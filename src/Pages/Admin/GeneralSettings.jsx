import React, { useState, useEffect } from 'react';
import { API, getAdminToken } from '../../config/api';

const GeneralSettings = () => {
    const [settings, setSettings] = useState({
        phone1: '',
        phone2: '',
        email: '',
        address: '',
        map_url: ''
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
        if (name === 'map_url' && value.includes('<iframe')) {
            const match = value.match(/src="([^"]+)"/);
            if (match) value = match[1];
        }
        if (name === 'phone1' || name === 'phone2') {
            value = value.replace(/\D/g, '').slice(0, 9);
        }
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
                setMessage('✅ Sozlamalar saqlandi');
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
                            <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                                <span>Google Maps Embed URL</span>
                                <span className="text-blue-400 normal-case lowercase font-medium">Qanday olish mumkin?</span>
                            </label>
                            <textarea name="map_url" value={settings.map_url} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all text-sm resize-none" rows="3" placeholder="Google Maps -> Bo'lishish (Поделиться) -> Xaritani joylashtirish -> Linkdan faqat src qismini nusxalang..." />
                            <p className="text-[10px] text-gray-500 italic">Eslatma: Google Maps'dan "Xaritani joylashtirish" (Embed a map) bo'limidagi <b>&lt;iframe&gt;</b> kodini to'liqligicha tashlasangiz ham tizim o'zi kerakli qismini ajratib oladi.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transform active:scale-95 transition-all">
                        <i className="fas fa-save mr-2"></i> Sozlamalarni saqlash
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GeneralSettings;
