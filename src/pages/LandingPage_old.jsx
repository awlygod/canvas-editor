import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  const handleStart = (e) => {
    e.preventDefault();
    navigate('/canvas/new');
  };

  return (
    <div>
      {/* NAV */}
      <nav>
        <div className="nav-logo">kite<span>.</span></div>
        <ul className="nav-links">
          <li><a href="#features">features</a></li>
          <li><a href="#ai">ai</a></li>
          <li><a href="#collab">collab</a></li>
        </ul>
        <div className="nav-actions">
          <button className="btn-ghost" onClick={() => navigate('/auth')}>log in</button>
          <button className="btn-primary" onClick={() => navigate('/auth')}>start free</button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-left">
          <div className="label">collaborative canvas</div>
          <h1 className="hero-headline">
            draw together.<br/>
            <em>live.</em>
          </h1>
          <p className="hero-sub">catch the wind. draw with friends. let ai lift the rest. sketch shapes, write, draw freehand, then invite anyone to create alongside you in real time.</p>
          <div className="hero-cta">
            <button className="btn-cta" onClick={handleStart}>start creating →</button>
            <button className="btn-outline" onClick={() => window.open('https://github.com/awlygod/canvas-editor', '_blank')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              source
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="canvas-mock">
            <div className="canvas-titlebar">
              <div className="dots">
                <div className="dot dot-r"></div>
                <div className="dot dot-y"></div>
                <div className="dot dot-g"></div>
              </div>
              <div className="canvas-toolbar">
                <div className="tool-btn active">↖</div>
                <div className="tool-btn">▭</div>
                <div className="tool-btn">○</div>
                <div className="tool-btn">∿</div>
                <div className="tool-btn">✎</div>
              </div>
            </div>
            <div className="canvas-area">
              <div className="shape-rect"></div>
              <div className="shape-circle"></div>
              <div className="shape-text">hello!</div>
              <div className="cursor-label">
                <div className="cursor-dot"></div>
                <div className="cursor-name">alice</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider"/>
      {/* FEATURES */}
      <section id="features">
        <div className="section-header">
          <div className="label">what you get</div>
          <h2 className="section-title">every tool.<br/>no friction.</h2>
          <p className="section-desc">from basic geometry to ai-generated diagrams. all the tools for getting ideas out of your head and onto a shared canvas, instantly.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-num">01</div>
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            <div className="feature-name">real-time sync</div>
            <div className="feature-desc">every stroke syncs instantly across all sessions. no lag, no reload. just live collaboration as it happens.</div>
          </div>
          <div className="feature-card">
            <div className="feature-num">02</div>
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <div className="feature-name">rich drawing tools</div>
            <div className="feature-desc">rectangles, circles, text, freehand pen. color picker, move, resize, rotate. a full creative toolkit right in your browser.</div>
          </div>
          <div className="feature-card">
            <div className="feature-num">03</div>
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            <div className="feature-name">auto-save</div>
            <div className="feature-desc">kite saves to firebase every 5 seconds. close the tab, reopen the link and everything is exactly where you left it.</div>
          </div>
          <div className="feature-card">
            <div className="feature-num">04</div>
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <div className="feature-name">shareable links</div>
            <div className="feature-desc">each canvas gets a unique url. copy and send. collaborators jump in without any account or setup required.</div>
          </div>
          <div className="feature-card">
            <div className="feature-num">05</div>
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <div className="feature-name">png export</div>
            <div className="feature-desc">download your canvas as a crisp, high-quality png. ready to share, print, or drop into any design workflow.</div>
          </div>
          <div className="feature-card">
            <div className="feature-num">06</div>
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
            <div className="feature-name">open source</div>
            <div className="feature-desc">built entirely in the open. fork it, extend it, self-host it. the full codebase lives on github and welcomes contributions.</div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow">
        <div className="label">the workflow</div>
        <h2 className="section-title">up and drawing<br/>in seconds.</h2>

        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-title">sign up or jump in</div>
            <div className="step-desc">create an account to own your canvases, or jump straight in as a guest. no friction, no mandatory sign-up.</div>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div className="step-title">draw or generate</div>
            <div className="step-desc">use the toolbar to sketch manually, or describe what you need and let the ai generate a flowchart in seconds.</div>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div className="step-title">share the link</div>
            <div className="step-desc">save once. your canvas gets a permanent url. copy and send. anyone with the link can jump right in.</div>
          </div>
          <div className="step">
            <div className="step-num">04</div>
            <div className="step-title">collaborate live</div>
            <div className="step-desc">draw together, leave pinned comments, and watch changes appear instantly. like being in the same room.</div>
          </div>
        </div>
      </section>

      {/* AI */}
      <section id="ai">
        <div>
          <div className="label">new feature</div>
          <h2 className="section-title">type a prompt.<br/><span style={{color:'var(--green)'}}>get a diagram.</span></h2>
          <p className="section-desc" style={{marginTop:'16px'}}>describe any system, process, or workflow in plain english. our ai generates a clean mermaid-style flowchart and places it directly on your canvas.</p>

          <div className="ai-features">
            <div className="ai-feature">
              <div className="ai-icon">⚡</div>
              <div>
                <div className="ai-feature-title">instant generation</div>
                <div className="ai-feature-desc">flowchart appears on your canvas in under 2 seconds, fully editable with all standard tools.</div>
              </div>
            </div>
            <div className="ai-feature">
              <div className="ai-icon">⬡</div>
              <div>
                <div className="ai-feature-title">mermaid-compatible</div>
                <div className="ai-feature-desc">output follows mermaid diagram syntax. export the code or let it render directly as a visual node graph.</div>
              </div>
            </div>
            <div className="ai-feature">
              <div className="ai-icon">↺</div>
              <div>
                <div className="ai-feature-title">refine iteratively</div>
                <div className="ai-feature-desc">not quite right? type a follow-up. the ai adjusts the diagram without starting from scratch.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="diagram-mock">
          <div className="diagram-header">
            <div className="diagram-path">canvas / auth-flow.diagram</div>
            <div className="diagram-dots">
              <div className="diagram-dot"></div>
              <div className="diagram-dot"></div>
              <div className="diagram-dot"></div>
            </div>
          </div>
          <div className="diagram-body">
            <div className="ai-badge">+ ai generated</div>
            <div style={{marginTop:'28px'}}></div>
            <div className="d-node start">start</div>
            <div className="d-arrow"></div>
            <div className="d-node">user visits /login</div>
            <div className="d-arrow"></div>
            <div className="d-node">has account?</div>
            <div className="d-arrow"></div>
            <div className="d-node">email / oauth login</div>
            <div className="d-arrow"></div>
            <div className="d-node">verify & create session</div>
            <div className="d-arrow"></div>
            <div className="d-node end">redirect to canvas</div>
          </div>
        </div>
      </section>

      {/* COLLAB */}
      <section id="collab">
        <div className="comment-mock">
          <div className="comment-card">
            <div className="comment-user">alice</div>
            <div className="comment-text">can we make this box bigger? it's getting cut off on mobile.</div>
            <div className="comment-time">2 min ago</div>
          </div>
          <div className="comment-card">
            <div className="comment-user" style={{color:'#60a5fa'}}>maya</div>
            <div className="comment-text">@alice resolved. updated the dimensions.</div>
            <div className="comment-time">1 min ago</div>
          </div>
          <div className="comment-viewers">
            <div className="avatar-row">
              <div className="avatar av1">A</div>
              <div className="avatar av2">B</div>
              <div className="avatar av3">M</div>
            </div>
            <div className="viewers-text">3 people viewing</div>
          </div>
        </div>

        <div>
          <div className="label">collaboration</div>
          <h2 className="section-title">leave a note.<br/>anywhere on the canvas.</h2>
          <p className="section-desc" style={{marginTop:'16px', marginBottom: 0}}>pin comments directly to shapes, regions, or blank space. teammates see them in real time.</p>

          <div className="collab-features">
            <div className="collab-item">
              <div className="collab-icon-wrap">💬</div>
              <div>
                <div className="collab-item-title">pinned comment threads</div>
                <div className="collab-item-desc">attach a comment to any point on the canvas</div>
              </div>
            </div>
            <div className="collab-item">
              <div className="collab-icon-wrap">✓</div>
              <div>
                <div className="collab-item-title">resolve & dismiss</div>
                <div className="collab-item-desc">mark threads as resolved to keep the canvas clean</div>
              </div>
            </div>
            <div className="collab-item">
              <div className="collab-icon-wrap">@</div>
              <div>
                <div className="collab-item-title">@mention collaborators</div>
                <div className="collab-item-desc">tag anyone on the canvas to notify them instantly</div>
              </div>
            </div>
            <div className="collab-item">
              <div className="collab-icon-wrap">◉</div>
              <div>
                <div className="collab-item-title">live comment feed</div>
                <div className="collab-item-desc">all comments update in real time across every session</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STACK */}
      <section id="stack">
        <div className="label">built with</div>
        <h2 className="section-title">a modern,<br/>proven stack.</h2>
        <div className="stack-tags">
          <span className="tag hi">React 18</span>
          <span className="tag hi">Fabric.js 6</span>
          <span className="tag hi">Firebase</span>
          <span className="tag hi">AI / LLM</span>
          <span className="tag hi">Mermaid</span>
          <span className="tag">Vite</span>
          <span className="tag">React Router v6</span>
          <span className="tag">Firestore</span>
          <span className="tag">Firebase Auth</span>
          <span className="tag">Realtime Listeners</span>
          <span className="tag">Vercel</span>
        </div>
      </section>

      {/* CTA */}
      <section id="cta">
        <div className="label">get started</div>
        <h2 className="cta-title">ready to draw together?</h2>
        <p className="cta-sub">no setup. no friction. open a canvas and invite anyone.</p>
        <div className="cta-buttons">
          <button className="btn-cta" onClick={handleStart}>start creating →</button>
          <button className="btn-outline" onClick={() => window.open('https://github.com/awlygod/canvas-editor', '_blank')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            view source
          </button>
        </div>
      </section>

      <footer>
        <div className="footer-logo">kite<span>.</span></div>
        <div className="footer-copy">© 2025 kite. open source.</div>
      </footer>
    </div>
  );
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