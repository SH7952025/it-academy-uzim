import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DynamicLogo from '../../components/DynamicLogo';
import { API, setAuth } from '../../config/api';

const UserLogin = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Device limit management states
    const [showDeviceLimitModal, setShowDeviceLimitModal] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [modalError, setModalError] = useState('');

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 9);
        setPhone(value);
    };

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        if (phone.length < 9) {
            setError('Telefon raqami noto\'g\'ri');
            return;
        }
        setError('');
        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    phone: `+998${phone}`, // To'liq formatda yuborish
                    password 
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setAuth(data.token, data.user);
                // Yangi token haqida barcha komponentlarni ogohlantirish
                window.dispatchEvent(new Event('storage'));
                if (data.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else if (res.status === 403 && data.code === 'DEVICE_LIMIT_REACHED') {
                setSessions(data.sessions || []);
                setShowDeviceLimitModal(true);
                setModalError('');
            } else {
                setError(data.message || 'Kirishda xatolik');
            }
        } catch (err) {
            setError('Server bilan bog\'lanishda xatolik');
        }
    };

    const handleDeleteSession = async (sessionId) => {
        setDeletingId(sessionId);
        setModalError('');
        try {
            const res = await fetch(`${API}/auth/sessions/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: `+998${phone}`,
                    password,
                    sessionId
                })
            });
            const data = await res.json();
            if (res.ok) {
                setShowDeviceLimitModal(false);
                // Sessiya muvaffaqiyatli o'chirilgach, avtomatik kirish
                await handleLogin();
            } else {
                setModalError(data.message || 'Qurilmani tizimdan chiqarishda xatolik yuz berdi');
            }
        } catch (err) {
            setModalError('Server bilan bog\'lanishda xatolik');
        } finally {
            setDeletingId(null);
        }
    };

    const getDeviceIcon = (deviceInfo = '') => {
        const info = deviceInfo.toLowerCase();
        if (info.includes('iphone') || info.includes('android') || info.includes('mobile')) {
            return 'fa-mobile-alt text-emerald-500';
        }
        if (info.includes('ipad') || info.includes('tablet')) {
            return 'fa-tablet-alt text-indigo-500';
        }
        return 'fa-laptop text-blue-500';
    };

    const formatLastActive = (dateStr) => {
        try {
            const diffMs = new Date() - new Date(dateStr);
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) return 'Hozirgina faol';
            if (diffMins < 60) return `${diffMins} daqiqa oldin faol`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} soat oldin faol`;
            return new Date(dateStr).toLocaleDateString('uz-UZ', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Yaqinda faol';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-gray-950 p-4 transition-colors duration-300 relative">
            <div className="w-full max-w-[440px] bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center mb-10">
                    <div className="mb-6 transform hover:scale-110 transition-transform duration-300">
                        <DynamicLogo size={64} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Kirish</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                        Akademiyamizga xush kelibsiz! <br /> O'qishni davom ettirish uchun kiring.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Telefon raqamingiz</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold border-r border-gray-200 dark:border-gray-700 pr-3">+998</span>
                            <input
                                type="tel"
                                placeholder="90 123 45 67"
                                className="w-full pl-18 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all font-mono"
                                value={phone}
                                onChange={handlePhoneChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Parol</label>
                            <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                Parolni unutdingizmi?
                            </Link>
                        </div>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Parolingizni kiriting"
                                className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors">
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all">
                        Kirish
                    </button>

                    <div className="pt-4 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            Hisobingiz yo'qmi?{' '}
                            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                Ro'yxatdan o'tish
                            </Link>
                        </p>
                    </div>
                </form>
            </div>

            {/* Premium, Interactive Device Limit Modal */}
            {showDeviceLimitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm transition-all duration-300">
                    <div className="w-full max-w-[480px] bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 transform scale-100 transition-transform duration-300">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 rounded-2xl flex items-center justify-center mb-4 text-amber-500">
                                <i className="fas fa-exclamation-triangle text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Qurilmalar soni cheklangan</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                                Siz allaqachon 2 ta qurilmadan tizimga kirgansiz. Kirish uchun quyidagi faol qurilmalardan birortasini o'chiring:
                            </p>
                        </div>

                        {modalError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs text-center">
                                {modalError}
                            </div>
                        )}

                        <div className="space-y-3 mb-6">
                            {sessions.map((s) => (
                                <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm shrink-0">
                                            <i className={`fas ${getDeviceIcon(s.deviceInfo)} text-lg`}></i>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate pr-2" title={s.deviceInfo}>
                                                {s.deviceInfo || 'Noma\'lum qurilma'}
                                            </p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                                {formatLastActive(s.lastActive)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSession(s.id)}
                                        disabled={deletingId === s.id}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all disabled:opacity-50 shrink-0"
                                        title="Qurilmani tizimdan chiqarish"
                                    >
                                        {deletingId === s.id ? (
                                            <i className="fas fa-spinner fa-spin text-xs"></i>
                                        ) : (
                                            <i className="far fa-trash-alt text-sm"></i>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeviceLimitModal(false)}
                                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                            >
                                Bekor qilish
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `.pl-18 { padding-left: 4.8rem; }` }} />
        </div>
    );
};

export default UserLogin;
