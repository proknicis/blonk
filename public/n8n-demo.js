/**
 * BLONK | Sovereign Protocol Orchestration Suite v6.0
 * Ultra-premium, high-fidelity protocol visualization with advanced depth and vector orchestration.
 * Institutional Design System: Sovereign Light Tier.
 */

class N8nDemoComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      offsetX: 0, offsetY: 0, zoom: 1,
      isDragging: false, startX: 0, startY: 0, baseX: 0, baseY: 0
    };
  }

  static get observedAttributes() { return ['workflow']; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'workflow') this.render();
  }

  connectedCallback() {
    this.render();
    this.initPanning();
    this.initZooming();
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
      const delta = e.deltaY > 0 ? -0.06 : 0.06;
      const oldZoom = this.state.zoom;
      const newZoom = Math.min(Math.max(oldZoom + delta, 0.15), 2.2);
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
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      if (node.position && Array.isArray(node.position)) {
        minX = Math.min(minX, node.position[0]); minY = Math.min(minY, node.position[1]);
        maxX = Math.max(maxX, node.position[0]); maxY = Math.max(maxY, node.position[1]);
      }
    });

    const canvasWidth = this.offsetWidth || 800; const canvasHeight = 600;
    if (this.state.offsetX === 0 && this.state.offsetY === 0 && minX !== Infinity) {
      const wW = (maxX - minX) + 260; const wH = (maxY - minY) + 140;
      this.state.zoom = Math.min(Math.max(Math.min((canvasWidth - 120) / wW, (canvasHeight - 120) / wH), 0.25), 1);
      this.state.offsetX = (canvasWidth / 2) - (((maxX + minX + 260) / 2) * this.state.zoom);
      this.state.offsetY = (canvasHeight / 2) - (((maxY + minY + 100) / 2) * this.state.zoom);
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block; width: 100%; height: 600px;
          background: #FFFFFF; font-family: 'Outfit', 'Inter', system-ui, sans-serif;
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
          transition: transform 0.05s linear;
        }

        .node {
          position: absolute; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px;
          padding: 12px 16px; min-width: 220px; display: flex; align-items: center; gap: 14px;
          pointer-events: auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02), inset 0 0 0 1px rgba(255,255,255,0.5);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .node:hover {
          border-color: #3B82F6; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02);
          transform: translateY(-4px) scale(1.02); z-index: 100;
        }

        .glass-card {
          position: absolute; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px);
          border: 1px solid rgba(226, 232, 240, 0.6); border-radius: 12px; padding: 24px;
          color: #475569; font-size: 0.85rem; line-height: 1.7; pointer-events: auto;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02); font-weight: 500;
        }

        .node-icon { 
          width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          background: #F8FAFC; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .icon-trigger { color: #3B82F6; background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); }
        .icon-integration { color: #10B981; background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); }
        .icon-logic { color: #6366F1; background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); }
        .icon-data { color: #D97706; background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); }

        .node-info { display: flex; flex-direction: column; gap: 2px; }
        .node-name { font-size: 0.85rem; font-weight: 900; color: #0F172A; letter-spacing: -0.02em; }
        .node-type { font-size: 0.65rem; color: #94A3B8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }

        .connection-svg { position: absolute; width: 40000px; height: 40000px; top: -20000px; left: -20000px; pointer-events: none; }
        
        .path-line {
          fill: none; stroke: #CBD5E1; stroke-width: 2.5; stroke-linecap: round;
        }

        .path-active {
          stroke: #3B82F6; stroke-width: 3; stroke-dasharray: 6 120;
          animation: flow 4s linear infinite; filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.4));
        }

        @keyframes flow { from { stroke-dashoffset: 126; } to { stroke-dashoffset: 0; } }

        .hud {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 200;
        }

        .badge {
          background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px);
          border: 1px solid #E2E8F0; padding: 10px 20px; border-radius: 100px;
          display: flex; align-items: center; gap: 12px; pointer-events: auto;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .badge-left { position: absolute; top: 24px; left: 24px; }
        .badge-right { position: absolute; top: 24px; right: 24px; }
        .badge-bottom { position: absolute; bottom: 24px; left: 24px; font-size: 0.7rem; font-weight: 800; color: #64748B; opacity: 0.8; }

        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 10px #10B981; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        .wf-title { font-size: 0.85rem; font-weight: 900; color: #0F172A; text-transform: uppercase; letter-spacing: 0.02em; }
        .wf-scale { font-weight: 950; color: #3B82F6; letter-spacing: 0.05em; }
      </style>

      <div class="canvas">
        <div class="hud">
          <div class="badge badge-left">
            <div class="status-dot"></div>
            <span class="wf-title">${workflow.name || 'Protocol Registry'}</span>
          </div>
          <div class="badge badge-right">
            <span class="wf-scale">${Math.round(this.state.zoom * 100)}%</span>
            <span style="font-size: 0.65rem; font-weight: 950; color: #94A3B8; text-transform: uppercase;">Visual Depth</span>
          </div>
          <div class="badge badge-bottom">
            SOVEREIGN ENGINE | OPERATIONAL UNIT V6.1
          </div>
        </div>

        <div class="view-container">
          <svg class="connection-svg" viewBox="-20000 -20000 40000 40000">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#CBD5E1" />
                <stop offset="100%" stop-color="#94A3B8" />
              </linearGradient>
            </defs>
            ${this.renderConnections(nodes, connections)}
          </svg>

          ${nodes.map((node, i) => {
            const x = node.position ? node.position[0] : (i * 260);
            const y = node.position ? node.position[1] : 200;
            
            if (node.type === 'n8n-nodes-base.stickyNote') {
              const colors = ['rgba(254,249,195,0.7)', 'rgba(255,237,213,0.7)', 'rgba(243,232,255,0.7)', 'rgba(252,231,243,0.7)', 'rgba(236,253,245,0.7)', 'rgba(241,245,249,0.7)', 'rgba(219,234,254,0.7)'];
              const bg = colors[(node.parameters?.color || 1) - 1] || colors[0];
              return `
                <div class="glass-card" style="left: ${x}px; top: ${y}px; width: ${node.parameters?.width || 340}px; height: ${node.parameters?.height || 220}px; background: ${bg};">
                  ${(node.parameters?.content || '').replace(/\n/g, '<br>')}
                </div>
              `;
            }

            const category = this.getCategory(node.type);
            return `
              <div class="node" style="left: ${x}px; top: ${y}px;">
                <div class="node-icon icon-${category}">
                  ${this.getRawIcon(node.type)}
                </div>
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
    const nodeMap = {}; nodes.forEach(n => nodeMap[n.name] = n);
    Object.keys(connections).forEach(src => {
      const sN = nodeMap[src]; if (!sN || sN.type.includes('sticky')) return;
      const outputs = connections[src].main || [];
      outputs.forEach(og => {
        og.forEach(t => {
          const tN = nodeMap[t.node]; if (!tN) return;
          const sX = sN.position[0] + 220, sY = sN.position[1] + 32;
          const eX = tN.position[0], eY = tN.position[1] + (tN.type.includes('sticky') ? 40 : 32);
          const cpX = sX + (eX - sX) * 0.45;
          html += `
            <path d="M ${sX} ${sY} C ${cpX} ${sY}, ${cpX} ${eY}, ${eX} ${eY}" class="path-line" stroke="url(#lineGrad)" />
            <path d="M ${sX} ${sY} C ${cpX} ${sY}, ${cpX} ${eY}, ${eX} ${eY}" class="path-line path-active" />
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
    if (t.includes('sheets') || t.includes('db')) return 'data';
    return 'logic';
  }

  getRawIcon(type) {
    const t = type.toLowerCase();
    const common = 'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
    if (t.includes('trigger')) return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ${common}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
    if (t.includes('http') || t.includes('webhook')) return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ${common}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
    if (t.includes('sheets') || t.includes('db')) return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ${common}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`;
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ${common}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
  }

  renderError() {
    this.shadowRoot.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94A3B8; font-weight: 950; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.7rem;">Sovereign Engine | Protocol Data Missing</div>`;
  }
}

customElements.define('n8n-demo', N8nDemoComponent);
