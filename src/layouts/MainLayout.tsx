import { ReactNode } from 'react';

interface MainLayoutProps {
    sidebar: ReactNode;
    children: ReactNode;
}

export function MainLayout({ sidebar, children }: MainLayoutProps) {
    return (
        <div className="h-screen flex overflow-hidden">
            {sidebar}
            {children}
        </div>
    );
}
