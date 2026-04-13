/**
 * BLONK | Sovereign Protocol Orchestration Engine
 * A high-fidelity, interactive visualization suite for complex automation protocols.
 * Features: Multi-layer grid, Panning, SVG Connectivity, and Institutional Design System.
 */

class N8nDemoComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      offsetX: 0,
      offsetY: 0,
      zoom: 1,
      isDragging: false,
      startX: 0,
      startY: 0,
      baseX: 0,
      baseY: 0
    };
  }

  static get observedAttributes() {
    return ['workflow'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'workflow') {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.initPanning();
  }

  initPanning() {
    const canvas = this.shadowRoot.querySelector('.canvas');
    if (!canvas) return;

    const handleMouseDown = (e) => {
      if (e.target.closest('.node') || e.target.closest('.toolbar')) return;
      this.state.isDragging = true;
      this.state.startX = e.clientX;
      this.state.startY = e.clientY;
      this.state.baseX = this.state.offsetX;
      this.state.baseY = this.state.offsetY;
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
      if (!this.state.isDragging) return;
      const dx = e.clientX - this.state.startX;
      const dy = e.clientY - this.state.startY;
      this.state.offsetX = this.state.baseX + dx;
      this.state.offsetY = this.state.baseY + dy;
      this.updateTransform();
    };

    const handleMouseUp = () => {
      this.state.isDragging = false;
      canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  updateTransform() {
    const container = this.shadowRoot.querySelector('.view-container');
    const canvas = this.shadowRoot.querySelector('.canvas');
    if (container) {
      container.style.transform = `translate(${this.state.offsetX}px, ${this.state.offsetY}px)`;
    }
    if (canvas) {
      canvas.style.backgroundPosition = `${this.state.offsetX}px ${this.state.offsetY}px`;
    }
  }

  render() {
    const workflowStr = this.getAttribute('workflow') || '{}';
    let workflow = null;
    let error = false;
    try {
      workflow = JSON.parse(workflowStr);
    } catch (e) {
      error = true;
    }

    if (error || !workflow || !workflow.nodes) {
      this.renderError();
      return;
    }

    const { nodes = [], connections = {} } = workflow;

    // Initial View Normalization
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      if (node.position && Array.isArray(node.position)) {
        minX = Math.min(minX, node.position[0]); minY = Math.min(minY, node.position[1]);
        maxX = Math.max(maxX, node.position[0]); maxY = Math.max(maxY, node.position[1]);
      }
    });

    const canvasWidth = this.offsetWidth || 800;
    const canvasHeight = 600;
    
    if (this.state.offsetX === 0 && this.state.offsetY === 0 && minX !== Infinity) {
      this.state.offsetX = (canvasWidth / 2) - ((maxX + minX) / 2) - 100;
      this.state.offsetY = (canvasHeight / 2) - ((maxY + minY) / 2) - 50;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 600px;
          background: #F8FAFC;
          font-family: 'Outfit', 'Inter', system-ui, sans-serif;
          color: #0F172A;
          position: relative;
          overflow: hidden;
          user-select: none;
          --accent: #3A81F1;
          --border: #E2E8F0;
        }

        .canvas {
          width: 100%;
          height: 100%;
          background-color: #F8FAFC;
          background-image: 
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px),
            linear-gradient(rgba(226, 232, 240, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(226, 232, 240, 0.3) 1px, transparent 1px);
          background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
          background-position: ${this.state.offsetX}px ${this.state.offsetY}px;
          position: relative;
          cursor: grab;
        }

        .view-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          pointer-events: none;
          transform: translate(${this.state.offsetX}px, ${this.state.offsetY}px);
        }

        .node {
          position: absolute;
          background: #FFFFFF;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px 14px;
          min-width: 180px;
          display: flex;
          align-items: center;
          gap: 12px;
          pointer-events: auto;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .node:hover {
          border-color: var(--accent);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
          transform: translateY(-2px);
          z-index: 50;
        }

        .node-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: #F1F5F9;
          color: #64748B;
        }

        .icon-trigger { background: #EEF2FF; color: var(--accent); }
        .icon-integration { background: #ECFDF5; color: #10B981; }
        .icon-logic { background: #F8FAFC; color: #475569; }
        .icon-data { background: #FFFBEB; color: #D97706; }

        .node-info { display: flex; flex-direction: column; overflow: hidden; }
        .node-name { font-size: 0.8rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em; }
        .node-type { font-size: 0.6rem; color: #94A3B8; font-weight: 650; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1px; }

        .connection-svg {
          position: absolute;
          width: 20000px; height: 20000px;
          top: -10000px; left: -10000px;
          pointer-events: none;
          z-index: 0;
        }

        .path-line {
          fill: none;
          stroke: #CBD5E1;
          stroke-width: 2;
          stroke-dasharray: 4 4;
          animation: flow 40s linear infinite;
        }

        @keyframes flow { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }

        .toolbar {
          position: absolute;
          top: 24px; left: 24px;
          display: flex; gap: 8px;
          z-index: 100;
        }

        .tool-btn {
          height: 38px;
          padding: 0 16px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
          color: #475569;
          cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          transition: all 0.2s;
        }

        .tool-btn:hover { background: #FFFFFF; color: var(--accent); border-color: var(--accent); }

        .btn-primary { background: var(--accent); color: white; border: none; }
        .btn-primary:hover { background: #2A6BCC; color: white; }

        .breadcrumb {
          position: absolute;
          top: 24px; right: 24px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          padding: 8px 16px;
          border-radius: 100px;
          display: flex; align-items: center; gap: 12px;
          z-index: 100;
        }

        .status-badge {
          font-size: 0.6rem;
          font-weight: 950;
          text-transform: uppercase;
          color: #10B981;
          background: #ECFDF5;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .workflow-name { font-size: 0.75rem; font-weight: 800; color: #1E293B; }
      </style>

      <div class="canvas">
        <div class="toolbar">
          <button class="tool-btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Execute
          </button>
          <button class="tool-btn">Node Library</button>
          <button class="tool-btn">Inspect Protocol</button>
        </div>

        <div class="breadcrumb">
          <span class="status-badge">Live</span>
          <span class="workflow-name">${workflow.name || 'Autonomous Protocol'}</span>
        </div>

        <div class="view-container">
          <svg class="connection-svg" viewBox="-10000 -10000 20000 20000">
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#CBD5E1" />
              </marker>
            </defs>
            ${this.renderConnections(nodes, connections)}
          </svg>

          ${nodes.map((node, i) => {
            const x = node.position ? node.position[0] : (i * 240);
            const y = node.position ? node.position[1] : 200;
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
  }

  renderConnections(nodes, connections) {
    let paths = '';
    const nodeMap = {};
    nodes.forEach(n => nodeMap[n.name] = n);

    Object.keys(connections).forEach(sourceName => {
      const sourceNode = nodeMap[sourceName];
      if (!sourceNode) return;

      const outputs = connections[sourceName].main || [];
      outputs.forEach(outputGroup => {
        outputGroup.forEach(target => {
          const targetNode = nodeMap[target.node];
          if (!targetNode) return;

          const startX = sourceNode.position[0] + 180;
          const startY = sourceNode.position[1] + 28;
          const endX = targetNode.position[0];
          const endY = targetNode.position[1] + 28;

          const dx = endX - startX;
          const cpX = startX + (dx * 0.5);

          paths += `<path d="M ${startX} ${startY} C ${cpX} ${startY}, ${cpX} ${endY}, ${endX} ${endY}" class="path-line" marker-end="url(#arrowhead)" />`;
        });
      });
    });

    return paths;
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
    if (t.includes('trigger')) return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
    if (t.includes('http') || t.includes('webhook')) return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
    if (t.includes('sheets') || t.includes('db')) return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`;
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
  }

  renderError() {
    this.shadowRoot.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94A3B8; font-weight: 800;">Protocol Sync Offline</div>`;
  }
}

customElements.define('n8n-demo', N8nDemoComponent);
