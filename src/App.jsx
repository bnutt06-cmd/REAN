import React, { useState, useEffect } from "react";
import { getDogListings } from "./lib/dogsApi";
import { submitEnquiry } from "./lib/enquiriesApi";

// ---- Brand tokens ----
const C = {
  paper: "#f7f4ec",
  paperDeep: "#efe9db",
  ink: "#20271f",
  inkSoft: "#4a5347",
  forest: "#2f6b3a",
  forestDeep: "#1f4a28",
  amber: "#f0a92b",
  amberDeep: "#d8901a",
  rust: "#9a5a2b",
  line: "#e0d8c6",
  white: "#ffffff",
  danger: "#b3261e",
};

const display = "'Fraunces', Georgia, serif";
const sans = "'Inter', system-ui, -apple-system, sans-serif";

// ---- Placeholder dog portrait ----
function DogPortrait({ hue = 30, style }) {
  const gid = "dp" + hue + Math.round((style?.h || 0) * 1000);
  const a = `hsl(${hue} 55% 78%)`;
  const b = `hsl(${hue + 12} 45% 62%)`;
  const c = `hsl(${hue - 6} 35% 42%)`;
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block", ...style }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${gid})`} />
      <g fill={c} opacity="0.9" transform="translate(200 230)">
        <ellipse cx="0" cy="20" rx="92" ry="86" />
        <path d="M-86 -52 Q-120 -120 -70 -96 Q-44 -84 -52 -40 Z" />
        <path d="M86 -52 Q120 -120 70 -96 Q44 -84 52 -40 Z" />
        <circle cx="-34" cy="0" r="11" fill={a} />
        <circle cx="34" cy="0" r="11" fill={a} />
        <ellipse cx="0" cy="44" rx="16" ry="12" fill={a} />
      </g>
    </svg>
  );
}

