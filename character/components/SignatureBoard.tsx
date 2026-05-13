"use client";

import useSWR from "swr";
import { OtterSprite } from "@/components/OtterSprite";
import { useCountUp } from "@/components/useCountUp";

type Key = "coup" | "solo" | "baekryeonsan" | "seobu";

type ApiResponse = {
  totals: Record<Key, number>;
  grandTotal: number;
  fetchedAt: number;
};

const fetcher = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 204) {
    // Silent retry mode: let SWR keep previous data
    throw new Error("no-content");
  }
  if (!res.ok) throw new Error("fetch-failed");
  return (await res.json()) as ApiResponse;
};

function scaleFromCount(count: number) {
  return 1 + Math.floor(count / 100) * 0.1;
}

/** 막대 100% 기준(건). 숫자는 위쪽이 정확한 값. */
const FISH_METER_MAX = 800;

/** 탱크 안에 그릴 물고기 최대 개수(DOM 부담·영역 초과분은 +n). */
const FISH_STACK_CAP = 160;

function fishMeterPercent(raw: number) {
  if (raw <= 0) return 0;
  const linear = (raw / FISH_METER_MAX) * 100;
  const boosted = Math.max(6, linear);
  return Math.min(100, boosted);
}

const ITEMS: Array<{
  key: Key;
  title: string;
  color: string;
  /** Google Forms 등 서명 페이지 */
  signUrl?: string;
}> = [
  {
    key: "coup",
    title: "내란세력없는\n서대문 만들기",
    color: "#ed174c",
    signUrl: "https://forms.gle/h3UeuYRi1bMig17s8",
  },
  { key: "solo", title: "1인가구 동별\n지원센터 설치", color: "#f15623" },
  {
    key: "baekryeonsan",
    title: "백련산 끈끈이\n롤트랩 반대",
    color: "#008c69",
    signUrl: "https://forms.gle/7YBA7bLeQUDKeyK79",
  },
  {
    key: "seobu",
    title: "서부선\n공공 신속 추진",
    color: "#009ee2",
    signUrl: "https://forms.gle/7LGXVS39Sddv3bHSA",
  },
];

function SignatureCol({
  item,
  raw,
}: {
  item: (typeof ITEMS)[number];
  raw: number;
}) {
  const display = useCountUp(raw);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xl font-black leading-none" style={{ color: item.color }}>
        {display}
      </div>
      <div
        className="whitespace-pre-line text-center text-[0.74rem] font-semibold leading-snug"
        style={{ color: item.color }}
      >
        {item.title}
      </div>
      {item.signUrl ? (
        <a
          href={item.signUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex w-full max-w-[86px] items-center justify-center rounded-lg px-2 py-1.5 text-center text-[0.72rem] font-bold text-white no-underline"
          style={{ background: item.color }}
        >
          서명하기
        </a>
      ) : (
        <button
          type="button"
          className="mt-0.5 w-full max-w-[86px] rounded-lg px-2 py-1.5 text-[0.72rem] font-bold text-white"
          style={{ background: item.color }}
        >
          서명하기
        </button>
      )}
      <div className="mt-1">
        <OtterSprite motion={1} width={34} scale={scaleFromCount(raw)} ariaLabel="수달 동작1" />
      </div>
      <div
        className="mt-2 w-full max-w-[92px]"
        aria-hidden
        title={`서명 ${raw.toLocaleString("ko-KR")}건`}
      >
        <div className="mb-1.5 h-3.5 w-full overflow-hidden rounded-full bg-slate-900/10 shadow-inner">
          <div
            className="h-full max-w-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: `${fishMeterPercent(raw)}%`,
              backgroundColor: item.color,
            }}
          />
        </div>
        <div className="relative flex h-[112px] w-full flex-wrap content-end items-end justify-center gap-px overflow-hidden rounded-xl border border-slate-900/10 bg-gradient-to-b from-slate-50 to-slate-100/90 px-0.5 pb-0.5 shadow-inner">
          {raw > FISH_STACK_CAP ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-white from-40% to-transparent px-0.5 pb-3 pt-1 text-center text-[0.65rem] font-bold leading-tight text-slate-600">
              +{(raw - FISH_STACK_CAP).toLocaleString("ko-KR")}
            </div>
          ) : null}
          {Array.from({ length: Math.min(raw, FISH_STACK_CAP) }).map((_, i) => (
            <span key={i} className="select-none text-[10px] leading-[1.05]">
              🐟
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

type SignatureBoardProps = {
  /** 홈 슬라이드 안에 넣을 때 여백·배경만 줄임 */
  embedded?: boolean;
};

export function SignatureBoard({ embedded = false }: SignatureBoardProps) {
  const { data } = useSWR<ApiResponse>("/api/signatures", fetcher, {
    refreshInterval: 1_800_000,
    revalidateOnFocus: true,
    shouldRetryOnError: true,
    errorRetryInterval: 1_800_000,
    errorRetryCount: undefined,
    keepPreviousData: true,
  });

  return (
    <section
      className={
        embedded
          ? "w-full max-w-[420px] px-4 pb-4 pt-6 text-slate-900"
          : "w-full max-w-[420px] px-6 pb-12 pt-10 text-slate-900"
      }
    >
      <div className="mb-2 flex items-end justify-center">
        <OtterSprite motion={3} width={56} ariaLabel="수달 동작3" />
      </div>
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">
        서대문 <span style={{ color: "#a67c52" }}>수달이</span>를 키워주세요!
      </h1>
      <p className="mx-auto mt-3 max-w-[22rem] text-center text-sm leading-relaxed text-slate-500">
        서대문에서 해결할 4가지 문제!
        <br />
        황경산 구의원 후보가 시민들과 함께 해결하겠습니다!
      </p>

      <div className="mt-6 grid grid-cols-4 gap-x-1 gap-y-3">
        {ITEMS.map((it) => (
          <SignatureCol key={it.key} item={it} raw={data?.totals?.[it.key] ?? 0} />
        ))}
      </div>
      <p className="mx-auto mt-3 max-w-[22rem] text-center text-[0.65rem] leading-relaxed text-slate-400">
        숫자 집계는 약 30분 간격으로 반영됩니다.
        <br />
        서명 수가 늘어날수록 수달이 커지고, 동작도 달라집니다.
      </p>
    </section>
  );
}

