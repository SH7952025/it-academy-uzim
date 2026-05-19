import React, { useState, useEffect } from 'react';
import { API, getAdminToken } from '../../config/api';

const SocialsAdmin = () => {
    const [settings, setSettings] = useState({
        telegram: '',
        instagram: '',
        facebook: '',
        youtube: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const token = getAdminToken();

    useEffect(() => {
        fetch(`${API}/settings`)
            .then(res => res.json())
            .then(data => {
                setSettings(prev => ({ ...prev, ...data }));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Auto-remove standard prefixes if admin pastes the full link by mistake
        if (name === 'telegram') value = value.replace(/^(https?:\/\/)?(t\.me\/|telegram\.me\/)/i, '');
        if (name === 'instagram') value = value.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '');
        if (name === 'facebook') value = value.replace(/^(https?:\/\/)?(www\.)?facebook\.com\//i, '');
        if (name === 'youtube') value = value.replace(/^(https?:\/\/)?(www\.)?youtube\.com\/(@)?/i, '');

        setSettings({ ...settings, [name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(settings).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            const res = await fetch(`${API}/settings`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                setMessage('✅ Ijtimoiy tarmoqlar saqlandi');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            setMessage('❌ Xatolik yuz berdi');
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Yuklanmoqda...</div>;

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white">Ijtimoiy tarmoqlar</h2>
                <p className="text-gray-500 text-sm">Sayt pastidagi (Footer) ijtimoiy tarmoq linklarini tahrirlash</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl text-sm border ${message.startsWith('✅') ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                    <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><i className="fab fa-telegram text-blue-500"></i> Telegram</label>
                            <div className="flex bg-gray-900 border border-gray-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-all text-sm">
                                <span className="px-4 py-3 bg-gray-800 text-gray-400 font-bold border-r border-gray-700">t.me/</span>
                                <input name="telegram" value={settings.telegram || ''} onChange={handleChange} className="w-full bg-transparent px-4 py-3 text-white outline-none tracking-wider" placeholder="IT" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><i className="fab fa-instagram text-pink-500"></i> Instagram</label>
                            <div className="flex bg-gray-900 border border-gray-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-all text-sm">
                                <span className="px-4 py-3 bg-gray-800 text-gray-400 font-bold border-r border-gray-700">instagram.com/</span>
                                <input name="instagram" value={settings.instagram || ''} onChange={handleChange} className="w-full bg-transparent px-4 py-3 text-white outline-none tracking-wider" placeholder="IT" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><i className="fab fa-facebook text-blue-600"></i> Facebook</label>
                            <div className="flex bg-gray-900 border border-gray-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-all text-sm">
                                <span className="px-4 py-3 bg-gray-800 text-gray-400 font-bold border-r border-gray-700">facebook.com/</span>
                                <input name="facebook" value={settings.facebook || ''} onChange={handleChange} className="w-full bg-transparent px-4 py-3 text-white outline-none tracking-wider" placeholder="IT" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><i className="fab fa-youtube text-red-600"></i> YouTube</label>
                            <div className="flex bg-gray-900 border border-gray-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-all text-sm">
                                <span className="px-4 py-3 bg-gray-800 text-gray-400 font-bold border-r border-gray-700">youtube.com/@</span>
                                <input name="youtube" value={settings.youtube || ''} onChange={handleChange} className="w-full bg-transparent px-4 py-3 text-white outline-none tracking-wider" placeholder="IT" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transform active:scale-95 transition-all">
                        <i className="fas fa-save mr-2"></i> Saqlash
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SocialsAdmin;