// Hero photo with graceful fallback to the SVG placeholder if the file
// isn't present yet (or fails to load). Drop real photos into /public as
// hero-1.jpg … hero-4.jpg and they appear automatically.
function HeroImage({ src, hue }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <DogPortrait hue={hue} />;
  return (
    <img
      src={src}
      alt="A rescued REAN dog"
      onError={() => setFailed(true)}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}

function Logo({ size = 44 }) {
  return (
    <img
      src="/rean-logo.png"
      width={size}
      height={size}
      alt="REAN — Rescuing European Animals in Need"
      style={{ display: "block", width: size, height: size, objectFit: "contain" }}
    />
  );
}

const NAV = [
  { label: "Home", page: "home" },
  { label: "Adopt a Dog", page: "adopt", children: [
    { label: "Dogs in Foster in the UK", page: "adopt", q: "uk" },
    { label: "Dogs & Puppies in Romania", page: "adopt", q: "romania" },
  ]},
  { label: "Happy Homes", page: "happy" },
  { label: "Support Us", page: "donate", children: [
    { label: "Donate", page: "donate" },
    { label: "Where Your Money Goes", page: "donate" },
  ]},
  { label: "REAN News", page: "news" },
  { label: "Contact Us", page: "contact" },
];

function Header({ go, current }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openAcc, setOpenAcc] = useState(null);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = (page, q) => { go(page, q); setMobileOpen(false); setOpenAcc(null); };
  const goAdmin = () => { setMobileOpen(false); window.location.href = "/admin"; };

  return (
    <>
      <div style={{ background: C.forestDeep, textAlign: "center" }}>
        <button onClick={() => nav("donate")} style={{ ...btnReset, color: "rgba(255,255,255,.9)", fontSize: 13, padding: "8px 16px", fontFamily: sans }}>
          Text&nbsp;<strong style={{ color: "#fff" }}>REAN</strong>&nbsp;to&nbsp;<strong style={{ color: "#fff" }}>70191</strong>&nbsp;to donate £10 →
        </button>
      </div>

      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: scrolled ? "rgba(247,244,236,.82)" : C.paper,
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled ? C.line : "transparent"}`,
        transition: "all .3s",
      }}>
        <nav style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 20px" }}>
          <button onClick={() => nav("home")} style={{ ...btnReset, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <Logo size={52} />
            <span style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>REAN</span>
          </button>

          <div className="rean-desktop" style={{ alignItems: "center", gap: 22 }}>
            {NAV.map((item) => item.children ? (
              <div key={item.label} style={{ position: "relative" }} onMouseEnter={() => setHover(item.label)} onMouseLeave={() => setHover(null)}>
                <button onClick={() => nav(item.page)} style={{ ...navLink, display: "flex", alignItems: "center", gap: 4 }}>
                  {item.label}
                  <Chevron open={hover === item.label} />
                </button>
                <div style={{
                  position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", paddingTop: 10,
                  visibility: hover === item.label ? "visible" : "hidden",
                  opacity: hover === item.label ? 1 : 0, transition: "opacity .15s",
                }}>
                  <div style={{ width: 290, background: "rgba(255,255,255,.97)", border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 50px -20px rgba(31,74,40,.35)" }}>
                    {item.children.map((c) => (
                      <button key={c.label} onClick={() => nav(c.page, c.q)} style={{ ...btnReset, display: "block", width: "100%", textAlign: "left", padding: "14px 18px", fontFamily: sans, fontWeight: 600, color: C.ink, fontSize: 14.5 }}
                        onMouseEnter={(e) => e.currentTarget.style.background = C.paperDeep}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <button key={item.label} onClick={() => nav(item.page)} style={{ ...navLink, color: current === item.page ? C.forest : navLink.color, fontWeight: current === item.page ? 700 : 500 }}>
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button className="rean-desktop" onClick={goAdmin} style={{ ...btnReset, alignItems: "center", gap: 8, border: `1px solid ${C.line}`, background: "#fff", padding: "9px 18px", borderRadius: 999, fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.ink, whiteSpace: "nowrap" }}>
              <UserIcon /> Staff Login
            </button>
            <button className="rean-desktop" onClick={() => nav("donate")} style={{ ...btnReset, display: "inline-block", background: C.forest, color: "#fff", padding: "10px 22px", borderRadius: 999, fontFamily: sans, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>
              Donate
            </button>
            <button className="rean-mobile" onClick={() => setMobileOpen(v => !v)} aria-label="Menu" style={{ ...btnReset, width: 44, height: 44, alignItems: "center", justifyContent: "center", color: C.ink }}>
              <Burger open={mobileOpen} />
            </button>
          </div>
        </nav>
      </header>

      <div className="rean-mobile" style={{
        position: "fixed", inset: 0, zIndex: 30, background: C.paper, paddingTop: 88,
        visibility: mobileOpen ? "visible" : "hidden", opacity: mobileOpen ? 1 : 0, transition: "all .3s",
        overflowY: "auto",
      }}>
        <div style={{ padding: "0 24px 40px" }}>
          {NAV.map((item) => item.children ? (
            <div key={item.label} style={{ borderBottom: `1px solid ${C.line}99` }}>
              <button onClick={() => setOpenAcc(openAcc === item.label ? null : item.label)} style={{ ...btnReset, display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", padding: "20px 0", fontFamily: display, fontSize: 24, color: C.ink }}>
                {item.label} <Chevron open={openAcc === item.label} big />
              </button>
              {openAcc === item.label && (
                <div style={{ paddingBottom: 12 }}>
                  {item.children.map((c) => (
                    <button key={c.label} onClick={() => nav(c.page, c.q)} style={{ ...btnReset, display: "block", padding: "12px 0 12px 16px", fontFamily: sans, fontSize: 17, color: C.inkSoft }}>{c.label}</button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button key={item.label} onClick={() => nav(item.page)} style={{ ...btnReset, display: "block", width: "100%", textAlign: "left", padding: "20px 0", borderBottom: `1px solid ${C.line}99`, fontFamily: display, fontSize: 24, color: C.ink }}>{item.label}</button>
          ))}
          <button onClick={() => nav("donate")} style={{ ...btnReset, display: "block", width: "100%", marginTop: 28, background: C.forest, color: "#fff", padding: "16px", borderRadius: 999, fontFamily: sans, fontSize: 16, fontWeight: 600, textAlign: "center" }}>Donate</button>
          <button onClick={goAdmin} style={{ ...btnReset, display: "flex", width: "100%", marginTop: 12, justifyContent: "center", alignItems: "center", gap: 8, border: `1px solid ${C.line}`, background: "#fff", padding: "16px", borderRadius: 999, fontFamily: sans, fontSize: 16, fontWeight: 500, color: C.ink }}><UserIcon /> Staff Login</button>
        </div>
      </div>
    </>
  );
}

function Chevron({ open, big }) {
  return <svg width={big ? 22 : 16} height={big ? 22 : 16} viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", color: big ? C.forest : "inherit" }}><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function UserIcon() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}
function Burger({ open }) {
  return (
    <div style={{ position: "relative", width: 24, height: 16 }}>
      <span style={{ position: "absolute", left: 0, width: 24, height: 2, borderRadius: 2, background: "currentColor", transition: "all .3s", top: open ? 7 : 0, transform: open ? "rotate(45deg)" : "none" }} />
      <span style={{ position: "absolute", left: 0, top: 7, width: 24, height: 2, borderRadius: 2, background: "currentColor", transition: "all .3s", opacity: open ? 0 : 1 }} />
      <span style={{ position: "absolute", left: 0, width: 24, height: 2, borderRadius: 2, background: "currentColor", transition: "all .3s", top: open ? 7 : 14, transform: open ? "rotate(-45deg)" : "none" }} />
    </div>
  );
}

const btnReset = { background: "none", border: "none", padding: 0, margin: 0, cursor: "pointer", display: "flex" };
const navLink = { ...btnReset, fontFamily: sans, fontSize: 15, fontWeight: 500, color: "rgba(32,39,31,.8)", padding: "8px 0", whiteSpace: "nowrap" };

function Home({ go, dogs, loading }) {
  const hueGrid = [28, 46, 18, 38];
  return (
    <main>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 20px 24px" }}>
        <div className="rean-hero-grid">
          <div>
            <span style={pill}><span style={{ width: 8, height: 8, borderRadius: 999, background: C.amber }} /> Rescuing dogs from Romania since 2013</span>
            <h1 style={{ fontFamily: display, fontWeight: 600, lineHeight: 1.04, letterSpacing: "-0.02em", color: C.ink, fontSize: "clamp(2.6rem, 6vw, 4rem)", margin: "24px 0 0" }}>
              We bring them to safety.<br /><span style={{ fontStyle: "italic", color: C.forest }}>You bring them home.</span>
            </h1>
            <p style={{ fontFamily: sans, fontSize: 18, lineHeight: 1.6, color: C.inkSoft, maxWidth: 440, marginTop: 24 }}>
              We rescue stray dogs from the streets and shelters of Romania, care for them, and bring them to loving homes across the UK.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
              <button onClick={() => go("adopt")} style={ctaPrimary}>Meet the dogs</button>
              <button onClick={() => go("donate")} style={ctaSecondary}>Donate</button>
            </div>
          </div>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ aspectRatio: "3/4", borderRadius: 28, overflow: "hidden" }}><HeroImage src="/hero-1.jpg" hue={hueGrid[0]} /></div>
                <div style={{ aspectRatio: "1", borderRadius: 28, overflow: "hidden" }}><HeroImage src="/hero-2.jpg" hue={hueGrid[1]} /></div>
              </div>
              <div style={{ display: "grid", gap: 16, paddingTop: 40 }}>
                <div style={{ aspectRatio: "1", borderRadius: 28, overflow: "hidden" }}><HeroImage src="/hero-3.jpg" hue={hueGrid[2]} /></div>
                <div style={{ aspectRatio: "3/4", borderRadius: 28, overflow: "hidden" }}><HeroImage src="/hero-4.jpg" hue={hueGrid[3]} /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, background: C.paperDeep, marginTop: 40 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          {[["3,000+", "Dogs rescued & re-homed"], ["200+", "Dogs in our care right now"], ["2", "Sanctuaries in Romania"], ["2013", "Rescuing ever since"]].map(([n, l], i) => (
            <div key={i} style={{ padding: "36px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: display, fontSize: 34, fontWeight: 700, color: C.forest }}>{n}</div>
              <div style={{ fontFamily: sans, fontSize: 14, color: C.inkSoft, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 20px", marginBottom: 24 }}>
          <div>
            <p style={eyebrow}>Waiting for you</p>
            <h2 style={h2}>Latest Additions</h2>
          </div>
          <button onClick={() => go("adopt")} style={{ ...ctaSecondary, padding: "10px 18px", fontSize: 14 }}>See all →</button>
        </div>
        {loading ? (
          <p style={{ padding: "0 20px", color: C.inkSoft }}>Loading beautiful dogs...</p>
        ) : dogs.length === 0 ? (
          <p style={{ padding: "0 20px", color: C.inkSoft }}>No current available dogs listed yet.</p>
        ) : (
          <div className="rean-scroll" style={{ display: "flex", gap: 20, overflowX: "auto", padding: "4px 20px 16px" }}>
            {dogs.map((d) => <DogCard key={d.id} dog={d} go={go} />)}
          </div>
        )}
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 72px" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
          <p style={eyebrow}>Two ways to adopt</p>
          <h2 style={h2}>Some are already here. Some are waiting.</h2>
        </div>
        <div className="rean-two">
          {[
            { tag: "Ready now", title: "Dogs in foster in the UK", body: "These dogs are already here, living with UK foster families. Meet them and, once approved, bring them home soon.", q: "uk", hue: 34, accent: C.forest },
            { tag: "Waiting for a home", title: "Dogs & puppies in Romania", body: "Most of our dogs are still in our Romanian sanctuaries. They travel to the UK once a loving home is confirmed.", q: "romania", hue: 44, accent: C.amberDeep },
          ].map((p) => (
            <button key={p.q} onClick={() => go("adopt", p.q)} style={{ ...btnReset, display: "block", textAlign: "left", width: "100%", border: `1px solid ${C.line}`, background: "#fff", borderRadius: 24, overflow: "hidden" }}>
              <div style={{ aspectRatio: "16/9" }}><DogPortrait hue={p.hue} /></div>
              <div style={{ padding: 28 }}>
                <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: p.accent }}>{p.tag}</span>
                <h3 style={{ fontFamily: display, fontSize: 26, fontWeight: 600, color: C.ink, margin: "8px 0 0" }}>{p.title}</h3>
                <p style={{ fontFamily: sans, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, marginTop: 12 }}>{p.body}</p>
                <span style={{ fontFamily: sans, fontWeight: 600, color: C.forest, marginTop: 18, display: "inline-block" }}>Browse dogs →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section style={{ position: "relative", background: C.forest, color: "#fff", overflow: "hidden" }}>
        {/* Faded sanctuary photo behind the content. The green overlay keeps text fully legible. */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "url(/money-bg.jpg)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.18 }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${C.forest} 0%, rgba(47,107,58,0.92) 45%, rgba(47,107,58,0.80) 100%)` }} />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "80px 20px" }}>
          <div className="rean-money">
            <div>
              <p style={{ ...eyebrow, color: C.amber }}>Where your money goes</p>
              <h2 style={{ fontFamily: display, fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 600, lineHeight: 1.15, margin: 0 }}>Every pound moves a dog one step closer to home.</h2>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,.8)", maxWidth: 420, marginTop: 20 }}>REAN is run by volunteers, so your donation goes straight to the dogs — vet bills, transport, and daily care.</p>
              <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 18, padding: 24, marginTop: 32, backdropFilter: "blur(8px)" }}>
                <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: C.amber, margin: 0 }}>Text to donate</p>
                <ul style={{ fontFamily: sans, listStyle: "none", padding: 0, margin: "12px 0 0", color: "rgba(255,255,255,.92)", lineHeight: 1.9 }}>
                  <li>Text <strong style={{ color: "#fff" }}>REAN</strong> to 70191 to give £10</li>
                  <li>Text <strong style={{ color: "#fff" }}>REAN2</strong> to 70191 to give £20</li>
                  <li>Text <strong style={{ color: "#fff" }}>REAN3</strong> to 70191 to give £30</li>
                </ul>
                <button onClick={() => go("donate")} style={{ ...btnReset, display: "inline-block", background: C.amber, color: C.ink, padding: "12px 24px", borderRadius: 999, fontFamily: sans, fontWeight: 600, marginTop: 20 }}>More ways to give →</button>
              </div>
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              {[["🩺", "Veterinary care", "Neutering, vaccination and microchipping before any dog can leave Romania."], ["🚐", "Safe transport", "The journey from our sanctuaries to their new UK homes, done safely and legally."], ["🦴", "Food & shelter", "Feeding and caring for 200+ dogs in our sanctuaries and UK kennels every day."]].map(([icon, t, b]) => (
                <div key={t} style={{ display: "flex", gap: 20, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.05)", borderRadius: 18, padding: 24 }}>
                  <div style={{ width: 56, height: 56, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 12, background: "rgba(255,255,255,.1)", fontSize: 24 }}>{icon}</div>
                  <div>
                    <h3 style={{ fontFamily: display, fontSize: 20, fontWeight: 600, margin: 0 }}>{t}</h3>
                    <p style={{ fontFamily: sans, fontSize: 15, color: "rgba(255,255,255,.75)", margin: "4px 0 0", lineHeight: 1.5 }}>{b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 760, margin: "0 auto", padding: "96px 20px", textAlign: "center" }}>
        <h2 style={{ fontFamily: display, fontSize: "clamp(1.9rem,5vw,3rem)", fontWeight: 600, lineHeight: 1.12, color: C.ink, margin: 0 }}>
          Can't adopt right now?<br /><span style={{ fontStyle: "italic", color: C.forest }}>There are other ways to help.</span>
        </h2>
        <p style={{ fontFamily: sans, fontSize: 18, color: C.inkSoft, maxWidth: 520, margin: "20px auto 0" }}>Foster a dog, donate food and bedding, or simply share our dogs with someone who's ready.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 32 }}>
          <button onClick={() => go("contact")} style={ctaPrimary}>Become a foster</button>
          <button onClick={() => go("donate")} style={ctaSecondary}>Donate today</button>
        </div>
      </section>
    </main>
  );
}

function DogCard({ dog, go }) {
  const isUk = (dog.status || "").startsWith("uk");
  return (
    <button onClick={() => go("dog", dog.id)} style={{ ...btnReset, display: "block", textAlign: "left", width: 300, flexShrink: 0, border: `1px solid ${C.line}`, background: "#fff", borderRadius: 24, overflow: "hidden" }}>
      <div style={{ position: "relative", aspectRatio: "4/5", background: C.paperDeep }}>
        {dog.photo_urls?.[0] ? (
          <img src={dog.photo_urls[0]} alt={dog.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <DogPortrait hue={28} />
        )}
        <span style={{ position: "absolute", top: 14, left: 14, padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, fontFamily: sans, background: isUk ? "rgba(47,107,58,.92)" : "rgba(240,169,43,.95)", color: isUk ? "#fff" : C.ink }}>
          {isUk ? "In the UK" : "In Romania"}
        </span>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h3 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.ink, margin: 0 }}>{dog.name}</h3>
          <span style={{ fontFamily: sans, fontSize: 14, color: C.inkSoft }}>{dog.age}</span>
        </div>
        <p style={{ fontFamily: sans, fontSize: 14, color: C.inkSoft, margin: "4px 0 0", textTransform: "capitalize" }}>{dog.gender} · {dog.size}</p>
        <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.55, color: C.inkSoft, margin: "12px 0 0", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{dog.bio}</p>
        <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 700, color: C.forest, marginTop: 16, display: "inline-block" }}>Meet {dog.name} →</span>
      </div>
    </button>
  );
}

