import React, { useState, useEffect } from 'react';
import { API, API_URL, getAdminToken } from '../../config/api';

const ReviewsAdmin = () => {
    const [reviews, setReviews] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState({ name: '', job: '', text: '', stars: 5 });
    const [imageFile, setImageFile] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const token = getAdminToken();

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${API}/comments`);
            const data = await res.json();
            if (res.ok) setReviews(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReviews(); }, []);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing ? `${API}/comments/${current.id}` : `${API}/comments`;
        const method = isEditing ? 'PATCH' : 'POST';
        
        const formData = new FormData();
        formData.append('name', current.name);
        formData.append('job', current.job);
        formData.append('text', current.text);
        formData.append('stars', current.stars);
        if (imageFile) formData.append('image', imageFile);

        const res = await fetch(url, {
            method, headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (res.ok) {
            showMsg(isEditing ? '✅ Izoh yangilandi' : '✅ Izoh qo\'shildi');
            setIsEditing(false);
            setCurrent({ name: '', job: '', text: '', stars: 5 });
            setImageFile(null);
            setShowForm(false);
            fetchReviews();
        } else { showMsg('❌ Xatolik yuz berdi', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu izohni o'chirishni tasdiqlaysizmi?")) return;
        const res = await fetch(`${API}/comments/${id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) { showMsg('🗑️ Izoh o\'chirildi'); fetchReviews(); }
    };

    const handleEdit = (review) => {
        setIsEditing(true);
        setCurrent(review);
        setImageFile(null);
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Izohlar boshqaruvi</h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">O'quvchilar fikrlarini qo'shing yoki tahrirlang</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-yellow-600/20 border border-yellow-600/30 text-yellow-400 text-xs sm:text-sm px-3 py-1 rounded-full font-medium">
                        {reviews.length} ta izoh
                    </span>
                    <button onClick={() => { setShowForm(!showForm); setIsEditing(false); setCurrent({ name: '', job: '', text: '', stars: 5 }); setImageFile(null); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors">
                        <i className="fas fa-plus mr-1"></i> Yangi
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`mb-4 p-3 rounded-xl text-xs sm:text-sm border flex items-center gap-2 ${message.type === 'error' ? 'bg-red-900/30 border-red-700 text-red-400' : 'bg-green-900/30 border-green-700 text-green-400'}`}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl border border-gray-700 p-4 sm:p-5 mb-6">
                    <h3 className="text-white font-semibold mb-4 text-xs sm:text-sm uppercase tracking-wider">
                        {isEditing ? '✏️ Izohni tahrirlash' : '➕ Yangi izoh qo\'shish'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                        <input className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 outline-none text-sm"
                            placeholder="O'quvchi ismi" value={current.name} onChange={e => setCurrent({...current, name: e.target.value})} required />
                        <input className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 outline-none text-sm"
                            placeholder="Kasbi yoki o'qiyotgan kursi" value={current.job} onChange={e => setCurrent({...current, job: e.target.value})} required />
                        <textarea className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 outline-none text-sm sm:col-span-2 resize-none"
                            placeholder="Izoh matni" value={current.text} onChange={e => setCurrent({...current, text: e.target.value})} rows="3" required />
                        <label className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-500 cursor-pointer hover:border-blue-500 transition-all text-sm sm:col-span-2 flex items-center gap-2">
                            <i className="fas fa-image text-gray-600"></i>
                            <span className="truncate">{imageFile ? imageFile.name : 'O\'quvchi rasmini yuklash (Majburiy emas)...'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                        </label>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/25">
                            <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} text-xs`}></i>
                            {isEditing ? 'Saqlash' : 'Qo\'shish'}
                        </button>
                        <button type="button" onClick={() => { setIsEditing(false); setCurrent({ name: '', job: '', text: '', stars: 5 }); setImageFile(null); setShowForm(false); }}
                            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm transition-colors">Bekor qilish</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {[1,2,3].map(i => <div key={i} className="h-44 bg-gray-800 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-4 sm:p-5 hover:border-gray-600 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-3 sm:mb-4">
                                    {review.image ? (
                                        <img src={`${API_URL}/${review.image}`} alt={review.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-600" />
                                    ) : (
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600/10 rounded-full flex items-center justify-center">
                                            <i className="fas fa-user text-blue-500 text-xs sm:text-sm"></i>
                                        </div>
                                    )}
                                    <div className="flex gap-1.5 sm:gap-2">
                                        <button onClick={() => handleEdit(review)} className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg flex items-center justify-center text-blue-400 transition-colors">
                                            <i className="fas fa-edit text-[10px] sm:text-xs"></i>
                                        </button>
                                        <button onClick={() => handleDelete(review.id)} className="w-7 h-7 sm:w-8 sm:h-8 bg-red-600/20 hover:bg-red-600/40 rounded-lg flex items-center justify-center text-red-400 transition-colors">
                                            <i className="fas fa-trash text-[10px] sm:text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-xs sm:text-sm italic mb-3 sm:mb-4 line-clamp-3">"{review.text}"</p>
                            </div>
                            <div className="border-t border-gray-700 pt-3 sm:pt-4">
                                <h4 className="text-white font-bold text-xs sm:text-sm">{review.name}</h4>
                                <p className="text-gray-500 text-[10px] sm:text-xs">{review.job}</p>
                            </div>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-600">Hozircha izohlar yo'q</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewsAdmin;
