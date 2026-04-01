import React from 'react';
import styles from "./Bento.module.css";

export default function BentoGrids() {
  return (
    <section className={styles.bento_section}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header */}
        <div className={styles.section_header}>
          <span className={styles.label_cap}>Engine Architecture</span>
          <h2 className={styles.section_title}>
            Institutional Infrastructure.<br />Zero Compromise.
          </h2>
          <p className={styles.section_desc}>
            A high-fidelity platform engineered for the most demanding professional services firms.
          </p>
        </div>

        {/* Bento Grid */}
        <div className={styles.bento_grid}>
          {/* Card 1 — Ultra-Low Response (tall, spans 2 cols + 2 rows) */}
          <div className={`${styles.bento_card} ${styles.bento_card_large}`}>
            <div>
              <p className={styles.bento_tag}>LATENCY</p>
              <h3 className={styles.bento_card_title}>Ultra-Low Response</h3>
              <p className={styles.bento_card_desc}>
                Every administrative process is optimized for zero-leakage execution. Operations complete in milliseconds across globally distributed sovereign clouds.
              </p>
            </div>
            <div className={styles.bento_stat}>{"<"}50ms</div>
          </div>

          {/* Card 2 — Sovereign Availability */}
          <div className={`${styles.bento_card} ${styles.bento_card_normal}`}>
            <p className={styles.bento_tag}>UPTIME</p>
            <h3 className={styles.bento_card_title_sm}>Sovereign Availability</h3>
            <div className={styles.bento_stat_sm}>99.99%</div>
          </div>

          {/* Card 3 — Audit Ready */}
          <div className={`${styles.bento_card} ${styles.bento_card_normal}`}>
            <p className={styles.bento_tag}>SECURITY</p>
            <h3 className={styles.bento_card_title_sm}>Audit Ready</h3>
            <div className={`${styles.bento_stat_sm} ${styles.accent}`}>SOC-2</div>
          </div>

          {/* Card 4 — Enterprise Guardrails (spans 2 cols) */}
          <div className={`${styles.bento_card} ${styles.bento_card_light} ${styles.bento_card_wide}`}>
            <p className={styles.bento_tag}>GOVERNANCE</p>
            <h3 className={styles.bento_card_title_md}>Enterprise Guardrails</h3>
            <p className={styles.bento_card_desc_sm}>
              SOC 2 Type II certified infrastructure with end-to-end cryptographic verification. Granular sovereign access controls integrated at the kernel level.
            </p>
          </div>

          {/* Card 5 — Seamless Abstraction (spans 2 cols) */}
          <div className={`${styles.bento_card} ${styles.bento_card_light} ${styles.bento_card_wide}`}>
            <p className={styles.bento_tag}>CONNECTIVITY</p>
            <h3 className={styles.bento_card_title_md}>Seamless Abstraction</h3>
            <p className={styles.bento_card_desc_sm}>
              Direct integration with legacy stack components. 100+ secure webhooks and a high-performance REST orchestration layer.
            </p>
          </div>

          {/* Card 6 — Infinite Throughput (spans 2 cols) */}
          <div className={`${styles.bento_card} ${styles.bento_card_normal} ${styles.bento_card_wide}`}>
            <p className={styles.bento_tag}>SCALE</p>
            <h3 className={styles.bento_card_title_md}>Infinite Throughput</h3>
            <p className={styles.bento_card_desc_sm}>
              Sovereign vertical scaling designed for Fortune 500 legal and accounting practices. Deploy at any velocity.
            </p>
            <div className={styles.bento_stat_sm}>10M+ Operations</div>
          </div>
        </div>
      </div>
    </section>
  );
}
