"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./layout.module.css";

// Pages that render their own full-page shell (same as /setup)
// and must NOT be wrapped by the ActivationLayoutClient topbar.
const SELF_CONTAINED_ROUTES = [
    "/activation/deploy",
    "/activation/success",
    "/activation",   // root activation page (ActivationStartClient)
];

export default function ActivationLayoutClient({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const pathname = usePathname();

    // If the current route renders its own wrapper, pass children straight through
    if (SELF_CONTAINED_ROUTES.some(r => pathname?.startsWith(r))) {
        return <>{children}</>;
    }

    return (
        <div className={styles.activationShell}>
            <div className={styles.topbar}>
                <div className={styles.brand}>
                    <div className={styles.logoDot} />
                    <span>BLONK</span>
                </div>
                {session?.user && (
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>{session.user.name?.charAt(0) || "U"}</div>
                        <span>{session.user.name}</span>
                    </div>
                )}
            </div>
            <div className={styles.pageContainer}>
                {children}
            </div>
        </div>
    );
}
