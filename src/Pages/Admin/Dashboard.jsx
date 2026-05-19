import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import DynamicLogo from '../../components/DynamicLogo';
import { API, getAdminToken } from '../../config/api';

const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', end: true },
    { path: '/admin/dashboard/courses', label: 'Kurslar', icon: 'fas fa-graduation-cap' },
    { path: '/admin/dashboard/news', label: 'Yangiliklar', icon: 'fas fa-newspaper' },
    { path: '/admin/dashboard/gallery', label: 'Galereya', icon: 'fas fa-images' },
    { path: '/admin/dashboard/students', label: 'Talabalar', icon: 'fas fa-user-graduate' },
    { path: '/admin/dashboard/mentors', label: 'Mentorlar', icon: 'fas fa-users' },
    { path: '/admin/dashboard/reviews', label: 'Izohlar', icon: 'fas fa-comments' },
    { path: '/admin/dashboard/contacts', label: 'Lidlar', icon: 'fas fa-envelope' },
    { path: '/admin/dashboard/socials', label: 'Tarmoqlar', icon: 'fas fa-share-nodes' },
    { path: '/admin/dashboard/security', label: 'Xavfsizlik', icon: 'fas fa-shield-halved' },
    { path: '/admin/dashboard/logo', label: 'Logo', icon: 'fas fa-icons' },
    { path: '/admin/dashboard/settings', label: 'Platforma', icon: 'fas fa-cog' },
    { path: '/admin/dashboard/hero', label: 'Asosiy sahifa', icon: 'fas fa-home' },
];

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({ courses: 0, mentors: 0, contacts: 0, students: 0 });
    const token = getAdminToken();

    useEffect(() => {
        if (!token) { navigate('/admin'); return; }
        // Fetch stats
        Promise.all([
            fetch(`${API}/courses`).then(r => r.json()).catch(() => []),
            fetch(`${API}/mentors`).then(r => r.json()).catch(() => []),
            fetch(`${API}/contacts`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
            fetch(`${API}/users?role=student`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
        ]).then(([courses, mentors, contacts, students]) => {
            setStats({
                courses: Array.isArray(courses) ? courses.length : 0,
                mentors: Array.isArray(mentors) ? mentors.length : 0,
                contacts: Array.isArray(contacts) ? contacts.length : 0,
                students: Array.isArray(students) ? students.length : 0,
            });
        });
    }, [location.pathname]);

    // Mobildan sidebar yopish
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
    };

    return (
        <div className="flex h-screen bg-gray-950 font-sans overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-[260px] lg:w-64
                transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
                transition-transform duration-300 ease-in-out
                flex flex-col bg-gray-900 border-r border-gray-800
            `}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
                    <div className="flex flex-col">
                        <DynamicLogo size={36} />
                        <span className="text-[10px] text-gray-500 mt-1 font-medium tracking-widest uppercase ml-0.5">Admin Panel</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="ml-auto text-gray-500 hover:text-gray-300 transition-colors lg:hidden"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`
                            }
                        >
                            <i className={`${item.icon} text-sm w-5 text-center flex-shrink-0`}></i>
                            <span className="text-sm font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom - Admin info & Logout */}
                <div className="px-3 py-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
                        <div>
                            <p className="text-white text-xs font-semibold">Admin</p>
                            <p className="text-gray-500 text-[10px]">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200"
                    >
                        <i className="fas fa-sign-out-alt text-sm w-5 text-center flex-shrink-0"></i>
                        <span className="text-sm font-medium">Chiqish</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                {/* Topbar */}
                <header className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-xl transition-colors"
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                        <div>
                            <h1 className="text-white font-bold text-base sm:text-lg">
                                {navItems.find(n => location.pathname === n.path || location.pathname.startsWith(n.path + '/') )?.label || 'Dashboard'}
                            </h1>
                            <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5 hidden sm:block">{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-green-900/30 border border-green-800 text-green-400 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            Faol
                        </div>
                    </div>
                </header>

                {/* Scrollable content */}
                <main className="flex-1 overflow-y-auto bg-gray-950 p-3 sm:p-4 lg:p-6">
                    {/* Stats - only on dashboard index */}
                    {location.pathname === '/admin/dashboard' && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
                            {[
                                { label: 'Kurslar', value: stats.courses, icon: 'fas fa-graduation-cap', gradient: 'from-blue-600 to-blue-500', link: '/admin/dashboard/courses' },
                                { label: 'Talabalar', value: stats.students, icon: 'fas fa-user-graduate', gradient: 'from-green-600 to-green-500', link: '/admin/dashboard/students' },
                                { label: 'Mentorlar', value: stats.mentors, icon: 'fas fa-users', gradient: 'from-purple-600 to-purple-500', link: '/admin/dashboard/mentors' },
                                { label: "Lidlar", value: stats.contacts, icon: 'fas fa-envelope', gradient: 'from-amber-600 to-amber-500', link: '/admin/dashboard/contacts' },
                            ].map((stat) => (
                                <NavLink key={stat.label} to={stat.link}
                                    className="block bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 hover:border-blue-700/50 transition-all duration-200 hover:-translate-y-0.5 group"
                                >
                                    <div className={`w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
                                        <i className={`${stat.icon} text-white text-sm sm:text-lg`}></i>
                                    </div>
                                    <p className="text-2xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">{stat.value}</p>
                                    <p className="text-gray-500 text-xs sm:text-sm">{stat.label}</p>
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* Page Content */}
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                        {location.pathname === '/admin/dashboard' ? (
                            <div className="p-6 sm:p-10 text-center">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <i className="fas fa-moon text-blue-400 text-xl sm:text-2xl"></i>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">IT Admin Panelga Xush Kelibsiz!</h2>
                                <p className="text-gray-500 text-xs sm:text-sm">Chap panel orqali kurslar, mentorlar va lidlarni boshqaring.</p>
                            </div>
                        ) : (
                            <div className="p-3 sm:p-4 lg:p-6">
                                <Outlet />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
