import React, { useState, useEffect } from 'react';
import { API, API_URL, getAdminToken } from '../../config/api';

const NewsAdmin = () => {
    const [news, setNews] = useState([]);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState(null);
    const token = getAdminToken();

    const fetchNews = async () => {
        try {
            const res = await fetch(`${API}/news`);
            const data = await res.json();
            if (res.ok) setNews(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNews(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        if (imageFile) data.append('image', imageFile);

        const res = await fetch(`${API}/news`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: data
        });

        if (res.ok) {
            setFormData({ title: '', content: '' });
            setImageFile(null);
            setShowForm(false);
            fetchNews();
        }
    };

    const handleDelete = async (id) => {
        try {
            const adminToken = getAdminToken();
            const res = await fetch(`${API}/news/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (res.ok) fetchNews();
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setNewsToDelete(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Yangiliklar boshqaruvi</h2>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
                    {showForm ? 'Bekor qilish' : 'Yangi qo\'shish'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 mb-8 space-y-4">
                    <input className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white" placeholder="Sarlavha" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    <textarea className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white" placeholder="Mazmuni" rows="4" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
                    <label className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-500 cursor-pointer hover:border-blue-500 transition-all text-sm flex items-center gap-2">
                        <i className="fas fa-image text-gray-600"></i>
                        <span className="truncate">{imageFile ? imageFile.name : 'Yangilik uchun rasm yuklash (Majburiy emas)...'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                    </label>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">Saqlash</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.map(item => (
                    <div key={item.id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 group">
                        {item.image && <img src={`${API_URL}/${item.image}`} className="w-full h-40 object-cover" alt="" />}
                        <div className="p-4">
                            <h3 className="text-white font-bold mb-2">{item.title}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-4">{item.content}</p>
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setNewsToDelete(item.id);
                                }} 
                                className="text-red-500 text-sm font-bold"
                            >
                                <i className="fas fa-trash mr-1 pointer-events-none"></i>O'chirish
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            {newsToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center">
                        <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">O'chirishni tasdiqlaysizmi?</h3>
                        <p className="text-gray-400 text-sm mb-6">Ushbu yangilikni o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleDelete(newsToDelete)}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                            >
                                Ha, o'chirish
                            </button>
                            <button 
                                onClick={() => setNewsToDelete(null)}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold transition-colors"
                            >
                                Yo'q, bekor qilish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsAdmin;
