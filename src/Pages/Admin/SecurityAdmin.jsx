import React, { useState, useEffect } from 'react';
import { API, authFetch, getUser } from '../../config/api';

const SecurityAdmin = () => {
    const [user, setUser] = useState(getUser());
    const [formData, setFormData] = useState({ username: user?.username || '', email: user?.email || '', password: '', confirmPassword: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await authFetch(`${API}/auth/me`);
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setFormData(prev => ({ ...prev, username: data.username, email: data.email || '' }));
                }
            } catch (err) {
                console.error("Xavfsizlik sahifasida profilni yuklashda xatolik:", err);
            }
        };
        fetchUserProfile();
    }, []);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            return showMsg('Parollar mos kelmadi', 'error');
        }

        try {
            setLoading(true);
            const res = await authFetch(`${API}/auth/update-profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email || undefined,
                    password: formData.password || undefined
                })
            });

            if (res.ok) {
                showMsg('✅ Ma\'lumotlar yangilandi. Xavfsizlik yuzasidan qayta kiring...', 'success');
                setFormData({ ...formData, password: '', confirmPassword: '' });
                
                // 🔒 FORCE LOGOUT FOR SECURITY
                setTimeout(() => {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('user');
                    window.location.href = '/admin/login';
                }, 2000);
            } else {
                const data = await res.json();
                showMsg(data.message || 'Xatolik yuz berdi', 'error');
            }
        } catch (err) {
            showMsg('Server bilan aloqa yo\'q', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Xavfsizlik sozlamalari</h2>
                <p className="text-gray-500 text-sm mt-1">Admin login va parolini shu yerdan o'zgartirishingiz mumkin</p>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm border flex items-center gap-2 ${message.type === 'error' ? 'bg-red-900/30 border-red-700 text-red-400' : 'bg-green-900/30 border-green-700 text-green-400'}`}>
                    <i className={`fas ${message.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleUpdate} className="bg-gray-800 rounded-2xl border border-gray-700 p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Joriy Login (Username)</label>
                    <div className="relative">
                        <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                        <input 
                            type="text" 
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-all"
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email (Parolni tiklash uchun)</label>
                    <div className="relative">
                        <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                        <input 
                            type="email" 
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-all"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="example@gmail.com"
                            required
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                    <p className="text-xs font-bold text-blue-500 uppercase mb-4">Parolni yangilash (Ixtiyoriy)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Yangi Parol</label>
                            <div className="relative">
                                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                                <input 
                                    type="password" 
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tasdiqlash</label>
                            <div className="relative">
                                <i className="fas fa-shield-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                                <input 
                                    type="password" 
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 italic">Parolni o'zgartirmoqchi bo'lsangizgina to'ldiring. Bo'sh qoldirilsa, eski parol qoladi.</p>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                >
                    {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                    Saqlash
                </button>
            </form>
        </div>
    );
};

export default SecurityAdmin;
