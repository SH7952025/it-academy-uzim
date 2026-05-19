import React, { useState, useEffect } from 'react';
import { API } from '../config/api';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [settings, setSettings] = useState({
    phone1: '',
    phone2: '',
    email: '',
    address: '',
    map_url: ''
  });

  useEffect(() => {
    fetch(`${API}/settings`)
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.phone && !data.phone1) setSettings(prev => ({ ...prev, phone1: data.phone.replace('+998', '').trim() }));
      })
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    // Agar tayyor iframe kodi bo'lsa, src qismini ajratib olamiz
    if (url.includes('<iframe')) {
      const match = url.match(/src="([^"]+)"/);
      return match ? match[1] : "";
    }
    // Agar oddiy link bo'lsa va /embed bo'lmasa, uni to'g'rilashga harakat qilamiz (faqat ba'zi hollarda ishlaydi)
    if (url.includes('google.com/maps') && !url.includes('/embed')) {
      // Bu qiyin, shuning uchun foydalanuvchiga embed link kerakligini aytgan ma'qul
      // Lekin biz xatoni oldini olish uchun src ni qaytaramiz
      return url; 
    }
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length < 9) {
      alert('Telefon raqami to\'liq emas (9 ta raqam bo\'lishi kerak)');
      return;
    }
    
    try {
      const res = await fetch(`${API}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: `+998${formData.phone}` // Bazaga to'liq formatda yuboramiz
        }),
      });
      if (res.ok) {
        alert('Xabaringiz muvaffaqiyatli yuborildi!');
        setFormData({ name: '', phone: '', message: '' });
      } else {
        alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      }
    } catch (err) {
      alert('Server bilan bog\'lanib bo\'lmadi.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-sm text-blue-600 font-semibold mb-2 uppercase tracking-wide">Bog'lanish</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Savollaringiz bo'lsa murojaat qiling</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-800">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
              <i className="fas fa-phone-alt text-white"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Telefon</h3>
            <p className="text-gray-600 dark:text-gray-400">+998 {settings.phone1 || '90 123 45 67'}</p>
            {settings.phone2 && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">+998 {settings.phone2}</p>
            )}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-800">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
              <i className="fas fa-envelope text-white"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Elektron pochta</h3>
            <p className="text-gray-600 dark:text-gray-400">{settings.email || 'info@it.uz'}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-800">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
              <i className="fas fa-map-marker-alt text-white"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Manzil</h3>
            <p className="text-gray-600 dark:text-gray-400">{settings.address || 'Toshkent sh.'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-transparent dark:border-gray-800">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">F.I.SH</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ismingizni kiriting" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefon raqamingiz</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold border-r border-gray-300 dark:border-gray-700 pr-3">+998</span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="90 123 45 67"
                  className="w-full pl-18 pr-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono tracking-wider"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xabar</label>
              <textarea name="message" value={formData.message} onChange={handleChange} rows="4" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" required />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md active:scale-95">Yuborish</button>
          </form>

          <div className="h-[400px] lg:h-auto min-h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
            {settings.map_url ? (
              <iframe title="Map" src={getEmbedUrl(settings.map_url)} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500">Xarita yuklanmadi</div>
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.pl-18 { padding-left: 4.8rem; }` }} />
    </div>
  );
}
