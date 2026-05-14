import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** GAS·스냅샷 재호출 주기(초). Next `unstable_cache` 및 CDN `s-maxage`와 동일. */
const SIGNATURE_REVALIDATE_SEC = 600;

/** 브라우저·공유 캐시 모두에서 오래된 응답을 잠깐이라도 바로 줄 수 있는 시간(초) */
const STALE_WHILE_REVALIDATE_SEC = 7200;

type Key = "coup" | "solo" | "baekryeonsan" | "seobu";

const KEYS: Key[] = ["coup", "solo", "baekryeonsan", "seobu"];

type GasResponse = {
  count: number | string;
};

function num(x: unknown): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function env(name: string): string | undefined {
  const v = process.env[name];
  if (!v) return undefined;
  return v.trim();
}

async function fetchCount(url?: string): Promise<number> {
  if (!url) return 0;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  const json = (await res.json()) as Partial<GasResponse>;
  return num(json.count);
}

type Snapshot = {
  totals: Record<Key, number>;
  breakdown: Record<Key, { online: number; offline: number; total: number }>;
  grandTotal: number;
  fetchedAt: number;
};

function emptyBreakdownFromTotals(totals: Record<Key, number>): Snapshot["breakdown"] {
  const o = {} as Snapshot["breakdown"];
  for (const k of KEYS) {
    const t = totals[k];
    o[k] = { online: 0, offline: 0, total: t };
  }
  return o;
}

/**
 * GAS에 “합산 JSON 한 번에 반환” 웹앱 URL을 두면 8회 fetch → 1회로 줄일 수 있습니다.
 * 응답 예:
 * { "totals": { "coup": 1, "solo": 2, "baekryeonsan": 0, "seobu": 3 },
 *   "breakdown": { "coup": { "online": 1, "offline": 0, "total": 1 }, ... } }
 * breakdown 생략 시 totals만으로 채웁니다.
 */
async function fetchSnapshotSingle(url: string): Promise<Snapshot> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Snapshot ${res.status}`);
  const raw = (await res.json()) as {
    totals?: Partial<Record<Key, unknown>>;
    breakdown?: Partial<
      Record<Key, { online?: unknown; offline?: unknown; total?: unknown }>
    >;
    grandTotal?: unknown;
  };

  const totals = {
    coup: num(raw.totals?.coup),
    solo: num(raw.totals?.solo),
    baekryeonsan: num(raw.totals?.baekryeonsan),
    seobu: num(raw.totals?.seobu),
  };

  let breakdown: Snapshot["breakdown"];
  if (raw.breakdown) {
    breakdown = {} as Snapshot["breakdown"];
    for (const k of KEYS) {
      const b = raw.breakdown[k];
      if (b) {
        const online = num(b.online);
        const offline = num(b.offline);
        breakdown[k] = {
          online,
          offline,
          total: num(b.total) || online + offline,
        };
      } else {
        const t = totals[k];
        breakdown[k] = { online: 0, offline: 0, total: t };
      }
    }
  } else {
    breakdown = emptyBreakdownFromTotals(totals);
  }

  const grandTotal = num(raw.grandTotal) || KEYS.reduce((s, k) => s + totals[k], 0);

  return {
    totals,
    breakdown,
    grandTotal,
    fetchedAt: Date.now(),
  };
}

async function computeSnapshotParallel(): Promise<Snapshot> {
  const urls = {
    coup: {
      online: env("GAS_COUP_ONLINE_URL"),
      offline: env("GAS_COUP_OFFLINE_URL"),
    },
    solo: {
      online: env("GAS_SOLO_ONLINE_URL"),
      offline: env("GAS_SOLO_OFFLINE_URL"),
    },
    baekryeonsan: {
      online: env("GAS_BAEKRYEONSAN_ONLINE_URL"),
      offline: env("GAS_BAEKRYEONSAN_OFFLINE_URL"),
    },
    seobu: {
      online: env("GAS_SEOBU_ONLINE_URL"),
      offline: env("GAS_SEOBU_OFFLINE_URL"),
    },
  } as const;

  /** 4키 × (온·오프라인) = 8회 GAS 호출을 한 번에 병렬 처리 */
  const flat = await Promise.all(
    KEYS.flatMap((k) => {
      const u = urls[k];
      return [
        fetchCount(u.online).then((n) => ({ k, kind: "online" as const, n })),
        fetchCount(u.offline).then((n) => ({ k, kind: "offline" as const, n })),
      ];
    }),
  );

  const byKey = {
    coup: { online: 0, offline: 0, total: 0 },
    solo: { online: 0, offline: 0, total: 0 },
    baekryeonsan: { online: 0, offline: 0, total: 0 },
    seobu: { online: 0, offline: 0, total: 0 },
  } satisfies Record<Key, { online: number; offline: number; total: number }>;

  for (const row of flat) {
    const slot = byKey[row.k];
    if (row.kind === "online") slot.online = row.n;
    else slot.offline = row.n;
  }
  for (const k of KEYS) {
    const slot = byKey[k];
    slot.total = slot.online + slot.offline;
  }

  const totals = {
    coup: byKey.coup.total,
    solo: byKey.solo.total,
    baekryeonsan: byKey.baekryeonsan.total,
    seobu: byKey.seobu.total,
  };

  const grandTotal =
    totals.coup + totals.solo + totals.baekryeonsan + totals.seobu;

  return {
    totals,
    breakdown: byKey,
    grandTotal,
    fetchedAt: Date.now(),
  };
}

async function computeSnapshot(): Promise<Snapshot> {
  const snapshotUrl = env("GAS_SIGNATURES_SNAPSHOT_URL");
  if (snapshotUrl) {
    return fetchSnapshotSingle(snapshotUrl);
  }
  return computeSnapshotParallel();
}

function cacheKeyParts() {
  return [
    "signatures-v3",
    env("GAS_SIGNATURES_SNAPSHOT_URL") ? "single" : "parallel",
  ] as const;
}

const getCachedSnapshot = unstable_cache(
  () => computeSnapshot(),
  [...cacheKeyParts()],
  { revalidate: SIGNATURE_REVALIDATE_SEC },
);

export async function GET() {
  try {
    const body = await getCachedSnapshot();
    return NextResponse.json(body, {
      headers: {
        // max-age: 브라우저 즉시 재사용 / s-maxage: CDN / stale-while-revalidate: 백그라운드 갱신
        "cache-control": `public, max-age=${SIGNATURE_REVALIDATE_SEC}, s-maxage=${SIGNATURE_REVALIDATE_SEC}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SEC}`,
      },
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
