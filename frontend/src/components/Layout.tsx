import { Outlet, Link, useLocation } from 'react-router-dom';
import { Mail, LayoutDashboard } from 'lucide-react';

export default function Layout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-surface-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 group-hover:shadow-glow transition-shadow">
                                <Mail className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-surface-100 group-hover:text-gradient transition-colors">
                                    Email Incident Tool
                                </h1>
                                <p className="text-xs text-surface-500 hidden sm:block">
                                    Logging & Summarization
                                </p>
                            </div>
                        </Link>

                        {/* Navigation */}
                        <nav className="flex items-center gap-2">
                            <Link
                                to="/"
                                className={`btn btn-ghost text-sm ${location.pathname === '/' ? 'bg-surface-800 text-primary-400' : ''
                                    }`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-surface-800 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />
            </footer>
        </div>
    );
}
