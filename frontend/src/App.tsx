
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Branches from './pages/Branches';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Setup from './pages/Setup';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import MacroViewPage from './pages/dashboard/MacroViewPage';
import BrandingSettings from './pages/BrandingSettings';
import { AuthProvider, useAuth } from './AuthContext';
import { BrandingProvider, useBranding } from './BrandingContext';
import Notifications from './components/Notifications';
import {
    LayoutDashboard,
    Package,
    Building2,
    Truck,
    FileText,
    Tags,
    Users as UsersIcon,
    LogOut,
    Menu as MenuIcon,
    Palette,
} from 'lucide-react';
import { useState } from 'react';

const PrivateRoute = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => {
    const { branding } = useBranding();
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${active
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
            style={active ? { backgroundColor: 'rgba(255,255,255,0.2)' } : {}}
        >
            <Icon size={20} className={active ? 'text-white' : 'text-white/60 group-hover:text-white'} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

const Layout = () => {
    const { logout, user } = useAuth();
    const { branding } = useBranding();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            <Notifications />

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ backgroundColor: branding.primaryColor }}
            >
                {/* Logo area */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                        {branding.logoUrl ? (
                            /* Custom logo — no box, no fixed size, natural proportions */
                            <img
                                src={branding.logoUrl}
                                alt="Logo"
                                className="max-h-12 max-w-[120px] object-contain shrink-0 drop-shadow-sm"
                                style={{ width: 'auto', height: 'auto', maxHeight: '48px', maxWidth: '120px' }}
                            />
                        ) : (
                            /* Default: icon only, no container */
                            <Package className="text-white shrink-0" size={28} />
                        )}
                        <span className="text-lg font-bold text-white tracking-tight truncate">
                            {branding.appName}
                        </span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white text-2xl leading-none ml-2 shrink-0">
                        ×
                    </button>
                </div>

                <div className="p-4 space-y-1 overflow-y-auto flex-1">
                    <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3 mt-2">Menu</div>
                    <NavItem to="/" icon={LayoutDashboard} label="Painel" active={isActive('/')} />
                    <NavItem to="/inventory" icon={Package} label="Inventário" active={isActive('/inventory')} />
                    <NavItem to="/branches" icon={Building2} label="Filiais" active={isActive('/branches')} />
                    <NavItem to="/suppliers" icon={Truck} label="Fornecedores" active={isActive('/suppliers')} />

                    <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3 mt-6">Gestão</div>
                    <NavItem to="/reports" icon={FileText} label="Relatórios" active={isActive('/reports')} />

                    {user?.role !== 'OPERATOR' && (
                        <NavItem to="/categories" icon={Tags} label="Categorias" active={isActive('/categories')} />
                    )}
                    {(user?.role === 'ADMIN' || user?.role === 'APPROVER') && (
                        <NavItem to="/users" icon={UsersIcon} label="Usuários" active={isActive('/users')} />
                    )}

                    {(user?.role === 'ADMIN' || user?.role === 'APPROVER') && (
                        <>
                            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3 mt-6">Sistema</div>
                            <NavItem to="/branding" icon={Palette} label="Personalização" active={isActive('/branding')} />
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                 {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
                    >
                        <MenuIcon size={24} />
                    </button>

                    <div className="flex items-center ml-auto gap-3">
                        {/* Branding button - only for ADMIN/APPROVER */}
                        {(user?.role === 'ADMIN' || user?.role === 'APPROVER') && (
                            <Link
                                to="/branding"
                                title="Personalizar aplicação"
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <Palette size={20} />
                            </Link>
                        )}

                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-slate-700">{user?.email || 'Usuário'}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                                {user?.role}
                            </span>
                        </div>
                        <div
                            className="h-9 w-9 rounded-full flex items-center justify-center font-bold border-2 text-white"
                            style={{ backgroundColor: branding.primaryColor, borderColor: `${branding.primaryColor}44` }}
                        >
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-2 lg:p-4">
                    <div className="mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

const AppRoutes = () => {
     return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
            <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard/:type/:id" element={<MacroViewPage />} />
                    <Route path="/dashboard/detalhes/:type" element={<MacroViewPage />} />
                    <Route path="/dashboard/depreciacao" element={<MacroViewPage />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/branches" element={<Branches />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/branding" element={<BrandingSettings />} />
                </Route>
            </Route>
        </Routes>
     );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <BrandingProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrandingProvider>
    </Router>
  )
}

export default App
