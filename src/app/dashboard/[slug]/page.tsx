import { notFound } from "next/navigation";

/**
 * Legacy catch-all route — all subpages now have dedicated routes.
 * Any unmatched slug returns a proper 404.
 */
export default function LegacyCatchAllPage() {
    notFound();
}
