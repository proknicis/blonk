"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

/**
 * Institutional Analytics Tracking System
 * Captures critical business events and session data for real-time intelligence.
 */
export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isFirstRender = useRef(true);

    // 1. Core Event Dispatcher
    const trackEvent = async (eventType: string, metadata: any = {}) => {
        if (typeof window === "undefined") return;

        let visitorId = localStorage.getItem("blonk_visitor_id");
        if (!visitorId) {
            visitorId = uuidv4();
            localStorage.setItem("blonk_visitor_id", visitorId);
        }

        let sessionId = sessionStorage.getItem("blonk_session_id");
        if (!sessionId) {
            sessionId = uuidv4();
            sessionStorage.setItem("blonk_session_id", sessionId);
        }

        const source = searchParams.get("utm_source") || document.referrer || "direct";

        try {
            await fetch("/api/analytics/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventType,
                    visitorId,
                    sessionId,
                    source,
                    metadata: {
                        path: window.location.pathname,
                        ...metadata
                    }
                }),
            });
        } catch (err) {
            console.warn("[Analytics] Tracking failure:", err);
        }
    };

    // 2. Lifecycle Tracking
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            // Detect if this is a login or signup success by checking URL or storage flags
            // This is a simplified detection; real apps might use redirect params
            if (pathname === "/dashboard" && document.referrer.includes("/login")) {
                trackEvent("login");
            } else if (pathname === "/dashboard" && document.referrer.includes("/setup")) {
                trackEvent("signup");
            }
        }

        trackEvent("page_visit", { referrer: document.referrer });
    }, [pathname, searchParams]);

    return null;
}
