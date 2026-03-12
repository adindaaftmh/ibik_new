import React, { useEffect, useMemo, useRef, useState } from "react";
import "./HomePage.css";

/** Parse date string "22 Mar 2026" atau "2026-03-22" ke Date (jam 09:00) */
function parseEventDate(dateStr) {
  if (!dateStr) return null;
  const d = dateStr.trim();
  const iso = /^\d{4}-\d{2}-\d{2}/.test(d);
  if (iso) {
    return new Date(d + (d.length <= 10 ? "T09:00:00" : ""));
  }
  const months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
  const parts = d.split(/[\s,]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const mi = months.indexOf(parts[1]);
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && mi >= 0 && !isNaN(year)) {
      return new Date(year, mi, day, 9, 0, 0);
    }
  }
  return null;
}

/** Hitung sisa waktu ke target (days, hours, minutes, seconds) */
function useCountdown(targetDate) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate || targetDate.getTime() <= Date.now()) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    const tick = () => {
      const now = Date.now();
      const end = targetDate.getTime();
      let diff = Math.max(0, Math.floor((end - now) / 1000));
      const seconds = diff % 60;
      diff = Math.floor(diff / 60);
      const minutes = diff % 60;
      diff = Math.floor(diff / 60);
      const hours = diff % 24;
      const days = Math.floor(diff / 24);
      setCountdown({ days, hours, minutes, seconds });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate?.getTime()]);

  return countdown;
}

const HERO_CARDS = [
  {
    id: "h1",
    title: "Neon Night Festival",
    price: "Rp180rb",
    handle: "@skylineent",
    gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
  },
  {
    id: "h2",
    title: "Digital Summit 2026",
    price: "Rp250rb",
    handle: "@techverse",
    gradient: "linear-gradient(135deg, #5b21b6, #8b5cf6)",
  },
  {
    id: "h3",
    title: "Career & Meditation",
    price: "Gratis",
    handle: "@mindfulid",
    gradient: "linear-gradient(135deg, #6d28d9, #a78bfa)",
  },
];

const DEFAULT_NEAREST_EVENT = {
  id: 0,
  title: "Neon Night Music Festival Bandung",
  date: "22 Mar 2026",
  location: "Bandung, Jawa Barat",
  category: "Music & Festival",
  organizer: "Skyline Entertainment",
  handle: "@skylineent",
  imageGradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
};

