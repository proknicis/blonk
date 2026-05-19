"use client";

import React, { useState, useRef } from "react";
import {
    Calendar, Filter, Download, ChevronDown, CheckCircle,
    AlertCircle, Clock, ShieldCheck, Zap, TrendingUp,
    BarChart3, AlertTriangle, FileText, Users, X
} from "lucide-react";
import styles from "./reports.module.css";

interface DayRow   { day: string; successes: number; failures: number }
interface WfStat   { name: string; runs: number; successRate: string; avgMs: number; failures: number }
interface ErrorRow { label: string; count: number; pct: string }
interface DeptRow  { name: string; successRate: number; runs: number }

interface Props {
    totalRuns:     number;
    successRuns:   number;
    failedRuns:    number;
    avgExecMs:     number;
    successRate:   string;
    failureRate:   string;
    slaCompliance: string;
    runsOverTime:  DayRow[];
    topWorkflows:  WfStat[];
    errorInsights: ErrorRow[];
    departments:   DeptRow[];
}

// ── SVG Line Chart ──────────────────────────────────────────────────────────
function LineChart({ data }: { data: DayRow[] }) {
    if (!data.length) {
        return <div className={styles.emptyChart}>No data for selected period</div>;
    }
    const W = 700, H = 160;
    const maxVal = Math.max(...data.map(d => d.successes + d.failures), 1);

    const buildPath = (vals: number[]) => {
        const pts = vals.map((v, i) => {
            const x = (i / Math.max(vals.length - 1, 1)) * W;
            const y = H - 10 - ((v / maxVal) * (H - 20));
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        });
        return `M${pts.join(" L")}`;
    };

    const successPath = buildPath(data.map(d => d.successes));
    const failPath    = buildPath(data.map(d => d.failures));
    const successArea = `${successPath} L${W},${H} L0,${H} Z`;

    // Show every Nth label to avoid crowding
    const step = Math.ceil(data.length / 7);

    return (
        <svg viewBox={`0 0 ${W} ${H + 24}`} className={styles.svgChart}>
            <defs>
                <linearGradient id="successGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%"   stopColor="#10B981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0"    />
                </linearGradient>
            </defs>
            <path d={successArea} fill="url(#successGrad)" />
            <path d={successPath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
            <path d={failPath}    fill="none" stroke="#EF4444" strokeWidth="2"   strokeLinecap="round" strokeDasharray="4 3" />
            {data.map((d, i) => i % step === 0 && (
                <text key={i} x={(i / Math.max(data.length - 1, 1)) * W} y={H + 18}
                    textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="700">
                    {d.day}
                </text>
            ))}
        </svg>
    );
}

// ── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ success, failed, manual, total }: { success: number; failed: number; manual: number; total: number }) {
    const R = 50, CX = 60, CY = 60, CIRC = 2 * Math.PI * R;
    const safeTotal = total || 1;
    const sOff = 0;
    const fOff = CIRC * (success / safeTotal);
    const mOff = fOff + CIRC * (failed / safeTotal);

    return (
        <svg viewBox="0 0 120 120" width="160" height="160">
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F1F5F9" strokeWidth="18" />
            {success > 0 && (
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#10B981" strokeWidth="18"
                    strokeDasharray={`${CIRC * success / safeTotal} ${CIRC}`}
                    strokeDashoffset={-sOff} transform={`rotate(-90 ${CX} ${CY})`} />
            )}
            {failed > 0 && (
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#EF4444" strokeWidth="18"
                    strokeDasharray={`${CIRC * failed / safeTotal} ${CIRC}`}
                    strokeDashoffset={-(fOff)} transform={`rotate(-90 ${CX} ${CY})`} />
            )}
            {manual > 0 && (
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F59E0B" strokeWidth="18"
                    strokeDasharray={`${CIRC * manual / safeTotal} ${CIRC}`}
                    strokeDashoffset={-(mOff)} transform={`rotate(-90 ${CX} ${CY})`} />
            )}
            <text x={CX} y={CY - 6}  textAnchor="middle" fontSize="14" fontWeight="900" fill="#0F172A">{(total ?? 0).toLocaleString()}</text>
            <text x={CX} y={CY + 10} textAnchor="middle" fontSize="8"  fontWeight="700" fill="#94A3B8">Total Runs</text>
        </svg>
    );
}

// ── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            style={{
                width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                background: on ? '#10B981' : '#E2E8F0', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
        >
            <span style={{
                position: 'absolute', top: 3, left: on ? 20 : 3, width: 16, height: 16,
                borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
        </button>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function ReportsClient({
    totalRuns, successRuns, failedRuns, avgExecMs,
    successRate, failureRate, slaCompliance,
    runsOverTime, topWorkflows, errorInsights, departments,
}: Props) {
    const [period,  setPeriod]  = useState("Daily");
    const [showExport, setShowExport] = useState(false);
    const [reportToggles, setReportToggles] = useState({
        summary:    true,
        trends:     true,
        outcome:    true,
        topWf:      true,
        errors:     true,
        dept:       true,
        resources:  false,
    });
    const [reportTitle,  setReportTitle]  = useState("Weekly Performance Report");
    const [reportFormat, setReportFormat] = useState<"standard" | "detailed" | "executive">("standard");
    const [generating, setGenerating] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    const manualRuns = Math.max(0, totalRuns - successRuns - failedRuns);

    // ── Export CSV ─────────────────────────────────────────────────────────────
    const exportCSV = () => {
        const rows = [
            ["Metric", "Value"],
            ["Total Runs", totalRuns],
            ["Successful Runs", successRuns],
            ["Failed Runs", failedRuns],
            ["Success Rate", successRate + "%"],
            ["Failure Rate", failureRate + "%"],
            ["Avg Execution Time", avgExecMs + "ms"],
            ["SLA Compliance", slaCompliance + "%"],
            ["", ""],
            ["TOP WORKFLOWS", ""],
            ["Workflow", "Runs", "Success Rate", "Avg Time", "Failures"],
            ...topWorkflows.map(w => [w.name, w.runs, w.successRate + "%", w.avgMs + "ms", w.failures]),
            ["", ""],
            ["ERROR INSIGHTS", ""],
            ["Error", "Count", "Share"],
            ...errorInsights.map(e => [e.label, e.count, e.pct]),
        ];
        const csv  = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `blonk-report-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExport(false);
    };

    const generateReport = () => {
        setGenerating(true);
        setTimeout(() => { exportCSV(); setGenerating(false); }, 800);
    };

    const toggle = (key: keyof typeof reportToggles) =>
        setReportToggles(p => ({ ...p, [key]: !p[key] }));

    // KPI cards
    const kpis = [
        {
            label: "Total Runs", value: (totalRuns ?? 0).toLocaleString(),
            sub: `From workflow logs`, up: true,
            icon: <BarChart3 size={22} />, color: "#3B82F6",
        },
        {
            label: "Successful Runs", value: (successRuns ?? 0).toLocaleString(),
            sub: `${successRate}% success rate`, up: true,
            icon: <CheckCircle size={22} />, color: "#10B981",
        },
        {
            label: "Failed Runs", value: (failedRuns ?? 0).toLocaleString(),
            sub: `${failureRate}% failure rate`, up: false,
            icon: <AlertCircle size={22} />, color: "#EF4444",
        },
        {
            label: "Avg. Execution Time", value: avgExecMs ? `${avgExecMs}ms` : "No data",
            sub: `Average from logged duration`, up: true,
            icon: <Clock size={22} />, color: "#F59E0B",
        },
        {
            label: "SLA Compliance", value: `${slaCompliance}%`,
            sub: `Based on successful runs`, up: true,
            icon: <ShieldCheck size={22} />, color: "#8B5CF6",
        },
    ];

    return (
        <div className={styles.page}>

            {/* ── FILTER BAR ─────────────────────────────────────── */}
            <div className={styles.filterBar}>
                <div className={styles.filterLeft}>
                    <div className={styles.datePill}>
                        <Calendar size={14} />
                        Last 30 days
                        <ChevronDown size={13} />
                    </div>
                    <select className={styles.filterSel}><option>All Workflows</option>
                        {topWorkflows.map(w => <option key={w.name}>{w.name}</option>)}
                    </select>
                    <select className={styles.filterSel}><option>All Outcomes</option><option>Success</option><option>Failed</option></select>
                    <button className={styles.moreFiltersBtn}><Filter size={13} /> More Filters</button>
                </div>
                <div className={styles.filterRight}>
                    <button className={styles.printBtn} onClick={() => window.print()}>
                        <FileText size={14} /> Print / Download Report
                    </button>
                    <div style={{ position: 'relative' }} ref={exportRef}>
                        <button className={styles.exportBtn} onClick={() => setShowExport(v => !v)}>
                            <Download size={14} /> Export <ChevronDown size={13} />
                        </button>
                        {showExport && (
                            <div className={styles.exportDropdown}>
                                <button onClick={() => { window.print(); setShowExport(false); }}>Export PDF</button>
                                <button onClick={exportCSV}>Export CSV</button>
                                <button onClick={exportCSV}>Export Excel</button>
                                <button onClick={() => { navigator.clipboard?.writeText(window.location.href); setShowExport(false); }}>Copy Summary Link</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── KPI ROW ────────────────────────────────────────── */}
            <div className={styles.kpiRow}>
                {kpis.map((k, i) => (
                    <div key={i} className={styles.kpiCard}>
                        <div className={styles.kpiTop}>
                            <div className={styles.kpiIcon} style={{ background: `${k.color}15`, color: k.color }}>
                                {k.icon}
                            </div>
                            <span className={styles.kpiLabel}>{k.label}</span>
                        </div>
                        <div className={styles.kpiValue}>{k.value}</div>
                        <div className={`${styles.kpiSub} ${k.up ? styles.kpiUp : styles.kpiDown}`}>{k.sub}</div>
                    </div>
                ))}
            </div>

            {/* ── MAIN CONTENT + SIDEBAR ─────────────────────────── */}
            <div className={styles.mainLayout}>
                {/* LEFT: charts + tables */}
                <div className={styles.leftCol}>

                    {/* Runs Over Time */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>
                                <TrendingUp size={18} color="#10B981" />
                                Runs Over Time
                            </div>
                            <div className={styles.chartLegend}>
                                <span><span style={{ background: '#10B981' }} />Successful</span>
                                <span><span style={{ background: '#EF4444' }} />Failed</span>
                            </div>
                            <div className={styles.periodTabs}>
                                {["Hourly","Daily","Weekly"].map(p => (
                                    <button key={p} className={`${styles.periodTab} ${period === p ? styles.periodTabActive : ''}`} onClick={() => setPeriod(p)}>{p}</button>
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: '8px 24px 16px' }}>
                            <LineChart data={runsOverTime} />
                        </div>
                    </div>

                    {/* Middle row: Outcome Breakdown + Error Insights */}
                    <div className={styles.midRow}>
                        {/* Outcome Donut */}
                        <div className={styles.card} style={{ flex: '0 0 340px' }}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitle}><Zap size={18} color="#10B981" /> Outcome Breakdown</div>
                            </div>
                            <div className={styles.donutArea}>
                                <DonutChart success={successRuns} failed={failedRuns} manual={manualRuns} total={totalRuns} />
                                <div className={styles.donutLegend}>
                                    {[
                                        { label: "Successful", value: successRuns, color: "#10B981", pct: successRate + "%" },
                                        { label: "Failed",     value: failedRuns,  color: "#EF4444", pct: failureRate + "%" },
                                        { label: "Manual Actions", value: manualRuns, color: "#F59E0B",
                                            pct: totalRuns > 0 ? ((manualRuns/totalRuns)*100).toFixed(1)+"%" : "0%" },
                                    ].map(item => (
                                        <div key={item.label} className={styles.legendRow}>
                                            <span className={styles.legendDot} style={{ background: item.color }} />
                                            <span className={styles.legendLabel}>{item.label}</span>
                                            <span className={styles.legendValue}>{(item.value ?? 0).toLocaleString()}</span>
                                            <span className={styles.legendPct}>{item.pct}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Error Insights */}
                        <div className={styles.card} style={{ flex: 1 }}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitle}><AlertTriangle size={18} color="#EF4444" /> Error Insights</div>
                                <span className={styles.totalErrors}>Total Errors: {(failedRuns ?? 0).toLocaleString()}</span>
                            </div>
                            <div style={{ padding: '0 24px 20px' }}>
                                <div className={styles.errorSubTitle}>Most Common Errors</div>
                                {errorInsights.length === 0 ? (
                                    <div className={styles.emptyState}>No errors recorded 🎉</div>
                                ) : errorInsights.map((e, i) => (
                                    <div key={i} className={styles.errorRow}>
                                        <AlertCircle size={14} color="#EF4444" style={{ flexShrink: 0 }} />
                                        <span className={styles.errorLabel}>{e.label}</span>
                                        <span className={styles.errorCount}>{(e.count ?? 0).toLocaleString()}</span>
                                        <span className={styles.errorPct}>{e.pct}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Workflows Table */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}><Zap size={18} color="#10B981" /> Top Workflows by Runs</div>
                        </div>
                        {topWorkflows.length === 0 ? (
                            <div className={styles.emptyState} style={{ padding: 40 }}>No workflow data yet.</div>
                        ) : (
                            <table className={styles.wfTable}>
                                <thead>
                                    <tr>
                                        <th>Workflow</th>
                                        <th>Runs</th>
                                        <th>Success Rate</th>
                                        <th>Avg. Execution Time</th>
                                        <th>Failures</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topWorkflows.map((wf, i) => {
                                        const initials = wf.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
                                        const colors = ["#3B82F6","#10B981","#8B5CF6","#F59E0B","#EF4444"];
                                        return (
                                            <tr key={i}>
                                                <td>
                                                    <div className={styles.wfNameCell}>
                                                        <div className={styles.wfAvatar} style={{ background: colors[i % colors.length] }}>{initials}</div>
                                                        <div>
                                                            <div className={styles.wfName}>{wf.name}</div>
                                                            <div className={styles.wfType}>Automated Workflow</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={styles.wfNum}>{(wf.runs ?? 0).toLocaleString()}</td>
                                                <td>
                                                    <span className={styles.successBadge}>{wf.successRate}%</span>
                                                </td>
                                                <td className={styles.wfNum}>{wf.avgMs}ms</td>
                                                <td>
                                                    <span className={styles.failBadge}>{wf.failures}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Efficiency by Department */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}><Users size={18} color="#10B981" /> Efficiency by Department</div>
                        </div>
                        {departments.length === 0 ? (
                            <div className={styles.emptyState} style={{ padding: 40 }}>No department data yet.</div>
                        ) : (
                            <div className={styles.deptGrid}>
                                {departments.map((d, i) => {
                                    const colors = ["#3B82F6","#10B981","#8B5CF6","#F59E0B","#EF4444"];
                                    return (
                                        <div key={i} className={styles.deptCard}>
                                            <div className={styles.deptIcon} style={{ background: `${colors[i%colors.length]}15`, color: colors[i%colors.length] }}>
                                                <Users size={20} />
                                            </div>
                                            <div className={styles.deptName}>{d.name}</div>
                                            <div className={styles.deptRate} style={{ color: d.successRate >= 90 ? '#10B981' : d.successRate >= 70 ? '#F59E0B' : '#EF4444' }}>
                                                {d.successRate}%
                                            </div>
                                            <div className={styles.deptSub}>Success Rate</div>
                                            <div className={styles.deptRuns}>{(d.runs ?? 0).toLocaleString()} runs</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Build Your Report */}
                <div className={styles.reportBuilder}>
                    <div className={styles.builderTitle}>BUILD YOUR REPORT</div>
                    <p className={styles.builderSub}>Choose what to include in your report.</p>

                    <div className={styles.builderSections}>
                        {[
                            { key: 'summary',  label: 'Summary Overview',   sub: 'High-level summary cards'    },
                            { key: 'trends',   label: 'Run Trends',          sub: 'Include runs over time chart' },
                            { key: 'outcome',  label: 'Outcome Breakdown',   sub: 'Donut chart with outcomes'   },
                            { key: 'topWf',    label: 'Top Workflows',       sub: 'Top performing workflows'    },
                            { key: 'errors',   label: 'Error Analysis',      sub: 'Include failure and error insights' },
                            { key: 'dept',     label: 'Department Efficiency', sub: 'Department overview'       },
                            { key: 'resources', label: 'Resource Usage',     sub: 'Compute and memory usage'    },
                        ].map(item => (
                            <div key={item.key} className={styles.builderRow}>
                                <div>
                                    <div className={styles.builderRowLabel}>{item.label}</div>
                                    <div className={styles.builderRowSub}>{item.sub}</div>
                                </div>
                                <Toggle
                                    on={reportToggles[item.key as keyof typeof reportToggles]}
                                    onChange={() => toggle(item.key as keyof typeof reportToggles)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className={styles.reportTitleSection}>
                        <label className={styles.builderLabel}>REPORT TITLE (OPTIONAL)</label>
                        <input
                            className={styles.reportTitleInput}
                            value={reportTitle}
                            onChange={e => setReportTitle(e.target.value)}
                            placeholder="Weekly Performance Report"
                        />
                    </div>

                    <div className={styles.reportFormatSection}>
                        <div className={styles.builderLabel}>REPORT FORMAT</div>
                        {[
                            { key: "standard",  label: "Standard",  sub: "Best for general sharing"       },
                            { key: "detailed",  label: "Detailed",  sub: "Includes all data and breakdowns" },
                            { key: "executive", label: "Executive Summary", sub: "High-level overview only" },
                        ].map(fmt => (
                            <label key={fmt.key} className={styles.fmtRow} onClick={() => setReportFormat(fmt.key as any)}>
                                <div className={`${styles.fmtRadio} ${reportFormat === fmt.key ? styles.fmtRadioActive : ''}`} />
                                <div>
                                    <div className={styles.fmtLabel}>{fmt.label}</div>
                                    <div className={styles.fmtSub}>{fmt.sub}</div>
                                </div>
                            </label>
                        ))}
                    </div>

                    <button
                        className={styles.generateBtn}
                        disabled={generating}
                        onClick={generateReport}
                    >
                        {generating ? "Generating..." : "Generate Report"}
                    </button>
                </div>
            </div>
        </div>
    );
}
