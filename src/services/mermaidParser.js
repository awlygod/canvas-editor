export const parseMermaid = (mermaidText) => {
  const lines = mermaidText.split('\n').map(l => l.trim()).filter(Boolean);
  const nodes = {};
  const edges = [];

  // Patterns
  const nodePatterns = [
    { regex: /^(\w+)\(\[(.+?)\]\)/, shape: 'oval' },       // A([label]) — start/end
    { regex: /^(\w+)\{(.+?)\}/,     shape: 'diamond' },     // A{label}   — decision
    { regex: /^(\w+)\[(.+?)\]/,     shape: 'rect' },        // A[label]   — normal
    { regex: /^(\w+)\((.+?)\)/,     shape: 'oval' },        // A(label)   — rounded
  ];

  const edgeRegex = /^(\w+)\s*-->(?:\|(.+?)\|)?\s*(\w+)/;

  lines.forEach(line => {
    if (line.startsWith('graph')) return;

    // Try to extract edge
    const edgeMatch = line.match(edgeRegex);
    if (edgeMatch) {
      const [, from, label, to] = edgeMatch;
      edges.push({ from, to, label: label || '' });

      // Also extract inline node definitions from edge lines
      const parts = line.split('-->');
      parts.forEach(part => {
        part = part.replace(/\|.+?\|/, '').trim();
        for (const { regex, shape } of nodePatterns) {
          const m = part.match(regex);
          if (m && !nodes[m[1]]) {
            nodes[m[1]] = { id: m[1], label: m[2], shape };
            break;
          }
        }
        // Plain ID with no definition
        const plainId = part.match(/^(\w+)$/);
        if (plainId && !nodes[plainId[1]]) {
          nodes[plainId[1]] = { id: plainId[1], label: plainId[1], shape: 'rect' };
        }
      });
      return;
    }

    // Standalone node definition
    for (const { regex, shape } of nodePatterns) {
      const m = line.match(regex);
      if (m) {
        nodes[m[1]] = { id: m[1], label: m[2], shape };
        break;
      }
    }
  });

  return { nodes: Object.values(nodes), edges };
};


export const layoutNodes = (nodes) => {
  // Simple top-down grid layout
  const COLS     = 3;
  const X_GAP    = 200;
  const Y_GAP    = 130;
  const START_X  = 120;
  const START_Y  = 60;

  return nodes.map((node, i) => ({
    ...node,
    x: START_X + (i % COLS) * X_GAP,
    y: START_Y + Math.floor(i / COLS) * Y_GAP,
    width:  node.shape === 'diamond' ? 130 : 150,
    height: node.shape === 'diamond' ? 70  : 50,
  }));
};