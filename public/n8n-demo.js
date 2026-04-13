/**
 * BLONK | n8n Workflow Preview Component
 * A high-fidelity web component for visualizing sovereign protocols.
 */

class N8nDemoComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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

    if (error || !workflow) {
      this.shadowRoot.innerHTML = `
        <style>
          .error-container {
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
        <div class="error-container">
          <div style="font-size: 3rem; margin-bottom: 20px;">🚫</div>
          <div style="font-weight: 800; font-size: 1.25rem; color: #111;">Preview not available</div>
          <div style="font-size: 0.9rem; margin-top: 8px;">Protocol definition is corrupted or missing.</div>
        </div>
      `;
      return;
    }

    const { nodes = [], connections = {} } = workflow;

    // Normalize positions (handling negative coordinates from n8n exports)
    let minX = Infinity;
    let minY = Infinity;
    
    nodes.forEach(node => {
      if (node.position && Array.isArray(node.position)) {
        minX = Math.min(minX, node.position[0]);
        minY = Math.min(minY, node.position[1]);
      }
    });

    const offsetX = minX === Infinity ? 0 : (60 - minX);
    const offsetY = minY === Infinity ? 0 : (100 - minY);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 600px;
          background: #FAFAFA;
          font-family: 'Inter', system-ui, sans-serif;
          color: #111;
          position: relative;
          overflow: hidden;
        }

        .canvas {
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(#E2E8F0 1px, transparent 1px);
          background-size: 32px 32px;
          position: relative;
          cursor: grab;
        }

        .node {
          position: absolute;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 12px;
          min-width: 160px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 10;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .node:hover {
          transform: translateY(-2px);
          border-color: #34D186;
        }

        .node-icon {
          width: 32px;
          height: 32px;
          background: #34D186;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1rem;
        }

        .node-info {
          display: flex;
          flex-direction: column;
        }

        .node-name {
          font-size: 0.8rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .node-type {
          font-size: 0.65rem;
          color: #64748B;
          font-weight: 500;
        }

        .toolbar {
          position: absolute;
          top: 20px;
          left: 20px;
          display: flex;
          gap: 8px;
          z-index: 100;
        }

        .tool-btn {
          padding: 8px 16px;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748B;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .status-badge {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: #EEF2FF;
          color: #4F46E5;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid #E0E7FF;
        }

        /* Institutional icons */
        .icon-trigger { background: #FF4F81; }
        .icon-logic { background: #4F46E5; }
        .icon-integration { background: #F59E0B; }
      </style>

      <div class="canvas">
        <div class="toolbar">
          <div class="tool-btn">Execute Protocol</div>
          <div class="tool-btn">Node Library</div>
        </div>

        ${nodes.length > 0 ? nodes.map((node, i) => {
          const x = node.position ? (node.position[0] + offsetX) : (100 + i * 200);
          const y = node.position ? (node.position[1] + offsetY) : 150;
          
          return `
            <div class="node" style="left: ${x}px; top: ${y}px;">
              <div class="node-icon">
                ${this.getIcon(node.type)}
              </div>
              <div class="node-info">
                <span class="node-name" title="${node.name}">${node.name}</span>
                <span class="node-type">${node.type.split('.').pop()}</span>
              </div>
            </div>
          `;
        }).join('') : `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94A3B8; font-weight: 600;">
            No nodes found in protocol definition.
          </div>
        `}

        <div class="status-badge">Sovereign Engine v3.1</div>
      </div>
    `;
  }

  getIcon(type) {
    if (type === 'Webhook') return '⚓';
    if (type === 'Code') return '</>';
    if (type === 'MySQL' || type === 'Postgres') return '📦';
    return '⚡';
  }
}

customElements.define('n8n-demo', N8nDemoComponent);
