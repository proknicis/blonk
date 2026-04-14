/**
 * BLONK | Sovereign Protocol Orchestration Suite v6.8
 * Kinetic Flow Visualization Engine.
 * Features automated connection labeling and directional pulse indicators.
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
      const zoomDiff = Math.abs(this.state.targetZoom - this.state.zoom);
      const xDiff = Math.abs(this.state.targetX - this.state.offsetX);
      const yDiff = Math.abs(this.state.targetY - this.state.offsetY);
      if (zoomDiff > 0.0001 || xDiff > 0.01 || yDiff > 0.01) {
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
    if (!canvas) return;
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
      const delta = e.deltaY > 0 ? 0.85 : 1.15;
      const oldZoom = this.state.targetZoom;
      const newZoom = Math.min(Math.max(oldZoom * delta, 0.002), 5.0);
      const rect = this.shadowRoot.querySelector('.canvas').getBoundingClientRect();
      const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top;
      this.state.targetX -= (mouseX - this.state.targetX) * (newZoom / oldZoom - 1);
      this.state.targetY -= (mouseY - this.state.targetY) * (newZoom / oldZoom - 1);
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
    const zoomVal = this.shadowRoot.querySelector('.zoom-val');
    if (zoomVal) zoomVal.textContent = `${Math.round(this.state.zoom * 100)}%`;
  }

  getLuminance(hex) {
    if (!hex || hex[0] !== '#') return 1;
    const rgb = parseInt(hex.substring(1), 16);
    const r = (rgb >> 16) & 0xff; const g = (rgb >>  8) & 0xff; const b = (rgb >>  0) & 0xff;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  render() {
    const workflowStr = this.getAttribute('workflow') || '{}';
    let workflow = null;
    try { workflow = JSON.parse(workflowStr); } catch (e) { this.renderError(); return; }
    if (!workflow || !workflow.nodes) { this.renderError(); return; }

    const { nodes = [], connections = {} } = workflow;
    const stickyNodes = nodes.filter(n => (n.type || '').includes('stickyNote'));
    const logicNodes = nodes.filter(n => !(n.type || '').includes('stickyNote'));

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      if (node.position && Array.isArray(node.position)) {
        const w = (node.type || '').includes('sticky') ? (node.parameters?.width || 340) : 240;
        const h = (node.type || '').includes('sticky') ? (node.parameters?.height || 220) : 100;
        minX = Math.min(minX, node.position[0]); minY = Math.min(minY, node.position[1]);
        maxX = Math.max(maxX, node.position[0] + w); maxY = Math.max(maxY, node.position[1] + h);
      }
    });

    const canvasWidth = this.offsetWidth || 800; const canvasHeight = this.offsetHeight || 600;
    if (this.state.targetX === 0 && this.state.targetY === 0 && minX !== Infinity) {
      const wW = maxX - minX; const wH = maxY - minY;
      const sX = (canvasWidth - 250) / (wW || 1); const sY = (canvasHeight - 250) / (wH || 1);
      this.state.targetZoom = this.state.zoom = Math.min(Math.max(Math.min(sX, sY), 0.01), 1.0);
      this.state.targetX = this.state.offsetX = (canvasWidth / 2) - (((maxX + minX) / 2) * this.state.zoom);
      this.state.targetY = this.state.offsetY = (canvasHeight / 2) - (((maxY + minY) / 2) * this.state.zoom);
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block; width: 100%; height: 100%; min-height: 500px;
          background: #FFFFFF; font-family: 'Inter', system-ui, sans-serif;
          position: relative; overflow: hidden; user-select: none;
        }

        .canvas { width: 100%; height: 100%; cursor: grab; background: #FFFFFF; background-image: linear-gradient(#F1F5F9 1px, transparent 1px), linear-gradient(90deg, #F1F5F9 1px, transparent 1px), linear-gradient(rgba(241, 245, 249, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(241, 245, 249, 0.4) 1px, transparent 1px); }
        .view-container { position: absolute; top: 0; left: 0; width: 0; height: 0; pointer-events: none; transform-origin: 0 0; will-change: transform; }

        .node { position: absolute; background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 14px 20px; min-width: 260px; display: flex; align-items: center; gap: 16px; pointer-events: auto; box-shadow: 0 6px 18px rgba(0,0,0,0.03); z-index: 200; transition: border-color 0.2s, box-shadow 0.2s; }
        .node:hover { border-color: #3B82F6; box-shadow: 0 12px 36px rgba(59, 130, 246, 0.12); z-index: 2000 !important; }

        .sticky-note { position: absolute; border: 1px solid rgba(0,0,0,0.05); border-radius: 16px; padding: 44px; font-size: 1rem; line-height: 1.8; pointer-events: auto; box-shadow: 0 4px 24px rgba(0,0,0,0.04); z-index: 10; overflow-y: auto; }
        .sticky-note b { font-weight: 850; display: block; margin-top: 20px; margin-bottom: 8px; }
        .sticky-note b:first-child { margin-top: 0; }
        .sticky-note::-webkit-scrollbar { width: 6px; }
        .sticky-note::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.06); border-radius: 10px; }

        .node-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .icon-trigger { background: #EEF2FF; color: #3B82F6; }
        .icon-integration { background: #ECFDF5; color: #10B981; }
        .icon-logic { background: #F8FAFC; color: #6366F1; }
        .icon-data { background: #FFFBEB; color: #D97706; }

        .node-info { display: flex; flex-direction: column; overflow: hidden; }
        .node-name { font-size: 1rem; font-weight: 850; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .node-type { font-size: 0.75rem; color: #94A3B8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }

        .connection-svg { position: absolute; width: 600%; height: 600%; top: -250%; left: -250%; pointer-events: none; z-index: 50; overflow: visible; }
        .path-line { fill: none !important; stroke: #CBD5E1; stroke-width: 2.5; stroke-linecap: round; vector-effect: non-scaling-stroke; }
        .path-active { fill: none !important; stroke: #3B82F6; stroke-width: 2.5; stroke-dasharray: 6 36; animation: flow 4s linear infinite; vector-effect: non-scaling-stroke; }
        @keyframes flow { from { stroke-dashoffset: 42; } to { stroke-dashoffset: 0; } }

        .conn-label { position: absolute; background: #64748B; color: #FFFFFF; font-size: 0.65rem; font-weight: 950; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 150; pointer-events: none; }
        .label-positive { background: #10B981; }
        .label-negative { background: #EF4444; }

        .hud { position: absolute; top: 24px; left: 24px; pointer-events: none; z-index: 10000; }
        .badge { background: rgba(255,255,255,0.98); border: 1.5px solid #E2E8F0; padding: 14px 32px; border-radius: 100px; display: flex; align-items: center; gap: 16px; pointer-events: auto; box-shadow: 0 12px 48px rgba(0,0,0,0.08); font-size: 0.95rem; font-weight: 900; color: #0F172A; }
        .live-dot { width: 10px; height: 10px; background: #10B981; border-radius: 50%; box-shadow: 0 0 10px #10B981; animation: pulse 2.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
      </style>

      <div class="canvas">
        <div class="hud">
          <div class="badge">
            <div class="live-dot"></div>
            <span>${workflow.name || 'Protocol Suite'}</span>
            <span style="color: #CBD5E1;">|</span>
            <span class="zoom-val" style="color: #3B82F6;">${Math.round(this.state.zoom * 100)}%</span>
          </div>
        </div>

        <div class="view-container">
          <!-- Layer 1: Architectural Stickies -->
          ${stickyNodes.map((node, i) => {
            const x = node.position ? node.position[0] : (i * 260);
            const y = node.position ? node.position[1] : 200;
            const bgCols = ['#FFF9C4', '#FFE0B2', '#F8BBD0', '#E1BEE7', '#C8E6C9', '#B3E5FC', '#CFD8DC'];
            let bg = node.parameters?.color || 1;
            if (typeof bg === 'number') bg = bgCols[bg - 1] || bgCols[0];
            const lum = this.getLuminance(bg);
            const textColor = lum > 0.6 ? '#334155' : '#F8FAFC';
            const headerColor = lum > 0.6 ? '#0F172A' : '#FFFFFF';

            let content = node.parameters?.content || '';
            content = content
              .replace(/^##\s+(.*)$/gm, `<b style="color: ${headerColor}">$1</b>`)
              .replace(/^###\s+(.*)$/gm, `<b style="color: ${headerColor}">$1</b>`)
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/^-\s+(.*)$/gm, '<span style="color: #64748B; margin-right: 8px;">•</span> $1')
              .replace(/\n/g, '<br>');

            return `
              <div class="sticky-note" style="left: ${x}px; top: ${y}px; width: ${node.parameters?.width || 340}px; height: ${node.parameters?.height || 220}px; background: ${bg}; color: ${textColor}; z-index: ${node.parameters?.width > 1000 ? 1 : 10};">
                ${content}
              </div>
            `;
          }).join('')}

          <!-- Layer 2: Vector Data Flows & Labels -->
          <svg class="connection-svg">
            ${this.renderConnectionsData(nodes, connections).svg}
          </svg>
          ${this.renderConnectionsData(nodes, connections).labels}

          <!-- Layer 3: Logic Nodes -->
          ${logicNodes.map((node, i) => {
            const x = node.position ? node.position[0] : (i * 260);
            const y = node.position ? node.position[1] : 200;
            const cat = this.getCategory(node.type);
            return `
              <div class="node" style="left: ${x}px; top: ${y}px;">
                <div class="node-icon icon-${cat}">${this.getRawIcon(node.type)}</div>
                <div class="node-info">
                  <span class="node-name">${node.name}</span>
                  <span class="node-type">${node.type.split('.').pop()}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    this.updateTransform();
  }

  renderConnectionsData(nodes, connections) {
    let svgHtml = ''; let labelHtml = '';
    const nodeMap = {}; 
    nodes.forEach(n => { nodeMap[n.id] = n; nodeMap[n.name] = n; });
    
    Object.keys(connections).forEach(srcKey => {
      const srcNode = nodeMap[srcKey];
      if (!srcNode || (srcNode.type || '').includes('sticky')) return;
      const outputs = connections[srcKey].main || [];
      outputs.forEach((outputGroup, outputIndex) => {
        outputGroup.forEach(target => {
          const targetNode = nodeMap[target.node];
          if (!targetNode) return;
          
          const sX = srcNode.position[0] + 260; const sY = srcNode.position[1] + 40;
          const eX = targetNode.position[0]; const eY = targetNode.position[1] + 40;
          const dist = Math.abs(eX - sX);
          const cpX = sX + Math.min(dist * 0.4, 150);
          
          svgHtml += `
            <path d="M ${sX} ${sY} C ${cpX} ${sY}, ${sX + (eX - sX) * 0.5} ${eY}, ${eX} ${eY}" class="path-line" />
            <path d="M ${sX} ${sY} C ${cpX} ${sY}, ${sX + (eX - sX) * 0.5} ${eY}, ${eX} ${eY}" class="path-active" />
          `;

          // Handle IF labels (index 0 = True, 1 = False in n8n v2)
          if ((srcNode.type || '').includes('.if') || (srcNode.type || '').includes('.filter')) {
            const labelText = outputIndex === 0 ? 'True' : 'False';
            const labelClass = outputIndex === 0 ? 'label-positive' : 'label-negative';
            const midX = sX + (eX - sX) * 0.3;
            // Linear interpolate for label vertical position roughly along the curve
            const midY = sY + (eY - sY) * 0.3;
            labelHtml += `<div class="conn-label ${labelClass}" style="left: ${midX}px; top: ${midY - 14}px;">${labelText}</div>`;
          }
        });
      });
    });
    return { svg: svgHtml, labels: labelHtml };
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

  renderError() {
    this.shadowRoot.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94A3B8; font-weight: 800; font-size: 0.75rem;">SOVEREIGN ENGINE | DATA SYNC ERROR</div>`;
  }
}

customElements.define('n8n-demo', N8nDemoComponent);
