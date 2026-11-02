// Override the parent activation layout for the deploy page.
// DeployClient renders its own full-page wrapper (identical to /setup),
// so we must NOT wrap it in the ActivationLayoutClient topbar shell.
export default function DeployLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
