"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { SignatureBoard } from "@/components/SignatureBoard";
import { OtterSprite } from "@/components/OtterSprite";

function scheduleToastClear(
  setMsg: (s: string) => void,
  prevTimer: ReturnType<typeof setTimeout> | null,
) {
  if (prevTimer) clearTimeout(prevTimer);
  return setTimeout(() => setMsg(""), 3000);
}

function ShareAndSupportActions({
  onShare,
  onSupport,
}: {
  onShare: () => void;
  onSupport: () => void;
}) {
  return (
    <div className="profile-actions">
      <button
        type="button"
        className="profile-action-btn"
        aria-label="페이지 공유"
        onClick={onShare}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>
      <button
        type="button"
        className="profile-action-btn"
        aria-label="지지 선언"
        onClick={onSupport}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
    </div>
  );
}

function CampaignSnsFooter() {
  return (
    <>
      <div className="sns-icon-row">
        <a
          className="sns-icon-btn"
          href="https://www.instagram.com/hwangkyungsan"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="인스타그램"
        >
          <img
            src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/instagram.svg"
            alt=""
          />
        </a>
        <a
          className="sns-icon-btn"
          href="https://www.youtube.com/@kyungsan98"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="유튜브"
        >
          <img
            src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/youtube.svg"
            alt=""
          />
        </a>
        <a
          className="sns-icon-btn"
          href="https://www.facebook.com/rhfdkttl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="페이스북"
        >
          <img
            src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/facebook.svg"
            alt=""
          />
        </a>
        <a
          className="sns-icon-btn"
          href="https://www.threads.com/@hwangkyungsan"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="스레드"
        >
          <img
            src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/threads.svg"
            alt=""
          />
        </a>
        <a
          className="sns-icon-btn"
          href="https://blog.naver.com/kyungsan98"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="네이버 블로그"
        >
          <img
            src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/naver.svg"
            alt=""
          />
        </a>
      </div>

      <footer className="page-footer">
        <p>
          <strong>황경산 후보 선거사무소 | 정의당 서대문구 마선거구</strong>
        </p>
        <p>서울특별시 서대문구 증가로 123 | 02-XXXX-XXXX</p>
      </footer>
    </>
  );
}

