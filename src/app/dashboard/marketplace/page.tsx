"use client";

import styles from "./marketplace.module.css";
import React, { useState, useEffect } from "react";
import { Activity, Zap, CheckCircle, AlertCircle, Plus, FileText, Link2, ArrowUpRight, ShieldCheck, ShieldAlert, X, MousePointer2, Settings, Cpu, Link, Search, Layers, Key, Euro, ShoppingCart, CreditCard, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ModalPortal from "@/app/components/ModalPortal";
import { Skeleton } from "@/app/components/Skeleton";

function getTemplatePrice(template: any) {
    if (!template) return 0;
    const pInfo = typeof template.productInfo === 'string' 
        ? JSON.parse(template.productInfo) 
        : (template.productInfo || {});
        
    const setupPrice = parseFloat(pInfo.discountSetupPrice || pInfo.setupPrice || 0);
    const monthlyPrice = parseFloat(pInfo.discountMonthlyPrice || pInfo.monthlyPrice || 0);
    if (setupPrice > 0 || monthlyPrice > 0) {
        return setupPrice + monthlyPrice;
    }
    const directPrice = parseFloat(template.price || 0);
    const productInfoPrice = pInfo.price ? parseFloat(pInfo.price) : 0;
    return productInfoPrice > 0 ? productInfoPrice : directPrice;
}

function robustParse(val: any): any[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            return robustParse(parsed);
        } catch (e) { return []; }
    }
    return [];
}

