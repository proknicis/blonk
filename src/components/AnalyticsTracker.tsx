"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Only run tracking on the client
        if (typeof window === "undefined") return;

        // Ensure we only track on route changes, not multiple times on first render
        if (isFirstRender.current) {
            isFirstRender.current = false;
        }

        const trackVisit = async () => {
            // Get or create visitor ID from localStorage
            let visitorId = localStorage.getItem("blonk_visitor_id");
            if (!visitorId) {
                visitorId = uuidv4();
                localStorage.setItem("blonk_visitor_id", visitorId);
            }

            // Get session ID from sessionStorage
            let sessionId = sessionStorage.getItem("blonk_session_id");
            if (!sessionId) {
                sessionId = uuidv4();
                sessionStorage.setItem("blonk_session_id", sessionId);
            }

            // Extract UTM parameters
            const utmSource = searchParams.get("utm_source");
            const utmMedium = searchParams.get("utm_medium");
            const utmCampaign = searchParams.get("utm_campaign");

            try {
                await fetch("/api/analytics/track", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        path: pathname,
                        referrer: document.referrer,
                        utmSource,
                        utmMedium,
                        utmCampaign,
                        visitorId,
                        sessionId,
                    }),
                });
            } catch (err) {
                console.warn("[Analytics] Tracking failed:", err);
            }
        };

        trackVisit();
    }, [pathname, searchParams]);

    return null;
}
