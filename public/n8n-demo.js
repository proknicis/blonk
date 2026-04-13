/**
 * BLONK | Sovereign Protocol Orchestration Engine
 * A high-fidelity, interactive visualization suite with Panning and Zooming capabilities.
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
    this.initZooming();
  }

  initPanning() {
    const canvas = this.shadowRoot.querySelector('.canvas');
    if (!canvas) return;

    const handleMouseDown = (e) => {
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
      this.state.isDragging = false;
      canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  initZooming() {
    const canvas = this.shadowRoot.querySelector('.canvas');
    if (!canvas) return;

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const oldZoom = this.state.zoom;
      const newZoom = Math.min(Math.max(oldZoom + delta, 0.2), 2.5);
      
      // Calculate mouse position relative to canvas
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Adjust offsets to zoom into mouse position
      this.state.offsetX -= (mouseX - this.state.offsetX) * (newZoom / oldZoom - 1);
      this.state.offsetY -= (mouseY - this.state.offsetY) * (newZoom / oldZoom - 1);
      
      this.state.zoom = newZoom;
      this.updateTransform();
    }, { passive: false });
  }

  updateTransform() {
    const container = this.shadowRoot.querySelector('.view-container');
    const canvas = this.shadowRoot.querySelector('.canvas');
    if (container) {
      container.style.transform = `translate(${this.state.offsetX}px, ${this.state.offsetY}px) scale(${this.state.zoom})`;
    }
    if (canvas) {
      canvas.style.backgroundPosition = `${this.state.offsetX}px ${this.state.offsetY}px`;
      canvas.style.backgroundSize = `${100 * this.state.zoom}px ${100 * this.state.zoom}px, ${100 * this.state.zoom}px ${100 * this.state.zoom}px, ${20 * this.state.zoom}px ${20 * this.state.zoom}px, ${20 * this.state.zoom}px ${20 * this.state.zoom}px`;
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

    // Zoom-to-Fit Orchestration: Calculate Bounding Box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      if (node.position && Array.isArray(node.position)) {
        minX = Math.min(minX, node.position[0]); minY = Math.min(minY, node.position[1]);
        maxX = Math.max(maxX, node.position[0]); maxY = Math.max(maxY, node.position[1]);
      }
    });

    const canvasWidth = this.offsetWidth || 800;
    const canvasHeight = 600;
    const padding = 80;

    if (minX !== Infinity) {
      const workflowWidth = (maxX - minX) + 200; // +200 for node width
      const workflowHeight = (maxY - minY) + 100; // +100 for node height
      
      const scaleX = (canvasWidth - padding) / workflowWidth;
      const scaleY = (canvasHeight - padding) / workflowHeight;
      const autoZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.3), 1);
      
      this.state.zoom = autoZoom;
      this.state.offsetX = (canvasWidth / 2) - (((maxX + minX + 200) / 2) * autoZoom);
      this.state.offsetY = (canvasHeight / 2) - (((maxY + minY + 80) / 2) * autoZoom);
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block; width: 100%; height: 600px; background: #F8FAFC;
          font-family: 'Outfit', 'Inter', system-ui, sans-serif;
          position: relative; overflow: hidden; user-select: none;
        }

        .canvas {
          width: 100%; height: 100%; cursor: grab;
          background-image: 
            linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px),
            linear-gradient(rgba(226, 232, 240, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(226, 232, 240, 0.3) 1px, transparent 1px);
          background-size: ${100 * this.state.zoom}px ${100 * this.state.zoom}px, ${100 * this.state.zoom}px ${100 * this.state.zoom}px, ${20 * this.state.zoom}px ${20 * this.state.zoom}px, ${20 * this.state.zoom}px ${20 * this.state.zoom}px;
          background-position: ${this.state.offsetX}px ${this.state.offsetY}px;
        }

        .view-container {
          position: absolute; top: 0; left: 0; width: 0; height: 0; pointer-events: none;
          transform-origin: 0 0;
          transform: translate(${this.state.offsetX}px, ${this.state.offsetY}px) scale(${this.state.zoom});
        }

        .node {
          position: absolute; background: white; border: 1.5px solid #E2E8F0; border-radius: 12px;
          padding: 10px 14px; min-width: 180px; display: flex; align-items: center; gap: 12px;
          pointer-events: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          transition: border-color 0.2s, transform 0.2s;
        }

        .node:hover { border-color: #3B82F6; transform: translateY(-2px); z-index: 100; }

        .node-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .icon-trigger { background: #EEF2FF; color: #3B82F6; }
        .icon-integration { background: #ECFDF5; color: #10B981; }
        .icon-logic { background: #F8FAFC; color: #475569; }
        .icon-data { background: #FFFBEB; color: #D97706; }

        .node-info { display: flex; flex-direction: column; overflow: hidden; }
        .node-name { font-size: 0.8rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #1E293B; }
        .node-type { font-size: 0.6rem; color: #94A3B8; font-weight: 650; text-transform: uppercase; margin-top: 1px; }

        .connection-svg { position: absolute; width: 20000px; height: 20000px; top: -10000px; left: -10000px; pointer-events: none; }
        .path-line { fill: none; stroke: #CBD5E1; stroke-width: 2; stroke-dasharray: 4 4; animation: flow 40s linear infinite; }
        @keyframes flow { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }

        .zoom-indicator {
          position: absolute; bottom: 24px; left: 24px;
          background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px);
          border: 1px solid #E2E8F0; padding: 6px 12px; border-radius: 100px;
          font-size: 0.65rem; font-weight: 950; color: #64748B;
        }

        .breadcrumb {
          position: absolute; top: 24px; right: 24px;
          background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px);
          border: 1px solid #E2E8F0; padding: 8px 16px; border-radius: 100px;
          display: flex; align-items: center; gap: 12px; z-index: 100;
        }

        .status-badge { font-size: 0.6rem; font-weight: 950; text-transform: uppercase; color: #10B981; background: #ECFDF5; padding: 2px 8px; border-radius: 4px; }
        .workflow-name { font-size: 0.75rem; font-weight: 800; color: #1E293B; }
      </style>

      <div class="canvas">
        <div class="breadcrumb">
          <span class="status-badge">Live</span>
          <span class="workflow-name">${workflow.name || 'Autonomous Protocol'}</span>
        </div>

        <div class="zoom-indicator">Scale: ${Math.round(this.state.zoom * 100)}%</div>

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
    
    this.initPanning();
    this.initZooming();
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