function getServiceIcon(serviceName: string) {
    const name = serviceName.toLowerCase().trim();
    if (name === 'gmail' || name === 'google mail' || name === 'google') {
        return (
            <svg style={{ width: '12px', height: '9px', display: 'inline-block', verticalAlign: 'middle' }} viewBox="0 49.4 512 399.42" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                    <g fillRule="nonzero">
                        <path fill="#4285f4" d="M34.91 448.818h81.454V251L0 163.727V413.91c0 19.287 15.622 34.91 34.91 34.91z"/>
                        <path fill="#34a853" d="M395.636 448.818h81.455c19.287 0 34.909-15.622 34.909-34.909V163.727L395.636 251z"/>
                        <path fill="#fbbc04" d="M395.636 99.727V251L512 163.727v-46.545c0-43.142-49.25-67.782-83.782-41.891z"/>
                    </g>
                    <path fill="#ea4335" d="M116.364 251V99.727L256 204.455 395.636 99.727V251L256 355.727z"/>
                    <path fill="#c5221f" fillRule="nonzero" d="M0 117.182v46.545L116.364 251V99.727L83.782 75.291C49.25 49.4 0 74.04 0 117.18z"/>
                </g>
            </svg>
        );
    }
    if (name === 'make' || name === 'make.com') {
        return (
            <svg style={{ width: '10px', height: '10px', display: 'inline-block', verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="#6D00CC" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.38 3.498c-.27 0-.511.19-.566.465L9.85 18.986a.578.578 0 0 0 .453.678l4.095.826a.58.58 0 0 0 .682-.455l2.963-15.021a.578.578 0 0 0-.453-.678l-4.096-.826a.589.589 0 0 0-.113-.012zm-5.876.098a.576.576 0 0 0-.516.318L.062 17.697a.575.575 0 0 0 .256.774l3.733 1.877a.578.578 0 0 0 .775-.258l6.926-13.781a.577.577 0 0 0-.256-.776L7.762 3.658a.571.571 0 0 0-.258-.062zm11.74.115a.576.576 0 0 0-.576.576v15.426c0 .318.258.578.576.578h4.178a.58.58 0 0 0 .578-.578V4.287a.578.578 0 0 0-.578-.576Z"/>
            </svg>
        );
    }
    if (name === 'slack') {
        return (
            <svg style={{ width: '10px', height: '10px', display: 'inline-block', verticalAlign: 'middle' }} viewBox="0 0 2447.6 2452.5" xmlns="http://www.w3.org/2000/svg">
                <g clipRule="evenodd" fillRule="evenodd">
                    <path d="m897.4 0c-135.3.1-244.8 109.9-244.7 245.2-.1 135.3 109.5 245.1 244.8 245.2h244.8v-245.1c.1-135.3-109.5-245.1-244.9-245.3.1 0 .1 0 0 0m0 654h-652.6c-135.3.1-244.9 109.9-244.8 245.2-.2 135.3 109.4 245.1 244.7 245.3h652.7c135.3-.1 244.9-109.9 244.8-245.2.1-135.4-109.5-245.2-244.8-245.3z" fill="#36c5f0" />
                    <path d="m2447.6 899.2c.1-135.3-109.5-245.1-244.8-245.2-135.3.1-244.9 109.9-244.8 245.2v245.3h244.8c135.3-.1 244.9-109.9 244.8-245.3zm-652.7 0v-654c.1-135.2-109.4-245-244.7-245.2-135.3.1-244.9 109.9-244.8 245.2v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.3z" fill="#2eb67d" />
                    <path d="m1550.1 2452.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.3-109.5-245.1-244.8-245.2h-244.8v245.2c-.1 135.2 109.5 245 244.8 245.2zm0-654.1h652.7c135.3-.1 244.9-109.9 244.8-245.2.2-135.3-109.4-245.1-244.7-245.3h-652.7c-135.3.1-244.9 109.9-244.8 245.2-.1 135.4 109.4 245.2 244.7 245.3z" fill="#ecb22e" />
                    <path d="m0 1553.2c-.1 135.3 109.5 245.1 244.8 245.2 135.3-.1 244.9-109.9 244.8-245.2v-245.2h-244.8c-135.3.1-244.9 109.9-244.8 245.2zm652.7 0v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.2v-653.9c.2-135.3-109.4-245.1-244.7-245.3-135.4 0-244.9 109.8-244.8 245.1 0 0 0 .1 0 0" fill="#e01e5a" />
                </g>
            </svg>
        );
    }
    if (name === 'hubspot') {
        return (
            <svg style={{ width: '10px', height: '10px', display: 'inline-block', verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="#FF7A59" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067a2.196 2.196 0 001.252 1.973l.013.006v2.852a6.22 6.22 0 00-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 104.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 00-1.038 3.446c0 1.343.425 2.588 1.147 3.607l-.013-.02-2.342 2.343a1.968 1.968 0 00-.58-.095h-.002a2.033 2.033 0 102.033 2.033 1.978 1.978 0 00-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 104.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 113.215-3.207v.002a3.206 3.206 0 01-3.207 3.207z"/>
            </svg>
        );
    }
    if (name === 'airtable') {
        return (
            <svg style={{ width: '10px', height: '10px', display: 'inline-block', verticalAlign: 'middle' }} fill="#18BFFF" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.992 1.966c-.434 0-.87.086-1.28.257L1.779 5.917c-.503.208-.49.908.012 1.116l8.982 3.558a3.266 3.266 0 0 0 2.454 0l8.982-3.558c.503-.196.503-.908.012-1.116l-8.957-3.694a3.255 3.255 0 0 0-1.272-.257zM23.4 8.056a.589.589 0 0 0-.222.045l-10.012 3.877a.612.612 0 0 0-.38.564v8.896a.6.6 0 0 0 .821.552L23.62 18.1a.583.583 0 0 0 .38-.551V8.653a.6.6 0 0 0-.6-.596zM.676 8.095a.644.644 0 0 0-.48.19C.086 8.396 0 8.53 0 8.69v8.355c0 .442.515.737.908.54l6.27-3.006.307-.147 2.969-1.436c.466-.22.43-.908-.061-1.092L.883 8.138a.57.57 0 0 0-.207-.044z"/>
            </svg>
        );
    }
    if (name === 'n8n') {
        return (
            <svg style={{ width: '19px', height: '10px', display: 'inline-block', verticalAlign: 'middle' }} viewBox="0 0 228 120" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M204 48C192.817 48 183.42 40.3514 180.756 30H153.248C147.382 30 142.376 34.241 141.412 40.0272L140.425 45.9456C139.489 51.5648 136.646 56.4554 132.626 60C136.646 63.5446 139.489 68.4352 140.425 74.0544L141.412 79.9728C142.376 85.759 147.382 90 153.248 90H156.756C159.42 79.6486 168.817 72 180 72C193.255 72 204 82.7452 204 96C204 109.255 193.255 120 180 120C168.817 120 159.42 112.351 156.756 102H153.248C141.516 102 131.504 93.5181 129.575 81.9456L128.588 76.0272C127.624 70.241 122.618 66 116.752 66H107.244C104.58 76.3514 95.183 84 84 84C72.817 84 63.4204 76.3514 60.7561 66H47.2439C44.5796 76.3514 35.183 84 24 84C10.7452 84 0 73.2548 0 60C0 46.7452 10.7452 36 24 36C35.183 36 44.5796 43.6486 47.2439 54H60.7561C63.4204 43.6486 72.817 36 84 36C95.183 36 104.58 43.6486 107.244 54H116.752C122.618 54 127.624 49.759 128.588 43.9728L129.575 38.0544C131.504 26.4819 141.516 18 153.248 18L180.756 18C183.42 7.64864 192.817 0 204 0C217.255 0 228 10.7452 228 24C228 37.2548 217.255 48 204 48ZM204 36C210.627 36 216 30.6274 216 24C216 17.3726 210.627 12 204 12C197.373 12 192 17.3726 192 24C192 30.6274 197.373 36 204 36ZM24 72C30.6274 72 36 66.6274 36 60C36 53.3726 30.6274 48 24 48C17.3726 48 12 53.3726 12 60C12 66.6274 17.3726 72 24 72ZM96 60C96 66.6274 90.6274 72 84 72C77.3726 72 72 66.6274 72 60C72 53.3726 77.3726 48 84 48C90.6274 48 96 53.3726 96 60ZM192 96C192 102.627 186.627 108 180 108C173.373 108 168 102.627 168 96C168 89.3726 173.373 84 180 84C186.627 84 192 89.3726 192 96Z" fill="#ea4b71"/>
            </svg>
        );
    }
    if (name === 'stripe') {
        return (
            <svg style={{ width: '24px', height: '10px', display: 'inline-block', verticalAlign: 'middle' }} viewBox="0 0 512 214" xmlns="http://www.w3.org/2000/svg">
                <path fill="#635BFF" d="M512 110.08c0-36.409-17.636-65.138-51.342-65.138c-33.85 0-54.33 28.73-54.33 64.854c0 42.808 24.179 64.426 58.88 64.426c16.925 0 29.725-3.84 39.396-9.244v-28.445c-9.67 4.836-20.764 7.823-34.844 7.823c-13.796 0-26.027-4.836-27.591-21.618h69.547c0-1.85.284-9.245.284-12.658m-70.258-13.511c0-16.071 9.814-22.756 18.774-22.756c8.675 0 17.92 6.685 17.92 22.756zm-90.31-51.627c-13.939 0-22.899 6.542-27.876 11.094l-1.85-8.818h-31.288v165.83l35.555-7.537l.143-40.249c5.12 3.698 12.657 8.96 25.173 8.96c25.458 0 48.64-20.48 48.64-65.564c-.142-41.245-23.609-63.716-48.498-63.716m-8.534 97.991c-8.391 0-13.37-2.986-16.782-6.684l-.143-52.765c3.698-4.124 8.818-6.968 16.925-6.968c12.942 0 21.902 14.506 21.902 33.137c0 19.058-8.818 33.28-21.902 33.28M241.493 36.551l35.698-7.68V0l-35.698 7.538zm0 10.809h35.698v124.444h-35.698zm-38.257 10.524L200.96 47.36h-30.72v124.444h35.556V87.467c8.39-10.951 22.613-8.96 27.022-7.396V47.36c-4.551-1.707-21.191-4.836-29.582 10.524m-71.112-41.386l-34.702 7.395l-.142 113.92c0 21.05 15.787 36.551 36.836 36.551c11.662 0 20.195-2.133 24.888-4.693V140.8c-4.55 1.849-27.022 8.391-27.022-12.658V77.653h27.022V47.36h-27.022zM35.982 83.484c0-5.546 4.551-7.68 12.09-7.68c10.808 0 24.461 3.272 35.27 9.103V51.484c-11.804-4.693-23.466-6.542-35.27-6.542C19.2 44.942 0 60.018 0 85.192c0 39.252 54.044 32.995 54.044 49.92c0 6.541-5.688 8.675-13.653 8.675c-11.804 0-26.88-4.836-38.827-11.378v33.849c13.227 5.689 26.596 8.106 38.827 8.106c29.582 0 49.92-14.648 49.92-40.106c-.142-42.382-54.329-34.845-54.329-50.774"/>
            </svg>
        );
    }
    return <Key size={10} color="#64748B" />;
}

export default function WorkflowsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [configureTemplate, setConfigureTemplate] = useState<any>(null);
    const [previewTemplate, setPreviewTemplate] = useState<any>(null);
    const [templateInputs, setTemplateInputs] = useState<Record<string, any>>({});
    const [helpStep, setHelpStep] = useState<any>(null);
    const [deployResult, setDeployResult] = useState<any>(null);
    const [step, setStep] = useState<'configure' | 'result'>('configure');
    const [isDeploying, setIsDeploying] = useState(false);
    const [paymentTemplate, setPaymentTemplate] = useState<any>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Custom workflow request wizard
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [customForm, setCustomForm] = useState({ name: '', category: 'General', description: '', tools: '', urgency: 'normal', timeline: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiMatches, setAiMatches] = useState<any[]>([]);

    // AI match: find marketplace templates that overlap with the description
    const findAiMatches = (description: string) => {
        if (!description.trim() || templates.length === 0) { setAiMatches([]); return; }
        const words = description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        const scored = templates.map(t => {
            const haystack = `${t.name} ${t.description} ${t.sector}`.toLowerCase();
            const score = words.filter(w => haystack.includes(w)).length;
            return { ...t, score };
        }).filter(t => t.score > 0).sort((a: any, b: any) => b.score - a.score).slice(0, 3);
        setAiMatches(scored);
    };

    const handleCustomRequest = async () => {
        if (!customForm.name.trim() || !customForm.description.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: `Custom Workflow Request: ${customForm.name}`,
                    message: `**Workflow:** ${customForm.name}\n**Category:** ${customForm.category}\n\n**What to automate:**\n${customForm.description}\n\n**Tools / Apps:** ${customForm.tools || 'Not specified'}\n**Urgency:** ${customForm.urgency}\n**Timeline:** ${customForm.timeline || 'Flexible'}`,
                })
            });
            if (res.ok) { setWizardStep(4); }
            else { const err = await res.json(); showToast(err.error || 'Submission failed.', 'error'); }
        } catch { showToast('Network error. Please try again.', 'error'); }
        finally { setIsSubmitting(false); }
    };

    const openCustomModal = () => {
        setCustomForm({ name: '', category: 'General', description: '', tools: '', urgency: 'normal', timeline: '' });
        setWizardStep(1); setAiMatches([]); setShowCustomModal(true);
    };

    const categories = ["All", "Accounting", "Law", "HR", "IT", "General"];

    useEffect(() => {
        fetchMarketplace();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const success = params.get('success');
        const templateId = params.get('templateId');
        if (success === 'true' && templateId) {
            (async () => {
                try {
                    await fetch('/api/marketplace/installed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ templateId }),
                    });
                } catch { /* webhook is source of truth */ }
                router.replace('/dashboard/incidents');
            })();
        } else if (params.get('canceled') === 'true') {
            showToast('Payment canceled.', 'error');
            router.replace('/dashboard/marketplace');
        }
    }, [router]);

    const fetchMarketplace = async () => {
        try {
            const res = await fetch('/api/workflows');
            const data = await res.json();
            if (data.templates) setTemplates(data.templates);
        } catch (error) {
            console.error("Error fetching marketplace:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePurchase = async (template: any) => {
        setIsProcessingPayment(true);
        try {
            const price = getTemplatePrice(template);
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workflowName: template.name, price: price, templateId: template.id }),
            });
            const data = await res.json();
            if (res.ok) {
                router.push(`/dashboard/incidents?highlight=${template.id}`);
            } else {
                showToast(data.error || 'Checkout failed.', 'error');
            }
        } catch {
            showToast('Payment could not be started.', 'error');
        } finally {
            setIsProcessingPayment(false);
            setPaymentTemplate(null);
        }
    };

    const handleAddClick = (template: any) => {
        const finalPrice = getTemplatePrice(template);

        if (finalPrice > 0) {
            setPaymentTemplate(template);
            return;
        }
        
        // Free templates use the old configuration flow
        const reqs = robustParse(template.requirements);
        if (reqs.length > 0) {
            setConfigureTemplate({ ...template, parsedReqs: reqs });
            setTemplateInputs({});
            setStep('configure');
            setDeployResult(null);
        } else {
            deployWorkflow(template, {});
        }
    };

    const deployWorkflow = async (template: any, inputs: Record<string, any>) => {
        setIsDeploying(true);
        try {
            const res = await fetch('/api/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: template.name,
                    sector: template.sector,
                    templateId: template.id,
                    inputs
                })
            });
            const data = await res.json();
            if (res.ok) {
                setDeployResult(data.orchestration || {});
                setStep('result');
                showToast(`Workflow ordered! Track progress in My Workflows.`);
                setConfigureTemplate(null);
                router.push('/dashboard/incidents');
            } else {
                showToast(data.error || "Deployment failed.", 'error');
            }
        } catch (error) {
            showToast("Network disruption detected.", 'error');
        } finally {
            setIsDeploying(false);
        }
    };

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const filteredTemplates = templates.filter(wf => {
        const matchesSearch = wf.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "All" || wf.sector === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className={styles.workflowsContainer}>
            {/* HEADER */}
            <div className={styles.header}>
                <h1 className={styles.title}>Marketplace</h1>
                <p className={styles.subtitle}>
                    Add powerful, pre-built workflows to automate and scale your operations.
                </p>
            </div>

            {/* FILTERS & SEARCH */}
            <div className={styles.filterRow}>
                <div className={styles.filterTabs}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.filterTab} ${selectedCategory === cat ? styles.filterTabActive : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className={styles.searchSort}>
                    <div className={styles.searchBox}>
                        <Search size={18} color="#94A3B8" />
                        <input
                            type="text"
                            placeholder="Search automations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className={styles.sortSelect}>
                        <option>Most Popular</option>
                        <option>Newest</option>
                    </select>
                </div>
            </div>

            {/* TRUST STRIP */}
            <div className={styles.trustStrip}>
                <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><Zap size={24} /></div>
                    <div className={styles.trustContent}>
                        <span className={styles.trustTitle}>98+</span>
                        <span className={styles.trustDesc}>Workflows Available</span>
                    </div>
                </div>
                <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><ShieldCheck size={24} /></div>
                    <div className={styles.trustContent}>
                        <span className={styles.trustTitle}>Trusted</span>
                        <span className={styles.trustDesc}>Built by experts</span>
                    </div>
                </div>
                <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><Activity size={24} /></div>
                    <div className={styles.trustContent}>
                        <span className={styles.trustTitle}>Instant Use</span>
                        <span className={styles.trustDesc}>No coding needed</span>
                    </div>
                </div>
                <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><Plus size={24} /></div>
                    <div className={styles.trustContent}>
                        <span className={styles.trustTitle}>Updated</span>
                        <span className={styles.trustDesc}>New loops weekly</span>
                    </div>
                </div>
            </div>

            {/* FEATURED WORKFLOWS */}
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Featured Workflows</h2>
                <Link href="#" className={styles.viewAllLink}>
                    View all workflows <ArrowUpRight size={16} />
                </Link>
            </div>

            {isLoading ? (
                <div className={styles.workflowGrid}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ height: '360px', background: '#F8FAFC', borderRadius: '24px', animation: 'pulse 2s infinite' }} />
                    ))}
                </div>
            ) : (
                <div className={styles.workflowGrid}>
                    {filteredTemplates.map(wf => {
                        const iconColor = wf.sector === 'Accounting' ? '#10B981' : (wf.sector === 'Law' ? '#8B5CF6' : '#3B82F6');
                        return (
                            <div key={wf.id} className={styles.workflowCard}>
                                <div className={styles.cardIcon} style={{ background: `${iconColor}15`, color: iconColor }}>
                                    <Zap size={24} />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>{wf.name}</h3>
                                    <p className={styles.cardDesc}>{wf.description}</p>
                                    {/* Associated Connections */}
                                    {(() => {
                                        const reqs = robustParse(wf.requirements);
                                        const services = Array.from(
                                            new Set(reqs.map((r: any) => r.service || r.app).filter(Boolean))
                                        );
                                        if (services.length === 0) return null;
                                        return (
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                                                {services.map((svc: any) => (
                                                    <span key={svc} style={{ fontSize: '0.68rem', background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #E2E8F0' }}>
                                                        {getServiceIcon(svc)} {svc}
                                                    </span>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                    <div className={styles.categoryTag} style={{ background: `${iconColor}15`, color: iconColor }}>{wf.sector}</div>
                                </div>
                                <div className={styles.cardStats}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statValue}>1.2K</span>
                                        <span className={styles.statLabel}>Installs</span>
                                    </div>
                                    <div className={styles.statItem} style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                                        {(() => {
                                            const pInfo = typeof wf.productInfo === 'string'
                                                ? JSON.parse(wf.productInfo)
                                                : (wf.productInfo || {});
                                            const setupPrice = parseFloat(pInfo.setupPrice || 0);
                                            const monthlyPrice = parseFloat(pInfo.monthlyPrice || 0);
                                            const discountSetup = parseFloat(pInfo.discountSetupPrice || 0);
                                            const discountMonthly = parseFloat(pInfo.discountMonthlyPrice || 0);

                                            // Fallback for legacy data
                                            let showSetup = setupPrice;
                                            let showMonthly = monthlyPrice;

                                            if (setupPrice === 0 && monthlyPrice === 0) {
                                                const legacyPrice = parseFloat(wf.price || 0);
                                                if (pInfo.monetization === 'Subscription') {
                                                    showMonthly = legacyPrice;
                                                } else {
                                                    showSetup = legacyPrice;
                                                }
                                            }

                                            if (showSetup === 0 && showMonthly === 0) {
                                                return (
                                                    <>
                                                        <span className={styles.statValue} style={{ color: '#0F172A' }}>Free</span>
                                                        <span className={styles.statLabel}>Price</span>
                                                    </>
                                                );
                                            }

                                            return (
                                                <>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
                                                        {showMonthly > 0 && (
                                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                                                {discountMonthly > 0 ? (
                                                                    <>
                                                                        <span style={{ fontSize: '0.7rem', color: '#94A3B8', textDecoration: 'line-through', fontWeight: 600 }}>€{showMonthly.toFixed(0)}</span>
                                                                        <span className={styles.statValue} style={{ color: '#10B981', fontSize: '0.85rem' }}>€{discountMonthly.toFixed(0)}</span>
                                                                    </>
                                                                ) : (
                                                                    <span className={styles.statValue} style={{ color: '#0F172A', fontSize: '0.85rem' }}>€{showMonthly.toFixed(0)}</span>
                                                                )}
                                                                <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>/mo</span>
                                                             </div>
                                                         )}
                                                         {showSetup > 0 && (
                                                             <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                                                 {discountSetup > 0 ? (
                                                                     <>
                                                                         <span style={{ fontSize: '0.7rem', color: '#94A3B8', textDecoration: 'line-through', fontWeight: 600 }}>€{showSetup.toFixed(0)}</span>
                                                                         <span className={styles.statValue} style={{ color: '#10B981', fontSize: '0.85rem' }}>€{discountSetup.toFixed(0)}</span>
                                                                     </>
                                                                 ) : (
                                                                     <span className={styles.statValue} style={{ color: '#64748B', fontSize: '0.85rem' }}>€{showSetup.toFixed(0)}</span>
                                                                 )}
                                                                 <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>setup</span>
                                                             </div>
                                                         )}
                                                     </div>
                                                     <span className={styles.statLabel} style={{ marginTop: '2px' }}>Price</span>
                                                 </>
                                             );
                                         })()}
                                     </div>
                                 </div>
                                <div className={styles.cardActions}>
                                    <button className={styles.btnDetails}>View Details</button>
                                    <button className={styles.btnInstall} onClick={() => handleAddClick(wf)}>
                                        {getTemplatePrice(wf) > 0 ? 'Order' : 'Install'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CUSTOM REQUEST SECTION */}
            <div className={styles.customSection}>
                <div className={styles.customLeft}>
                    <h2>Can't find what you need?</h2>
                    <p>Request a custom workflow tailored to your unique business processes.</p>
                    <button className={styles.btnRequest} onClick={openCustomModal}>
                        Request Custom Workflow <ArrowUpRight size={18} />
                    </button>
                    <div className={styles.responseNote}>
                        <CheckCircle size={16} /> Our team will get back to you within 24 hours.
                    </div>
                </div>
                <div className={styles.howItWorks}>
                    <span className={styles.howHeader}>How it works</span>
                    <div className={styles.stepGrid}>
                        <div className={styles.stepItem}>
                            <div className={styles.stepIcon}><FileText size={20} /></div>
                            <div>
                                <span className={styles.stepNumber}>1. Tell us your needs</span>
                                <p className={styles.stepDesc}>Fill out a short form and explain what you want to automate.</p>
                            </div>
                        </div>
                        <div className={styles.stepItem}>
                            <div className={styles.stepIcon}><MousePointer2 size={20} /></div>
                            <div>
                                <span className={styles.stepNumber}>2. We design it</span>
                                <p className={styles.stepDesc}>Our automation experts create a tailored workflow for you.</p>
                            </div>
                        </div>
                        <div className={styles.stepItem}>
                            <div className={styles.stepIcon}><Settings size={20} /></div>
                            <div>
                                <span className={styles.stepNumber}>3. Review & approve</span>
                                <p className={styles.stepDesc}>Review the workflow and request any adjustments needed.</p>
                            </div>
                        </div>
                        <div className={styles.stepItem}>
                            <div className={styles.stepIcon}><Zap size={20} /></div>
                            <div>
                                <span className={styles.stepNumber}>4. We deliver & set up</span>
                                <p className={styles.stepDesc}>We deliver, install, and help you get it running smoothly.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* INSTALL MODAL */}
            {configureTemplate && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setConfigureTemplate(null)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <button className={styles.closeButton} onClick={() => setConfigureTemplate(null)}>
                                <X size={20} />
                            </button>
                            {step === 'configure' ? (
                                <>
                                    <h2 className={styles.onboardingTitle}>Install {configureTemplate.name}</h2>
                                    <p className={styles.onboardingSubtitle}>Configure your parameters to begin orchestration.</p>
                                    <div className={styles.configFieldset}>
                                        {configureTemplate.parsedReqs.map((req: any, idx: number) => (
                                            <div key={idx} className={styles.formGroup} style={{ marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <label className={styles.fieldLabel} style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800 }}>{req.label || req.name.replace(/_/g, ' ')}</label>
                                                    {(req.service || req.app) && (
                                                        <span style={{ fontSize: '0.65rem', background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, border: '1px solid #BFDBFE' }}>
                                                            Linked to: {req.service || req.app}
                                                        </span>
                                                    )}
                                                </div>
                                                {req.description && (
                                                    <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{req.description}</p>
                                                )}
                                                <input
                                                    className={styles.fieldInput}
                                                    type={req.type === 'password' ? 'password' : 'text'}
                                                    placeholder={req.placeholder || req.example || `Specify ${req.name}...`}
                                                    onChange={e => setTemplateInputs({ ...templateInputs, [req.name]: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button className={styles.btnInstall} style={{ width: '100%', height: '56px', marginTop: '32px' }} disabled={isDeploying} onClick={() => deployWorkflow(configureTemplate, templateInputs)}>
                                        {isDeploying ? 'Deploying...' : 'Install Workflow'}
                                    </button>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <div style={{ width: '64px', height: '64px', background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <CheckCircle size={32} color="white" />
                                    </div>
                                    <h2 className={styles.onboardingTitle}>Workflow Installed</h2>
                                    <p className={styles.onboardingSubtitle}>Orchestration has been initiated successfully.</p>
                                    <button className={styles.btnInstall} style={{ width: '100%' }} onClick={() => setConfigureTemplate(null)}>Return to Marketplace</button>
                                </div>
                            )}
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* CUSTOM WORKFLOW REQUEST WIZARD */}
            {showCustomModal && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setShowCustomModal(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: 560, padding: 0, overflow: 'hidden', borderRadius: 28 }}>

                            {/* Dark header with progress */}
                            <div style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1E293B 100%)', padding: '28px 32px 24px', position: 'relative' }}>
                                <button className={styles.closeButton} onClick={() => setShowCustomModal(false)} style={{ color: 'rgba(255,255,255,0.4)', top: 18, right: 18 }}>
                                    <X size={20} />
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: wizardStep < 4 ? 24 : 0 }}>
                                    <div style={{ width: 44, height: 44, background: 'rgba(16,185,129,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>
                                        <Zap size={20} color="#10B981" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 950, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Custom Build</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 950, color: '#fff', letterSpacing: '-0.02em' }}>Request a Workflow</div>
                                    </div>
                                </div>
                                {wizardStep < 4 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                        {[{ n: 1, l: 'Basics' }, { n: 2, l: 'Describe' }, { n: 3, l: 'Urgency' }].map((s, i) => (
                                            <React.Fragment key={s.n}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                                    <div style={{
                                                        width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: wizardStep > s.n ? '#10B981' : wizardStep === s.n ? '#fff' : 'rgba(255,255,255,0.08)',
                                                        color: wizardStep > s.n ? '#fff' : wizardStep === s.n ? '#0F172A' : 'rgba(255,255,255,0.3)',
                                                        fontWeight: 950, fontSize: '0.8rem', transition: 'all 0.3s',
                                                        border: wizardStep === s.n ? 'none' : '1px solid rgba(255,255,255,0.12)'
                                                    }}>
                                                        {wizardStep > s.n ? '✓' : s.n}
                                                    </div>
                                                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: wizardStep === s.n ? '#fff' : 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{s.l}</span>
                                                </div>
                                                {i < 2 && <div style={{ flex: 1, height: 1, background: wizardStep > s.n ? '#10B981' : 'rgba(255,255,255,0.1)', marginBottom: 18, transition: 'background 0.3s', marginLeft: 6, marginRight: 6 }} />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Step body */}
                            <div style={{ padding: '28px 32px 32px' }}>

                                {/* STEP 1 — Basics */}
                                {wizardStep === 1 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        <div>
                                            <div style={{ fontSize: '1.05rem', fontWeight: 950, color: '#0F172A', marginBottom: 4 }}>What would you like to automate?</div>
                                            <div style={{ fontSize: '0.83rem', color: '#94A3B8', fontWeight: 600 }}>Give your workflow a name and pick a category.</div>
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>Workflow Name *</label>
                                            <input className={styles.fieldInput} type="text" autoFocus
                                                placeholder="e.g. Monthly Invoice Reconciliation"
                                                value={customForm.name}
                                                onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
                                                style={{ width: '100%', boxSizing: 'border-box' }} />
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>Category</label>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                                                {['Accounting', 'Law', 'HR', 'IT', 'Marketing', 'Sales', 'General'].map(cat => (
                                                    <button key={cat} onClick={() => setCustomForm(f => ({ ...f, category: cat }))} style={{
                                                        padding: '7px 16px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s',
                                                        background: customForm.category === cat ? '#0F172A' : '#F8FAFC',
                                                        color: customForm.category === cat ? '#fff' : '#475569',
                                                        border: customForm.category === cat ? 'none' : '1px solid #F1F5F9'
                                                    }}>{cat}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <button className={styles.btnInstall} disabled={!customForm.name.trim()}
                                            style={{ width: '100%', height: 50, marginTop: 4, opacity: !customForm.name.trim() ? 0.5 : 1 }}
                                            onClick={() => { findAiMatches(customForm.name); setWizardStep(2); }}>
                                            Continue →
                                        </button>
                                    </div>
                                )}

                                {/* STEP 2 — Describe + AI Match */}
                                {wizardStep === 2 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                        <div>
                                            <div style={{ fontSize: '1.05rem', fontWeight: 950, color: '#0F172A', marginBottom: 4 }}>Describe the workflow</div>
                                            <div style={{ fontSize: '0.83rem', color: '#94A3B8', fontWeight: 600 }}>The more detail, the faster we can build it.</div>
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>What should it do? *</label>
                                            <textarea rows={4} autoFocus
                                                placeholder="e.g. When a new invoice arrives via email, extract the data, match it to our CRM, and notify the finance team on Slack..."
                                                value={customForm.description}
                                                onChange={e => { setCustomForm(f => ({ ...f, description: e.target.value })); findAiMatches(e.target.value + ' ' + customForm.name); }}
                                                style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 14, padding: '12px 16px', fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.7, resize: 'vertical', outline: 'none', color: '#0F172A', fontFamily: 'inherit' }}
                                            />
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>Apps & tools involved</label>
                                            <input className={styles.fieldInput} type="text"
                                                placeholder="e.g. Gmail, Airtable, Slack, HubSpot..."
                                                value={customForm.tools}
                                                onChange={e => setCustomForm(f => ({ ...f, tools: e.target.value }))}
                                                style={{ width: '100%', boxSizing: 'border-box' }} />
                                        </div>

                                        {/* AI MATCH SUGGESTIONS */}
                                        {aiMatches.length > 0 && (
                                            <div style={{ background: 'linear-gradient(135deg,#F0FDF4,#ECFDF5)', border: '1px solid #A7F3D0', borderRadius: 16, padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                                    <Zap size={13} color="#10B981" />
                                                    <span style={{ fontSize: '0.72rem', fontWeight: 950, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>BLONK found similar workflows already in the marketplace</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {aiMatches.map((m, i) => (
                                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', borderRadius: 12, border: '1px solid #D1FAE5', cursor: 'pointer' }}
                                                            onClick={() => { setShowCustomModal(false); handleAddClick(m); }}>
                                                            <div style={{ width: 34, height: 34, background: '#10B98115', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                 <Zap size={16} color="#10B981" />
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                                                                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>{m.sector} · Click to install</div>
                                                            </div>
                                                            <ArrowUpRight size={14} color="#10B981" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#6EE7B7', fontWeight: 700, marginTop: 10, textAlign: 'center' }}>
                                                    Not quite right? Continue to request a custom build ↓
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <button onClick={() => setWizardStep(1)} style={{ flex: 1, height: 50, background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 14, fontWeight: 950, color: '#64748B', cursor: 'pointer', fontSize: '0.88rem' }}>← Back</button>
                                            <button className={styles.btnInstall} disabled={!customForm.description.trim()}
                                                style={{ flex: 2, height: 50, opacity: !customForm.description.trim() ? 0.5 : 1 }}
                                                onClick={() => setWizardStep(3)}>Continue →</button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3 — Urgency */}
                                {wizardStep === 3 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                        <div>
                                            <div style={{ fontSize: '1.05rem', fontWeight: 950, color: '#0F172A', marginBottom: 4 }}>When do you need it?</div>
                                            <div style={{ fontSize: '0.83rem', color: '#94A3B8', fontWeight: 600 }}>Set urgency so we can prioritise your request correctly.</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {[
                                                { value: 'low', label: 'Low priority', sub: 'Within 2 weeks — no rush', emoji: '🟢' },
                                                { value: 'normal', label: 'Normal', sub: 'Within 1 week — standard', emoji: '🔵' },
                                                { value: 'high', label: 'High priority', sub: 'Within 2 days — important', emoji: '🟡' },
                                                { value: 'urgent', label: 'Urgent', sub: 'ASAP — critical to business', emoji: '🔴' },
                                            ].map(opt => (
                                                <div key={opt.value} onClick={() => setCustomForm(f => ({ ...f, urgency: opt.value }))} style={{
                                                    display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.15s',
                                                    background: customForm.urgency === opt.value ? '#0F172A' : '#F8FAFC',
                                                    border: `1px solid ${customForm.urgency === opt.value ? '#0F172A' : '#F1F5F9'}`,
                                                }}>
                                                    <span style={{ fontSize: '1.1rem' }}>{opt.emoji}</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 950, fontSize: '0.88rem', color: customForm.urgency === opt.value ? '#fff' : '#0F172A' }}>{opt.label}</div>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: customForm.urgency === opt.value ? 'rgba(255,255,255,0.5)' : '#94A3B8' }}>{opt.sub}</div>
                                                    </div>
                                                    {customForm.urgency === opt.value && <CheckCircle size={17} color="#10B981" />}
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>Preferred delivery date (optional)</label>
                                            <input className={styles.fieldInput} type="date"
                                                value={customForm.timeline}
                                                onChange={e => setCustomForm(f => ({ ...f, timeline: e.target.value }))}
                                                style={{ width: '100%', boxSizing: 'border-box' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <button onClick={() => setWizardStep(2)} style={{ flex: 1, height: 50, background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 14, fontWeight: 950, color: '#64748B', cursor: 'pointer', fontSize: '0.88rem' }}>← Back</button>
                                            <button className={styles.btnInstall} disabled={isSubmitting}
                                                style={{ flex: 2, height: 50, opacity: isSubmitting ? 0.6 : 1 }}
                                                onClick={handleCustomRequest}>{isSubmitting ? 'Submitting...' : 'Submit Request ✓'}</button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4 — Success */}
                                {wizardStep === 4 && (
                                    <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                                        <div style={{ width: 76, height: 76, background: 'linear-gradient(135deg,#10B981,#059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(16,185,129,0.28)' }}>
                                            <CheckCircle size={38} color="white" />
                                        </div>
                                        <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: '#0F172A', marginBottom: 8 }}>Request Sent!</h2>
                                        <p style={{ color: '#64748B', fontWeight: 600, lineHeight: 1.6, maxWidth: 340, margin: '0 auto 24px', fontSize: '0.9rem' }}>
                                            Your workflow <strong style={{ color: '#0F172A' }}>"{customForm.name}"</strong> has been submitted. We'll get back to you within 24 hours.
                                        </p>
                                        <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '14px 18px', marginBottom: 24, textAlign: 'left', border: '1px solid #F1F5F9' }}>
                                            {[{ l: 'Workflow', v: customForm.name }, { l: 'Category', v: customForm.category }, { l: 'Urgency', v: customForm.urgency }].map(item => (
                                                <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8' }}>{item.l}</span>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 950, color: '#0F172A', textTransform: 'capitalize' }}>{item.v}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className={styles.btnInstall} style={{ width: '100%', height: 50 }} onClick={() => setShowCustomModal(false)}>Back to Marketplace</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {paymentTemplate && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => !isProcessingPayment && setPaymentTemplate(null)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <button className={styles.closeButton} onClick={() => setPaymentTemplate(null)} disabled={isProcessingPayment}>
                                <X size={20} />
                            </button>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{ width: 40, height: 40, background: '#10B98115', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={20} color="#10B981" />
                                </div>
                                <h2 className={styles.onboardingTitle} style={{ margin: 0 }}>Order Workflow</h2>
                            </div>

                            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9', marginBottom: '20px' }}>
                                <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '1.05rem', marginBottom: '16px' }}>{paymentTemplate.name}</div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                        <CheckCircle size={14} color="#10B981" /> Dedicated Server
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                        <CheckCircle size={14} color="#10B981" /> n8n Setup
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                        <CheckCircle size={14} color="#10B981" /> Full Configuration
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                        <CheckCircle size={14} color="#10B981" /> Testing
                                    </div>
                                </div>

                                {(() => {
                                    const reqs = robustParse(paymentTemplate.requirements);
                                    const services = Array.from(new Set(reqs.map((r: any) => r.service || r.app).filter(Boolean)));
                                    if (services.length === 0) return null;
                                    return (
                                        <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '16px', paddingTop: '12px' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Credentials & Connections Used:</div>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {services.map((svc: any) => (
                                                    <span key={svc} style={{ fontSize: '0.72rem', background: '#FFFFFF', color: '#1E293B', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        {getServiceIcon(svc)} {svc}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                            
                            <div style={{ background: '#F8FAFC', borderRadius: 14, padding: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                                <span>Total</span>
                                <span style={{ color: '#10B981', fontWeight: 950 }}>€{getTemplatePrice(paymentTemplate).toFixed(2)}</span>
                            </div>
                            <button
                                className={styles.btnInstall}
                                style={{ width: '100%', height: 56 }}
                                disabled={isProcessingPayment}
                                onClick={() => handlePurchase(paymentTemplate)}
                            >
                                {isProcessingPayment ? 'Processing...' : 'Continue to Payment'}
                            </button>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {toast && <div className={styles.toast}><CheckCircle size={20} /> {toast}</div>}
        </div>
    );
}