function Placeholder({ title, eyebrowText, children, go }) {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "72px 20px 96px", minHeight: "60vh" }}>
      <p style={eyebrow}>{eyebrowText}</p>
      <h1 style={{ fontFamily: display, fontSize: "clamp(2.2rem,5vw,3.2rem)", fontWeight: 600, color: C.ink, margin: "8px 0 0", lineHeight: 1.1 }}>{title}</h1>
      <div style={{ marginTop: 28, fontFamily: sans, fontSize: 17, lineHeight: 1.7, color: C.inkSoft }}>{children}</div>
      <button onClick={() => go("home")} style={{ ...ctaSecondary, marginTop: 36 }}>← Back home</button>
    </main>
  );
}

function AdoptPage({ go, q, dogs, loading }) {
  const [filter, setFilter] = useState(q || "all");
  useEffect(() => { if (q) setFilter(q); }, [q]);

  const shown = dogs.filter((d) => {
    if (filter === "all") return true;
    if (filter === "uk") return (d.status || "").startsWith("uk");
    if (filter === "romania") return d.status === "romania";
    return true;
  });

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 20px 96px" }}>
      <p style={eyebrow}>Adopt a dog</p>
      <h1 style={{ fontFamily: display, fontSize: "clamp(2.2rem,5vw,3.2rem)", fontWeight: 600, color: C.ink, margin: "8px 0 0" }}>Find your new best friend</h1>
      <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
        {[["all", "All available"], ["uk", "In the UK"], ["romania", "In Romania"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ ...btnReset, display: "inline-block", padding: "9px 18px", borderRadius: 999, fontFamily: sans, fontSize: 14, fontWeight: 600, border: `1px solid ${filter === k ? C.forest : C.line}`, background: filter === k ? C.forest : "#fff", color: filter === k ? "#fff" : C.ink }}>{l}</button>
        ))}
      </div>
      {loading ? (
        <p style={{ marginTop: 36, color: C.inkSoft }}>Retrieving records...</p>
      ) : shown.length === 0 ? (
        <p style={{ marginTop: 36, color: C.inkSoft }}>No matching dogs currently listed.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginTop: 36 }}>
          {shown.map((d) => <DogCard key={d.id} dog={d} go={go} />)}
        </div>
      )}
    </main>
  );
}

