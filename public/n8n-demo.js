/**
 * BLONK | Institutional Protocol Visualization Engine
 * High-fidelity rendering of n8n workflow archetypes for sovereign dashboards.
 */

class N8nDemoComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      offsetX: 0,
      offsetY: 0,
      zoom: 1
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

    // Coordinate Normalization
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

    // Centralize the view
    const canvasWidth = this.offsetWidth || 800;
    const canvasHeight = 600;
    
    const workflowWidth = maxX - minX;
    const workflowHeight = maxY - minY;
    
    const centerX = (canvasWidth - 180) / 2;
    const centerY = (canvasHeight - 100) / 2;
    
    const offsetBaseX = minX === Infinity ? 100 : (centerX - (workflowWidth / 2) - minX);
    const offsetBaseY = minY === Infinity ? 100 : (centerY - (workflowHeight / 2) - minY);

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
          overflow: visible;
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
          z-index: 10;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .node:hover {
          border-color: #3B82F6;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: translateY(-2px);
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
          letter-spacing: -0.01em;
        }

        .node-type {
          font-size: 0.65rem;
          color: #64748B;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .connection-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 5;
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
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          transition: all 0.2s;
        }

        .tool-btn:hover {
          background: #FFFFFF;
          border-color: #CBD5E1;
          color: #0F172A;
          transform: translateY(-1px);
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
          gap: 8px;
          z-index: 100;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
        }

        .status-text {
          font-size: 0.65rem;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #64748B;
        }
      </style>

      <div class="canvas">
        <div class="toolbar">
          <div class="tool-btn">Execute Protocol</div>
          <div class="tool-btn">Node Library</div>
        </div>

        <svg class="connection-svg">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#CBD5E1" />
            </marker>
          </defs>
          ${this.renderConnections(nodes, connections, offsetBaseX, offsetBaseY)}
        </svg>

        ${nodes.map((node, i) => {
          const x = node.position ? (node.position[0] + offsetBaseX) : (100 + i * 250);
          const y = node.position ? (node.position[1] + offsetBaseY) : 250;
          const category = this.getCategory(node.type);
          
          return `
            <div class="node" style="left: ${x}px; top: ${y}px;" data-id="${node.id}">
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

        <div class="status-pill">
          <div class="status-dot"></div>
          <span class="status-text">Synchronized Protocol v4.2</span>
        </div>
      </div>
    `;
  }

  renderConnections(nodes, connections, offsetX, offsetY) {
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

          const startX = sourceNode.position[0] + offsetX + 200; // Right side of node
          const startY = sourceNode.position[1] + offsetY + 32;  // Vertical center
          
          const endX = targetNode.position[0] + offsetX;      // Left side of node
          const endY = targetNode.position[1] + offsetY + 32;

          const cp1X = startX + (endX - startX) / 2;
          const cp2X = startX + (endX - startX) / 2;

          paths += `
            <path 
              d="M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}" 
              class="path-line" 
              marker-end="url(#arrowhead)"
            />
          `;
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
    if (t.includes('trigger')) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
    }
    if (t.includes('httprequest') || t.includes('webhook')) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
    }
    if (t.includes('googlesheets') || t.includes('db')) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`;
    }
    if (t.includes('if')) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10l5 5 5-5"/></svg>`;
    }
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
  }

  renderError() {
    this.shadowRoot.innerHTML = `
      <style>
        .error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #FAFAFA;
          color: #64748B;
          font-family: inherit;
        }
      </style>
      <div class="error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px; opacity: 0.5;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div style="font-weight: 800; color: #1e293b;">Protocol Definition Missing</div>
        <div style="font-size: 0.8rem; margin-top: 8px;">Ensure the JSON structure is properly synchronized.</div>
      </div>
    `;
  }
}

customElements.define('n8n-demo', N8nDemoComponent);
