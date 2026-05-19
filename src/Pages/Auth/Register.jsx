import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CrescentLogo from '../../components/CrescentLogo';
import { API, setAuth } from '../../config/api';

const UserRegister = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 9);
        setFormData({ ...formData, phone: value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.phone.length < 9) {
            setError('Telefon raqami noto\'g\'ri');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Parollar mos kelmadi');
            return;
        }
        setError('');
        try {
            const res = await fetch(`${API}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    phone: `+998${formData.phone}`,
                    password: formData.password
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setAuth(data.token, data.user);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Xatolik yuz berdi');
            }
        } catch (err) {
            setError('Server bilan bog\'lanishda xatolik');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-gray-950 p-4 transition-colors duration-300">
            <div className="w-full max-w-[480px] bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl p-8 md:p-10 border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4 transform hover:scale-110 transition-transform duration-300">
                        <CrescentLogo size={54} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ro'yxatdan o'tish</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                        Bizga qo'shiling va kelajakni biz bilan quring
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">F.I.SH</label>
                        <input
                            type="text"
                            placeholder="Ism va familiyangizni kiriting"
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Telefon raqamingiz</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold border-r border-gray-200 dark:border-gray-700 pr-3">+998</span>
                            <input
                                type="tel"
                                placeholder="90 123 45 67"
                                className="w-full pl-18 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all font-mono"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Parol</label>
                            <input
                                type="password"
                                placeholder="••••••"
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Takrorlang</label>
                            <input
                                type="password"
                                placeholder="••••••"
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all mt-4">
                        Ro'yxatdan o'tish
                    </button>

                    <div className="pt-4 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Profilingiz bormi?{' '}
                            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                Kirish
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.pl-18 { padding-left: 4.8rem; }` }} />
        </div>
    );
};

export default UserRegister;
