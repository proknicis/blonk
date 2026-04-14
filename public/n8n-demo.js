/**
 * BLONK | Sovereign Protocol Orchestration Suite v6.9
 * Blueprint-Grade Dotted Flow Engine.
 * Implements high-fidelity dotted paths with kinetic light-pulse indicators.
 */

class N8nDemoComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      offsetX: 0, offsetY: 0, zoom: 0.8,
      targetX: 0, targetY: 0, targetZoom: 0.8,
      isDragging: false, startX: 0, startY: 0, baseX: 0, baseY: 0,
      activeWorkflow: null,
      isAnimating: false
    };
  }

  static get observedAttributes() { return ['workflow']; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'workflow' && newValue !== this.state.activeWorkflow) {
      this.state.activeWorkflow = newValue;
      this.state.targetX = 0; this.state.targetY = 0;
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.initPanning();
    this.initZooming();
    this.startAnimationLoop();
    window.addEventListener('resize', () => { this.render(); });
  }

  startAnimationLoop() {
    if (this.state.isAnimating) return;
    this.state.isAnimating = true;
    const lerp = (start, end, factor) => start + (end - start) * factor;
    const tick = () => {
      if (Math.abs(this.state.targetZoom - this.state.zoom) > 0.0001 || 
          Math.abs(this.state.targetX - this.state.offsetX) > 0.01 || 
          Math.abs(this.state.targetY - this.state.offsetY) > 0.01) {
        this.state.zoom = lerp(this.state.zoom, this.state.targetZoom, 0.15);
        this.state.offsetX = lerp(this.state.offsetX, this.state.targetX, 0.15);
        this.state.offsetY = lerp(this.state.offsetY, this.state.targetY, 0.15);
        this.updateTransform();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  initPanning() {
    const canvas = this.shadowRoot.querySelector('.canvas');
    canvas.addEventListener('mousedown', (e) => {
      if (e.target.closest('.node')) return;
      this.state.isDragging = true;
      this.state.startX = e.clientX; this.state.startY = e.clientY;
      this.state.baseX = this.state.targetX; this.state.baseY = this.state.targetY;
      canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.state.isDragging) return;
      this.state.targetX = this.state.baseX + (e.clientX - this.state.startX);
      this.state.targetY = this.state.baseY + (e.clientY - this.state.startY);
    });
    window.addEventListener('mouseup', () => {
      this.state.isDragging = false; canvas.style.cursor = 'grab';
    });
  }

  initZooming() {
    this.shadowRoot.querySelector('.canvas')?.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.82 : 1.18;
      const oldZoom = this.state.targetZoom;
      const newZoom = Math.min(Math.max(oldZoom * delta, 0.002), 5.0);
      const rect = this.shadowRoot.querySelector('.canvas').getBoundingClientRect();
      const mX = e.clientX - rect.left; const mY = e.clientY - rect.top;
      this.state.targetX -= (mX - this.state.targetX) * (newZoom / oldZoom - 1);
      this.state.targetY -= (mY - this.state.targetY) * (newZoom / oldZoom - 1);
      this.state.targetZoom = newZoom;
    }, { passive: false });
  }

  updateTransform() {
    const container = this.shadowRoot.querySelector('.view-container');
    const canvas = this.shadowRoot.querySelector('.canvas');
    if (container) container.style.transform = `translate(${this.state.offsetX}px, ${this.state.offsetY}px) scale(${this.state.zoom})`;
    if (canvas) {
      canvas.style.backgroundPosition = `${this.state.offsetX}px ${this.state.offsetY}px`;
      const sz1 = 100 * this.state.zoom; const sz2 = 20 * this.state.zoom;
      canvas.style.backgroundSize = `${sz1}px ${sz1}px, ${sz1}px ${sz1}px, ${sz2}px ${sz2}px, ${sz2}px ${sz2}px`;
    }
    const zoomBadge = this.shadowRoot.querySelector('.zoom-val');
    if (zoomBadge) zoomBadge.textContent = `${Math.round(this.state.zoom * 100)}%`;
  }

  getLuminance(hex) {
    if (!hex || hex[0] !== '#') return 1;
    const rgb = parseInt(hex.substring(1), 16);
    return (0.299 * ((rgb >> 16) & 0xff) + 0.587 * ((rgb >>  8) & 0xff) + 0.114 * ((rgb >>  0) & 0xff)) / 255;
  }

  render() {
    const workflowStr = this.getAttribute('workflow') || '{}';
    let workflow = null;
    try { workflow = JSON.parse(workflowStr); } catch (e) { this.renderError(); return; }
    if (!workflow || !workflow.nodes) { this.renderError(); return; }

    const { nodes = [], connections = {} } = workflow;
    const stickies = nodes.filter(n => (n.type || '').includes('stickyNote'));
    const mechanics = nodes.filter(n => !(n.type || '').includes('stickyNote'));

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      if (node.position) {
        const w = (node.type || '').includes('sticky') ? (node.parameters?.width || 340) : 260;
        const h = (node.type || '').includes('sticky') ? (node.parameters?.height || 220) : 100;
        minX = Math.min(minX, node.position[0]); minY = Math.min(minY, node.position[1]);
        maxX = Math.max(maxX, node.position[0] + w); maxY = Math.max(maxY, node.position[1] + h);
      }
    });

    if (this.state.targetX === 0 && this.state.targetY === 0 && minX !== Infinity) {
      const cW = this.offsetWidth || 800; const cH = this.offsetHeight || 600;
      const sX = (cW - 250) / (maxX - minX || 1); const sY = (cH - 250) / (maxY - minY || 1);
      this.state.targetZoom = this.state.zoom = Math.min(Math.max(Math.min(sX, sY), 0.01), 1.0);
      this.state.targetX = this.state.offsetX = (cW / 2) - (((maxX + minX) / 2) * this.state.zoom);
      this.state.targetY = this.state.offsetY = (cH / 2) - (((maxY + minY) / 2) * this.state.zoom);
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; width: 100%; height: 100%; min-height: 500px; background: #FFFFFF; font-family: 'Inter', system-ui, sans-serif; position: relative; overflow: hidden; user-select: none; }
        .canvas { width: 100%; height: 100%; cursor: grab; background: #FFFFFF; background-image: linear-gradient(#F1F5F9 1px, transparent 1px), linear-gradient(90deg, #F1F5F9 1px, transparent 1px), linear-gradient(rgba(241, 245, 249, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(241, 245, 249, 0.4) 1px, transparent 1px); }
        .view-container { position: absolute; top: 0; left: 0; width: 0; height: 0; pointer-events: none; transform-origin: 0 0; will-change: transform; }

        .node { position: absolute; background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 14px 20px; min-width: 260px; display: flex; align-items: center; gap: 16px; pointer-events: auto; box-shadow: 0 6px 18px rgba(0,0,0,0.03); z-index: 200; }
        .node:hover { border-color: #3B82F6; box-shadow: 0 12px 36px rgba(59, 130, 246, 0.12); z-index: 2000 !important; }

        .sticky-note { position: absolute; border: 1px solid rgba(0,0,0,0.05); border-radius: 16px; padding: 44px; font-size: 1rem; line-height: 1.8; pointer-events: auto; box-shadow: 0 4px 24px rgba(0,0,0,0.04); z-index: 10; overflow-y: auto; }
        .sticky-note strong { color: inherit; font-weight: 850; }
        .sticky-note b { font-weight: 900; display: block; margin-top: 20px; margin-bottom: 8px; }
        .sticky-note b:first-child { margin-top: 0; }

        .node-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .icon-trigger { background: #EEF2FF; color: #3B82F6; }
        .icon-integration { background: #ECFDF5; color: #10B981; }
        .icon-logic { background: #F8FAFC; color: #6366F1; }
        .icon-data { background: #FFFBEB; color: #D97706; }

        .node-info { display: flex; flex-direction: column; overflow: hidden; }
        .node-name { font-size: 1rem; font-weight: 850; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .node-type { font-size: 0.75rem; color: #94A3B8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }

        .connection-svg { position: absolute; width: 600%; height: 600%; top: -250%; left: -250%; pointer-events: none; z-index: 50; overflow: visible; }
        /* BLUEPRINT DOTS ENGINE */
        .path-line { fill: none !important; stroke: #CBD5E1; stroke-width: 2.2; stroke-linecap: round; stroke-dasharray: 4 6; vector-effect: non-scaling-stroke; }
        .path-pulse { fill: none !important; stroke: #3B82F6; stroke-width: 3.5; stroke-dasharray: 8 92; animation: blueprintFlow 3s linear infinite; vector-effect: non-scaling-stroke; stroke-linecap: round; filter: drop-shadow(0 0 3px rgba(59,130,246,0.4)); }
        @keyframes blueprintFlow { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }

        .conn-label { position: absolute; background: #64748B; color: #FFFFFF; font-size: 0.65rem; font-weight: 950; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 150; pointer-events: none; transform: translate(-50%, -50%); border: 1.5px solid #FFFFFF; }
        .label-positive { background: #10B981; }
        .label-negative { background: #EF4444; }

        .hud { position: absolute; top: 24px; left: 24px; pointer-events: none; z-index: 10000; }
        .badge { background: rgba(255,255,255,0.98); border: 1.5px solid #E2E8F0; padding: 14px 32px; border-radius: 100px; display: flex; align-items: center; gap: 16px; pointer-events: auto; box-shadow: 0 12px 48px rgba(0,0,0,0.08); font-size: 0.95rem; font-weight: 900; color: #0F172A; }
        .live-dot { width: 10px; height: 10px; background: #10B981; border-radius: 50%; box-shadow: 0 0 12px #10B981; animation: pulse 2.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.3); } 100% { opacity: 1; transform: scale(1); } }
      </style>

      <div class="canvas">
        <div class="hud"><div class="badge"><div class="live-dot"></div><span>${workflow.name || 'Protocol Suite'}</span><span style="color: #CBD5E1;">|</span><span class="zoom-val" style="color: #3B82F6;">${Math.round(this.state.zoom * 100)}%</span></div></div>
        <div class="view-container">
          ${stickies.map((node, i) => {
            const x = node.position ? node.position[0] : (i * 260); const y = node.position ? node.position[1] : 200;
            const bgCols = ['#FFF9C4', '#FFE0B2', '#F8BBD0', '#E1BEE7', '#C8E6C9', '#B3E5FC', '#CFD8DC'];
            let bg = node.parameters?.color || 1; 
            if (typeof bg === 'number') bg = bgCols[bg - 1] || bgCols[0];
            const lum = this.getLuminance(bg); const textColor = lum > 0.6 ? '#334155' : '#F8FAFC'; const headerColor = lum > 0.6 ? '#0F172A' : '#FFFFFF';
            let content = (node.parameters?.content || '').replace(/^##\s+(.*)$/gm, `<b style="color: ${headerColor}">$1</b>`).replace(/^###\s+(.*)$/gm, `<b style="color: ${headerColor}">$1</b>`).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^-\s+(.*)$/gm, '<span style="color: #64748B; margin-right: 8px;">•</span> $1').replace(/\n/g, '<br>');
            return `<div class="sticky-note" style="left: ${x}px; top: ${y}px; width: ${node.parameters?.width || 340}px; height: ${node.parameters?.height || 220}px; background: ${bg}; color: ${textColor}; z-index: ${node.parameters?.width > 1000 ? 1 : 10};">${content}</div>`;
          }).join('')}

          <svg class="connection-svg">${this.renderFlowData(nodes, connections).svg}</svg>
          ${this.renderFlowData(nodes, connections).labels}

          ${mechanics.map((node, i) => {
            const x = node.position ? node.position[0] : (i * 260); const y = node.position ? node.position[1] : 200;
            const cat = this.getCategory(node.type);
            return `<div class="node" style="left: ${x}px; top: ${y}px;"><div class="node-icon icon-${cat}">${this.getRawIcon(node.type)}</div><div class="node-info"><span class="node-name">${node.name}</span><span class="node-type">${node.type.split('.').pop()}</span></div></div>`;
          }).join('')}
        </div>
      </div>
    `;
    this.updateTransform();
  }

  renderFlowData(nodes, connections) {
    let svg = ''; let labels = '';
    const nodeMap = {}; nodes.forEach(n => { nodeMap[n.id] = n; nodeMap[n.name] = n; });
    
    Object.keys(connections).forEach(srcKey => {
      const src = nodeMap[srcKey];
      if (!src || (src.type || '').includes('sticky')) return;
      const outputs = connections[srcKey].main || [];
      outputs.forEach((group, idx) => {
        group.forEach(target => {
          const dest = nodeMap[target.node]; if (!dest) return;
          const sX = src.position[0] + 260; const sY = src.position[1] + 45;
          const eX = dest.position[0]; const eY = dest.position[1] + 45;
          const cpX = sX + Math.min(Math.abs(eX - sX) * 0.4, 150);
          const d = `M ${sX} ${sY} C ${cpX} ${sY}, ${sX + (eX - sX) * 0.5} ${eY}, ${eX} ${eY}`;
          svg += `<path d="${d}" class="path-line" /><path d="${d}" class="path-pulse" />`;
          if ((src.type || '').includes('.if') || (src.type || '').includes('.filter')) {
            const txt = idx === 0 ? 'True' : 'False'; const cls = idx === 0 ? 'label-positive' : 'label-negative';
            labels += `<div class="conn-label ${cls}" style="left: ${sX + (eX - sX) * 0.3}px; top: ${sY + (eY-sY) * 0.3}px;">${txt}</div>`;
          }
        });
      });
    });
    return { svg, labels };
  }

  getCategory(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('trigger')) return 'trigger';
    if (t.includes('http') || t.includes('webhook')) return 'integration';
    if (t.includes('sheets') || t.includes('db') || t.includes('sql') || t.includes('gmail')) return 'data';
    return 'logic';
  }

  getRawIcon(type) {
    const t = (type || '').toLowerCase();
    const common = 'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
    if (t.includes('trigger')) return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" ${common}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
    if (t.includes('http') || t.includes('webhook')) return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" ${common}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
    if (t.includes('sheets') || t.includes('db') || t.includes('sql') || t.includes('gmail')) return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" ${common}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`;
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" ${common}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/></svg>`;
  }

  renderError() { this.shadowRoot.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94A3B8; font-weight: 800; font-size: 0.75rem;">SOVEREIGN ENGINE | DATA SYNC ERROR</div>`; }
}
customElements.define('n8n-demo', N8nDemoComponent);
