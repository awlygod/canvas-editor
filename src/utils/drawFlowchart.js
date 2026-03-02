import * as fabric from 'fabric';

const PALETTE = {
  rect:    { fill: '#162032', stroke: '#4a90d9', textColor: '#dce8f8' },
  diamond: { fill: '#1e1235', stroke: '#9b59b6', textColor: '#e8d8f8' },
  oval:    { fill: '#0d2a1e', stroke: '#27ae60', textColor: '#c8f0d8' },
};

const ARROW_COLOR  = '#4a6fa8';
const LABEL_COLOR  = '#8ab0d8';
const FONT         = 'Inter, system-ui, sans-serif';

// ── connection point helpers ────────────────────────────────────────────────
const cp = (node, side) => {
  const cx = node.x + node.width  / 2;
  const cy = node.y + node.height / 2;
  if (side === 'top')    return { x: cx,           y: node.y              };
  if (side === 'bottom') return { x: cx,           y: node.y + node.height };
  if (side === 'left')   return { x: node.x,        y: cy                 };
  if (side === 'right')  return { x: node.x + node.width, y: cy           };
  return { x: cx, y: node.y + node.height };
};

const edgePoints = (from, to) => {
  const dx = (to.x + to.width  / 2) - (from.x + from.width  / 2);
  const dy = (to.y + to.height / 2) - (from.y + from.height / 2);

  if (Math.abs(dy) >= Math.abs(dx)) {
    return dy >= 0
      ? { p1: cp(from, 'bottom'), p2: cp(to, 'top')    }
      : { p1: cp(from, 'top'),    p2: cp(to, 'bottom') };
  }
  return dx >= 0
    ? { p1: cp(from, 'right'), p2: cp(to, 'left')  }
    : { p1: cp(from, 'left'),  p2: cp(to, 'right') };
};

// ── arrow drawing ───────────────────────────────────────────────────────────
const drawArrow = (canvas, p1, p2, label = '') => {
  const angle   = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const HEAD    = 12;
  // Pull endpoint back slightly so arrowhead tip sits on the border
  const ex = p2.x - Math.cos(angle) * 1;
  const ey = p2.y - Math.sin(angle) * 1;

  canvas.add(new fabric.Line([p1.x, p1.y, ex, ey], {
    stroke: ARROW_COLOR, strokeWidth: 1.8,
    selectable: false, evented: false,
  }));

  canvas.add(new fabric.Triangle({
    left: p2.x, top: p2.y,
    width: HEAD, height: HEAD,
    fill: ARROW_COLOR,
    angle: (angle * 180) / Math.PI + 90,
    originX: 'center', originY: 'center',
    selectable: false, evented: false,
  }));

  if (label) {
    const mx  = (p1.x + p2.x) / 2;
    const my  = (p1.y + p2.y) / 2;
    const pad = 5;
    const fs  = 10;
    const tw  = label.length * 6 + pad * 2;
    const th  = fs + pad * 2;

    canvas.add(new fabric.Rect({
      left: mx - tw / 2, top: my - th / 2,
      width: tw, height: th,
      fill: '#0e1620', rx: 3, ry: 3,
      selectable: false, evented: false,
    }));
    canvas.add(new fabric.Text(label, {
      left: mx, top: my,
      fontSize: fs, fill: LABEL_COLOR,
      fontFamily: FONT, fontWeight: '500',
      originX: 'center', originY: 'center',
      selectable: false, evented: false,
    }));
  }
};

// ── word-wrap helper ────────────────────────────────────────────────────────
const wrapLabel = (label, maxChars = 16) => {
  const words = label.split(' ');
  const lines = [''];
  words.forEach(w => {
    const cur  = lines[lines.length - 1];
    const next = cur ? cur + ' ' + w : w;
    if (next.length <= maxChars) lines[lines.length - 1] = next;
    else lines.push(w);
  });
  return lines.slice(0, 2).join('\n');
};

// ── node drawing ────────────────────────────────────────────────────────────
const makeNode = (node) => {
  const { x, y, width, height, label, shape } = node;
  const pal = PALETTE[shape] || PALETTE.rect;
  let shapeObj;

  if (shape === 'diamond') {
    const hw = width / 2, hh = height / 2;
    shapeObj = new fabric.Polygon([
      { x: hw,    y: 0      },
      { x: width, y: hh     },
      { x: hw,    y: height },
      { x: 0,     y: hh     },
    ], { fill: pal.fill, stroke: pal.stroke, strokeWidth: 2, selectable: false });
  } else {
    const rx = shape === 'oval' ? height / 2 : 10;
    shapeObj = new fabric.Rect({
      width, height, rx, ry: rx,
      fill: pal.fill, stroke: pal.stroke, strokeWidth: 2, selectable: false,
    });
  }

  const textObj = new fabric.Text(wrapLabel(label), {
    left: width / 2, top: height / 2,
    fontSize: shape === 'diamond' ? 11 : 12,
    fill: pal.textColor,
    fontFamily: FONT, fontWeight: '600',
    textAlign: 'center', lineHeight: 1.3,
    originX: 'center', originY: 'center',
    selectable: false,
  });

  return new fabric.Group([shapeObj, textObj], {
    left: x, top: y,
    selectable: true, hoverCursor: 'move',
    shadow: new fabric.Shadow({ color: pal.stroke + '44', blur: 18, offsetX: 0, offsetY: 4 }),
    data: { nodeId: node.id },
  });
};

// ── public entry ────────────────────────────────────────────────────────────
export const drawFlowchart = (fabricCanvas, nodes, edges) => {
  const nodeMap = {};

  nodes.forEach(n => {
    if (
      isFinite(n.x) && isFinite(n.y) &&
      isFinite(n.width) && isFinite(n.height) &&
      n.width > 0 && n.height > 0
    ) {
      nodeMap[n.id] = n;
    } else {
      console.warn('Skipping node with invalid dimensions:', n);
    }
  });                              // ← closing forEach correctly

  // Draw edges first (behind nodes)
  edges.forEach(({ from, to, label }) => {
    const f = nodeMap[from];
    const t = nodeMap[to];
    if (!f || !t) return;
    const { p1, p2 } = edgePoints(f, t);
    drawArrow(fabricCanvas, p1, p2, label);
  });

  // Draw nodes on top
  nodes.forEach(n => {
    if (!nodeMap[n.id]) return;
    fabricCanvas.add(makeNode(n));
  });

  fabricCanvas.renderAll();
};
