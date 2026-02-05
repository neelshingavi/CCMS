import { useState, createContext, useContext } from 'react';
import './AppShell.css';

const AppShellContext = createContext({
    sidebarOpen: true,
    setSidebarOpen: () => { },
});

export const useAppShell = () => useContext(AppShellContext);

/**
 * AppShell Layout
 * Main application container with header, sidebar, and content area
 * 
 * @param {ReactNode} header - Header component
 * @param {ReactNode} sidebar - Sidebar component
 * @param {boolean} hasSidebar - Enable sidebar
 */
export function AppShell({
    header,
    sidebar,
    hasSidebar = true,
    className = '',
    children,
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const classes = [
        'app-shell',
        hasSidebar && 'app-shell--with-sidebar',
        sidebarOpen && hasSidebar && 'app-shell--sidebar-open',
        className
    ].filter(Boolean).join(' ');

    return (
        <AppShellContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
            <div className={classes}>
                {header && (
                    <header className="app-shell__header">
                        {header}
                    </header>
                )}

                <div className="app-shell__body">
                    {hasSidebar && sidebar && (
                        <aside className="app-shell__sidebar">
                            {sidebar}
                        </aside>
                    )}

                    <main className="app-shell__main">
                        {children}
                    </main>
                </div>
            </div>
        </AppShellContext.Provider>
    );
}

export default AppShell;