export function CampaignSite() {
  const [slide, setSlideState] = useState(0);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [accProfile, setAccProfile] = useState(false);
  const [accPledge, setAccPledge] = useState(true);
  const [accSupport, setAccSupport] = useState(true);
  const [accPledgeIntro, setAccPledgeIntro] = useState(false);
  const [accPledgeList, setAccPledgeList] = useState(true);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const setSlide = useCallback((idx: number) => {
    const i = Math.max(0, Math.min(3, idx));
    setSlideState(i);
    const tail = i === 1 ? "#intro" : i === 2 ? "#pledge" : "";
    if (typeof window !== "undefined") {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search + tail,
      );
    }
  }, []);

  const syncSlideViewportHeight = useCallback(() => {
    const vp = viewportRef.current;
    const p = panelRefs.current[slide];
    if (!vp || !p) return;
    vp.style.height = `${p.offsetHeight}px`;
  }, [slide]);

  useLayoutEffect(() => {
    syncSlideViewportHeight();
    requestAnimationFrame(() => syncSlideViewportHeight());
  }, [slide, syncSlideViewportHeight]);

  useEffect(() => {
    const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
    const vp = viewportRef.current;
    if (!vp) return;
    const ro = new ResizeObserver(() => syncSlideViewportHeight());
    panels.forEach((el) => ro.observe(el));
    window.addEventListener("resize", syncSlideViewportHeight);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => syncSlideViewportHeight());
    }
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncSlideViewportHeight);
    };
  }, [syncSlideViewportHeight]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#intro") {
      setSlideState(1);
    } else if (window.location.hash === "#pledge") {
      setSlideState(2);
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll(".card, .sns-icon-btn");
    const revObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            revObs.unobserve(el);
          }
        });
      },
      { threshold: 0.08 },
    );
    els.forEach((el) => {
      const h = el as HTMLElement;
      h.style.opacity = "0";
      h.style.transform = "translateY(20px)";
      h.style.transition = "opacity .45s ease, transform .45s ease";
      revObs.observe(el);
    });
    return () => revObs.disconnect();
  }, []);

  const doShare = () => {
    if (navigator.share) {
      void navigator.share({
        title: "황경산 | 정의당 서대문구의원 후보",
        url: window.location.href,
      });
    } else {
      void navigator.clipboard?.writeText(window.location.href);
      setToast("링크가 복사됐습니다.");
      toastTimer.current = scheduleToastClear(setToast, toastTimer.current);
    }
  };

  const doSupport = () => {
    setSlide(1);
    window.setTimeout(() => {
      document.getElementById("support")?.scrollIntoView({ behavior: "smooth" });
    }, 420);
  };

  const onSupportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = (f.elements.namedItem("name") as HTMLInputElement)?.value?.trim();
    const phone = (f.elements.namedItem("phone") as HTMLInputElement)?.value?.trim();
    if (!name || !phone) {
      setToast("성함과 연락처를 입력해주세요.");
      toastTimer.current = scheduleToastClear(setToast, toastTimer.current);
      return;
    }
    setToast(`${name}님, 지지 선언 감사합니다! 🙏`);
    toastTimer.current = scheduleToastClear(setToast, toastTimer.current);
    f.reset();
  };

  const setPanelRef = (i: number) => (el: HTMLDivElement | null) => {
    panelRefs.current[i] = el;
  };

  return (
    <div className="campaign-root" ref={rootRef} data-slide={slide}>
      <div className="page">
        <div className="slide-viewport" ref={viewportRef} aria-live="polite">
          <div
            className="slide-track"
            style={{ transform: `translateX(-${slide * 25}%)` }}
          >
            <section
              className="slide-panel"
              id="slide-0"
              aria-label="홈"
              ref={setPanelRef(0)}
            >
              <div className="slide-panel-inner home-slide">
                <SignatureBoard embedded />
                <div className="home-cta-stack">
                  <img
                    className="home-logo"
                    src="/justice_logo.svg"
                    alt="정의당"
                  />
                  <div className="home-candidate-byline">
                    <div className="home-candidate-name">황경산</div>
                    <div className="home-candidate-role">
                      서대문 구의원 후보
                      <br />
                      마선거구 · 남가좌동 · 북가좌동
                    </div>
                  </div>
                  <button
                    type="button"
                    className="home-cta"
                    onClick={() => setSlide(1)}
                  >
                    후보 소개 보기 →
                  </button>
                </div>
              </div>
            </section>

            <section
              className="slide-panel"
              id="slide-1"
              aria-label="후보 소개"
              ref={setPanelRef(1)}
            >
              <div className="slide-panel-inner">
                <header className="profile-header" style={{ position: "relative" }}>
                  <ShareAndSupportActions onShare={doShare} onSupport={doSupport} />
                  <div className="header-bottom">
                    <div className="party-logo-wrap">
                      <img src="/justice_logo_wh.svg" alt="정의당" />
                    </div>
                    <h1 className="profile-name">
                      황<em>경산</em>
                    </h1>
                    <p className="profile-role">서대문구의회 의원 후보</p>
                    <div className="profile-district">
                      📍 마선거구 · 남가좌동 · 북가좌동
                    </div>
                    <p className="profile-slogan">
                      황경산은 서대문 주민과 함께
                      <br />
                      <strong style={{ color: "var(--accent)" }}>
                        내란세력 청산
                      </strong>
                      하겠습니다!
                    </p>
                  </div>
                </header>

                <div className="page-content">
                  <div className="card">
                    <button
                      type="button"
                      className="acc-trigger"
                      aria-expanded={accProfile}
                      onClick={() => setAccProfile((v) => !v)}
                    >
                      <span className="acc-left">
                        <span className="acc-icon">🙋</span>
                        내란세력에게 구의원 자리를 내어 주시겠습니까?
                      </span>
                      <span className="acc-arrow">▼</span>
                    </button>
                    <div
                      className={`acc-body${accProfile ? " open" : ""}`}
                      id="acc-profile"
                    >
                      <p className="profile-bio">
                        남가좌동 북가좌동 구의원 3명 중 1명은 내란세력 말고
                        황경산에게!!
                        <br />
                        <br />
                        12.3 불법계엄과 내란, 그리고 윤석열 탄핵 구속에도 불구하고
                        여전히 내란세력이 지방선거에 출마하며 부활을 꿈꾸고
                        있습니다. 국민의힘은 ‘윤 어게인’, ‘부정선거음모론’을
                        퍼뜨리는 극우 내란세력 그 자체가 되었습니다. 이번
                        지방선거에서 서대문구의회 국민의힘 내란세력을 뿌리뽑는
                        선거로 만들어주세요
                        <br />
                        <br />
                        2024년 12월, 우리는 모두가 빛이 되어 응원봉 시위가 있는
                        국회와 광화문으로, 대통령 관저가 있는 한남동으로
                        달려갔습니다. 국민들은 그렇게 계엄과 내란을 막아냈습니다.
                        <br />
                        <br />
                        황경산도 그중 하나의 빛이었습니다.
                        <br />
                        2024년 12월 윤석열 체포구속 500명 서대문 주민선언, 2025년
                        4~5월 내란청산 시민권력 1400명 민주주의 서대문
                        주민선언, 그리고 지금, 내란세력 없는 서대문 만들기
                        주민선언을 이어가며 오늘도 내란세력 청산을 위해 싸우고
                        있습니다.
                        <br />
                        <br />
                        <span className="profile-bio-strong">
                          3명이 당선되는 남가좌동 북가좌동 구의원 선거에서
                          내란세력 국민의힘 후보는 늘 자동으로 당선됐습니다.
                          황경산을 선택하면 내란세력이 낙선합니다.
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="card">
                    <button
                      type="button"
                      className="acc-trigger"
                      aria-expanded={accPledge}
                      onClick={() => setAccPledge((v) => !v)}
                    >
                      <span className="acc-left">
                        <span className="acc-icon">🌈</span>무지개 가좌 플랜
                      </span>
                      <span className="acc-arrow">▼</span>
                    </button>
                    <div
                      className={`acc-body${accPledge ? " open" : ""}`}
                      id="acc-pledge"
                    >
                      <div className="pledge-item">
                        <div className="pledge-header">
                          <div className="pledge-num-badge">01</div>
                          <span className="pledge-icon-sm">🏠</span>
                          <div className="pledge-title">1인가구 행복 가좌</div>
                        </div>
                        <ul className="pledge-sub">
                          <li>1인가구 원스탑지원센터</li>
                          <li>1인가구 무상 청소·심리상담</li>
                        </ul>
                      </div>
                      <div className="pledge-item">
                        <div className="pledge-header">
                          <div className="pledge-num-badge">02</div>
                          <span className="pledge-icon-sm">🤝</span>
                          <div className="pledge-title">함께 돌봄 가좌</div>
                        </div>
                        <ul className="pledge-sub">
                          <li>구립 심야어린이병원 설치</li>
                          <li>가좌 공공돌봄센터 설치</li>
                        </ul>
                      </div>
                      <div className="pledge-item">
                        <div className="pledge-header">
                          <div className="pledge-num-badge">03</div>
                          <span className="pledge-icon-sm">🌿</span>
                          <div className="pledge-title">생태 공존 가좌</div>
                        </div>
                        <ul className="pledge-sub">
                          <li>5산2천 막개발 중단, 재자연화</li>
                          <li>서대문 탄소중립지원센터 설치</li>
                        </ul>
                      </div>
                      <div className="pledge-item">
                        <div className="pledge-header">
                          <div className="pledge-num-badge">04</div>
                          <span className="pledge-icon-sm">🚌</span>
                          <div className="pledge-title">15분 교통 가좌</div>
                        </div>
                        <ul className="pledge-sub">
                          <li>마을버스 공영제 무상교통</li>
                          <li>지하철 서부선 공공 신속 추진</li>
                        </ul>
                      </div>
                      <div className="pledge-item">
                        <div className="pledge-header">
                          <div className="pledge-num-badge">05</div>
                          <span className="pledge-icon-sm">⚧️</span>
                          <div className="pledge-title">성평등 가좌</div>
                        </div>
                        <ul className="pledge-sub">
                          <li>디지털성폭력 원샷지원센터 설치</li>
                          <li>여성노동공제회로 4대보험 지원</li>
                        </ul>
                      </div>
                      <div className="pledge-item">
                        <div className="pledge-header">
                          <div className="pledge-num-badge">06</div>
                          <span className="pledge-icon-sm">🤲</span>
                          <div className="pledge-title">함께 인권 가좌</div>
                        </div>
                        <ul className="pledge-sub">
                          <li>서대문 차별금지 조례 제정</li>
                          <li>장애인 맞춤 공공일자리 확대</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="card" id="support">
                    <button
                      type="button"
                      className="acc-trigger"
                      aria-expanded={accSupport}
                      onClick={() => setAccSupport((v) => !v)}
                    >
                      <span className="acc-left">
                        <span className="acc-icon">✊</span>지지 선언하기
                      </span>
                      <span className="acc-arrow">▼</span>
                    </button>
                    <div
                      className={`acc-body${accSupport ? " open" : ""}`}
                      id="acc-support"
                    >
                      <form className="support-form" noValidate onSubmit={onSupportSubmit}>
                        <input type="text" name="name" placeholder="성함" required />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="연락처 (예: 010-1234-5678)"
                          required
                        />
                        <input
                          type="text"
                          name="dong"
                          placeholder="거주 동 (남가좌동 / 북가좌동)"
                        />
                        <textarea name="message" placeholder="응원 메시지 (선택)" />
                        <button type="submit">황경산 후보를 지지합니다 →</button>
                      </form>
                    </div>
                  </div>

                  <CampaignSnsFooter />
                </div>
              </div>
            </section>

            <section
              className="slide-panel"
              id="slide-2"
              aria-label="공약 한눈에"
              ref={setPanelRef(2)}
            >
              <div className="slide-panel-inner">
                <header
                  className="profile-header profile-header--hwang2"
                  style={{ position: "relative" }}
                >
                  <ShareAndSupportActions onShare={doShare} onSupport={doSupport} />
                  <div className="header-bottom">
                    <div className="party-logo-wrap">
                      <img src="/justice_logo_wh.svg" alt="정의당" />
                    </div>
                    <h1 className="profile-name">
                      황<em>경산</em>
                    </h1>
                    <p className="profile-role">공약 한눈에 · 무지개 가좌 플랜</p>
                    <div className="profile-district">
                      📍 마선거구 · 남가좌동 · 북가좌동
                    </div>
                    <p className="profile-slogan">
                      6가지 분야로
                      <br />
                      <strong style={{ color: "var(--accent)" }}>
                        서대문을 바꿉니다
                      </strong>
                    </p>
                  </div>
                </header>

                <div className="page-content">
                  <div className="card">
                    <button
                      type="button"
                      className="acc-trigger"
                      aria-expanded={accPledgeIntro}
                      onClick={() => setAccPledgeIntro((v) => !v)}
                    >
                      <span className="acc-left">
                        <span className="acc-icon">📋</span>
                        공약을 한눈에 보는 이유
                      </span>
                      <span className="acc-arrow">▼</span>
                    </button>
                    <div
                      className={`acc-body${accPledgeIntro ? " open" : ""}`}
                      id="acc-pledge-slide2-intro"
                    >
                      <p className="profile-bio" style={{ borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}>
                        지방선거는 후보뿐 아니라 <strong className="profile-bio-strong">무엇을 할지(공약)</strong>를
                        비교하는 선거입니다. 무지개 가좌 플랜은 내란 청산·1인가구·돌봄·생태·교통·성평등·인권까지
                        서대문에서 바로 체감할 수 있는 약속을 한곳에 모았습니다. 아래에서 분야별 세부 공약을
                        확인해 주세요.
                      </p>
                    </div>
                  </div>

                  <div className="card">
                    <button
                      type="button"
                      className="acc-trigger"
                      aria-expanded={accPledgeList}
                      onClick={() => setAccPledgeList((v) => !v)}
                    >
                      <span className="acc-left">
                        <span className="acc-icon">🌈</span>
                        6대 분야 공약 요약
                      </span>
                      <span className="acc-arrow">▼</span>
                    </button>
                    <div
                      className={`acc-body${accPledgeList ? " open" : ""}`}
                      id="acc-pledge-slide2-list"
                    >
                      <div className="pledge-item">
                        <div className="pledge-header">
                          <div className="pledge-num-badge">01</div>
                          <span className="pledge-icon-sm">🏠</span>
                          <div className="pledge-title">1인가구 행복 가좌</div>
                        </div>
                        <ul className="pledge-sub">
                          <li>1인가구 원스탑지원센터</li>
                          <li>1인가구 무상 청소·심리상담</li>
                        </ul>
                      </div>
                      <div className="pledge-item">
                        <div className="pledge-header">
                          <div className="pledge-num-badge">02</div>
                          <span className="pledge-icon-sm">🤝</span>
                          <div className="pledge-title">함께 돌봄 가좌</div>
                        </div>
                        <ul className="pledge-sub">
                          <li>구립 심야어린이병원 설치</li>
                          <li>가좌 공공돌봄센터 설치</li>
                        </ul>
                      </div>
                      <div className="pledge-item">
                        <div className="pledge-header">
                          <div className="pledge-num-badge">03</div>
                          <span className="pledge-icon-sm">🌿</span>
                          <div className="pledge-title">생태 공존 가좌</div>
                        </div>
                        <ul className="pledge-sub">
                          <li>5산2천 막개발 중단, 재자연화</li>
                          <li>서대문 탄소중립지원센터 설치</li>
                        </ul>
                      </div>
                      <div className="pledge-item">
                        <div className="pledge-header">
                          <div className="pledge-num-badge">04</div>
                          <span className="pledge-icon-sm">🚌</span>
                          <div className="pledge-title">15분 교통 가좌</div>
                        </div>
                        <ul className="pledge-sub">
                          <li>마을버스 공영제 무상교통</li>
                          <li>지하철 서부선 공공 신속 추진</li>
                        </ul>
                      </div>
                      <div className="pledge-item">
                        <div className="pledge-header">
                          <div className="pledge-num-badge">05</div>
                          <span className="pledge-icon-sm">⚧️</span>
                          <div className="pledge-title">성평등 가좌</div>
                        </div>
                        <ul className="pledge-sub">
                          <li>디지털성폭력 원샷지원센터 설치</li>
                          <li>여성노동공제회로 4대보험 지원</li>
                        </ul>
                      </div>
                      <div className="pledge-item">
                        <div className="pledge-header">
                          <div className="pledge-num-badge">06</div>
                          <span className="pledge-icon-sm">🤲</span>
                          <div className="pledge-title">함께 인권 가좌</div>
                        </div>
                        <ul className="pledge-sub">
                          <li>서대문 차별금지 조례 제정</li>
                          <li>장애인 맞춤 공공일자리 확대</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: "18px 22px 22px" }}>
                    <p
                      className="profile-bio"
                      style={{
                        borderBottom: "none",
                        marginBottom: 14,
                        paddingBottom: 0,
                      }}
                    >
                      인사말·지지 선언 폼은{" "}
                      <strong className="profile-bio-strong">「후보 소개」</strong> 탭에서
                      이어집니다.
                    </p>
                    <button
                      type="button"
                      className="home-cta"
                      style={{ width: "100%", maxWidth: "100%" }}
                      onClick={() => setSlide(1)}
                    >
                      후보 소개로 이동 →
                    </button>
                  </div>

                  <CampaignSnsFooter />
                </div>
              </div>
            </section>
            <section
              className="slide-panel"
              id="slide-3"
              aria-label="더보기"
              ref={setPanelRef(3)}
            >
              <div className="slide-panel-inner placeholder-slide">
                <strong>더보기</strong>
                <span>준비 중입니다.</span>
              </div>
            </section>
          </div>
        </div>
      </div>

      <nav className="dock-nav" aria-label="페이지 메뉴">
        <button
          type="button"
          className="dock-btn"
          aria-label="홈"
          title="홈"
          aria-current={slide === 0 ? "true" : undefined}
          onClick={() => setSlide(0)}
        >
          <OtterSprite motion={2} width={28} ariaLabel="홈" />
        </button>
        <button
          type="button"
          className="dock-btn"
          aria-label="후보 소개"
          title="후보 소개"
          aria-current={slide === 1 ? "true" : undefined}
          onClick={() => setSlide(1)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        <button
          type="button"
          className="dock-btn"
          aria-label="공약 한눈에"
          title="공약 한눈에"
          aria-current={slide === 2 ? "true" : undefined}
          onClick={() => setSlide(2)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </button>
        <button
          type="button"
          className="dock-btn"
          aria-label="더보기"
          title="더보기"
          aria-current={slide === 3 ? "true" : undefined}
          onClick={() => setSlide(3)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </nav>

      <div
        id="toast"
        role="status"
        aria-live="polite"
        className={toast ? "show" : ""}
      >
        {toast}
      </div>
    </div>
  );
}
