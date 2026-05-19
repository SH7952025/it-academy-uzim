import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CrescentLogo from '../../components/CrescentLogo';
import { API } from '../../config/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ text: 'Parollar mos kelmadi', type: 'error' });
            return;
        }
        if (password.length < 6) {
            setMessage({ text: 'Parol kamida 6 belgidan iborat bo\'lishi kerak', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const res = await fetch(`${API}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: 'Parolingiz muvaffaqiyatli yangilandi! 3 soniyadan so\'ng kirish sahifasiga yo\'naltirilasiz...', type: 'success' });
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setMessage({ text: data.message || 'Havola yaroqsiz yoki muddati tugagan', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Server bilan bog\'lanishda xatolik', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-gray-950 p-4 transition-colors duration-300">
            <div className="w-full max-w-[460px] bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl p-8 md:p-10 border border-gray-100 dark:border-gray-800 transition-all duration-300">
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4 transform hover:scale-110 transition-transform duration-300">
                        <CrescentLogo size={54} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Yangi parol o'rnatish</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                        Profilingiz uchun yangi kuchli parol o'rnating.
                    </p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-2xl border text-sm text-center font-medium transition-all ${
                        message.type === 'success' 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-600 dark:text-red-400'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Yangi parol</label>
                        <input
                            type="password"
                            placeholder="••••••"
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Parolni takrorlang</label>
                        <input
                            type="password"
                            placeholder="••••••"
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <span>Yangilanmoqda...</span>
                        ) : (
                            <>
                                <i className="fas fa-key"></i>
                                <span>Parolni yangilash</span>
                            </>
                        )}
                    </button>

                    <div className="pt-2 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                Kirish sahifasiga qaytish
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
