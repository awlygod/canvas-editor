import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { canvasService } from '../services/canvasService';

const HEADER_H  = 52;
const STATUS_H  = 28;

export const useCanvas = (canvasId, user) => {
  const canvasRef        = useRef(null);
  const fabricCanvasRef  = useRef(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [zoomLevel, setZoomLevel]       = useState(100);
  const [selectedBounds, setSelectedBounds] = useState(null); // { x, y } for layer toolbar
  const isSavingRef      = useRef(false);
  const debounceTimer    = useRef(null);
  const lastSavedBy      = useRef(null); // uid of whoever triggered the last Firestore write
  const isPanning        = useRef(false);
  const lastPan          = useRef({ x: 0, y: 0 });
  const spacePressed     = useRef(false);
  const handlersRef      = useRef({});
  // Keep a stable ref to canvasId and user so event callbacks stay fresh
  const canvasIdRef      = useRef(canvasId);
  const userRef          = useRef(user);
  useEffect(() => { canvasIdRef.current = canvasId; }, [canvasId]);
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    let unsubscribe;
    
    const initCanvas = async () => {
      if (canvasRef.current && !fabricCanvasRef.current) {
        const w = window.innerWidth;
        const h = window.innerHeight - HEADER_H - STATUS_H;

        // Create new fabric canvas — fills the viewport
        fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
          width: w,
          height: h,
          backgroundColor: '#0e0e0e',
          selection: true,
          selectionColor:        'rgba(74,144,217,0.08)',
          selectionBorderColor:  'rgba(74,144,217,0.4)',
          selectionLineWidth:    1,
        });

        const fc = fabricCanvasRef.current;

        // Remove selection borders & controls globally
        fabric.FabricObject.ownDefaults = {
          ...fabric.FabricObject.ownDefaults,
          borderColor:        'transparent',
          cornerColor:        'rgba(255,255,255,0.9)',
          cornerStrokeColor:  'transparent',
          cornerSize:         8,
          cornerStyle:        'circle',
          transparentCorners: false,
          hasBorders:         false,
        };

        /* ── resize to always fill viewport ── */
        const handleResize = () => {
          if (!fabricCanvasRef.current) return;
          fabricCanvasRef.current.setWidth(window.innerWidth);
          fabricCanvasRef.current.setHeight(window.innerHeight - HEADER_H - STATUS_H);
          fabricCanvasRef.current.renderAll();
        };
        window.addEventListener('resize', handleResize);

        /* ── zoom via Ctrl+wheel ── */
        fc.on('mouse:wheel', (opt) => {
          if (!opt.e.ctrlKey) return;
          opt.e.preventDefault();
          let zoom = fc.getZoom() * (0.999 ** opt.e.deltaY);
          zoom = Math.min(Math.max(zoom, 0.1), 5);
          fc.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
          setZoomLevel(Math.round(zoom * 100));
        });

        /* ── pan via Space+drag or middle mouse ── */
        const onKeyDown = (e) => {
          if (e.code === 'Space' && !e.target.closest('input, textarea')) {
            spacePressed.current = true;
            fc.defaultCursor = 'grab';
            fc.renderAll();
          }
        };
        const onKeyUp = (e) => {
          if (e.code === 'Space') {
            spacePressed.current = false;
            fc.defaultCursor = 'default';
            fc.renderAll();
          }
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // Store for cleanup
        handlersRef.current = { handleResize, onKeyDown, onKeyUp };

        fc.on('mouse:down', (opt) => {
          if (spacePressed.current || opt.e.button === 1) {
            opt.e.preventDefault();
            isPanning.current = true;
            lastPan.current = { x: opt.e.clientX, y: opt.e.clientY };
            fc.selection = false;
            fc.defaultCursor = 'grabbing';
          }
        });
        fc.on('mouse:move', (opt) => {
          if (!isPanning.current) return;
          fc.relativePan({
            x: opt.e.clientX - lastPan.current.x,
            y: opt.e.clientY - lastPan.current.y,
          });
          lastPan.current = { x: opt.e.clientX, y: opt.e.clientY };
        });
        fc.on('mouse:up', () => {
          if (isPanning.current) {
            isPanning.current = false;
            fc.selection = true;
            fc.defaultCursor = spacePressed.current ? 'grab' : 'default';
          }
        });

        // ── selection toolbar position ──
        const updateSelBounds = () => {
          const obj = fc.getActiveObject();
          if (!obj) { setSelectedBounds(null); return; }
          const b = obj.getBoundingRect();
          setSelectedBounds({ x: b.left + b.width / 2, y: b.top - 48 });
        };
        fc.on('selection:created', updateSelBounds);
        fc.on('selection:updated', updateSelBounds);
        fc.on('object:moving',    updateSelBounds);
        fc.on('object:scaling',   updateSelBounds);
        fc.on('object:rotating',  updateSelBounds);
        fc.on('selection:cleared', () => setSelectedBounds(null));
        fc.on('mouse:up',          updateSelBounds);

        // ── debounced real-time save on any canvas mutation ──
        const scheduleSave = () => {
          const id = canvasIdRef.current;
          if (!id || id === 'new' || !fabricCanvasRef.current || isSavingRef.current) return;
          clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(async () => {
            isSavingRef.current = true;
            try {
              const canvasJSON = fabricCanvasRef.current.toJSON();
              const uid = userRef.current?.uid || null;
              lastSavedBy.current = uid;
              await canvasService.updateCanvas(id, { canvasJSON, userId: uid });
            } catch (e) {
              console.error('Real-time save failed:', e);
            } finally {
              isSavingRef.current = false;
            }
          }, 600);
        };

        fc.on('object:added',    scheduleSave);
        fc.on('object:modified', scheduleSave);
        fc.on('object:removed',  scheduleSave);
        fc.on('path:created',    scheduleSave);

        // Load from Firestore if canvasId exists and is not "new"
        if (canvasId && canvasId !== 'new') {
          try {
            console.log('Loading canvas:', canvasId);
            const canvasData = await canvasService.getCanvas(canvasId);
            console.log('Canvas data:', canvasData);
            
            if (canvasData && canvasData.canvasJSON) {
              await new Promise((resolve) => {
                fabricCanvasRef.current.loadFromJSON(canvasData.canvasJSON, () => {
                  fabricCanvasRef.current.renderAll();
                  // Force a second render after a short delay
                  setTimeout(() => {
                    fabricCanvasRef.current.requestRenderAll();
                  }, 100);
                  console.log('Canvas loaded successfully with', fabricCanvasRef.current.getObjects().length, 'objects');
                  resolve();
                });
              });
            }

            // Subscribe to real-time updates
            unsubscribe = canvasService.subscribeToCanvas(canvasId, (data) => {
              // Skip if we are currently in the middle of saving
              if (isSavingRef.current) return;
              // Skip if this snapshot was triggered by our own save
              const currentUid = userRef.current?.uid;
              if (currentUid && data.userId === currentUid && lastSavedBy.current === currentUid) return;

              if (data.canvasJSON && fabricCanvasRef.current) {
                const activeObject = fabricCanvasRef.current.getActiveObject();
                if (!activeObject) {
                  fabricCanvasRef.current.loadFromJSON(data.canvasJSON, () => {
                    fabricCanvasRef.current.renderAll();
                    setTimeout(() => {
                      fabricCanvasRef.current.requestRenderAll();
                    }, 100);
                  });
                }
              }
            });
          } catch (error) {
            console.error('Error loading canvas:', error);
          }
        }
      }
    };

    initCanvas();

    return () => {
      const { handleResize, onKeyDown, onKeyUp } = handlersRef.current;
      if (handleResize) window.removeEventListener('resize', handleResize);
      if (onKeyDown)    window.removeEventListener('keydown', onKeyDown);
      if (onKeyUp)      window.removeEventListener('keyup', onKeyUp);
      clearTimeout(debounceTimer.current);
      if (unsubscribe) {
        unsubscribe();
      }
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [canvasId]);

  // Helper to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const FILL_OPACITY = 0.15;

  const addRectangle = (color = '#4ade80') => {
    if (!fabricCanvasRef.current) return;
    
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: hexToRgba(color, FILL_OPACITY),
      stroke: color,
      strokeWidth: 2,
      width: 100,
      height: 100,
    });
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  };

  const addCircle = (color = '#4ade80') => {
    if (!fabricCanvasRef.current) return;
    
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      fill: hexToRgba(color, FILL_OPACITY),
      stroke: color,
      strokeWidth: 2,
      radius: 50,
    });
    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
    fabricCanvasRef.current.renderAll();
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;
    
    const text = new fabric.IText('Edit me!', {
      left: 200,
      top: 200,
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#ffffff',
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  const addArrow = (color = '#4ade80') => {
    if (!fabricCanvasRef.current) return;

    const line = new fabric.Line([50, 0, 200, 0], {
      stroke: color,
      strokeWidth: 2,
      selectable: false,
    });

    const arrowhead = new fabric.Triangle({
      width: 16,
      height: 20,
      fill: hexToRgba(color, FILL_OPACITY),
      stroke: color,
      strokeWidth: 2,
      left: 192,
      top: -10,
      angle: 90,
      selectable: false,
    });

    const group = new fabric.Group([line, arrowhead], {
      left: 150,
      top: 200,
    });

    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
    fabricCanvasRef.current.renderAll();
  };

  const addLine = (color = '#4ade80') => {
    if (!fabricCanvasRef.current) return;

    const line = new fabric.Line([50, 0, 200, 0], {
      stroke: color,
      strokeWidth: 2,
      selectable: true,
    });

    fabricCanvasRef.current.add(line);
    fabricCanvasRef.current.setActiveObject(line);
    fabricCanvasRef.current.renderAll();
  };

  const enablePenTool = () => {
    if (!fabricCanvasRef.current) return;
    
    fabricCanvasRef.current.isDrawingMode = true;
    fabricCanvasRef.current.freeDrawingBrush.color = '#e8e8e8';
    fabricCanvasRef.current.freeDrawingBrush.width = 3;
  };

  const disablePenTool = () => {
    if (!fabricCanvasRef.current) return;
    
    fabricCanvasRef.current.isDrawingMode = false;
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current) return;
    
    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    if (activeObjects.length) {
      fabricCanvasRef.current.remove(...activeObjects);
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
    }
  };

  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = '#0e0e0e';
    fabricCanvasRef.current.renderAll();
  };

  const changeColor = (color) => {
    if (!fabricCanvasRef.current) return;
    
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      // Set both stroke and fill with matching color
      // Stroke: full color, Fill: same color with 15% opacity
      activeObject.set({
        stroke: color,
        fill: hexToRgba(color, FILL_OPACITY)
      });
      fabricCanvasRef.current.renderAll();
    }
  };

  const getSelectedObject = () => {
    if (!fabricCanvasRef.current) return null;
    return fabricCanvasRef.current.getActiveObject();
  };

  const saveCanvas = async (currentId) => {
    if (!fabricCanvasRef.current) return;
    
    isSavingRef.current = true;
    const canvasJSON = fabricCanvasRef.current.toJSON();
    
    const userId = user?.uid || null;
    try {
      if (!currentId || currentId === 'new') {
        const newId = await canvasService.saveCanvas({ canvasJSON, userId });
        isSavingRef.current = false;
        return newId;
      } else {
        await canvasService.updateCanvas(currentId, { canvasJSON, userId });
        isSavingRef.current = false;
      }
    } catch (error) {
      console.error('Error saving canvas:', error);
      isSavingRef.current = false;
      throw error;
    }
  };

  const exportCanvas = (filename) => {
    if (!fabricCanvasRef.current) return;
    
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
    });
    const link = document.createElement('a');
    link.download = `${filename || canvasId || 'canvas'}.png`;
    link.href = dataURL;
    link.click();
  };

  const zoomIn = () => {
    if (!fabricCanvasRef.current) return;
    const fc = fabricCanvasRef.current;
    const center = { x: fc.getWidth() / 2, y: fc.getHeight() / 2 };
    const zoom = Math.min(fc.getZoom() * 1.25, 5);
    fc.zoomToPoint(center, zoom);
    const level = Math.round(zoom * 100);
    setZoomLevel(level);
    return level;
  };

  const zoomOut = () => {
    if (!fabricCanvasRef.current) return;
    const fc = fabricCanvasRef.current;
    const center = { x: fc.getWidth() / 2, y: fc.getHeight() / 2 };
    const zoom = Math.max(fc.getZoom() * 0.8, 0.1);
    fc.zoomToPoint(center, zoom);
    const level = Math.round(zoom * 100);
    setZoomLevel(level);
    return level;
  };

  const resetZoom = () => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
    setZoomLevel(100);
  };

  const bringForward = () => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) return;
    fc.bringObjectForward(obj);
    fc.renderAll();
  };

  const sendBackward = () => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) return;
    fc.sendObjectBackwards(obj);
    fc.renderAll();
  };

  const bringToFront = () => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) return;
    fc.bringObjectToFront(obj);
    fc.renderAll();
  };

  const sendToBack = () => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) return;
    fc.sendObjectToBack(obj);
    fc.renderAll();
  };

  return {
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
  };
};