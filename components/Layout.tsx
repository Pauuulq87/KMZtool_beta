import React, { ReactNode } from 'react';

interface LayoutProps {
    sidebar: ReactNode;
    propertiesPanel: ReactNode;
    children: ReactNode; // Map Canvas
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, propertiesPanel, children }) => {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            {/* Left Sidebar */}
            <aside className="flex-none z-20 shadow-xl">
                {sidebar}
            </aside>

            {/* Center Map Area */}
            <main className="flex-1 relative z-0">
                {children}
            </main>

            {/* Right Properties Panel */}
            <aside className="flex-none z-10 shadow-xl">
                {propertiesPanel}
            </aside>
        </div>
    );
};
