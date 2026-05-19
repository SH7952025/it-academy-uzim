import React, { useState, useEffect } from 'react';
import { API, authFetch, getAdminToken, API_URL } from '../../config/api';

const SettingsAdmin = () => {
    const [settings, setSettings] = useState({
        phone1: '',
        phone2: '',
        email: '',
        address: '',
        map_url: '',
        hero_title1: '',
        hero_title2: '',
        hero_subtitle: '',
        hero_image: ''
    });
    const [heroImageFile, setHeroImageFile] = useState(null);
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

        // Auto extract src from iframe if user pastes HTML
        if (name === 'map_url' && value.includes('<iframe')) {
            const match = value.match(/src="([^"]+)"/);
            if (match) value = match[1];
        }

        // Only numbers for phone, max 9 digits
        if (name === 'phone1' || name === 'phone2') {
            value = value.replace(/\D/g, '').slice(0, 9);
        }

        setSettings({ ...settings, [name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(settings).forEach(([key, value]) => {
            if (key !== 'hero_image') formData.append(key, value);
        });
        if (heroImageFile) formData.append('hero_image', heroImageFile);

        try {
            const res = await fetch(`${API}/settings`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('✅ Sozlamalar saqlandi');
                if (data.hero_image) setSettings(prev => ({ ...prev, hero_image: data.hero_image }));
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            setMessage('❌ Xatolik yuz berdi');
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Yuklanmoqda...</div>;

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white">Platforma sozlamalari</h2>
                <p className="text-gray-500 text-sm">Saytdagi umumiy ma'lumotlarni tahrirlang</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl text-sm border ${message.startsWith('✅') ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
                {/* Contact Info */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <i className="fas fa-address-book text-blue-500"></i> Aloqa ma'lumotlari
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">1-Telefon</label>
                            <div className="flex bg-gray-900 border border-gray-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-all text-sm">
                                <span className="px-4 py-3 bg-gray-800 text-gray-400 font-bold border-r border-gray-700">+998</span>
                                <input name="phone1" value={settings.phone1 || ''} onChange={handleChange} className="w-full bg-transparent px-4 py-3 text-white outline-none tracking-wider" placeholder="90 123 45 67" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">2-Telefon</label>
                            <div className="flex bg-gray-900 border border-gray-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-all text-sm">
                                <span className="px-4 py-3 bg-gray-800 text-gray-400 font-bold border-r border-gray-700">+998</span>
                                <input name="phone2" value={settings.phone2 || ''} onChange={handleChange} className="w-full bg-transparent px-4 py-3 text-white outline-none tracking-wider" placeholder="90 123 45 67" />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">E-mail</label>
                            <input name="email" value={settings.email} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all text-sm" placeholder="info@it.uz" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Manzil</label>
                            <input name="address" value={settings.address} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all text-sm" placeholder="Toshkent sh., Yunusobod tumani" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Google Maps Embed URL</label>
                            <textarea name="map_url" value={settings.map_url} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all text-sm resize-none" rows="2" placeholder="https://www.google.com/maps/embed?..." />
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <i className="fas fa-home text-purple-500"></i> Asosiy sahifa (Hero)
                    </h3>
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Sarlavha 1 (Rangli)</label>
                                <input name="hero_title1" value={settings.hero_title1} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all text-sm" placeholder="IT Kelajagingizni" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Sarlavha 2 (Oq)</label>
                                <input name="hero_title2" value={settings.hero_title2} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all text-sm" placeholder="biz bilan quring" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Pastki matn (Subtitle)</label>
                            <textarea name="hero_subtitle" value={settings.hero_subtitle} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all text-sm resize-none" rows="3" placeholder="Kurslarimiz haqida qisqacha ma'lumot..." />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-500 uppercase block">Asosiy rasm (Banner)</label>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {settings.hero_image && (
                                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden border border-gray-700 flex-shrink-0">
                                        <img src={`${API_URL}${settings.hero_image}`} alt="Hero" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <label className="w-full flex-1 border-2 border-dashed border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group">
                                    <i className="fas fa-cloud-upload-alt text-3xl text-gray-600 group-hover:text-blue-500 mb-3"></i>
                                    <span className="text-sm text-gray-500 group-hover:text-gray-300">
                                        {heroImageFile ? heroImageFile.name : 'Yangi rasm yuklash uchun bosing'}
                                    </span>
                                    <input type="file" className="hidden" onChange={e => setHeroImageFile(e.target.files[0])} accept="image/*" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transform active:scale-95 transition-all">
                        <i className="fas fa-save mr-2"></i> Barcha o'zgarishlarni saqlash
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsAdmin;
