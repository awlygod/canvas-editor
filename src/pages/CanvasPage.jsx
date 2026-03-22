import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCanvas } from '../hooks/useCanvas';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { canvasService } from '../services/canvasService';
import { generateMermaidFromPrompt } from '../services/aiService';
import { parseMermaid, layoutNodes } from '../utils/mermaidParser';
import { drawFlowchart } from '../utils/drawFlowchart';
import './CanvasPage.css';



const AI_CHIPS = ['Flowchart', 'Mind map', 'UI wireframe', 'Org chart', 'Timeline', 'Network'];

/* ─── helpers ─── */
const getInitials = (user) => {
  if (user?.displayName) {
    return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return user?.email?.[0].toUpperCase() ?? '?';
};

const getAvatarColor = (uid) => {
  const gradients = [
    'linear-gradient(135deg, #e63946, #f4a261)',
    'linear-gradient(135deg, #457b9d, #a8dadc)',
    'linear-gradient(135deg, #2d6a4f, #95d5b2)',
    'linear-gradient(135deg, #e9c46a, #f4a261)',
    'linear-gradient(135deg, #8338ec, #ff006e)',
    'linear-gradient(135deg, #fb5607, #ffbe0b)',
    'linear-gradient(135deg, #3a86ff, #8338ec)',
    'linear-gradient(135deg, #06d6a0, #118ab2)',
  ];
  return gradients[uid ? uid.charCodeAt(0) % gradients.length : 0];
};

const CanvasPage = () => {
  const navigate = useNavigate();
  const { canvasId } = useParams();
  const { user } = useAuth();

  /* ── existing state ── */
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentCanvasId, setCurrentCanvasId] = useState(canvasId);
  const [activeColor, setActiveColor] = useState('#e63946');

  /* ── new UI state ── */
  const [canvasTitle, setCanvasTitle] = useState('Untitled Canvas');
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [aiVisible, setAiVisible] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [saveStatus, setSaveStatus] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [ctxMenu, setCtxMenu] = useState({ show: false, x: 0, y: 0 });
  const [paletteTop, setPaletteTop] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [shareModal, setShareModal] = useState({ open: false, url: '', saving: false });
  const [shareCopied, setShareCopied] = useState(false);

  /* ── palette drag refs ── */
  const isDragging = useRef(false);
  const dragOffset = useRef({ y: 0 });
  const paletteRef = useRef(null);

  /* ── canvas hook ── */
  const {
    canvasRef,
    fabricCanvasRef,
    selectedTool,
    setSelectedTool,
    zoomLevel,
    selectedBounds,
    zoomIn,
    zoomOut,
    resetZoom,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    addRectangle,
    addCircle,
    addText,
    addArrow,
    addLine,
    deleteSelected,
    clearCanvas,
    saveCanvas,
    exportCanvas,
    changeColor,
    getSelectedObject,
  } = useCanvas(currentCanvasId, user);


  /* ════════════════ PRESENCE ════════════════ */
  useEffect(() => {
    if (!user || !currentCanvasId || currentCanvasId === 'new') return;
    let unsubPresence;
    canvasService.joinPresence(currentCanvasId, user).catch(() => {});
    unsubPresence = canvasService.subscribeToPresence(currentCanvasId, setOnlineUsers);
    const onUnload = () => canvasService.leavePresence(currentCanvasId, user.uid);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      canvasService.leavePresence(currentCanvasId, user.uid);
      if (unsubPresence) unsubPresence();
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [user, currentCanvasId]);

  /* ════════════════ COMMENTS (real-time) ════════════════ */
  useEffect(() => {
    if (!currentCanvasId || currentCanvasId === 'new') return;
    const unsub = canvasService.subscribeToComments(currentCanvasId, (data) => {
      setComments(data);
    });
    return () => unsub();
  }, [currentCanvasId]);

  /* ════════════════ AUTO-SAVE ════════════════ */
  useEffect(() => {
    if (currentCanvasId === 'new') return;
    const interval = setInterval(async () => {
      if (canvasRef.current && currentCanvasId) {
        try {
          await saveCanvas(currentCanvasId);
          setSaveStatus(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } catch (e) {
          console.error('Auto-save failed:', e);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentCanvasId, saveCanvas]);

  /* ════════════════ KEYBOARD SHORTCUTS ════════════════ */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const map = { v: 'select', r: 'rectangle', c: 'circle', l: 'line', t: 'text', a: 'arrow' };
      if (map[e.key]) {
        handleToolChange(map[e.key]);
        if (e.key === 'a') addArrow();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') { deleteSelected(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  /* Ctrl+wheel zoom is now handled inside useCanvas via Fabric viewport */

  /* ════════════════ PALETTE DRAG ════════════════ */
  const onPaletteMouseDown = useCallback((e) => {
    isDragging.current = true;
    dragOffset.current.y = e.clientY - paletteRef.current.getBoundingClientRect().top;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current || !paletteRef.current) return;
      const newTop = e.clientY - dragOffset.current.y;
      const maxTop = window.innerHeight - paletteRef.current.offsetHeight;
      setPaletteTop(Math.max(52, Math.min(maxTop, newTop)));
    };
    const onUp = () => { isDragging.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  /* ════════════════ CONTEXT MENU ════════════════ */
  useEffect(() => {
    const onDocClick = () => setCtxMenu(m => ({ ...m, show: false }));
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  /* ════════════════ HANDLERS ════════════════ */
  const handleSave = async () => {
    try {
      const newId = await saveCanvas(currentCanvasId);
      if (newId && currentCanvasId === 'new') {
        setCurrentCanvasId(newId);
        navigate(`/canvas/${newId}`, { replace: true });
        setSaveStatus(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setSaveStatus(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      alert('Error saving: ' + err.message);
    }
  };

  const handleToolChange = (tool) => {
    setSelectedTool(tool);
  };

  const handleClear = () => {
    if (window.confirm('Clear the entire canvas?')) clearCanvas();
  };

  const handleColorChange = (color) => {
    setActiveColor(color);
    changeColor(color);
    setShowColorPicker(false);
  };

  const handleZoomIn  = () => zoomIn();
  const handleZoomOut = () => zoomOut();
  const handleFit     = () => resetZoom();



  const handleMouseMoveOnWrap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({ x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setCtxMenu({ show: true, x: e.clientX, y: e.clientY });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    const clsMap = ['ca', 'cb', 'cd'];
    const initials = getInitials(user);
    const name = user.displayName || user.email?.split('@')[0] || 'You';
    const avatarColor = getAvatarColor(user.uid);
    const commentData = {
      uid: user.uid,
      initial: initials,
      name,
      photoURL: user.photoURL || null,
      avatarColor,
      textColor: '#1a1a1a',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: newComment.trim(),
      resolved: false,
      cls: clsMap[comments.length % 3],
    };
    setNewComment('');
    try {
      await canvasService.addComment(currentCanvasId, commentData);
    } catch (e) {
      console.error('Failed to save comment:', e);
    }
  };

  const handleResolve = async (id) => {
    const comment = comments.find(c => c.id === id);
    if (!comment || !currentCanvasId || currentCanvasId === 'new') return;
    try {
      await canvasService.resolveComment(currentCanvasId, id, !comment.resolved);
    } catch (e) {
      console.error('Failed to resolve comment:', e);
    }
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      // 1. Ask Gemini for Mermaid syntax
      const mermaid = await generateMermaidFromPrompt(aiPrompt);
      console.log('Mermaid output:', mermaid);

      // 2. Parse into nodes + edges
      const { nodes, edges } = parseMermaid(mermaid);
      console.log('Parsed nodes:', nodes);
      console.log('Parsed edges:', edges);

      if (!nodes.length) throw new Error('Could not parse any nodes from the AI response. Check console for raw output.');

      // 3. Layout nodes using topological BFS
      const positionedNodes = layoutNodes(nodes, edges);
      console.log('Positioned nodes:', positionedNodes);

      // 4. Clear canvas and draw
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = '#1a1a1a';
     // console.log('LAYOUT RESULT:', layoutNodes(parsedNodes, parsedEdges));
      drawFlowchart(fabricCanvasRef.current, positionedNodes, edges);

    } catch (err) {
      console.error('AI generation failed:', err);
      alert('AI generation failed: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    let id = currentCanvasId;
    if (id === 'new') {
      // Open modal immediately with a pending state
      setShareCopied(false);
      setShareModal({ open: true, url: '', saving: true });
      try {
        id = await saveCanvas('new');
        if (id) {
          setCurrentCanvasId(id);
          navigate(`/canvas/${id}`, { replace: true });
          const url = `${window.location.origin}/canvas/${id}`;
          setShareModal({ open: true, url, saving: false });
        } else {
          setShareModal({ open: false, url: '', saving: false });
          alert('Could not save canvas. Please try again.');
        }
      } catch (err) {
        console.error('Save before share failed:', err);
        setShareModal({ open: false, url: '', saving: false });
        alert('Could not save canvas: ' + err.message);
      }
      return;
    }
    const url = `${window.location.origin}/canvas/${id}`;
    setShareCopied(false);
    setShareModal({ open: true, url, saving: false });
  };

  const handleCopyShareUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await authService.signOut();
    navigate('/auth');
  };

  const handleNewCanvas = () => {
    if (comments.length > 0 || canvasTitle !== 'Untitled Canvas') {
      if (!window.confirm('Start a new canvas? Unsaved changes will be lost.')) return;
    }
    clearCanvas();
    setComments([]);
    setCanvasTitle('Untitled Canvas');
    setSaveStatus('');
    navigate('/canvas/new', { replace: true });
  };

  const handleExport = () => exportCanvas(canvasTitle);

  /* canvas fills viewport — zoom/pan managed by Fabric viewport transform */

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="cp-root">

      {/* ─── HEADER ─── */}
      <header className="cp-header">
        {/* Logo */}
        <span className="h-logo" onClick={() => navigate('/')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          KITE<span>.</span>
        </span>

        {/* Editable title */}
        <div className="h-title-wrap">
          <input
            className="h-title"
            value={canvasTitle}
            onChange={e => setCanvasTitle(e.target.value)}
            spellCheck={false}
          />
          <button className="h-title-edit" title="Rename">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>

        {/* ─── Collaborator avatars ─── */}
        <div className="h-collabs">
          {/* Online users from presence */}
          {onlineUsers.filter(u => u.uid !== user?.uid).map(u => (
            <div
              key={u.uid}
              className="h-avatar"
              title={u.displayName || u.email}
              style={{
                backgroundImage: u.photoURL ? 'none' : getAvatarColor(u.uid),
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700', color: '#fff',
                border: '2px solid #3ecf5c', flexShrink: 0,
              }}
            >
              {u.photoURL
                ? <img src={u.photoURL} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : getInitials(u)
              }
            </div>
          ))}

          {user ? (
            <>
              {/* Current user avatar + dropdown */}
              <div style={{ position: 'relative' }}>
                <div
                  className="h-avatar"
                  onClick={() => setShowUserMenu(p => !p)}
                  title={user.displayName || user.email}
                  style={{
                    backgroundImage: user.photoURL ? 'none' : getAvatarColor(user.uid),
                    cursor: 'pointer', overflow: 'hidden',
                    border: '2px solid transparent', transition: 'border-color 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '700', color: '#fff',
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#fff'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  {user.photoURL
                    ? <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : getInitials(user)
                  }
                </div>

                {showUserMenu && (
                  <>
                    <div onClick={() => setShowUserMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
                    <div style={{
                      position: 'absolute', top: '40px', right: 0,
                      background: '#1e1e1e', border: '1px solid #444', borderRadius: '10px',
                      padding: '12px', minWidth: '190px', zIndex: 999,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      display: 'flex', flexDirection: 'column', gap: '8px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          backgroundImage: user.photoURL ? 'none' : getAvatarColor(user.uid),
                          overflow: 'hidden', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: '700', color: '#fff',
                        }}>
                          {user.photoURL
                            ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : getInitials(user)
                          }
                        </div>
                        <div>
                          <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600', lineHeight: 1.3 }}>{user.displayName || 'User'}</div>
                          <div style={{ color: '#888', fontSize: '10px', marginTop: '2px', wordBreak: 'break-all' }}>{user.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3ecf5c', boxShadow: '0 0 6px #3ecf5c', animation: 'cp-pulse 2s infinite' }} />
                        <span style={{ color: '#888', fontSize: '11px', fontFamily: "'Space Mono', monospace" }}>
                          {onlineUsers.length} live
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        style={{
                          background: 'transparent', border: '1px solid #ca3746', color: '#ca3746',
                          borderRadius: '6px', padding: '7px 12px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '600', textAlign: 'left', transition: 'all 0.2s', marginTop: '2px',
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#ca3746'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ca3746'; }}
                      >Log Out</button>
                    </div>
                  </>
                )}
              </div>

              <div className="h-live">
                <div className="h-live-dot" />
                {onlineUsers.length} live
              </div>
            </>
          ) : (
            <button className="h-btn h-btn-save" onClick={() => navigate('/auth')}>Sign In</button>
          )}
        </div>

        {/* Action buttons */}
        <div className="h-actions">
          <button className="h-btn h-btn-ghost" onClick={() => setCommentsOpen(o => !o)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Comments
          </button>

          <button className="h-btn h-btn-ghost" onClick={() => setAiVisible(v => !v)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            AI
          </button>

          <div className="h-div" />

          <button className="h-btn h-btn-ghost" onClick={handleNewCanvas}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="11" x2="12" y2="17"/>
              <line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            New
          </button>

          <button className="h-btn h-btn-ghost" onClick={handleShare}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>

          <button className="h-btn h-btn-ghost" onClick={handleExport}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
        </div>
      </header>

      {/* ─── CANVAS AREA ─── */}
      <div
        className="cp-canvas-wrap cp-dark"
        onMouseMove={handleMouseMoveOnWrap}
        onContextMenu={handleContextMenu}
      >
        <div className="cp-canvas-surface">
          <canvas ref={canvasRef} />
          {generating && (
            <div className="gen-overlay show">
              <div className="gen-spinner" />
              <div className="gen-text">Generating…</div>
              <div className="gen-subtext">Placing objects on canvas</div>
            </div>
          )}
          <div className="cp-canvas-label">Space+drag or middle-mouse to pan · Ctrl+wheel to zoom</div>
        </div>
      </div>

      {/* ─── PALETTE ─── */}
      <div
        className="palette"
        ref={paletteRef}
        style={paletteTop !== null ? { top: paletteTop, transform: 'none' } : {}}
      >
        <div className="palette-handle" onMouseDown={onPaletteMouseDown}>
          {[0,1,2,3,4].map(i => <div key={i} className="handle-dot" />)}
        </div>
        <div className="palette-tools">

          {/* Select */}
          <div className="p-group">
            <button
              className={`p-tool${selectedTool === 'select' ? ' active' : ''}`}
              data-tip="Select  [V]"
              onClick={() => handleToolChange('select')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M4 4l7 18 3-7 7-3z"/>
              </svg>
              <span className="p-tool-label">Select</span>
            </button>
          </div>

          {/* Shapes */}
          <div className="p-group">
            <button
              className={`p-tool${selectedTool === 'rectangle' ? ' active' : ''}`}
              data-tip="Rectangle  [R]"
              onClick={() => { handleToolChange('rectangle'); addRectangle(activeColor); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <rect x="3" y="3" width="18" height="18"/>
              </svg>
              <span className="p-tool-label">Rect</span>
            </button>

            <button
              className={`p-tool${selectedTool === 'circle' ? ' active' : ''}`}
              data-tip="Circle  [C]"
              onClick={() => { handleToolChange('circle'); addCircle(activeColor); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              <span className="p-tool-label">Circle</span>
            </button>

            <button
              className={`p-tool${selectedTool === 'line' ? ' active' : ''}`}
              data-tip="Line  [L]"
              onClick={() => { handleToolChange('line'); addLine(activeColor); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <line x1="5" y1="19" x2="19" y2="5"/>
              </svg>
              <span className="p-tool-label">Line</span>
            </button>
          </div>

          {/* Arrow */}
          <div className="p-group">
            <button
              className={`p-tool${selectedTool === 'arrow' ? ' active' : ''}`}
              data-tip="Arrow  [A]"
              onClick={() => { handleToolChange('arrow'); addArrow(activeColor); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="13 6 19 12 13 18"/>
              </svg>
              <span className="p-tool-label">Arrow</span>
            </button>
          </div>

          {/* Text */}
          <div className="p-group">
            <button
              className={`p-tool${selectedTool === 'text' ? ' active' : ''}`}
              data-tip="Text  [T]"
              onClick={() => { handleToolChange('text'); addText(); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <polyline points="4 7 4 4 20 4 20 7"/>
                <line x1="9" y1="20" x2="15" y2="20"/>
                <line x1="12" y1="4" x2="12" y2="20"/>
              </svg>
              <span className="p-tool-label">Text</span>
            </button>
          </div>

          {/* Color + Delete */}
          <div className="p-group">
            <div
              className="p-color-swatch"
              style={{ background: activeColor }}
              title="Color"
              onClick={() => setShowColorPicker(v => !v)}
            />
            <button
              className="p-tool"
              data-tip="Delete  [Del]"
              onClick={deleteSelected}
              style={{ color: 'rgba(230,57,70,0.7)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
              <span className="p-tool-label">Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── INLINE COLOR PICKER ─── */}
      {showColorPicker && (
        <div style={{
          position: 'fixed', left: 84, top: '50%', transform: 'translateY(-50%)',
          background: '#0a0a0a', border: '1.5px solid rgba(245,240,232,0.15)',
          boxShadow: '6px 6px 0 rgba(10,10,10,0.85)',
          padding: 12, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: 132 }}>
            {['#e63946','#457b9d','#2d6a4f','#f4a261','#a8dadc','#000000','#ffffff','#8a8375'].map(c => (
              <div
                key={c}
                onClick={() => handleColorChange(c)}
                style={{
                  width: 26, height: 26, background: c, cursor: 'pointer',
                  border: activeColor === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                  transition: 'transform 0.1s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
          <input
            type="color" defaultValue={activeColor}
            onChange={e => handleColorChange(e.target.value)}
            style={{ width: '100%', height: 30, cursor: 'pointer', border: 'none', background: 'none' }}
          />
          <button
            onClick={() => setShowColorPicker(false)}
            style={{
              fontFamily: "'Space Mono', monospace", fontSize: 8,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              background: 'rgba(245,240,232,0.07)', color: 'rgba(245,240,232,0.5)',
              border: '1px solid rgba(245,240,232,0.1)', cursor: 'pointer', padding: '4px 0',
            }}
          >Close</button>
        </div>
      )}

      {/* ─── ZOOM BAR ─── */}
      <div className="zoom-bar">
        <button className="z-btn" onClick={handleZoomOut}>−</button>
        <div className="z-level" onClick={handleFit}>{zoomLevel}%</div>
        <button className="z-btn" onClick={handleZoomIn}>+</button>
        <button className="z-fit" onClick={handleFit}>Fit</button>
      </div>

      {/* ─── AI PANEL ─── */}
      <div className={`ai-panel${!aiVisible ? ' hidden' : ''}${aiCollapsed ? ' collapsed' : ''}`}>
        <div className="ai-header" onClick={() => setAiCollapsed(c => !c)}>
          <div className="ai-header-left">
            <svg className="ai-star" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            AI Generate
          </div>
          <button className="ai-toggle" onClick={e => { e.stopPropagation(); setAiVisible(false); }}>✕</button>
        </div>
        <div className="ai-body">
          <div className="ai-chips">
            {AI_CHIPS.map(chip => (
              <span key={chip} className="ai-chip" onClick={() => setAiPrompt(chip)}>{chip}</span>
            ))}
          </div>
          <textarea
            className="ai-input"
            placeholder="Describe what to generate…"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            rows={3}
          />
          <button
            className={`ai-generate${generating ? ' loading' : ''}`}
            onClick={handleGenerate}
          >
            {generating
              ? <><div style={{ width:12,height:12,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'cp-spin 0.8s linear infinite' }} /> Generating…</>
              : '✦ Generate'
            }
          </button>
        </div>
      </div>

      {/* ─── COMMENTS SIDEBAR ─── */}
      <div className={`comments-sidebar${commentsOpen ? ' open' : ''}`}>
        <div className="cs-header">
          <span className="cs-title">COMMENTS</span>
          <button className="cs-close" onClick={() => setCommentsOpen(false)}>✕</button>
        </div>
        <div className="cs-body">
          {comments.length === 0 && (
            <div style={{
              padding: '32px 16px', textAlign: 'center',
              color: 'rgba(245,240,232,0.2)',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px', lineHeight: 1.8,
            }}>
              No comments yet.<br />Be the first to add one.
            </div>
          )}
          {comments.map(cm => (
            <div key={cm.id} className={`comment-card ${cm.cls}${cm.resolved ? ' cc-resolved' : ''}`}>
              <div className="cc-top">
                <div className="cc-avatar" style={{
                  background: cm.photoURL ? 'transparent' : 'none',
                  backgroundImage: cm.photoURL ? 'none' : cm.avatarColor,
                  overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cm.photoURL
                    ? <img src={cm.photoURL} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : cm.initial
                  }
                </div>
                <span className="cc-name">{cm.name}</span>
                <span className="cc-time">{cm.time}</span>
              </div>
              <div className="cc-text" style={{ color: cm.resolved ? '#aaa' : '#1a1a1a' }}>
                {cm.text}
              </div>
              {cm.resolved && <div className="cc-resolved-label">✓ Resolved</div>}
              <div className="cc-actions">
                <button className="cc-action" onClick={() => handleResolve(cm.id)}>
                  {cm.resolved ? 'Unresolve' : 'Resolve'}
                </button>
                <button className="cc-action">Reply</button>
              </div>
            </div>
          ))}
        </div>
        <div className="cs-new">
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  background: user.photoURL ? 'transparent' : 'none',
                  backgroundImage: user.photoURL ? 'none' : getAvatarColor(user.uid),
                  overflow: 'hidden', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#fff',
                }}>
                  {user.photoURL
                    ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : getInitials(user)
                  }
                </div>
                <span style={{ fontSize: '11px', color: 'rgba(245,240,232,0.5)', fontFamily: "'Space Mono', monospace" }}>
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </div>
              <textarea
                className="cs-new-input"
                placeholder="Add a comment…"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={3}
              />
              <button className="cs-new-btn" onClick={handleAddComment}>Post Comment</button>
            </>
          ) : (
            <div style={{
              padding: '16px', textAlign: 'center',
              color: 'rgba(245,240,232,0.3)',
              fontFamily: "'Space Mono', monospace", fontSize: '11px', lineHeight: 1.8,
            }}>
              <div>Sign in to comment.</div>
              <button
                onClick={() => navigate('/auth')}
                style={{
                  marginTop: '8px', background: 'transparent',
                  border: '1px solid rgba(245,240,232,0.2)',
                  color: 'rgba(245,240,232,0.5)', padding: '6px 14px',
                  cursor: 'pointer', fontSize: '10px',
                  fontFamily: "'Space Mono', monospace",
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}
              >Sign In</button>
            </div>
          )}
        </div>
      </div>

      {/* ─── SIDE TAB ─── */}
      <div className={`side-tabs${commentsOpen ? ' shifted' : ''}`}>
        <button
          className={`side-tab${commentsOpen ? ' active' : ''}`}
          onClick={() => setCommentsOpen(o => !o)}
        >
          <span className="side-tab-label">Comments</span>
        </button>
      </div>

      {/* ─── STATUS BAR ─── */}
      <div className="cp-statusbar">
        <div className="sb-item">
          <div className="sb-dot" />
          <span>{saveStatus ? `Saved ${saveStatus}` : (currentCanvasId === 'new' ? 'Unsaved' : 'Auto-saving…')}</span>
        </div>
        <div className="sb-item">Tool <span>{selectedTool || 'select'}</span></div>
        <div className="sb-item">Cursor <span>{cursorPos.x}, {cursorPos.y}</span></div>
        <div className="sb-item">Zoom <span>{zoomLevel}%</span></div>
        <div className="sb-item" style={{ marginLeft: 'auto' }}>
          {currentCanvasId !== 'new' && (
            <>ID <span style={{ fontFamily: "'Space Mono', monospace" }}>{currentCanvasId.substring(0, 8)}…</span></>
          )}
        </div>
        <div className="sb-item">
          <button
            onClick={handleClear}
            style={{
              fontFamily: "'Space Mono', monospace", fontSize: 8,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              background: 'transparent', color: 'rgba(230,57,70,0.6)',
              border: 'none', cursor: 'pointer', transition: 'color 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#e63946'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(230,57,70,0.6)'}
          >Clear canvas</button>
        </div>
      </div>

      {/* ─── SHARE MODAL ─── */}
      {shareModal.open && (
        <>
          <div
            onClick={() => setShareModal({ open: false, url: '' })}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9000 }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            background: '#1a1a1a', border: '1.5px solid rgba(255,255,255,0.12)',
            borderRadius: '14px', padding: '28px 28px 24px',
            width: 'min(480px, 90vw)', zIndex: 9001,
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}>Share canvas</span>
              <button
                onClick={() => setShareModal({ open: false, url: '' })}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}
              >✕</button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginBottom: '14px', fontFamily: "'Space Mono',monospace" }}>
              Anyone with this link can view and edit this canvas after signing in.
            </p>
            {shareModal.saving ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontFamily: "'Space Mono',monospace" }}>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'cp-spin 0.8s linear infinite', flexShrink: 0 }} />
                Saving canvas…
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  readOnly
                  value={shareModal.url}
                  onFocus={e => e.target.select()}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px', padding: '10px 12px',
                    color: 'rgba(255,255,255,0.8)', fontSize: '12px',
                    fontFamily: "'Space Mono',monospace", outline: 'none',
                  }}
                />
                <button
                  onClick={() => handleCopyShareUrl(shareModal.url)}
                  style={{
                    background: shareCopied ? '#3ecf5c' : '#e63946',
                    border: 'none', borderRadius: '8px',
                    padding: '10px 16px', color: '#fff',
                    fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                    whiteSpace: 'nowrap', transition: 'background 0.2s',
                  }}
                >
                  {shareCopied ? '✓ Copied!' : 'Copy link'}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── LAYER TOOLBAR (appears when object selected) ─── */}
      {selectedBounds && (
        <div style={{
          position: 'fixed',
          left: selectedBounds.x,
          top:  Math.max(60, selectedBounds.y),
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          padding: '4px 6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          zIndex: 600,
          pointerEvents: 'all',
        }}>
          {[
            { label: '⤒', tip: 'Bring to Front', fn: bringToFront  },
            { label: '↑', tip: 'Bring Forward',  fn: bringForward  },
            { label: '↓', tip: 'Send Backward',  fn: sendBackward  },
            { label: '⤓', tip: 'Send to Back',   fn: sendToBack    },
          ].map(({ label, tip, fn }) => (
            <button
              key={tip}
              title={tip}
              onClick={fn}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.75)',
                fontSize: '14px',
                width: '28px',
                height: '28px',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
            >
              {label}
            </button>
          ))}
          <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />
          <button
            title="Delete"
            onClick={deleteSelected}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(230,57,70,0.7)',
              fontSize: '13px',
              width: '28px',
              height: '28px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(230,57,70,0.15)'; e.currentTarget.style.color = '#e63946'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(230,57,70,0.7)'; }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── CONTEXT MENU ─── */}
      <div
        className={`ctx-menu${ctxMenu.show ? ' show' : ''}`}
        style={{ top: ctxMenu.y, left: ctxMenu.x }}
        onClick={e => e.stopPropagation()}
      >
        <div className="ctx-item" onClick={() => { addRectangle(); setCtxMenu(m=>({...m,show:false})); }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><rect x="3" y="3" width="18" height="18"/></svg>
          Add Rectangle
        </div>
        <div className="ctx-item" onClick={() => { addCircle(); setCtxMenu(m=>({...m,show:false})); }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><circle cx="12" cy="12" r="10"/></svg>
          Add Circle
        </div>
        <div className="ctx-item" onClick={() => { addText(); setCtxMenu(m=>({...m,show:false})); }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
          Add Text
        </div>
        <div className="ctx-sep" />
        <div className="ctx-item danger" onClick={() => { deleteSelected(); setCtxMenu(m=>({...m,show:false})); }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          Delete Selected
        </div>
      </div>

    </div>
  );
};

export default CanvasPage;