const DEMO_LATEST_EVENTS = [
  {
    id: "demo-1",
    title: "Lunar Arcade Showcase",
    date: "12 Apr 2026",
    location: "Jakarta, Indonesia",
    category: "Expo",
    organizer: "ArcadeWorks",
    imageGradient: "linear-gradient(135deg, #06b6d4, #6366f1)",
  },
  {
    id: "demo-2",
    title: "Neon Night Music Festival",
    date: "22 Mar 2026",
    location: "Bandung, Jawa Barat",
    category: "Music & Festival",
    organizer: "Skyline Entertainment",
    imageGradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
  },
  {
    id: "demo-3",
    title: "Digital Innovation Summit 2026",
    date: "05 Apr 2026",
    location: "Surabaya, Jawa Timur",
    category: "Conference",
    organizer: "TechVerse ID",
    imageGradient: "linear-gradient(135deg, #0ea5e9, #22c55e)",
  },
  {
    id: "demo-4",
    title: "Creators Meetup: UI Motion Lab",
    date: "19 Apr 2026",
    location: "Yogyakarta, DIY",
    category: "Workshop",
    organizer: "MotionLab",
    imageGradient: "linear-gradient(135deg, #f97316, #fb7185)",
  },
  {
    id: "demo-5",
    title: "Indie Game Jam Weekend",
    date: "26 Apr 2026",
    location: "Online",
    category: "Game",
    organizer: "IndieHub",
    imageGradient: "linear-gradient(135deg, #22c55e, #a3e635)",
  },
  {
    id: "demo-6",
    title: "Career & Meditation Classes",
    date: "30 Mar 2026",
    location: "Online Webinar",
    category: "Business & Career",
    organizer: "Mindful Growth ID",
    imageGradient: "linear-gradient(135deg, #a855f7, #c084fc)",
  },
];

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [latestEvents, setLatestEvents] = useState([]);
  const [activeLatestIndex, setActiveLatestIndex] = useState(0); // index pada list yang dirender (looped)
  const latestRowRef = useRef(null);
  const latestRafRef = useRef(0);
  const latestPausedRef = useRef(false);
  const latestAutoplayTimerRef = useRef(0);

  const latestList = useMemo(() => {
    const list = latestEvents.length ? latestEvents : events;
    const normalized = Array.isArray(list) ? list : [];
    return normalized.length ? normalized : DEMO_LATEST_EVENTS;
  }, [events, latestEvents]);

  // supaya terlihat berulang: render 3x (kiri-tengah-kanan) lalu "jump" ke tengah saat mendekati ujung
  const latestLoopList = useMemo(() => {
    if (!latestList.length) return [];
    return [...latestList, ...latestList, ...latestList];
  }, [latestList]);

  const nearestEvent = useMemo(() => {
    if (!events.length) return DEFAULT_NEAREST_EVENT;
    const withDate = events
      .map((e) => ({ ...e, parsed: parseEventDate(e.date) }))
      .filter((e) => e.parsed && e.parsed > new Date());
    if (!withDate.length) return events[0] ? { ...events[0], ...DEFAULT_NEAREST_EVENT } : DEFAULT_NEAREST_EVENT;
    withDate.sort((a, b) => a.parsed - b.parsed);
    return { ...withDate[0], imageGradient: "linear-gradient(135deg, #7c3aed, #a78bfa)" };
  }, [events]);

  const targetDate = useMemo(() => parseEventDate(nearestEvent.date), [nearestEvent.date]);
  const countdown = useCountdown(targetDate);

  useEffect(() => {
    fetch("http://localhost:8000/api/events/featured")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch(() => {
        setEvents([
          {
            id: 1,
            title: "Neon Night Music Festival Bandung",
            date: "22 Mar 2026",
            location: "Bandung, Jawa Barat",
            category: "Music & Festival",
            organizer: "Skyline Entertainment",
            buttonLabel: "Beli Tiket",
          },
          {
            id: 2,
            title: "Success Free Career & Meditation Classes",
            date: "30 Mar 2026",
            location: "Online Webinar",
            category: "Business & Career",
            organizer: "Mindful Growth ID",
            buttonLabel: "Daftar Sekarang",
          },
          {
            id: 3,
            title: "Digital Innovation Summit 2026",
            date: "05 Apr 2026",
            location: "Surabaya, Jawa Timur",
            category: "Conference",
            organizer: "TechVerse ID",
            buttonLabel: "Beli Tiket",
          },
        ]);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/events/latest")
      .then((res) => res.json())
      .then((data) => setLatestEvents(Array.isArray(data) ? data : []))
      .catch(() => {
        // fallback: gunakan data featured untuk demo local
        setLatestEvents((prev) => (prev.length ? prev : []));
      });
  }, []);

  useEffect(() => {
    // jika endpoint latest belum tersedia, pakai featured sebagai fallback
    if (!latestEvents.length && events.length) setLatestEvents(events);
  }, [events, latestEvents.length]);

  const scrollLatest = (dir) => {
    const el = latestRowRef.current;
    if (!el) return;
    const first = el.querySelector(".latest-card");
    const cardW = first ? first.getBoundingClientRect().width : 260;
    const gap = 14;
    el.scrollBy({ left: dir * (cardW + gap) * 2, behavior: "smooth" });
  };

  const scrollLatestToIndex = (idx) => {
    const el = latestRowRef.current;
    if (!el) return;
    const cards = el.querySelectorAll(".latest-card");
    const card = cards?.[idx];
    if (card && card.scrollIntoView) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const updateActiveLatest = () => {
    const el = latestRowRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll(".latest-card"));
    if (!cards.length) return;

    const rowRect = el.getBoundingClientRect();
    const centerX = rowRect.left + rowRect.width / 2;

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < cards.length; i += 1) {
      const r = cards[i].getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const d = Math.abs(cx - centerX);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    setActiveLatestIndex((prev) => (prev === bestIdx ? prev : bestIdx));
  };

  const ensureLatestInMiddleLoop = () => {
    const el = latestRowRef.current;
    if (!el) return;
    if (!latestList.length) return;

    const first = el.querySelector(".latest-card");
    if (!first) return;

    const cardW = first.getBoundingClientRect().width || 260;
    const cs = window.getComputedStyle(el);
    const gap = parseFloat(cs.columnGap || cs.gap || "0") || 0;
    const cycle = (cardW + gap) * latestList.length;
    if (!cycle) return;

    // total 3 cycles; idealnya posisi ada di cycle tengah
    const x = el.scrollLeft;
    if (x < cycle * 0.5) el.scrollLeft = x + cycle;
    else if (x > cycle * 1.5) el.scrollLeft = x - cycle;
  };

  const scheduleUpdateActiveLatest = () => {
    if (latestRafRef.current) cancelAnimationFrame(latestRafRef.current);
    latestRafRef.current = requestAnimationFrame(updateActiveLatest);
  };

  useEffect(() => {
    // initialize active card setelah data ready
    const el = latestRowRef.current;
    // set posisi awal ke cycle tengah supaya loop mulus
    if (el && latestList.length) {
      requestAnimationFrame(() => {
        const first = el.querySelector(".latest-card");
        const cardW = first ? first.getBoundingClientRect().width : 260;
        const cs = window.getComputedStyle(el);
        const gap = parseFloat(cs.columnGap || cs.gap || "0") || 0;
        const cycle = (cardW + gap) * latestList.length;
        if (cycle) el.scrollLeft = cycle; // awal di salinan tengah
        scheduleUpdateActiveLatest();
      });
    } else {
      scheduleUpdateActiveLatest();
    }
    return () => {
      if (latestRafRef.current) cancelAnimationFrame(latestRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestList.length]);

  useEffect(() => {
    const el = latestRowRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      ensureLatestInMiddleLoop();
      scheduleUpdateActiveLatest();
    };
    const onResize = () => scheduleUpdateActiveLatest();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    // autoplay: geser ke samping otomatis, pause saat hover (cursor) / fokus
    if (latestAutoplayTimerRef.current) window.clearInterval(latestAutoplayTimerRef.current);
    latestAutoplayTimerRef.current = window.setInterval(() => {
      if (latestPausedRef.current) return;
      const len = Math.max(1, latestLoopList.length);
      const next = (activeLatestIndex + 1) % len;
      scrollLatestToIndex(next);
    }, 1800);

    return () => {
      if (latestAutoplayTimerRef.current) window.clearInterval(latestAutoplayTimerRef.current);
    };
  }, [activeLatestIndex, latestLoopList.length]);

  const handleToggleNav = () => {
    const navbar = document.getElementById("navbar");
    if (navbar) navbar.classList.toggle("open");
  };

  return (
    <div className="page flacto-style">
      <header className="navbar" id="navbar">
        <div className="container navbar-inner">
          <a href="#" className="brand">
            <span className="brand-text">EventPlace</span>
          </a>

          <button
            type="button"
            className="menu-toggle"
            aria-label="Buka navigasi"
            onClick={handleToggleNav}
          >
            <span />
          </button>

          <nav className="nav-links" id="navLinks">
            <a href="#" className="nav-link nav-link--active">Events</a>
            <a href="#" className="nav-link">Kategori</a>
            <a href="#" className="nav-link">Kontak</a>
          </nav>

          <div className="nav-actions">
            <button type="button" className="btn btn-register">Daftar</button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero flacto-hero">
          <div className="hero-bg" aria-hidden="true" />
          <div className="container hero-inner">
            <div className="hero-content">
              <h1 className="hero-title">
                Temukan Event Luar Biasa
                <br />
                &amp; Tiket Eksklusif.
              </h1>
              <p className="hero-subtitle">
                Daftar dan beli tiket event favorit Anda — konser, seminar,
                workshop — dari berbagai organizer terpercaya dalam satu platform.
              </p>
              <div className="hero-actions">
                <button type="button" className="btn btn-explore">
                  Jelajahi Event
                </button>
                <button type="button" className="btn btn-outline-white">
                  Cara Kerja?
                </button>
              </div>
              <div className="hero-artists">
                <div className="hero-avatars">
                  <div className="hero-avatar" style={{ background: "linear-gradient(135deg,#c4b5fd,#a78bfa)" }} />
                  <div className="hero-avatar" style={{ background: "linear-gradient(135deg,#a78bfa,#8b5cf6)" }} />
                  <div className="hero-avatar" style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }} />
                </div>
                <span className="hero-artists-label">+12k Peserta</span>
                <span className="hero-rating">4.9</span>
                <span className="hero-rating-dash">—</span>
              </div>
            </div>

            <div className="hero-cards">
              {HERO_CARDS.map((card, i) => (
                <div
                  key={card.id}
                  className={`hero-nft-card hero-nft-card--${i + 1}`}
                >
                  <div
                    className="hero-nft-card-image"
                    style={{ background: card.gradient }}
                  />
                  <div className="hero-nft-card-body">
                    <h3 className="hero-nft-card-title">{card.title}</h3>
                    <p className="hero-nft-card-price">{card.price}</p>
                    <p className="hero-nft-card-handle">{card.handle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Countdown Event Terdekat */}
        <section className="countdown-section">
          <div className="container countdown-inner">
            <div className="countdown-card">
              <div
                className="countdown-image"
                style={{
                  background: nearestEvent.imageGradient || "linear-gradient(135deg, #7c3aed, #a78bfa)",
                }}
              />
              <div className="countdown-info">
                <p className="countdown-date">{nearestEvent.date}</p>
                <h2 className="countdown-title">{nearestEvent.title}</h2>
                <p className="countdown-label">Event dimulai dalam</p>
                <div className="countdown-boxes">
                  <div className="countdown-box">
                    <span className="countdown-num">{String(countdown.days).padStart(2, "0")}</span>
                    <span className="countdown-unit">hari</span>
                  </div>
                  <div className="countdown-box">
                    <span className="countdown-num">{String(countdown.hours).padStart(2, "0")}</span>
                    <span className="countdown-unit">jam</span>
                  </div>
                  <div className="countdown-box">
                    <span className="countdown-num">{String(countdown.minutes).padStart(2, "0")}</span>
                    <span className="countdown-unit">menit</span>
                  </div>
                  <div className="countdown-box">
                    <span className="countdown-num">{String(countdown.seconds).padStart(2, "0")}</span>
                    <span className="countdown-unit">detik</span>
                  </div>
                </div>
                <div className="countdown-owner">
                  <div className="countdown-owner-avatar" />
                  <span className="countdown-owner-label">Penyelenggara</span>
                  <span className="countdown-owner-handle">
                    {nearestEvent.handle || `@${(nearestEvent.organizer || "").replace(/\s+/g, "").toLowerCase()}`}
                  </span>
                </div>
                <div className="countdown-actions">
                  <button type="button" className="btn-countdown-primary">
                    Lihat Semua Upcoming
                  </button>
                  <div className="countdown-nav">
                    <button type="button" className="countdown-nav-btn" aria-label="Sebelumnya">
                      ←
                    </button>
                    <button type="button" className="countdown-nav-btn countdown-nav-btn--active" aria-label="Selanjutnya">
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Event Terbaru — slider ala Netflix / launcher */}
        <section className="latest-section" aria-label="Event terbaru">
          <div className="container latest-inner">
            <header className="latest-header">
              <div className="latest-titlewrap">
                <h2 className="latest-title">Event Terbaru</h2>
                <p className="latest-subtitle">Swipe untuk lihat lebih banyak event yang baru ditambahkan.</p>
              </div>
              <div className="latest-actions">
                <a className="latest-seeall" href="#">
                  Lihat semua
                </a>
                <div className="latest-nav" aria-hidden="false">
                  <button
                    type="button"
                    className="latest-nav-btn"
                    onClick={() => scrollLatest(-1)}
                    aria-label="Geser ke kiri"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="latest-nav-btn latest-nav-btn--primary"
                    onClick={() => scrollLatest(1)}
                    aria-label="Geser ke kanan"
                  >
                    ›
                  </button>
                </div>
              </div>
            </header>

            <div
              className="latest-row"
              ref={latestRowRef}
              role="list"
              aria-roledescription="carousel"
              onMouseEnter={() => {
                latestPausedRef.current = true;
              }}
              onMouseLeave={() => {
                latestPausedRef.current = false;
              }}
              onFocus={() => {
                latestPausedRef.current = true;
              }}
              onBlur={() => {
                latestPausedRef.current = false;
              }}
              onPointerDown={() => {
                // kalau user mulai swipe/drag, jangan dipaksa autoplay
                latestPausedRef.current = true;
              }}
              onPointerUp={() => {
                latestPausedRef.current = false;
              }}
            >
              {latestLoopList.map((event, idx) => {
                const isActive = idx === activeLatestIndex;
                return (
                <article
                  className={`latest-card${isActive ? " is-active" : ""}`}
                  key={`${event.id ?? "latest"}-${idx}`}
                  role="listitem"
                  aria-current={isActive ? "true" : "false"}
                  tabIndex={0}
                  onClick={() => {
                    scrollLatestToIndex(idx);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      scrollLatestToIndex(idx);
                    }
                  }}
                >
                  <div
                    className="latest-card-media"
                    style={{
                      background:
                        event.imageGradient ||
                        [
                          "linear-gradient(135deg, #0ea5e9, #22c55e)",
                          "linear-gradient(135deg, #7c3aed, #a78bfa)",
                          "linear-gradient(135deg, #f97316, #fb7185)",
                          "linear-gradient(135deg, #06b6d4, #6366f1)",
                        ][idx % 4],
                    }}
                  >
                    <div className="latest-card-badge">{event.category || "Event"}</div>
                  </div>

                  <div className="latest-card-body">
                    <h3 className="latest-card-title">{event.title}</h3>
                    <div className="latest-card-meta">
                      <span className="latest-card-metaitem">📅 {event.date}</span>
                      <span className="latest-card-metaitem">📍 {event.location}</span>
                    </div>
                    <div className="latest-card-footer">
                      <span className="latest-card-org">{event.organizer || "Organizer"}</span>
                      <button type="button" className="latest-card-cta">
                        Detail
                      </button>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section featured-section">
          <div className="section-inner container">
            <header className="section-header">
              <h2 className="section-title">Event Unggulan</h2>
              <p className="section-subtitle">
                Pilihan event populer minggu ini.
              </p>
            </header>
            <div className="events-grid">
              {events.map((event) => (
                <article className="event-card" key={event.id}>
                  <div className="event-card-media">
                    <div className="event-card-tag">{event.category}</div>
                  </div>
                  <div className="event-card-body">
                    <h3 className="event-title">{event.title}</h3>
                    <div className="event-meta">
                      <span className="event-meta-item">📅 {event.date}</span>
                      <span className="event-meta-item">📍 {event.location}</span>
                    </div>
                    <p className="event-organizer">
                      Oleh <strong>{event.organizer}</strong>
                    </p>
                    <div className="event-actions">
                      <button type="button" className="event-btn">
                        {event.buttonLabel || "Beli Tiket"}
                      </button>
                      <a href="#" className="event-link">Detail</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="section-footer">
              <button type="button" className="btn-ghost">
                Lihat Semua Event →
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        © 2026 EventPlace. Semua hak cipta dilindungi.
      </footer>
    </div>
  );
}
