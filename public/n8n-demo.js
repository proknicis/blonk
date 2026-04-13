/**
 * BLONK | Institutional Protocol Visualization Engine
 * Panning-enabled high-fidelity rendering of n8n workflow archetypes.
 */

class N8nDemoComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      offsetX: 0,
      offsetY: 0,
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
      // Only drag if clicking the canvas background, not nodes
      if (e.target.closest('.node')) return;
      
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
      if (!this.state.isDragging) return;
      this.state.isDragging = false;
      canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', (e) => handleMouseMove(e));
    window.addEventListener('mouseup', () => handleMouseUp());
  }

  updateTransform() {
    const container = this.shadowRoot.querySelector('.view-container');
    if (container) {
      container.style.transform = `translate(${this.state.offsetX}px, ${this.state.offsetY}px)`;
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

    // Initial Coordinate Normalization
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
      if (node.position && Array.isArray(node.position)) {
        minX = Math.min(minX, node.position[0]);
        minY = Math.min(minY, node.position[1]);
        maxX = Math.max(maxX, node.position[0]);
        maxY = Math.max(maxY, node.position[1]);
      }
    });

    const canvasWidth = this.offsetWidth || 800;
    const canvasHeight = 600;
    const workflowWidth = maxX - minX;
    const workflowHeight = maxY - minY;
    
    // Set initial offsets if they haven't been touched yet
    if (this.state.offsetX === 0 && this.state.offsetY === 0 && minX !== Infinity) {
      const centerX = (canvasWidth - 200) / 2;
      const centerY = (canvasHeight - 100) / 2;
      this.state.offsetX = (centerX - (workflowWidth / 2) - minX);
      this.state.offsetY = (centerY - (workflowHeight / 2) - minY);
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 600px;
          background: #FAFAFA;
          font-family: 'Outfit', 'Inter', system-ui, sans-serif;
          color: #0F172A;
          position: relative;
          overflow: hidden;
          user-select: none;
        }

        .canvas {
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(#E2E8F0 1px, transparent 1px);
          background-size: 24px 24px;
          position: relative;
          cursor: grab;
          background-position: ${this.state.offsetX % 24}px ${this.state.offsetY % 24}px;
        }

        .view-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          transform: translate(${this.state.offsetX}px, ${this.state.offsetY}px);
        }

        .node {
          position: absolute;
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 16px;
          padding: 12px 18px;
          min-width: 200px;
          display: flex;
          align-items: center;
          gap: 14px;
          pointer-events: auto;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }

        .node:hover {
          border-color: #3B82F6;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
          z-index: 50;
        }

        .node-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-trigger { background: #EFF6FF; color: #3B82F6; }
        .icon-logic { background: #F8FAFC; color: #64748B; }
        .icon-integration { background: #F0FDF4; color: #10B981; }
        .icon-data { background: #FEF3C7; color: #D97706; }

        .node-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .node-name {
          font-size: 0.85rem;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .node-type {
          font-size: 0.65rem;
          color: #64748B;
          font-weight: 600;
          text-transform: uppercase;
        }

        .connection-svg {
          position: absolute;
          width: 20000px;
          height: 20000px;
          top: -10000px;
          left: -10000px;
          pointer-events: none;
        }

        .path-line {
          fill: none;
          stroke: #CBD5E1;
          stroke-width: 2;
          stroke-dasharray: 4 4;
          animation: flow 30s linear infinite;
        }

        @keyframes flow {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }

        .toolbar {
          position: absolute;
          top: 24px;
          left: 24px;
          display: flex;
          gap: 12px;
          z-index: 100;
        }

        .tool-btn {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .status-pill {
          position: absolute;
          bottom: 24px;
          right: 24px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          padding: 8px 16px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 100;
        }

        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981; }
        .status-text { font-size: 0.65rem; font-weight: 950; text-transform: uppercase; color: #64748B; letter-spacing: 0.05em; }
      </style>

      <div class="canvas">
        <div class="toolbar">
          <div class="tool-btn">Execute Protocol</div>
          <div class="tool-btn">Node Library</div>
        </div>

        <div class="view-container">
          <svg class="connection-svg" viewBox="-10000 -10000 20000 20000">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#CBD5E1" />
              </marker>
            </defs>
            ${this.renderConnections(nodes, connections)}
          </svg>

          ${nodes.map((node, i) => {
            const x = node.position ? node.position[0] : (i * 250);
            const y = node.position ? node.position[1] : 250;
            const category = this.getCategory(node.type);
            
            return `
              <div class="node" style="left: ${x}px; top: ${y}px;">
                <div class="node-icon-wrapper icon-${category}">
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

        <div class="status-pill">
          <div class="status-dot"></div>
          <span class="status-text">Synchronized Engine v4.2</span>
        </div>
      </div>
    `;
    
    this.initPanning();
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

          const startX = sourceNode.position[0] + 200;
          const startY = sourceNode.position[1] + 32;
          const endX = targetNode.position[0];
          const endY = targetNode.position[1] + 32;

          const cp1X = startX + (endX - startX) / 2;
          const cp2X = startX + (endX - startX) / 2;

          paths += `<path d="M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}" class="path-line" marker-end="url(#arrowhead)" />`;
        });
      });
    });

    return paths;
  }

  getCategory(type) {
    const t = type.toLowerCase();
    if (t.includes('trigger')) return 'trigger';
    if (t.includes('if') || t.includes('switch') || t.includes('wait') || t.includes('set')) return 'logic';
    if (t.includes('http') || t.includes('webhook') || t.includes('api')) return 'integration';
    if (t.includes('sheets') || t.includes('db') || t.includes('sql')) return 'data';
    return 'logic';
  }

  getRawIcon(type) {
    const t = type.toLowerCase();
    if (t.includes('trigger')) return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
    if (t.includes('httprequest') || t.includes('webhook')) return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
    if (t.includes('googlesheets') || t.includes('db')) return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`;
    if (t.includes('if')) return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 10l5 5 5-5"/></svg>`;
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
  }

  renderError() {
    this.shadowRoot.innerHTML = `
      <style>
        .error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; font-family: sans-serif; }
      </style>
      <div class="error">
        <div style="font-weight: 800; color: #1e293b;">Protocol Engine Offline</div>
        <div style="font-size: 0.8rem; color: #64748B; margin-top: 8px;">Synchronize JSON definition to enable visualization.</div>
      </div>
    `;
  }
}

customElements.define('n8n-demo', N8nDemoComponent);
