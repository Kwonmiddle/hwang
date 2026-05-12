import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Key = "coup" | "solo" | "baekryeonsan" | "seobu";

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
  const res = await fetch(url, {
    // Next.js data cache: 60s
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  const json = (await res.json()) as Partial<GasResponse>;
  return num(json.count);
}

export async function GET() {
  try {
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
        offline: env("GAS_BAEKRYEONSAN_OFFLINE_URL"), // optional, may be undefined
      },
      seobu: {
        online: env("GAS_SEOBU_ONLINE_URL"),
        offline: env("GAS_SEOBU_OFFLINE_URL"), // optional, may be undefined
      },
    } as const;

    const keys: Key[] = ["coup", "solo", "baekryeonsan", "seobu"];

    const results = await Promise.all(
      keys.map(async (k) => {
        const u = urls[k];
        const [online, offline] = await Promise.all([
          fetchCount(u.online),
          fetchCount(u.offline),
        ]);
        return [k, { online, offline, total: online + offline }] as const;
      }),
    );

    const byKey = Object.fromEntries(results) as Record<
      Key,
      { online: number; offline: number; total: number }
    >;

    const totals = {
      coup: byKey.coup.total,
      solo: byKey.solo.total,
      baekryeonsan: byKey.baekryeonsan.total,
      seobu: byKey.seobu.total,
    };

    const grandTotal =
      totals.coup + totals.solo + totals.baekryeonsan + totals.seobu;

    return NextResponse.json(
      {
        totals,
        breakdown: byKey,
        grandTotal,
        fetchedAt: Date.now(),
      },
      { headers: { "cache-control": "s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch {
    // Silent failure: return 204, client keeps previous value
    return new NextResponse(null, { status: 204 });
  }
}