function EnquiryForm({ dog, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", honeypot: "" });
  const [state, setState] = useState({ type: "idle", message: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setState({ type: "idle", message: "" });
    if (!form.name.trim() || !form.email.trim()) {
      setState({ type: "error", message: "Please enter at least your name and email." });
      return;
    }
    setState({ type: "sending", message: "" });
    try {
      await submitEnquiry({ dogId: dog.id, dogName: dog.name, ...form });
      setState({ type: "success", message: "" });
    } catch (err) {
      setState({ type: "error", message: err.message });
    }
  }

  if (state.type === "success") {
    return (
      <div style={{ marginTop: 28, padding: 24, borderRadius: 18, background: "#eef4ee", border: `1px solid ${C.forest}` }}>
        <h3 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, color: C.forestDeep, margin: 0 }}>Thank you! 🐾</h3>
        <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.6, color: C.ink, margin: "8px 0 0" }}>
          Your enquiry about {dog.name} has been sent to the REAN team. A volunteer will be in touch by email soon — please do check your spam folder just in case.
        </p>
      </div>
    );
  }

  const fieldStyle = { width: "100%", boxSizing: "border-box", padding: "11px 13px", fontFamily: sans, fontSize: 15, color: C.ink, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, outline: "none" };
  const lbl = { display: "block", fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 6 };
  const sending = state.type === "sending";

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 28, padding: 24, borderRadius: 18, background: C.paperDeep, border: `1px solid ${C.line}` }} noValidate>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, color: C.ink, margin: 0 }}>Enquire about {dog.name}</h3>
        <button type="button" onClick={onClose} aria-label="Close" style={{ ...btnReset, fontSize: 22, color: C.inkSoft, lineHeight: 1 }}>×</button>
      </div>
      <p style={{ fontFamily: sans, fontSize: 14, color: C.inkSoft, margin: "0 0 18px", lineHeight: 1.5 }}>
        Leave your details and a short message. A REAN volunteer will email you back to talk through next steps — there's no commitment in saying hello.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="rean-enq-row">
          <div><label style={lbl}>Your name *</label><input style={fieldStyle} value={form.name} onChange={set("name")} /></div>
          <div><label style={lbl}>Phone (optional)</label><input style={fieldStyle} value={form.phone} onChange={set("phone")} /></div>
        </div>
        <div><label style={lbl}>Email *</label><input type="email" style={fieldStyle} value={form.email} onChange={set("email")} /></div>
        <div><label style={lbl}>Message</label><textarea style={{ ...fieldStyle, minHeight: 100, resize: "vertical", lineHeight: 1.5 }} value={form.message} onChange={set("message")} placeholder={`Tell us a little about your home and why ${dog.name} caught your eye…`} /></div>
      </div>

      {/* Honeypot: hidden from people, visible to bots. */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <label>Leave this field empty<input tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={set("honeypot")} /></label>
      </div>

      {state.type === "error" && <p style={{ fontFamily: sans, fontSize: 14, color: C.danger, margin: "14px 0 0" }}>{state.message}</p>}

      <button type="submit" disabled={sending} style={{ ...ctaPrimary, marginTop: 18, opacity: sending ? 0.7 : 1 }}>
        {sending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}

function DogProfile({ go, id, dogs }) {
  const dog = dogs.find((d) => d.id === id);
  const [showEnquiry, setShowEnquiry] = useState(false);
  if (!dog) return <p style={{ padding: 40 }}>Finding profile records...</p>;

  const traits = [];
  if (dog.good_with_dogs) traits.push("Good with dogs");
  if (dog.good_with_cats) traits.push("Good with cats");
  if (dog.good_with_kids) traits.push("Good with kids");
  if (dog.neutered) traits.push("Neutered / Spayed");
  if (dog.vaccinated) traits.push("Vaccinated");

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px 96px" }}>
      <button onClick={() => go("adopt")} style={{ ...btnReset, fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.forest, marginBottom: 24 }}>← All dogs</button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }} className="rean-profile">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 28, overflow: "hidden", aspectRatio: "4/5", boxShadow: "0 20px 40px -20px rgba(31,74,40,.4)", background: C.paperDeep }}>
            {dog.photo_urls?.[0] ? <img src={dog.photo_urls[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <DogPortrait hue={30} />}
          </div>
          {dog.photo_urls && dog.photo_urls.length > 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {dog.photo_urls.slice(1).map((url, i) => (
                <div key={i} style={{ aspectRatio: "1", borderRadius: 12, overflow: "hidden", border: `1px solid ${C.line}` }}>
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.forest }}>
            {(dog.status || "").replace("_", " ")}
          </span>
          <h1 style={{ fontFamily: display, fontSize: "clamp(2.4rem,6vw,3.6rem)", fontWeight: 600, color: C.ink, margin: "6px 0 0", lineHeight: 1 }}>{dog.name}</h1>
          <p style={{ fontFamily: sans, fontSize: 16, color: C.inkSoft, margin: "12px 0 0", textTransform: "capitalize" }}>{dog.gender} · {dog.age} · {dog.size}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
            {traits.map((t) => <span key={t} style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.forestDeep, background: C.paperDeep, border: `1px solid ${C.line}`, padding: "6px 14px", borderRadius: 999 }}>{t}</span>)}
          </div>
          <p style={{ fontFamily: sans, fontSize: 17, lineHeight: 1.7, color: C.ink, marginTop: 24, whiteSpace: "pre-wrap" }}>{dog.bio}</p>
          {!showEnquiry && (
            <button onClick={() => setShowEnquiry(true)} style={{ ...ctaPrimary, marginTop: 28 }}>Apply to adopt {dog.name}</button>
          )}
          {showEnquiry && <EnquiryForm dog={dog} onClose={() => setShowEnquiry(false)} />}
        </div>
      </div>
    </main>
  );
}

