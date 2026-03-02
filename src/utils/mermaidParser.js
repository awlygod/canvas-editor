export const parseMermaid = (mermaidText) => {
  const lines = mermaidText.split('\n').map(l => l.trim()).filter(Boolean);
  const nodes = {};
  const edges = [];

  const nodePatterns = [
    { regex: /^(\w+)\(\[(.+?)\]\)/, shape: 'oval'    },
    { regex: /^(\w+)\{(.+?)\}/,     shape: 'diamond' },
    { regex: /^(\w+)\[(.+?)\]/,     shape: 'rect'    },
    { regex: /^(\w+)\((.+?)\)/,     shape: 'oval'    },
  ];

  const edgeRegex = /^(\w+)(?:\[[^\]]*\]|\{[^}]*\}|\([^)]*\)|\(\[[^\]]*\]\))?\s*--(?:>|>>)(?:\|([^|]*)\|)?\s*(\w+)/;

  lines.forEach(line => {
    if (/^(?:graph|flowchart)\s/i.test(line)) return;

    const edgeMatch = line.match(edgeRegex);
    if (edgeMatch) {
      const [, from, label, to] = edgeMatch;
      edges.push({ from, to, label: label?.trim() || '' });

      const parts = line.split(/--(?:>|>>)/);
      parts.forEach(part => {
        const clean = part.replace(/\|[^|]*\|/g, '').trim();
        let found = false;
        for (const { regex, shape } of nodePatterns) {
          const m = clean.match(regex);
          if (m) {
            if (!nodes[m[1]]) nodes[m[1]] = { id: m[1], label: m[2].trim(), shape };
            found = true;
            break;
          }
        }
        if (!found) {
          const plain = clean.match(/^(\w+)$/);
          if (plain && !nodes[plain[1]]) {
            nodes[plain[1]] = { id: plain[1], label: plain[1], shape: 'rect' };
          }
        }
      });
      return;
    }

    for (const { regex, shape } of nodePatterns) {
      const m = line.match(regex);
      if (m) {
        if (!nodes[m[1]]) nodes[m[1]] = { id: m[1], label: m[2].trim(), shape };
        break;
      }
    }
  });

  return { nodes: Object.values(nodes), edges };
};

const NODE_W = { rect: 160, oval: 160, diamond: 150 };
const NODE_H = { rect:  54, oval:  54, diamond:  80 };
const X_GAP  = 60;
const Y_GAP  = 90;
const PAD_X  = 80;
const PAD_Y  = 60;

export const layoutNodes = (nodes, edges = []) => {
  if (!nodes.length) return [];

  const children = {};
  const inDegree = {};
  nodes.forEach(n => { children[n.id] = []; inDegree[n.id] = 0; });
  edges.forEach(({ from, to }) => {
    if (children[from] !== undefined) children[from].push(to);
    if (inDegree[to]  !== undefined) inDegree[to]++;
  });

  const level = {};
  const queue = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
  if (!queue.length) queue.push(nodes[0].id);
  queue.forEach(id => { level[id] = 0; });

  let head = 0;
  const visited = new Set(queue); // ← track visited
  while (head < queue.length) {
    const cur = queue[head++];
    (children[cur] || []).forEach(child => {
      const next = (level[cur] ?? 0) + 1;
      if (level[child] === undefined || level[child] < next) {
        level[child] = next;
        if (!visited.has(child)) { // ← only push if not visited
          visited.add(child);
          queue.push(child);
        }
      }
    });
  }
  nodes.forEach(n => { if (level[n.id] === undefined) level[n.id] = 0; });

  const byLevel = {};
  nodes.forEach(n => { (byLevel[level[n.id]] = byLevel[level[n.id]] || []).push(n); });

  const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);
  const rowWidths = levels.map(lv =>
    byLevel[lv].reduce((sum, n) => sum + NODE_W[n.shape || 'rect'], 0)
    + Math.max(0, byLevel[lv].length - 1) * X_GAP
  );
  const totalW = rowWidths.length
  ? Math.max(...rowWidths) + PAD_X * 2
  : PAD_X * 2;

const positioned = [];
  let y = PAD_Y;

  levels.forEach((lv, idx) => {
    const group = byLevel[lv];
    if (!group || !group.length) return;  // ← guard empty groups

    const rowW  = rowWidths[idx];
    if (!isFinite(rowW) || rowW <= 0) return;  // ← guard bad rowW

    let x = (totalW - rowW) / 2;
    if (!isFinite(x)) x = PAD_X;  // ← guard NaN x

    const maxH = group.reduce((m, n) => Math.max(m, NODE_H[n.shape || 'rect'] ?? 54), 54);  // ← safe max

    group.forEach(node => {
      const w = NODE_W[node.shape || 'rect'] ?? 160;
      const h = NODE_H[node.shape || 'rect'] ?? 54;
      positioned.push({ ...node, x, y: y + (maxH - h) / 2, width: w, height: h });
      x += w + X_GAP;
    });
    y += maxH + Y_GAP;
  });

  return positioned;
};