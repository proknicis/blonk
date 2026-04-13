/**
 * BLONK | Sovereign Protocol Orchestration Suite v6.2
 * Industrial-scale visualization for massive multi-node protocols.
 * Enhanced Zoom-to-Fit for ultra-large coordinate systems.
 */

class N8nDemoComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      offsetX: 0, offsetY: 0, zoom: 0.8,
      isDragging: false, startX: 0, startY: 0, baseX: 0, baseY: 0
    };
  }

  static get observedAttributes() { return ['workflow']; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'workflow') {
      this.state.offsetX = 0; this.state.offsetY = 0; // Reset on new workflow
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.initPanning();
    this.initZooming();
    window.addEventListener('resize', () => this.render());
  }

  initPanning() {
    const canvas = this.shadowRoot.querySelector('.canvas');
    if (!canvas) return;
    const handleMouseDown = (e) => {
      if (e.target.closest('.node') || e.target.closest('.glass-card')) return;
      this.state.isDragging = true;
      this.state.startX = e.clientX; this.state.startY = e.clientY;
      this.state.baseX = this.state.offsetX; this.state.baseY = this.state.offsetY;
      canvas.style.cursor = 'grabbing';
    };
    const handleMouseMove = (e) => {
      if (!this.state.isDragging) return;
      this.state.offsetX = this.state.baseX + (e.clientX - this.state.startX);
      this.state.offsetY = this.state.baseY + (e.clientY - this.state.startY);
      this.updateTransform();
    };
    const handleMouseUp = () => {
      this.state.isDragging = false; canvas.style.cursor = 'grab';
    };
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  initZooming() {
    this.shadowRoot.querySelector('.canvas')?.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      const oldZoom = this.state.zoom;
      const newZoom = Math.min(Math.max(oldZoom + delta, 0.05), 3.0);
      const rect = this.shadowRoot.querySelector('.canvas').getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      this.state.offsetX -= (mouseX - this.state.offsetX) * (newZoom / oldZoom - 1);
      this.state.offsetY -= (mouseY - this.state.offsetY) * (newZoom / oldZoom - 1);
      this.state.zoom = newZoom;
      this.updateTransform();
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
  }

  render() {
    const workflowStr = this.getAttribute('workflow') || '{}';
    let workflow = null;
    try { workflow = JSON.parse(workflowStr); } catch (e) { this.renderError(); return; }
    if (!workflow || !workflow.nodes) { this.renderError(); return; }

    const { nodes = [], connections = {} } = workflow;

    // Advanced Bounding Box Calculation (Including Dynamic Dimensions)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      if (node.position && Array.isArray(node.position)) {
        const w = node.type.includes('sticky') ? (node.parameters?.width || 300) : 220;
        const h = node.type.includes('sticky') ? (node.parameters?.height || 200) : 80;
        minX = Math.min(minX, node.position[0]); minY = Math.min(minY, node.position[1]);
        maxX = Math.max(maxX, node.position[0] + w); maxY = Math.max(maxY, node.position[1] + h);
      }
    });

    const canvasWidth = this.offsetWidth || 800;
    const canvasHeight = this.offsetHeight || 600;

    // Reset offsets and zoom for first-view orchestration
    if (this.state.offsetX === 0 && this.state.offsetY === 0 && minX !== Infinity) {
      const wW = maxX - minX; const wH = maxY - minY;
      const sX = (canvasWidth - 160) / wW; const sY = (canvasHeight - 160) / wH;
      this.state.zoom = Math.min(Math.max(Math.min(sX, sY), 0.06), 1); // Allow much lower zoom for massive flows
      this.state.offsetX = (canvasWidth / 2) - (((maxX + minX) / 2) * this.state.zoom);
      this.state.offsetY = (canvasHeight / 2) - (((maxY + minY) / 2) * this.state.zoom);
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block; width: 100%; height: 100%; min-height: 600px;
          background: #FFFFFF; font-family: 'Inter', system-ui, sans-serif;
          position: relative; overflow: hidden; user-select: none;
        }

        .canvas {
          width: 100%; height: 100%; cursor: grab; background: #FFFFFF;
          background-image: 
            linear-gradient(#F8FAFC 1px, transparent 1px), linear-gradient(90deg, #F8FAFC 1px, transparent 1px),
            linear-gradient(rgba(241, 245, 249, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(241, 245, 249, 0.4) 1px, transparent 1px);
          background-size: ${100 * this.state.zoom}px ${100 * this.state.zoom}px, ${100 * this.state.zoom}px ${100 * this.state.zoom}px, ${20 * this.state.zoom}px ${20 * this.state.zoom}px, ${20 * this.state.zoom}px ${20 * this.state.zoom}px;
          background-position: ${this.state.offsetX}px ${this.state.offsetY}px;
        }

        .view-container {
          position: absolute; top: 0; left: 0; width: 0; height: 0; pointer-events: none;
          transform-origin: 0 0;
          transform: translate(${this.state.offsetX}px, ${this.state.offsetY}px) scale(${this.state.zoom});
        }

        .node {
          position: absolute; background: #FFFFFF; border: 1.2px solid #E2E8F0; border-radius: 12px;
          padding: 10px 14px; min-width: 220px; display: flex; align-items: center; gap: 12px;
          pointer-events: auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
          z-index: 10; transition: border-color 0.2s, transform 0.2s;
        }
        .node:hover { border-color: #3B82F6; transform: translateY(-2px); z-index: 100 !important; }

        .glass-card {
          position: absolute; border: 1px solid rgba(0,0,0,0.05); border-radius: 8px; padding: 20px;
          color: #475569; font-size: 0.85rem; line-height: 1.6; pointer-events: auto;
          box-shadow: 0 4px 6px rgba(0,0,0,0.01); z-index: 1; overflow: hidden;
        }

        .node-icon { 
          width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          background: #F1F5F9;
        }
        .icon-trigger { color: #3B82F6; background: #EFF6FF; }
        .icon-integration { color: #10B981; background: #ECFDF5; }
        .icon-logic { color: #6366F1; background: #EEF2FF; }
        .icon-data { color: #D97706; background: #FFFBEB; }

        .node-info { display: flex; flex-direction: column; gap: 1px; overflow: hidden; }
        .node-name { font-size: 0.8rem; font-weight: 800; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .node-type { font-size: 0.6rem; color: #94A3B8; font-weight: 600; text-transform: uppercase; }

        .connection-svg { position: absolute; width: 80000px; height: 80000px; top: -40000px; left: -40000px; pointer-events: none; z-index: 5; }
        .path-line { fill: none; stroke: #CBD5E1; stroke-width: 2.5; stroke-linecap: round; }
        .path-active { stroke: #3B82F6; stroke-width: 2.5; stroke-dasharray: 4 40; animation: flow 5s linear infinite; }
        @keyframes flow { from { stroke-dashoffset: 88; } to { stroke-dashoffset: 0; } }

        .hud { position: absolute; top: 24px; left: 24px; right: 24px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; z-index: 1000; }
        .badge { background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border: 1px solid #E2E8F0; padding: 10px 20px; border-radius: 100px; display: flex; align-items: center; gap: 12px; pointer-events: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .wf-title { font-size: 0.8rem; font-weight: 950; color: #0F172A; letter-spacing: -0.01em; }
        .wf-focus { font-size: 0.7rem; font-weight: 950; color: #3B82F6; padding-left: 12px; border-left: 1px solid #E2E8F0; }
      </style>

      <div class="canvas">
        <div class="hud">
          <div class="badge">
            <div class="status-dot"></div>
            <span class="wf-title">${workflow.name || 'Protocol Master View'}</span>
            <span class="wf-focus">${Math.round(this.state.zoom * 100)}%</span>
          </div>
        </div>

        <div class="view-container">
          <svg class="connection-svg" viewBox="-40000 -40000 80000 80000">
            ${this.renderConnections(nodes, connections)}
          </svg>

          ${nodes.map((node, i) => {
            const x = node.position ? node.position[0] : (i * 260);
            const y = node.position ? node.position[1] : 200;
            
            if (node.type.includes('stickyNote')) {
              const bgColors = ['#FEF9C3', '#FFEDD5', '#F3E8FF', '#FCE7F3', '#ECFDF5', '#F1F5F9', '#DBEAFE'];
              const colorIdx = (typeof node.parameters?.color === 'number' ? node.parameters.color : 1) - 1;
              const bg = bgColors[colorIdx] || bgColors[0];
              return `
                <div class="glass-card" style="left: ${x}px; top: ${y}px; width: ${node.parameters?.width || 340}px; height: ${node.parameters?.height || 220}px; background: ${bg}; opacity: 0.85;">
                  ${(node.parameters?.content || '').replace(/\n/g, '<br>')}
                </div>
              `;
            }

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
    this.initPanning();
    this.initZooming();
  }

  renderConnections(nodes, connections) {
    let html = '';
    const nodeMap = {}; nodes.forEach(n => nodeMap[n.id || n.name] = n);
    
    // Support both name-based and ID-based connection mapping
    Object.keys(connections).forEach(srcKey => {
      const srcNode = nodeMap[srcKey] || nodes.find(n => n.name === srcKey);
      if (!srcNode || srcNode.type.includes('sticky')) return;

      const outputs = connections[srcKey].main || [];
      outputs.forEach((outputGroup, outputIndex) => {
        outputGroup.forEach(target => {
          const targetNode = nodeMap[target.node] || nodes.find(n => n.name === target.node);
          if (!targetNode) return;

          const sX = srcNode.position[0] + 220;
          const sY = srcNode.position[1] + 32;
          const eX = targetNode.position[0];
          const eY = targetNode.position[1] + (targetNode.type.includes('sticky') ? 40 : 32);

          const cpX = sX + (eX - sX) * 0.45;
          html += `
            <path d="M ${sX} ${sY} C ${cpX} ${sY}, ${cpX} ${eY}, ${eX} ${eY}" class="path-line" />
            <path d="M ${sX} ${sY} C ${cpX} ${sY}, ${cpX} ${eY}, ${eX} ${eY}" class="path-active" />
          `;
        });
      });
    });
    return html;
  }

  getCategory(type) {
    const t = type.toLowerCase();
    if (t.includes('trigger')) return 'trigger';
    if (t.includes('http') || t.includes('webhook')) return 'integration';
    if (t.includes('sheets') || t.includes('db') || t.includes('sql')) return 'data';
    return 'logic';
  }

  getRawIcon(type) {
    const t = type.toLowerCase();
    const common = 'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
    if (t.includes('trigger')) return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" ${common}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
    if (t.includes('http') || t.includes('webhook')) return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" ${common}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
    if (t.includes('sheets') || t.includes('db') || t.includes('sql')) return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" ${common}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`;
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" ${common}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
  }

  renderError() {
    this.shadowRoot.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94A3B8; font-weight: 950; font-size: 0.7rem;">Sovereign Engine | Data Sync Fault</div>`;
  }
}

customElements.define('n8n-demo', N8nDemoComponent);