function Footer({ go }) {
  const col = (title, links) => (
    <div>
      <h3 style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.amber, marginBottom: 16 }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(([l, p, q]) => <button key={l} onClick={() => go(p, q)} style={{ ...btnReset, fontFamily: sans, fontSize: 14, color: "rgba(247,244,236,.8)", textAlign: "left" }}>{l}</button>)}
      </div>
    </div>
  );
  return (
    <footer style={{ background: C.ink, color: C.paper, marginTop: 0 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 20px" }}>
        <div className="rean-footer">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Logo size={48} /><span style={{ fontFamily: display, fontSize: 24, fontWeight: 600 }}>REAN</span>
            </div>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.6, color: "rgba(247,244,236,.7)", maxWidth: 280, marginTop: 16 }}>Rescuing European Animals in Need. Saving stray dogs from Romania since 2013, and finding them forever homes in the UK.</p>
            <p style={{ fontFamily: sans, fontSize: 14, color: "rgba(247,244,236,.7)", marginTop: 16 }}>UK kennels in Dereham, Norfolk · Two sanctuaries in Romania</p>
          </div>
          {col("Adopt", [["Dogs in the UK", "adopt", "uk"], ["Dogs in Romania", "adopt", "romania"], ["Happy Homes", "happy"], ["How adoption works", "adopt"]])}
          {col("Support", [["Donate", "donate"], ["Where your money goes", "donate"], ["Foster a dog", "contact"], ["REAN News", "news"]])}
          {col("Contact", [["reanrescue@outlook.com", "contact"], ["Get in touch", "contact"], ["Facebook", "contact"]])}
        </div>
        <div style={{ borderTop: "1px solid rgba(247,244,236,.15)", marginTop: 56, paddingTop: 24, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", fontFamily: sans, fontSize: 13.5, color: "rgba(247,244,236,.6)" }}>
          <span>© {new Date().getFullYear()} REAN — Rescuing European Animals in Need. Registered charity.</span>
          <div style={{ display: "flex", gap: 24 }}><button onClick={() => go("privacy")} style={{ ...btnReset, color: "inherit", fontFamily: sans, fontSize: 13.5 }}>Privacy</button><button onClick={() => go("terms")} style={{ ...btnReset, color: "inherit", fontFamily: sans, fontSize: 13.5 }}>Terms</button><a href="/admin" style={{ color: "inherit", fontFamily: sans, fontSize: 13.5, textDecoration: "none" }}>Staff Login</a></div>
        </div>
      </div>
    </footer>
  );
}

const pill = { display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${C.line}`, background: "#fff", padding: "6px 16px", borderRadius: 999, fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.forest };
const ctaPrimary = { ...btnReset, display: "inline-block", background: C.forest, color: "#fff", padding: "14px 28px", borderRadius: 999, fontFamily: sans, fontSize: 16, fontWeight: 600 };
const ctaSecondary = { ...btnReset, display: "inline-block", background: "#fff", color: C.ink, padding: "14px 28px", borderRadius: 999, fontFamily: sans, fontSize: 16, fontWeight: 600, border: `1px solid ${C.line}` };
const eyebrow = { fontFamily: sans, fontSize: 13, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: C.forest, margin: 0 };
const h2 = { fontFamily: display, fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 600, color: C.ink, margin: "8px 0 0", lineHeight: 1.1 };

export default function App() {
  const [page, setPage] = useState("home");
  const [param, setParam] = useState(null);
  const [liveDogs, setLiveDogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const go = (p, x) => { setPage(p); setParam(x || null); window.scrollTo({ top: 0, behavior: "auto" }); };

  useEffect(() => {
    async function fetchPublicDogs() {
      try {
        const listings = await getDogListings();
        setLiveDogs(listings);
      } catch (err) {
        console.error("Error loading public dogs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicDogs();
  }, []);

  const availableDogs = liveDogs.filter(d => d.status !== "adopted");
  const adoptedDogs = liveDogs.filter(d => d.status === "adopted");

  const pages = {
    home: <Home go={go} dogs={availableDogs.slice(0, 4)} loading={loading} />,
    adopt: <AdoptPage go={go} q={param} dogs={availableDogs} loading={loading} />,
    dog: <DogProfile go={go} id={param} dogs={liveDogs} />,
    happy: <Placeholder go={go} eyebrowText="Happy Homes" title="Happy tails, forever homes">
      <p style={{ marginBottom: 20 }}>Stories and photos of REAN dogs settled into their new families will live here.</p>
      {loading ? (
        <p>Loading adopted stories...</p>
      ) : adoptedDogs.length === 0 ? (
        <p>No adopted stories posted yet. Check back soon!</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginTop: 24 }}>
          {adoptedDogs.map((d) => (
            <div key={d.id} style={{ border: `1px solid ${C.line}`, background: "#fff", borderRadius: 24, overflow: "hidden", padding: 20 }}>
              <div style={{ aspectRatio: "4/3", borderRadius: 16, overflow: "hidden", background: C.paper, marginBottom: 12 }}>
                {d.photo_urls?.[0] ? <img src={d.photo_urls[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <DogPortrait hue={30} />}
              </div>
              <h3 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, color: C.ink, margin: 0 }}>{d.name}</h3>
              <p style={{ fontFamily: sans, fontSize: 14, color: C.inkSoft, marginTop: 4 }}>{d.age} • Fully Rehomed 🎉</p>
              <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.5, color: C.inkSoft, marginTop: 8 }}>{d.bio}</p>
            </div>
          ))}
        </div>
      )}
    </Placeholder>,
    donate: <Placeholder go={go} eyebrowText="Support us" title="Help us bring them home"><p>Every donation goes straight to the dogs: vet care, transport, and daily food and shelter.</p><p style={{ marginTop: 16 }}><strong style={{ color: C.ink }}>Text to donate:</strong> Text REAN to 70191 (£10), REAN2 (£20), or REAN3 (£30).</p><p style={{ marginTop: 16 }}><strong style={{ color: C.ink }}>Standing order:</strong> Sort code 60-05-33, Account 23491086.</p><p style={{ marginTop: 16 }}>PayPal and debit/credit card options will be wired up here.</p></Placeholder>,
    news: <Placeholder go={go} eyebrowText="REAN News" title="The latest from the rescue">Updates from our sanctuaries, transport days, and rescue stories. The blog feed is a placeholder for now.</Placeholder>,
    contact: <Placeholder go={go} eyebrowText="Contact us" title="Get in touch"><p>Whether you want to adopt, foster, or donate supplies, we'd love to hear from you.</p><p style={{ marginTop: 16 }}>Email: <strong style={{ color: C.ink }}>reanrescue@outlook.com</strong></p></Placeholder>,
    signin: <Placeholder go={go} eyebrowText="Account" title="Sign in"><p>To manage dog listings, visit the dashboard page directly:</p><button onClick={() => window.location.pathname = "/admin"} style={{ ...ctaPrimary, marginTop: 16 }}>Go to Admin Panel →</button></Placeholder>,
    privacy: <Placeholder go={go} eyebrowText="Legal" title="Privacy policy">Placeholder for REAN's privacy policy.</Placeholder>,
    terms: <Placeholder go={go} eyebrowText="Legal" title="Terms">Placeholder for REAN's terms.</Placeholder>,
  };

  return (
    <div style={{ background: C.paper, color: C.ink, minHeight: "100vh", fontFamily: sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .rean-desktop { display: flex !important; }
        .rean-mobile { display: none !important; }
        .rean-hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 48px; align-items: center; }
        .rean-two { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .rean-money { display: grid; grid-template-columns: 1fr 1.1fr; gap: 48px; align-items: center; }
        .rean-footer { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 40px; }
        .rean-scroll::-webkit-scrollbar { height: 0; }
        .rean-scroll { scrollbar-width: none; }
        @media (max-width: 1080px) {
          .rean-desktop { display: none !important; }
          .rean-mobile { display: flex !important; }
          .rean-hero-grid { grid-template-columns: 1fr; gap: 56px; }
          .rean-two { grid-template-columns: 1fr; }
          .rean-money { grid-template-columns: 1fr; gap: 32px; }
          .rean-footer { grid-template-columns: 1fr 1fr; gap: 32px; }
          .rean-profile { grid-template-columns: 1fr !important; }
          .rean-enq-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) { .rean-footer { grid-template-columns: 1fr; } }
      `}</style>
      <Header go={go} current={page} />
      {pages[page]}
      <Footer go={go} />
    </div>
  );
}