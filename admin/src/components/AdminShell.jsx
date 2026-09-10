import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  List,
  Map,
  Car,
  Briefcase,
  FileText,
  Users,
  MessageSquare,
  User,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Listings',
    items: [
      { path: '/list', label: 'Properties', icon: List },
      { path: '/list-plots', label: 'Plots', icon: Map },
      { path: '/list-cars', label: 'Cars', icon: Car },
      { path: '/appointments', label: 'Appointments', icon: Calendar },
    ],
  },
  {
    label: 'Content',
    items: [
      { path: '/services', label: 'Services', icon: Briefcase },
      { path: '/blogs', label: 'Blogs', icon: FileText },
      { path: '/team', label: 'Team', icon: Users },
      { path: '/testimonials', label: 'Testimonials', icon: MessageSquare },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/users', label: 'Users', icon: User },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const QUICK_ADD = [
  { path: '/add', label: 'Property' },
  { path: '/add-plots', label: 'Plot' },
  { path: '/add-cars', label: 'Car' },
];

const pageTitleFromPath = (pathname) => {
  const flat = NAV_GROUPS.flatMap((g) => g.items);
  const match = flat.find((i) => pathname === i.path || pathname.startsWith(`${i.path}/`));
  if (match) return match.label;
  if (pathname.startsWith('/add')) return 'Add listing';
  if (pathname.startsWith('/update')) return 'Edit listing';
  if (pathname.startsWith('/view')) return 'View listing';
  return 'Admin';
};

/**
 * Fixed sidebar + sticky top bar shell for the admin panel.
 */
const AdminShell = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setQuickOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 'lg:w-[4.5rem]' : 'lg:w-64';
  const contentPad = collapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64';

  const SidebarInner = ({ mobile = false }) => (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-3 border-b border-white/10 px-4 ${mobile ? 'h-16' : 'h-16'}`}>
        <Link to="/dashboard" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-400 text-haven-950 shadow-md">
            <span className="font-display text-lg font-bold leading-none">N</span>
          </div>
          {(mobile || !collapsed) && (
            <div className="min-w-0">
              <div className="truncate font-display text-base font-semibold text-white tracking-wide">
                NGENZI
              </div>
              <div className="truncate text-[11px] uppercase tracking-[0.16em] text-cream-300/70">
                Admin
              </div>
            </div>
          )}
        </Link>
        {mobile && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-2 text-cream-200 hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {(mobile || !collapsed) && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-300/45">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    title={collapsed && !mobile ? item.label : undefined}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link-active' : ''} ${
                        collapsed && !mobile ? 'justify-center px-2' : ''
                      }`
                    }
                  >
                    <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px] shrink-0" />
                    {(mobile || !collapsed) && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-2">
        {(mobile || !collapsed) && (
          <div className="rounded-xl bg-white/5 px-3 py-2.5">
            <p className="text-xs font-medium text-white">Administrator</p>
            <p className="text-[11px] text-cream-300/60 truncate">NGENZI REALESTATE</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className={`nav-link w-full text-red-200 hover:bg-red-500/15 hover:text-red-100 ${
            collapsed && !mobile ? 'justify-center px-2' : ''
          }`}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {(mobile || !collapsed) && <span>Logout</span>}
        </button>
        {!mobile && (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="nav-link w-full justify-center text-cream-300/70"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-200">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden ${sidebarWidth} bg-haven-950 text-white transition-all duration-300 lg:block`}
      >
        <SidebarInner />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-haven-950/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-haven-950 text-white shadow-2xl lg:hidden"
            >
              <SidebarInner mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className={`${contentPad} transition-all duration-300`}>
        <header className="sticky top-0 z-30 border-b border-cream-400/80 bg-cream-50/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl p-2 text-haven-800 hover:bg-cream-300 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-[11px] uppercase tracking-[0.16em] text-haven-700/50">
                  NGENZI Admin
                </p>
                <h1 className="truncate font-display text-lg font-semibold text-haven-900 sm:text-xl">
                  {pageTitleFromPath(location.pathname)}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setQuickOpen((v) => !v)}
                  className="admin-btn !py-2 !px-3 text-xs sm:text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Quick add</span>
                </button>
                <AnimatePresence>
                  {quickOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-cream-400 bg-white shadow-panel"
                    >
                      {QUICK_ADD.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="block px-4 py-2.5 text-sm text-haven-800 hover:bg-cream-100"
                        >
                          Add {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/settings"
                className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cream-400 bg-white text-haven-800 hover:bg-cream-100"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-haven-800 text-sm font-semibold text-white">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default AdminShell;
