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
  const res = await fetch(url);
  if (res.status === 204) {
    // Silent retry mode: let SWR keep previous data
    throw new Error("no-content");
  }
  if (!res.ok) throw new Error("fetch-failed");
  return (await res.json()) as ApiResponse;
};

const OTTER_BASE_WIDTH = 34;
const OTTER_BASE_HEIGHT = (OTTER_BASE_WIDTH * 300) / 350;
/** 커질 때 버튼을 덮지 않도록 상한 */
const OTTER_SCALE_MAX = 1.65;
/** 동작3 점프(위로) 여유 */
const OTTER_MOTION3_JUMP_PAD = 14;
/** 이 과제(열) 서명 수 기준: 500 초과 동작2, 1000 초과 동작3 */
const OTTER_MOTION2_THRESHOLD = 500;
const OTTER_MOTION3_THRESHOLD = 1000;

function scaleFromCount(count: number) {
  const linear = 1 + Math.floor(count / 100) * 0.1;
  return Math.min(OTTER_SCALE_MAX, linear);
}

function getOtterMotion(count: number): 1 | 2 | 3 {
  if (count > OTTER_MOTION3_THRESHOLD) return 3;
  if (count > OTTER_MOTION2_THRESHOLD) return 2;
  return 1;
}

function otterAriaLabel(motion: 1 | 2 | 3) {
  if (motion === 3) return "수달 동작3";
  if (motion === 2) return "수달 동작2";
  return "수달 동작1";
}

/** 네 열 수달 영역 공통 높이(최대 스케일·동작3 점프 기준) — 하단 정렬용 */
const OTTER_ROW_HEIGHT_PX =
  Math.ceil(OTTER_BASE_HEIGHT * OTTER_SCALE_MAX) + OTTER_MOTION3_JUMP_PAD + 4;

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
  {
    key: "solo",
    title: "1인가구 동별\n지원센터 설치",
    color: "#f15623",
    signUrl: "https://forms.gle/qyQ96n4fjdym5xvR6",
  },
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
  showNumbers,
}: {
  item: (typeof ITEMS)[number];
  raw: number;
  showNumbers: boolean;
}) {
  const display = useCountUp(showNumbers ? raw : 0);
  const otterMotion = getOtterMotion(raw);
  const otterScale = scaleFromCount(raw);
  const signBtnClass =
    "relative z-10 box-border inline-flex min-h-[30px] w-full max-w-[92px] shrink-0 items-center justify-center rounded-lg px-1.5 py-1 text-center text-[0.62rem] font-bold leading-tight tracking-tight text-white";

  const signBtnLabel = (
    <>
      수달이 <strong className="font-black">더</strong> 키우기
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col items-center gap-1">
      <div
        className="shrink-0 text-center text-xl font-black tabular-nums leading-none"
        style={{ color: item.color }}
        aria-live="polite"
      >
        {showNumbers ? display : (
          <span className="text-slate-300" aria-busy="true">
            …
          </span>
        )}
      </div>
      <div
        className="flex min-h-[2.75rem] shrink-0 items-center justify-center whitespace-pre-line px-0.5 text-center text-[0.74rem] font-semibold leading-snug"
        style={{ color: item.color }}
      >
        {item.title}
      </div>
      {item.signUrl ? (
        <a
          href={item.signUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${signBtnClass} no-underline`}
          style={{ background: item.color }}
          aria-label={`${item.title.replace(/\n/g, " ")} 수달이 더 키우기 (새 창)`}
        >
          {signBtnLabel}
        </a>
      ) : (
        <button
          type="button"
          className={signBtnClass}
          style={{ background: item.color }}
        >
          {signBtnLabel}
        </button>
      )}
      <div
        className="flex min-h-0 w-full max-w-[86px] flex-1 flex-col justify-end"
        style={{ minHeight: OTTER_ROW_HEIGHT_PX }}
      >
        <OtterSprite
          motion={otterMotion}
          width={OTTER_BASE_WIDTH}
          scale={otterScale}
          ariaLabel={otterAriaLabel(otterMotion)}
        />
      </div>
      <div
        className="mt-auto w-full max-w-[92px] shrink-0"
        aria-hidden
        title={showNumbers ? `서명 ${raw.toLocaleString("ko-KR")}건` : "집계 불러오는 중"}
      >
        <div className="mb-1.5 h-3.5 w-full overflow-hidden rounded-full bg-slate-900/10 shadow-inner">
          <div
            className="h-full max-w-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: `${fishMeterPercent(showNumbers ? raw : 0)}%`,
              backgroundColor: item.color,
            }}
          />
        </div>
        <div className="relative flex h-[112px] w-full flex-wrap content-end items-end justify-center gap-px overflow-hidden rounded-xl border border-slate-900/10 bg-gradient-to-b from-slate-50 to-slate-100/90 px-0.5 pb-0.5 shadow-inner">
          {showNumbers && raw > FISH_STACK_CAP ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-white from-40% to-transparent px-0.5 pb-3 pt-1 text-center text-[0.65rem] font-bold leading-tight text-slate-600">
              +{(raw - FISH_STACK_CAP).toLocaleString("ko-KR")}
            </div>
          ) : null}
          {showNumbers
            ? Array.from({ length: Math.min(raw, FISH_STACK_CAP) }).map((_, i) => (
                <span key={i} className="select-none text-[10px] leading-[1.05]">
                  🐟
                </span>
              ))
            : null}
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
    refreshInterval: 600_000,
    revalidateOnFocus: true,
    shouldRetryOnError: true,
    errorRetryInterval: 600_000,
    errorRetryCount: undefined,
    keepPreviousData: true,
    suspense: false,
  });

  const showNumbers = Boolean(data);

  return (
    <section
      className={
        embedded
          ? "w-full max-w-[420px] px-4 pb-4 pt-6 text-slate-900"
          : "w-full max-w-[420px] px-6 pb-12 pt-10 text-slate-900"
      }
    >
      <div className="mb-2 flex items-end justify-center">
        <OtterSprite motion={3} width={56} imagePriority ariaLabel="수달 동작3" />
      </div>
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">
        서대문 <span style={{ color: "#a67c52" }}>수달이</span>를 키워주세요!
      </h1>
      <p className="mx-auto mt-3 max-w-[22rem] text-center text-sm leading-relaxed text-slate-500">
        서대문에서 해결 할 <strong>4</strong>가지 문제!
        <br />
        황경산 구의원 후보가 시민들과 함께 해결하겠습니다!
      </p>

      <div className="mt-6 grid grid-cols-4 items-stretch gap-x-1">
        {ITEMS.map((it) => (
          <SignatureCol
            key={it.key}
            item={it}
            raw={data?.totals?.[it.key] ?? 0}
            showNumbers={showNumbers}
          />
        ))}
      </div>
      <p className="mx-auto mt-3 max-w-[22rem] text-center text-[0.65rem] leading-relaxed text-slate-400">
        숫자 집계는 약 10분 간격으로 반영됩니다.
        <br />
        서명 수가 늘어날수록 수달이 커지고, 500·1000건을 넘기면 동작이 달라집니다.
      </p>
    </section>
  );
}

