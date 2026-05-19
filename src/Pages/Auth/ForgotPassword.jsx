import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CrescentLogo from '../../components/CrescentLogo';
import { API } from '../../config/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleForgot = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const res = await fetch(`${API}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: data.message || 'Tiklash havolasi emailingizga yuborildi!', type: 'success' });
            } else {
                setMessage({ text: data.message || 'Xatolik yuz berdi', type: 'error' });
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Parolni tiklash</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                        Profilingizga biriktirilgan email manzilingizni kiriting va biz sizga tiklash havolasini yuboramiz.
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

                <form onSubmit={handleForgot} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Email manzilingiz</label>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="example@domain.com"
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span>Yuborilmoqda...</span>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane"></i>
                                <span>Tiklash havolasini yuborish</span>
                            </>
                        )}
                    </button>

                    <div className="pt-2 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                <i className="fas fa-arrow-left mr-2"></i> Kirish sahifasiga qaytish
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
