import React, { useState, useEffect } from 'react';
import { API, getAdminToken, API_URL, authFetch } from '../../config/api';
import CrescentLogo from '../../components/CrescentLogo';

const LogoSettings = () => {
    const [logo, setLogo] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const token = getAdminToken();

    useEffect(() => {
        fetch(`${API}/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.logo) setLogo(data.logo);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!logoFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('logo', logoFile);

        try {
            const res = await authFetch(`${API}/settings`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage('✅ Logo muvaffaqiyatli yangilandi');
                if (data.logo) {
                    setLogo(data.logo);
                    sessionStorage.setItem('site_logo', data.logo);
                }
                setLogoFile(null);
                // Page reload to update all logo instances
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setMessage(`❌ Xatolik: ${data.message || 'Saqlashda xatolik'}`);
            }
        } catch (error) {
            setMessage('❌ Server bilan aloqa yo\'q');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Yuklanmoqda...</div>;

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white">Logo sozlamalari</h2>
                <p className="text-gray-500 text-sm">Sayt logotipini o'zgartiring</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl text-sm border ${message.startsWith('✅') ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current Logo Preview */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 flex flex-col items-center justify-center space-y-6">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Hozirgi ko'rinish</h3>
                    <div className="p-6 bg-gray-900/50 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
                        {logo ? (
                            <img src={`${API_URL}${logo}`} alt="Logo" className="max-h-20 object-contain" />
                        ) : (
                            <CrescentLogo size={60} />
                        )}
                    </div>
                    {!logo && <p className="text-[10px] text-gray-500 italic">Standart tizim logotipi ishlatilmoqda</p>}
                    {logo && (
                        <button 
                            onClick={async () => {
                                if(!window.confirm("Standart logotipga qaytmoqchimisiz?")) return;
                                const formData = new FormData();
                                formData.append('logo', '');
                                await fetch(`${API}/settings`, {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}` },
                                    body: formData
                                });
                                setLogo('');
                                setMessage('✅ Standart logotip tiklandi');
                                setTimeout(() => setMessage(''), 3000);
                            }}
                            className="text-red-500 text-[10px] font-bold uppercase hover:underline"
                        >
                            O'chirish va standartga qaytish
                        </button>
                    )}
                </div>

                {/* Upload Form */}
                <form onSubmit={handleSave} className="bg-gray-800 rounded-2xl border border-gray-700 p-8 flex flex-col space-y-6">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Yangi logo yuklash</h3>
                    
                    <label className="flex-1 border-2 border-dashed border-gray-700 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group text-center">
                        <i className="fas fa-image text-4xl text-gray-600 group-hover:text-blue-500 mb-4"></i>
                        <span className="text-sm text-gray-500 group-hover:text-gray-300 px-4">
                            {logoFile ? logoFile.name : 'PNG, JPG yoki SVG formatdagi rasm tanlang'}
                        </span>
                        <input type="file" className="hidden" onChange={e => setLogoFile(e.target.files[0])} accept="image/*" />
                    </label>

                    <button type="submit" disabled={!logoFile || loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all">
                        {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-check mr-2"></i>}
                        {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LogoSettings;
