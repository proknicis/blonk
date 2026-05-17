"use client";

import styles from "./page.module.css";
import React from "react";
import { 
    Globe, Server, CheckCircle, AlertCircle, Plus, 
    FileText, Link2, ShieldCheck, PieChart, Activity,
    TrendingUp, TrendingDown, Clock, Search, ExternalLink,
    Terminal, Database, Play, Pause, Settings, Menu, Settings2, Lock
} from "lucide-react";
import Link from "next/link";

export default function FleetProvisioning() {
    return (
        <div className={styles.dashboard}>
            {/* HERO BANNER */}
            <div className={styles.heroBanner}>
                <div className={styles.heroContent}>
                    <div className={styles.heroBadge}>
                        <Globe size={14} /> ORCHESTRATION HUB
                    </div>
                    <h1 className={styles.heroTitle}>
                        SOVEREIGN OPERATIONS
                    </h1>
                    <p className={styles.heroSubtitle}>Real-time telemetry and granular fleet orchestration across 6 clusters.</p>
                </div>
                <button className={styles.provisionBtn}>+ Provision New Cluster</button>
            </div>

            {/* METRICS ROW */}
            <div className={styles.metricsRow}>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>ACTIVE NODES</span>
                        <Server size={18} color="#10B981" />
                    </div>
                    <div className={styles.metricValue}>2</div>
                    <div className={styles.metricSub}>Online & connected</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>SYSTEM HEALTH</span>
                        <ShieldCheck size={18} color="#F59E0B" />
                    </div>
                    <div className={styles.metricValue}>50%</div>
                    <div className={`${styles.metricSub} ${styles.warningText}`}>Needs attention</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>RESOURCE LOAD</span>
                        <Activity size={18} color="#10B981" />
                    </div>
                    <div className={styles.metricValue}>24.2%</div>
                    <div className={styles.metricSub}>Average utilization</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>OP VELOCITY (24H)</span>
                    </div>
                    <div className={styles.metricValue}>350</div>
                    <div className={styles.metricSub}>Operations executed</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>DATA THROUGHPUT (24H)</span>
                    </div>
                    <div className={styles.metricValue}>1.2 TB</div>
                    <div className={`${styles.metricSub} ${styles.successText}`}><TrendingUp size={12}/> 12% vs yesterday</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricLabel}>ERROR RATE (24H)</span>
                    </div>
                    <div className={styles.metricValue}>0.8%</div>
                    <div className={`${styles.metricSub} ${styles.successText}`}><TrendingDown size={12}/> 8% vs yesterday</div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className={styles.mainLayout}>
                <div className={styles.contentLeft}>
                    {/* OPERATIONS LEDGER */}
                    <div className={styles.ledgerSection}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionTitleRow}>
                                <Activity size={20} color="#10B981" />
                                <div>
                                    <h3>OPERATIONS LEDGER</h3>
                                    <p>Real-time streaming from provisioned institutional nodes.</p>
                                </div>
                            </div>
                            <div className={styles.sectionControls}>
                                <div className={styles.tabs}>
                                    <button className={`${styles.tab} ${styles.activeTab}`}>All</button>
                                    <button className={styles.tab}>Ready</button>
                                    <button className={styles.tab}>Syncing</button>
                                    <button className={styles.tab}>Errors</button>
                                    <button className={styles.tab}>Provisioned</button>
                                </div>
                                <select className={styles.clusterSelect}>
                                    <option>All Clusters</option>
                                </select>
                                <div className={styles.searchBox}>
                                    <Search size={14} />
                                    <input type="text" placeholder="Search the fleet..." />
                                </div>
                            </div>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.ledgerTable}>
                                <thead>
                                    <tr>
                                        <th>NODE IDENTITY</th>
                                        <th>CLUSTER HUB</th>
                                        <th>STATUS</th>
                                        <th>YIELD (OPS/HR)</th>
                                        <th>TELEMETRY</th>
                                        <th>UPTIME</th>
                                        <th>LAST SEEN</th>
                                        <th>COMMANDS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className={styles.nodeIdentity}>
                                                <div className={styles.nodeAvatar}>3</div>
                                                <div>
                                                    <div className={styles.nodeEmail}>markunded@gmail.com</div>
                                                    <div className={styles.nodeId}><Lock size={10} /> 8374d57c-cc48</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.clusterHub}>
                                                <Server size={14} color="#10B981" />
                                                <div>
                                                    <div className={styles.clusterNum}>1</div>
                                                    <div className={styles.clusterUrl}>ndn.masedoniana.lv</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`${styles.statusBadge} ${styles.statusError}`}>ERROR</span></td>
                                        <td className={styles.yieldCol}><TrendingUp size={14} color="#F59E0B"/> 135</td>
                                        <td><div className={styles.telemetryBars}><div className={styles.barRed}/><div className={styles.barGray}/><div className={styles.barGray}/></div></td>
                                        <td className={styles.uptime}>0h 2m</td>
                                        <td className={styles.lastSeen}><div className={styles.dotGreen}/> 2 mins ago</td>
                                        <td><button className={styles.iconBtn}><Settings size={16}/></button></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className={styles.nodeIdentity}>
                                                <div className={styles.nodeAvatar}>3</div>
                                                <div>
                                                    <div className={styles.nodeEmail}>markunded@gmail.com</div>
                                                    <div className={styles.nodeId}><Lock size={10} /> 27c2e5ae-ffea</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.clusterHub}>
                                                <Server size={14} color="#10B981" />
                                                <div>
                                                    <div className={styles.clusterNum}>1</div>
                                                    <div className={styles.clusterUrl}>ndn.masedoniana.lv</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`${styles.statusBadge} ${styles.statusError}`}>ERROR</span></td>
                                        <td className={styles.yieldCol}><TrendingUp size={14} color="#F59E0B"/> 207</td>
                                        <td><div className={styles.telemetryBars}><div className={styles.barRed}/><div className={styles.barGray}/><div className={styles.barGray}/></div></td>
                                        <td className={styles.uptime}>0h 5m</td>
                                        <td className={styles.lastSeen}><div className={styles.dotGreen}/> 5 mins ago</td>
                                        <td><button className={styles.iconBtn}><Settings size={16}/></button></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className={styles.nodeIdentity}>
                                                <div className={styles.nodeAvatar}>2</div>
                                                <div>
                                                    <div className={styles.nodeEmail}>prokinicis@gmail.com</div>
                                                    <div className={styles.nodeId}><Lock size={10} /> a300bb48-152f</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.clusterHub}>
                                                <Server size={14} color="#10B981" />
                                                <div>
                                                    <div className={styles.clusterNum}>1</div>
                                                    <div className={styles.clusterUrl}>ndn.masedoniana.lv</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`${styles.statusBadge} ${styles.statusError}`}>ERROR</span></td>
                                        <td className={styles.yieldCol}><TrendingDown size={14} color="#F59E0B"/> 8</td>
                                        <td><div className={styles.telemetryBars}><div className={styles.barRed}/><div className={styles.barGray}/><div className={styles.barGray}/></div></td>
                                        <td className={styles.uptime}>0h 1m</td>
                                        <td className={styles.lastSeen}><div className={styles.dotGreen}/> 1 min ago</td>
                                        <td><button className={styles.iconBtn}><Settings size={16}/></button></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className={styles.nodeIdentity}>
                                                <div className={styles.nodeAvatar}>2</div>
                                                <div>
                                                    <div className={styles.nodeEmail}>prokinicis@gmail.com</div>
                                                    <div className={styles.nodeId}><Lock size={10} /> ad41a0bd-d0f8</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.clusterHub}>
                                                <Server size={14} color="#10B981" />
                                                <div>
                                                    <div className={styles.clusterNum}>1</div>
                                                    <div className={styles.clusterUrl}>ndn.masedoniana.lv</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`${styles.statusBadge} ${styles.statusProvisioned}`}>PROVISIONED</span></td>
                                        <td className={styles.yieldCol}><TrendingUp size={14} color="#10B981"/> 0</td>
                                        <td><div className={styles.telemetryBars}><div className={styles.barGreen}/><div className={styles.barGreen}/><div className={styles.barGray}/></div></td>
                                        <td className={styles.uptime}>1h 12m</td>
                                        <td className={styles.lastSeen}><div className={styles.dotGreen}/> Just now</td>
                                        <td><button className={styles.iconBtn}><Settings size={16}/></button></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className={styles.nodeIdentity}>
                                                <div className={styles.nodeAvatar}>1</div>
                                                <div>
                                                    <div className={styles.nodeEmail}>ovrhps@gmail.com</div>
                                                    <div className={styles.nodeId}><Lock size={10} /> 198daad1-f1d</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.clusterHub}>
                                                <Server size={14} color="#10B981" />
                                                <div>
                                                    <div className={styles.clusterNum}>1</div>
                                                    <div className={styles.clusterUrl}>ndn.masedoniana.lv</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`${styles.statusBadge} ${styles.statusReady}`}>READY</span></td>
                                        <td className={styles.yieldCol}><TrendingUp size={14} color="#10B981"/> 0</td>
                                        <td><div className={styles.telemetryBars}><div className={styles.barGreen}/><div className={styles.barGreen}/><div className={styles.barGray}/></div></td>
                                        <td className={styles.uptime}>2h 33m</td>
                                        <td className={styles.lastSeen}><div className={styles.dotGreen}/> Just now</td>
                                        <td><button className={styles.iconBtn}><Settings size={16}/></button></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className={styles.nodeIdentity}>
                                                <div className={styles.nodeAvatar}>3</div>
                                                <div>
                                                    <div className={styles.nodeEmail}>markunded@gmail.com</div>
                                                    <div className={styles.nodeId}><Lock size={10} /> ede140a6-774</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.clusterHub}>
                                                <Server size={14} color="#10B981" />
                                                <div>
                                                    <div className={styles.clusterNum}>1</div>
                                                    <div className={styles.clusterUrl}>ndn.masedoniana.lv</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`${styles.statusBadge} ${styles.statusReady}`}>READY</span></td>
                                        <td className={styles.yieldCol}><TrendingUp size={14} color="#10B981"/> 0</td>
                                        <td><div className={styles.telemetryBars}><div className={styles.barGreen}/><div className={styles.barGreen}/><div className={styles.barGray}/></div></td>
                                        <td className={styles.uptime}>45m</td>
                                        <td className={styles.lastSeen}><div className={styles.dotGreen}/> 3 mins ago</td>
                                        <td><button className={styles.iconBtn}><Settings size={16}/></button></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className={styles.paginationRow}>
                                <span className={styles.showingText}>Showing 1 to 6 of 6 nodes</span>
                                <div className={styles.perPage}>
                                    <select><option>10 per page</option></select>
                                </div>
                                <div className={styles.pagination}>
                                    <button>&lt;</button>
                                    <button className={styles.activePage}>1</button>
                                    <button>&gt;</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.bottomWidgets}>
                        {/* CLUSTER DISTRIBUTION */}
                        <div className={styles.widgetCard}>
                            <h4 className={styles.widgetTitle}>CLUSTER DISTRIBUTION</h4>
                            <div className={styles.distContent}>
                                <div className={styles.pieChartPlaceholder}>
                                    <div className={styles.pieSegment} style={{background: '#10B981'}}></div>
                                    <div className={styles.pieInner}></div>
                                </div>
                                <div className={styles.distLegend}>
                                    <div className={styles.legendItem}>
                                        <div className={styles.dotGreen}/>
                                        <span>1 Healthy</span>
                                        <span className={styles.legendVal}>83.3% (5)</span>
                                    </div>
                                    <div className={styles.legendItem}>
                                        <div className={styles.dotRed}/>
                                        <span>1 Error</span>
                                        <span className={styles.legendVal}>50.0% (3)</span>
                                    </div>
                                    <div className={styles.legendItem}>
                                        <div className={styles.dotGray}/>
                                        <span>0 Syncing</span>
                                        <span className={styles.legendVal}>0% (0)</span>
                                    </div>
                                    <div className={styles.legendItem}>
                                        <div className={styles.dotGray}/>
                                        <span>0 Offline</span>
                                        <span className={styles.legendVal}>0% (0)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RESOURCE UTILIZATION */}
                        <div className={styles.widgetCard}>
                            <h4 className={styles.widgetTitle}>RESOURCE UTILIZATION (AVG)</h4>
                            <div className={styles.utilList}>
                                <div className={styles.utilRow}>
                                    <span>CPU</span>
                                    <div className={styles.utilBarWrapper}><div className={styles.utilBar} style={{width:'24.2%', background:'#10B981'}}></div></div>
                                    <span>24.2%</span>
                                </div>
                                <div className={styles.utilRow}>
                                    <span>Memory</span>
                                    <div className={styles.utilBarWrapper}><div className={styles.utilBar} style={{width:'50.0%', background:'#F59E0B'}}></div></div>
                                    <span>50.0%</span>
                                </div>
                                <div className={styles.utilRow}>
                                    <span>Disk</span>
                                    <div className={styles.utilBarWrapper}><div className={styles.utilBar} style={{width:'18.7%', background:'#10B981'}}></div></div>
                                    <span>18.7%</span>
                                </div>
                                <div className={styles.utilRow}>
                                    <span>Network</span>
                                    <div className={styles.utilBarWrapper}><div className={styles.utilBar} style={{width:'32.1%', background:'#10B981'}}></div></div>
                                    <span>32.1%</span>
                                </div>
                            </div>
                        </div>

                        {/* TOP CLUSTERS */}
                        <div className={styles.widgetCard}>
                            <h4 className={styles.widgetTitle}>TOP CLUSTERS BY LOAD</h4>
                            <div className={styles.utilList}>
                                <div className={styles.utilRow}>
                                    <span className={styles.clusterRank}>1</span>
                                    <span className={styles.clusterName}>GLOBAL_ALPHA</span>
                                    <div className={styles.utilBarWrapper}><div className={styles.utilBar} style={{width:'24.2%', background:'#10B981'}}></div></div>
                                    <span>24.2%</span>
                                </div>
                                <div className={styles.utilRow}>
                                    <span className={styles.clusterRank}>2</span>
                                    <span className={styles.clusterName}>EU_WEST_1</span>
                                    <div className={styles.utilBarWrapper}><div className={styles.utilBar} style={{width:'18.7%', background:'#10B981'}}></div></div>
                                    <span>18.7%</span>
                                </div>
                                <div className={styles.utilRow}>
                                    <span className={styles.clusterRank}>3</span>
                                    <span className={styles.clusterName}>US_EAST_1</span>
                                    <div className={styles.utilBarWrapper}><div className={styles.utilBar} style={{width:'12.3%', background:'#10B981'}}></div></div>
                                    <span>12.3%</span>
                                </div>
                            </div>
                        </div>

                        {/* RECENT ALERTS */}
                        <div className={styles.widgetCard}>
                            <h4 className={styles.widgetTitle}>RECENT ALERTS</h4>
                            <div className={styles.alertsList}>
                                <div className={styles.alertItem}>
                                    <div className={styles.dotRed}/>
                                    <div className={styles.alertText}>High error rate on node markunded@gmail.com</div>
                                    <div className={styles.alertTime}>2m ago</div>
                                </div>
                                <div className={styles.alertItem}>
                                    <div className={styles.dotOrange}/>
                                    <div className={styles.alertText}>Node sync delayed on EU_WEST_1</div>
                                    <div className={styles.alertTime}>15m ago</div>
                                </div>
                                <div className={styles.alertItem}>
                                    <div className={styles.dotRed}/>
                                    <div className={styles.alertText}>CPU usage threshold exceeded on GLOBAL_ALPHA</div>
                                    <div className={styles.alertTime}>32m ago</div>
                                </div>
                            </div>
                            <div className={styles.viewAllBtn}>View all alerts &rsaquo;</div>
                        </div>
                    </div>
                </div>

                <div className={styles.contentRight}>
                    <div className={styles.rightCard}>
                        <h4 className={styles.rightCardTitle}>PROVISION QUICK ACTIONS</h4>
                        <div className={styles.quickActionList}>
                            <button className={styles.quickActionBtn}>
                                <div className={styles.quickActionIcon}><Globe size={16}/></div>
                                <div className={styles.quickActionText}>
                                    <strong>Provision New Node</strong>
                                    <span>Add a new node to cluster</span>
                                </div>
                            </button>
                            <button className={styles.quickActionBtn}>
                                <div className={styles.quickActionIcon}><Settings size={16}/></div>
                                <div className={styles.quickActionText}>
                                    <strong>Import Node Config</strong>
                                    <span>Bulk import node configurations</span>
                                </div>
                            </button>
                            <button className={styles.quickActionBtn}>
                                <div className={styles.quickActionIcon}><Activity size={16}/></div>
                                <div className={styles.quickActionText}>
                                    <strong>Sync All Nodes</strong>
                                    <span>Trigger sync across all nodes</span>
                                </div>
                            </button>
                            <button className={styles.quickActionBtn}>
                                <div className={styles.quickActionIcon}><ShieldCheck size={16}/></div>
                                <div className={styles.quickActionText}>
                                    <strong>Run Diagnostics</strong>
                                    <span>Check system & node health</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className={styles.rightCard}>
                        <h4 className={styles.rightCardTitle}>FLEET SHORTCUTS</h4>
                        <div className={styles.quickActionList}>
                            <Link href="/dashboard/registry" className={styles.quickActionBtn}>
                                <div className={styles.quickActionIcon}><Lock size={16}/></div>
                                <div className={styles.quickActionText}>
                                    <strong>Node Registry</strong>
                                    <span>View all registered nodes</span>
                                </div>
                            </Link>
                            <Link href="/dashboard/health" className={styles.quickActionBtn}>
                                <div className={styles.quickActionIcon}><Activity size={16}/></div>
                                <div className={styles.quickActionText}>
                                    <strong>Health Monitoring</strong>
                                    <span>Real-time system health</span>
                                </div>
                            </Link>
                            <Link href="/dashboard/audit" className={styles.quickActionBtn}>
                                <div className={styles.quickActionIcon}><FileText size={16}/></div>
                                <div className={styles.quickActionText}>
                                    <strong>Audit Trail</strong>
                                    <span>View system activity logs</span>
                                </div>
                            </Link>
                            <Link href="/dashboard/incidents" className={styles.quickActionBtn}>
                                <div className={styles.quickActionIcon}><AlertCircle size={16}/></div>
                                <div className={styles.quickActionText}>
                                    <strong>Incident Command</strong>
                                    <span>Manage incidents & response</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className={styles.rightCard}>
                        <h4 className={styles.rightCardTitle}>SYSTEM INFO</h4>
                        <div className={styles.sysInfoList}>
                            <div className={styles.sysInfoRow}>
                                <span>Cluster</span>
                                <strong><div className={styles.dotGreen}/> GLOBAL_ALPHA</strong>
                            </div>
                            <div className={styles.sysInfoRow}>
                                <span>Version</span>
                                <strong>v2.4.1</strong>
                            </div>
                            <div className={styles.sysInfoRow}>
                                <span>Environment</span>
                                <strong>Production</strong>
                            </div>
                            <div className={styles.sysInfoRow}>
                                <span>Region</span>
                                <strong>Frankfurt, EU</strong>
                            </div>
                            <div className={styles.sysInfoRow}>
                                <span>Uptime</span>
                                <strong>7d 14h 22m</strong>
                            </div>
                        </div>
                        <div className={styles.viewDetailsBtn}>View system details &rsaquo;</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
