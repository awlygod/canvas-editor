import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.fade-up').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleStart = (e) => {
    e.preventDefault();
    navigate('/canvas/new');
  };

  return (
    <div className="landing-root">

      {/* NAV */}
      <nav className="lp-nav">
        <a href="#" className="nav-logo">
          <svg className="nav-logo-icon" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="24" height="24" stroke="#0a0a0a" strokeWidth="1.5"/>
            <path d="M7 21 L11 12 L15 17 L18 13 L21 21" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8" cy="8" r="2" fill="#e63946"/>
          </svg>
          Kite<span>.</span>
        </a>
        <div className="nav-links">
          <a href="#features" className="nl">Features</a>
          <a href="#ai" className="nl">AI</a>
          <a href="#comments" className="nl">Collab</a>
          <a href="/auth" className="nl nav-login">Log in</a>
          <a href="/auth" className="nl nav-cta" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>Start Free</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">Real-time Collaborative Canvas</div>
          <h1 className="hero-title">
            <div>Draw</div>
            <div className="l2">Together.</div>
            <div className="l3">Live.</div>
          </h1>
          <p className="hero-sub">Catch the wind. Draw with friends. Let AI lift the rest.<br/><span style={{fontWeight:300,opacity:0.7,fontSize:'0.92em'}}>Sketch shapes, write, draw freehand, then invite anyone to create alongside you in real time. Now with AI-powered diagrams.</span></p>
          <div className="hero-actions">
            <a href="/canvas/new" className="btn-primary" onClick={handleStart}>
              Start Creating
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="https://github.com/awlygod/canvas-editor" className="btn-ghost" target="_blank" rel="noreferrer">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1C4.134 1 1 4.134 1 8c0 3.09 2.004 5.715 4.784 6.641.35.063.478-.152.478-.337 0-.166-.007-.72-.007-1.308-1.751.322-2.213-.427-2.353-.819-.079-.2-.42-.819-.714-.984-.244-.133-.594-.462-.007-.469.55-.007.943.506 1.074.715.629 1.053 1.632.757 2.034.574.063-.455.245-.757.447-.933-1.554-.175-3.185-.777-3.185-3.451 0-.763.273-1.393.715-1.883-.07-.175-.315-.891.07-1.855 0 0 .584-.182 1.918.714A6.47 6.47 0 0 1 8 4.76c.595.003 1.19.08 1.743.237 1.334-.903 1.918-.714 1.918-.714.385.964.14 1.68.07 1.855.441.49.714 1.113.714 1.883 0 2.681-1.638 3.276-3.192 3.451.252.217.472.637.472 1.288 0 .93-.007 1.68-.007 1.918 0 .185.127.406.477.337A7.01 7.01 0 0 0 15 8c0-3.866-3.134-7-7-7z" fill="currentColor"/>
              </svg>
              Source
            </a>
          </div>
          <div className="hero-pill">
            <div className="pill-dot"></div>
            3 users drawing right now
          </div>
        </div>
        <div className="hero-right">
          <div className="canvas-demo">
            <div className="demo-bar">
              <div className="dot dr"></div>
              <div className="dot dy"></div>
              <div className="dot dg"></div>
              <div className="demo-tools">
                <div className="tb act">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1L1 9L3.5 6.5L5 10L6.5 9.5L5 6H8.5L1 1Z" fill="white"/>
                  </svg>
                </div>
                <div className="tb">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect x="1" y="2" width="10" height="8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2"/>
                  </svg>
                </div>
                <div className="tb">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2"/>
                  </svg>
                </div>
                <div className="tb">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 9L4 3L6 6.5L8 4L10 9" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="tb">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 10L3.5 6.5L8 2L10 4L5.5 8.5L2 10Z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="demo-body">
              <svg className="pen-svg" viewBox="0 0 480 280">
                <path className="sp" d="M40 220 Q120 150 200 180 Q280 210 340 130 Q400 60 440 100"/>
              </svg>
              <div className="shape sh-rect"></div>
              <div className="shape sh-circ"></div>
              <div className="shape sh-txt">Hello!</div>
              <div className="cur ca">
                <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                  <path d="M0 0L0 14L4 10L6 16L8 15.2L6 9.5H11L0 0Z" fill="#e63946"/>
                </svg>
                <div className="cur-lbl">alice</div>
              </div>
              <div className="cur cb">
                <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                  <path d="M0 0L0 14L4 10L6 16L8 15.2L6 9.5H11L0 0Z" fill="#457b9d"/>
                </svg>
                <div className="cur-lbl">bob</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="mq-wrap">
        <div className="mq-track">
          {['Real-time Sync','AI Flowcharts','Freehand Drawing','Inline Comments','Auto-Save','Shareable Links','PNG Export','User Accounts','Open Source',
            'Real-time Sync','AI Flowcharts','Freehand Drawing','Inline Comments','Auto-Save','Shareable Links','PNG Export','User Accounts','Open Source'].map((item, i) => (
            <div className="mq-item" key={i}><span className="mq-dot"></span>{item}</div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="sec-label">What you get</div>
        <div className="feat-head fade-up">
          <h2 className="sec-title">Every tool.<br/>No friction.</h2>
          <p className="feat-desc">From basic geometry to AI-generated diagrams. All the tools for getting ideas out of your head and onto a shared canvas, instantly.</p>
        </div>
        <div className="feat-grid">

          <div className="fc fade-up">
            <div className="fc-num">01</div>
            <div className="feat-icon-wrap">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="8" stroke="#0a0a0a" strokeWidth="1.8"/>
                <path d="M22 6C13.163 6 6 13.163 6 22" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M22 38C30.837 38 38 30.837 38 22" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M6 22C6 30.837 13.163 38 22 38" stroke="#e63946" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="4 3"/>
                <path d="M38 22C38 13.163 30.837 6 22 6" stroke="#e63946" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="4 3"/>
                <path d="M18 6L22 2L26 6" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M26 38L22 42L18 38" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="fc-name">Real-time Sync</div>
            <p className="fc-desc">Every stroke syncs instantly across all sessions. No lag, no reload. Just live collaboration as it happens.</p>
          </div>

          <div className="fc fade-up" style={{transitionDelay:'0.1s'}}>
            <div className="fc-num">02</div>
            <div className="feat-icon-wrap">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <path d="M8 36L12 26L32 8L36 12L16 32L8 36Z" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M28 12L32 16" stroke="#e63946" strokeWidth="1.8" strokeLinecap="round"/>
                <rect x="20" y="34" width="16" height="6" rx="1" stroke="#0a0a0a" strokeWidth="1.5"/>
                <circle cx="23" cy="37" r="1.5" fill="#e63946"/>
                <circle cx="28" cy="37" r="1.5" fill="#457b9d"/>
                <circle cx="33" cy="37" r="1.5" fill="#0a0a0a"/>
              </svg>
            </div>
            <div className="fc-name">Rich Drawing Tools</div>
            <p className="fc-desc">Rectangles, circles, text, freehand pen. Color picker, move, resize, rotate. A full creative toolkit right in your browser.</p>
          </div>

          <div className="fc fade-up" style={{transitionDelay:'0.2s'}}>
            <div className="fc-num">03</div>
            <div className="feat-icon-wrap">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <path d="M22 8C15 8 9 13 8 20" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M22 8C29 8 35 13 36 20" stroke="#e63946" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 2.5"/>
                <rect x="12" y="20" width="20" height="16" rx="1" stroke="#0a0a0a" strokeWidth="1.8"/>
                <path d="M17 20V16C17 13.239 19.239 11 22 11C24.761 11 27 13.239 27 16V20" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M8 20L4 16" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M8 20L4 24" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="22" cy="28" r="2.5" fill="#e63946"/>
                <path d="M22 30.5V34" stroke="#e63946" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="fc-name">Auto-Save</div>
            <p className="fc-desc">Kite saves to Firebase every 5 seconds. Close the tab, reopen the link and everything is exactly where you left it.</p>
          </div>

          <div className="fc fade-up" style={{transitionDelay:'0.05s'}}>
            <div className="fc-num">04</div>
            <div className="feat-icon-wrap">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="34" cy="10" r="5" stroke="#0a0a0a" strokeWidth="1.8"/>
                <circle cx="10" cy="22" r="5" stroke="#0a0a0a" strokeWidth="1.8"/>
                <circle cx="34" cy="34" r="5" stroke="#0a0a0a" strokeWidth="1.8"/>
                <path d="M15 19.5L29 12.5" stroke="#e63946" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M15 24.5L29 31.5" stroke="#e63946" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="34" cy="10" r="2" fill="#e63946"/>
                <circle cx="34" cy="34" r="2" fill="#e63946"/>
              </svg>
            </div>
            <div className="fc-name">Shareable Links</div>
            <p className="fc-desc">Each canvas gets a unique URL. Copy and send. Collaborators jump in without any account or setup required.</p>
          </div>

          <div className="fc fade-up" style={{transitionDelay:'0.15s'}}>
            <div className="fc-num">05</div>
            <div className="feat-icon-wrap">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <rect x="6" y="6" width="28" height="28" rx="1" stroke="#0a0a0a" strokeWidth="1.8"/>
                <path d="M6 22L14 16L20 22L28 12L34 20" stroke="#e63946" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="14" cy="14" r="3" stroke="#0a0a0a" strokeWidth="1.5"/>
                <path d="M30 30L38 38" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M34 42H22V36H34" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M28 32L34 38L28 38" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="fc-name">PNG Export</div>
            <p className="fc-desc">Download your canvas as a crisp, high-quality PNG. Ready to share, print, or drop into any design workflow.</p>
          </div>

          <div className="fc fade-up" style={{transitionDelay:'0.25s'}}>
            <div className="fc-num">06</div>
            <div className="feat-icon-wrap">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <path d="M22 6C13.163 6 6 13.163 6 22C6 29.05 10.45 35.05 16.7 37.35C16.7 37.35 16 34 16 32C16 32 13 32 13 29C13 29 16 29 16 26C16 23 14 22 14 22C14 22 14 18 18 18C18 18 18 16 22 16C26 16 26 18 26 18C30 18 30 22 30 22C30 22 28 23 28 26C28 29 31 29 31 29C31 32 28 32 28 32C28 34 27.3 37.35 27.3 37.35C33.55 35.05 38 29.05 38 22C38 13.163 30.837 6 22 6Z" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.7 37.35C18.4 38 20.2 38.4 22 38.4C23.8 38.4 25.6 38 27.3 37.35" stroke="#e63946" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="fc-name">Open Source</div>
            <p className="fc-desc">Built entirely in the open. Fork it, extend it, self-host it. The full codebase lives on GitHub and welcomes contributions.</p>
          </div>

        </div>
      </section>

      {/* AI SECTION */}
      <section className="ai-section" id="ai">
        <div className="ai-inner">
          <div className="ai-left fade-up">
            <div className="sec-label">New feature</div>
            <h2 className="ai-title">Type a prompt.<br/><span>Get a diagram.</span></h2>
            <p className="ai-desc">Describe any system, process, or workflow in plain English. Our AI generates a clean Mermaid-style flowchart and places it directly on your canvas. Editable, shareable, live.</p>

            <div className="ai-prompt-box">
              <div className="ai-prompt-label">Prompt</div>
              <div className="ai-prompt-text">
                Show a user authentication flow with OAuth, email/password fallback, and session handling<span className="cursor-blink"></span>
              </div>
              <button className="ai-gen-btn">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L7.5 4.5L11 6L7.5 7.5L6 11L4.5 7.5L1 6L4.5 4.5L6 1Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
                Generate Diagram
              </button>
            </div>

            <div className="ai-features">
              <div className="ai-feat-row">
                <div className="ai-feat-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L11.8 7.2H17.3L12.8 10.4L14.5 15.6L10 12.5L5.5 15.6L7.2 10.4L2.7 7.2H8.2L10 2Z" stroke="rgba(245,240,232,0.6)" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="ai-feat-text">
                  <h4>Instant Generation</h4>
                  <p>Flowchart appears on your canvas in under 2 seconds, fully editable with all standard tools.</p>
                </div>
              </div>
              <div className="ai-feat-row">
                <div className="ai-feat-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="5" width="16" height="12" rx="1" stroke="rgba(245,240,232,0.6)" strokeWidth="1.3"/>
                    <path d="M6 3V5M14 3V5" stroke="rgba(245,240,232,0.6)" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M5 10H9M11 10H15M5 13H8" stroke="rgba(245,240,232,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="ai-feat-text">
                  <h4>Mermaid-Compatible</h4>
                  <p>Output follows Mermaid diagram syntax. Export the code or let it render directly as a visual node graph.</p>
                </div>
              </div>
              <div className="ai-feat-row">
                <div className="ai-feat-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="rgba(245,240,232,0.6)" strokeWidth="1.3"/>
                    <path d="M7 10L9 12L13 8" stroke="rgba(245,240,232,0.6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="ai-feat-text">
                  <h4>Refine Iteratively</h4>
                  <p>Not quite right? Type a follow-up. The AI adjusts the diagram without starting from scratch.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="ai-right fade-up" style={{transitionDelay:'0.15s'}}>
            <div className="flowchart-frame">
              <div className="flowchart-topbar">
                <div className="fc-bar-left">CANVAS / AUTH-FLOW.DIAGRAM</div>
                <div className="fc-bar-dots">
                  <div className="fc-bar-dot a"></div>
                  <div className="fc-bar-dot"></div>
                  <div className="fc-bar-dot"></div>
                </div>
              </div>
              <svg className="flowchart-svg" viewBox="0 0 380 420" fill="none">
                <path d="M190 50 L190 78" stroke="rgba(245,240,232,0.25)" strokeWidth="1.2" markerEnd="url(#arr)"/>
                <path d="M190 114 L190 142" stroke="rgba(245,240,232,0.25)" strokeWidth="1.2" markerEnd="url(#arr)"/>
                <path d="M190 192 L190 220" stroke="rgba(245,240,232,0.25)" strokeWidth="1.2" markerEnd="url(#arr)"/>
                <path d="M230 167 L310 167 L310 230" stroke="rgba(245,240,232,0.15)" strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#arr2)"/>
                <path d="M190 258 L190 286" stroke="rgba(245,240,232,0.25)" strokeWidth="1.2" markerEnd="url(#arr)"/>
                <path d="M310 266 L310 300 L230 300" stroke="rgba(245,240,232,0.15)" strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#arr2)"/>
                <path d="M190 318 L190 346" stroke="rgba(245,240,232,0.25)" strokeWidth="1.2" markerEnd="url(#arr)"/>
                <defs>
                  <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0 1L3 3L0 5" stroke="rgba(245,240,232,0.5)" strokeWidth="1" fill="none"/>
                  </marker>
                  <marker id="arr2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0 1L3 3L0 5" stroke="rgba(245,240,232,0.25)" strokeWidth="1" fill="none"/>
                  </marker>
                </defs>
                <rect x="150" y="28" width="80" height="26" rx="13" fill="#e63946" opacity="0.9"/>
                <text x="190" y="45" textAnchor="middle" fill="white" fontFamily="Space Mono, monospace" fontSize="9" letterSpacing="0.5">START</text>
                <rect x="120" y="80" width="140" height="36" rx="2" stroke="rgba(245,240,232,0.3)" strokeWidth="1" fill="rgba(245,240,232,0.04)"/>
                <text x="190" y="103" textAnchor="middle" fill="rgba(245,240,232,0.8)" fontFamily="DM Sans, sans-serif" fontSize="10">User visits /login</text>
                <polygon points="190,144 250,168 190,192 130,168" stroke="rgba(245,240,232,0.4)" strokeWidth="1" fill="rgba(69,123,157,0.15)"/>
                <text x="190" y="172" textAnchor="middle" fill="rgba(245,240,232,0.75)" fontFamily="DM Sans, sans-serif" fontSize="9.5">Has account?</text>
                <text x="198" y="186" textAnchor="start" fill="rgba(245,240,232,0.3)" fontFamily="Space Mono, monospace" fontSize="7.5">YES</text>
                <text x="238" y="162" textAnchor="start" fill="rgba(245,240,232,0.3)" fontFamily="Space Mono, monospace" fontSize="7.5">NO</text>
                <rect x="120" y="222" width="140" height="36" rx="2" stroke="rgba(245,240,232,0.3)" strokeWidth="1" fill="rgba(245,240,232,0.04)"/>
                <text x="190" y="244" textAnchor="middle" fill="rgba(245,240,232,0.8)" fontFamily="DM Sans, sans-serif" fontSize="10">Email / OAuth login</text>
                <rect x="250" y="230" width="110" height="36" rx="2" stroke="rgba(245,240,232,0.15)" strokeWidth="1" fill="rgba(245,240,232,0.03)" strokeDasharray="3 2"/>
                <text x="305" y="252" textAnchor="middle" fill="rgba(245,240,232,0.45)" fontFamily="DM Sans, sans-serif" fontSize="9.5">Sign up flow</text>
                <rect x="120" y="288" width="140" height="36" rx="2" stroke="rgba(245,240,232,0.3)" strokeWidth="1" fill="rgba(245,240,232,0.04)"/>
                <text x="190" y="310" textAnchor="middle" fill="rgba(245,240,232,0.8)" fontFamily="DM Sans, sans-serif" fontSize="10">Verify &amp; create session</text>
                <rect x="130" y="348" width="120" height="36" rx="2" stroke="#e63946" strokeWidth="1.2" fill="rgba(230,57,70,0.08)"/>
                <text x="190" y="370" textAnchor="middle" fill="rgba(245,240,232,0.9)" fontFamily="DM Sans, sans-serif" fontSize="10">Redirect to canvas</text>
                <rect x="6" y="6" width="70" height="22" rx="2" fill="#e63946"/>
                <text x="41" y="20" textAnchor="middle" fill="white" fontFamily="Space Mono,monospace" fontSize="8" letterSpacing="0.3">✦ AI GENERATED</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* AUTH SECTION */}
      <section className="auth-section" id="auth">
        <div className="auth-left fade-up">
          <div className="sec-label">User accounts</div>
          <h2 className="sec-title">Your work.<br/>Your identity.</h2>
          <p className="auth-desc">Sign up to own your canvases, access them from any device, and see who's drawing alongside you. All with a persistent profile.</p>
          <div className="auth-bullets">
            <div className="auth-bullet">
              <div className="auth-bullet-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5" r="3" stroke="#0a0a0a" strokeWidth="1.4"/>
                  <path d="M2 14C2 11.239 4.686 9 8 9C11.314 9 14 11.239 14 14" stroke="#0a0a0a" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              Sign up with email or Google OAuth
            </div>
            <div className="auth-bullet">
              <div className="auth-bullet-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="6" width="12" height="9" rx="1" stroke="#0a0a0a" strokeWidth="1.4"/>
                  <path d="M5 6V4C5 2.343 6.343 1 8 1C9.657 1 11 2.343 11 4V6" stroke="#0a0a0a" strokeWidth="1.4" strokeLinecap="round"/>
                  <circle cx="8" cy="10.5" r="1.5" fill="#e63946"/>
                </svg>
              </div>
              All your canvases saved to your account
            </div>
            <div className="auth-bullet">
              <div className="auth-bullet-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L9.5 6H14L10.5 8.5L12 12.5L8 10L4 12.5L5.5 8.5L2 6H6.5L8 2Z" stroke="#0a0a0a" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
              </div>
              Named cursors so collaborators know who's who
            </div>
          </div>
        </div>

        <div className="auth-right fade-up" style={{transitionDelay:'0.15s'}}>
          <div className="auth-card-wrap">
            <div className="auth-card">
              <div className="ac-title">Sign In</div>
              <div className="ac-sub">Welcome back</div>
              <div className="ac-field">
                <label>Email</label>
                <div className="ac-input focus">alex@studio.io</div>
              </div>
              <div className="ac-field">
                <label>Password</label>
                <div className="ac-input">••••••••••</div>
              </div>
              <button className="ac-btn">Continue →</button>
              <div className="ac-divider">or</div>
              <button className="ac-oauth">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#888" strokeWidth="1.2"/>
                  <path d="M7 3V7L10 9" stroke="#888" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Continue with Google
              </button>
            </div>
            <div className="auth-card signup">
              <div className="ac-title">Sign Up</div>
              <div className="ac-sub">Start for free</div>
              <div className="ac-field">
                <label>Name</label>
                <div className="ac-input">Your name</div>
              </div>
              <div className="ac-field">
                <label>Email</label>
                <div className="ac-input">you@example.com</div>
              </div>
              <div className="ac-field">
                <label>Password</label>
                <div className="ac-input">••••••••</div>
              </div>
              <button className="ac-btn blue">Create Account →</button>
            </div>
          </div>
        </div>
      </section>

      {/* REALTIME COMMENTS */}
      <section className="comments-section" id="comments">
        <div className="comments-inner">
          <div className="sec-label">Collaboration</div>
          <h2 className="sec-title fade-up">Leave a note.<br/>Anywhere on the canvas.</h2>
          <div className="comments-grid">
            <div className="comments-left fade-up">
              <p className="cm-desc">Pin comments directly to shapes, regions, or blank space. Teammates see them in real time. No more back-and-forth in Slack trying to describe what you mean.</p>
              <div className="cm-feat-list">
                <div className="cm-feat">
                  <div className="cm-feat-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3 3H15V12H10L7 15V12H3V3Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
                      <path d="M6 7H12M6 9.5H10" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="cm-feat-text">Pinned comment threads</div>
                    <div className="cm-feat-sub">Attach a comment to any point on the canvas</div>
                  </div>
                </div>
                <div className="cm-feat">
                  <div className="cm-feat-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="6" stroke="white" strokeWidth="1.3"/>
                      <path d="M6 9L8 11L12 7" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="cm-feat-text">Resolve &amp; dismiss</div>
                    <div className="cm-feat-sub">Mark threads as resolved to keep the canvas clean</div>
                  </div>
                </div>
                <div className="cm-feat">
                  <div className="cm-feat-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 2L10.5 6.5H15.5L11.5 9.2L13 14L9 11.2L5 14L6.5 9.2L2.5 6.5H7.5L9 2Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="cm-feat-text">@mention collaborators</div>
                    <div className="cm-feat-sub">Tag anyone on the canvas to notify them instantly</div>
                  </div>
                </div>
                <div className="cm-feat">
                  <div className="cm-feat-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2 9C2 5.134 5.134 2 9 2C12.866 2 16 5.134 16 9C16 12.866 12.866 16 9 16C7.8 16 6.67 15.7 5.7 15.17L2 16L2.83 12.3C2.3 11.33 2 10.2 2 9Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="cm-feat-text">Live comment feed</div>
                    <div className="cm-feat-sub">All comments update in real time across every session</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="comments-right fade-up" style={{transitionDelay:'0.15s'}}>
              <div className="comment-canvas-mock">
                <div className="ccm-top">
                  <div className="dot dr"></div>
                  <div className="dot dy"></div>
                  <div className="dot dg"></div>
                </div>
                <div className="ccm-body">
                  <div className="ccm-canvas-area"></div>
                  <div className="comment-pin pin1" style={{animationDelay:'0s'}}>
                    <div className="cp-bubble">
                      <div className="cp-user" style={{color:'var(--accent)'}}>alice</div>
                      <div className="cp-text">Can we make this box bigger? It&apos;s getting cut off on mobile.</div>
                      <div className="cp-time">2 min ago</div>
                    </div>
                    <div className="cp-dot" style={{background:'var(--accent)'}}>A</div>
                  </div>
                  <div className="comment-pin pin2" style={{animationDelay:'1.5s'}}>
                    <div className="cp-bubble">
                      <div className="cp-user" style={{color:'var(--accent2)'}}>bob</div>
                      <div className="cp-text">Love this layout. The flow makes sense now 👌</div>
                      <div className="cp-time">just now</div>
                    </div>
                    <div className="cp-dot" style={{background:'var(--accent2)'}}>B</div>
                  </div>
                  <div className="comment-pin pin3" style={{animationDelay:'0.7s'}}>
                    <div className="cp-bubble">
                      <div className="cp-user" style={{color:'#2d6a4f'}}>maya</div>
                      <div className="cp-text">@alice resolved. Updated the dimensions.</div>
                      <div className="cp-time">1 min ago</div>
                    </div>
                    <div className="cp-dot" style={{background:'#2d6a4f'}}>M</div>
                  </div>
                </div>
                <div className="ccm-users">
                  <div className="user-avatar" style={{background:'var(--accent)'}}>A</div>
                  <div className="user-avatar" style={{background:'var(--accent2)'}}>B</div>
                  <div className="user-avatar" style={{background:'#2d6a4f'}}>M</div>
                  <div className="ccm-users-label">3 people viewing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="how-inner">
          <div className="sec-label">The workflow</div>
          <h2 className="how-title">Up and drawing in seconds.</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <div className="step-title">Sign Up or Jump In</div>
              <p className="step-desc">Create an account to own your canvases, or jump straight in as a guest. No friction, no mandatory sign-up.</p>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <div className="step-title">Draw or Generate</div>
              <p className="step-desc">Use the toolbar to sketch manually, or describe what you need and let the AI generate a flowchart in seconds.</p>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <div className="step-title">Share the Link</div>
              <p className="step-desc">Save once. Your canvas gets a permanent URL. Copy and send. Anyone with the link can jump right in.</p>
            </div>
            <div className="step">
              <div className="step-num">04</div>
              <div className="step-title">Collaborate Live</div>
              <p className="step-desc">Draw together, leave pinned comments, and watch changes appear instantly. Like being in the same room.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TECH */}
      <section className="tech">
        <div className="fade-up">
          <div className="sec-label">Built with</div>
          <h2 className="sec-title" style={{marginBottom:'8px'}}>A modern,<br/>proven stack.</h2>
        </div>
        <div className="fade-up" style={{transitionDelay:'0.1s'}}>
          <div className="tech-badges">
            <div className="tb2 hl">React 18</div>
            <div className="tb2 hl">Fabric.js 6</div>
            <div className="tb2 hl">Firebase</div>
            <div className="tb2 hl2">AI / LLM</div>
            <div className="tb2 hl2">Mermaid</div>
            <div className="tb2">Vite</div>
            <div className="tb2">React Router v6</div>
            <div className="tb2">Firestore</div>
            <div className="tb2">Firebase Auth</div>
            <div className="tb2">Realtime Listeners</div>
            <div className="tb2">Vercel</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-section">
        <h2 className="cta-title">Your canvas is<br/>waiting.</h2>
        <p className="cta-sub">Jump in and start drawing. Sketch manually or generate with AI. Invite anyone. Your ideas deserve a shared surface.</p>
        <div className="cta-actions">
          <a href="/canvas/new" className="btn-white" onClick={handleStart}>Open the Canvas →</a>
          <a href="https://github.com/awlygod/canvas-editor" className="btn-white-ghost" target="_blank" rel="noreferrer">View on GitHub</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="footer-logo">Kite<span>.</span></div>
        <p>Built with ♥ using React, Fabric.js &amp; Firebase</p>
        <div className="footer-links">
          <a href="https://github.com/awlygod/canvas-editor" target="_blank" rel="noreferrer">GitHub</a>
          <a href="/canvas/new" onClick={handleStart}>Live Demo</a>
          <a href="#">Docs</a>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;