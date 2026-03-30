import React from 'react';

export default function BentoGrids() {
  const cardBase: React.CSSProperties = {
    borderRadius: '2rem',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  return (
    <section style={{ padding: '100px 0', borderTop: '1px solid #F1F5F9' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.2em', color: '#34D186', marginBottom: 16, display: 'block'
          }}>Engine Architecture</span>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900,
            letterSpacing: '-0.04em', color: '#101112', lineHeight: 1.1, marginBottom: 20
          }}>
            Institutional Infrastructure.<br />Zero Compromise.
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#64748B', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            A high-fidelity platform engineered for the most demanding professional services firms.
          </p>
        </div>

        {/* Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'auto auto auto',
          gap: 20,
        }}>
          {/* Card 1 — Ultra-Low Response (tall, spans 2 cols + 2 rows) */}
          <div style={{
            ...cardBase,
            background: '#101112',
            color: '#fff',
            gridColumn: '1 / 3',
            gridRow: '1 / 3',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            minHeight: 280,
          }}>
            <div>
              <p style={{ color: '#34D186', marginBottom: 12, fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>LATENCY</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 16 }}>Ultra-Low Response</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 500 }}>
                Every administrative protocol is optimized for zero-leakage execution. Operations complete in milliseconds across globally distributed sovereign clouds.
              </p>
            </div>
            <div style={{ color: '#34D186', fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.05em', marginTop: 32 }}>
              <span style={{ opacity: 0.5 }}>&lt;</span>50ms
            </div>
          </div>

          {/* Card 2 — Sovereign Availability */}
          <div style={{
            ...cardBase,
            background: '#fff',
            border: '1px solid #F1F5F9',
            gridColumn: '3 / 4',
            gridRow: '1 / 2',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            minHeight: 180,
          }}>
            <p style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>UPTIME</p>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Sovereign Availability</h3>
            <div style={{ color: '#101112', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', marginTop: 24 }}>99.99%</div>
          </div>

          {/* Card 3 — Audit Ready */}
          <div style={{
            ...cardBase,
            background: '#fff',
            border: '1px solid #F1F5F9',
            gridColumn: '4 / 5',
            gridRow: '1 / 2',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            minHeight: 180,
          }}>
            <p style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>SECURITY</p>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Audit Ready</h3>
            <div style={{ color: '#34D186', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', marginTop: 24 }}>SOC-2</div>
          </div>

          {/* Card 4 — Enterprise Guardrails (spans 2 cols) */}
          <div style={{
            ...cardBase,
            background: '#F8FAFC',
            border: '1px solid #F1F5F9',
            gridColumn: '3 / 5',
            gridRow: '2 / 3',
            minHeight: 180,
          }}>
            <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>GOVERNANCE</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 12 }}>Enterprise Guardrails</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 500 }}>
              SOC 2 Type II certified infrastructure with end-to-end cryptographic verification. Granular sovereign access controls integrated at the kernel level.
            </p>
          </div>

          {/* Card 5 — Seamless Abstraction (spans 2 cols) */}
          <div style={{
            ...cardBase,
            background: '#F8FAFC',
            border: '1px solid #F1F5F9',
            gridColumn: '1 / 3',
            gridRow: '3 / 4',
            minHeight: 180,
          }}>
            <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>CONNECTIVITY</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 12 }}>Seamless Abstraction</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 500 }}>
              Direct integration with legacy stack components. 100+ secure webhooks and a high-performance REST orchestration layer.
            </p>
          </div>

          {/* Card 6 — Infinite Throughput (spans 2 cols) */}
          <div style={{
            ...cardBase,
            background: '#fff',
            border: '1px solid #F1F5F9',
            gridColumn: '3 / 5',
            gridRow: '3 / 4',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            minHeight: 180,
          }}>
            <p style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>SCALE</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 12 }}>Infinite Throughput</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 500 }}>
              Sovereign vertical scaling designed for Fortune 500 legal and accounting practices. Deploy at any velocity.
            </p>
            <div style={{ color: '#101112', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginTop: 24 }}>10M+ Operations</div>
          </div>
        </div>
      </div>
    </section>
  );
}
