import React, { useState, useEffect } from 'react';
import { API, API_URL, getAdminToken } from '../../config/api';

const SOCIAL_FIELDS = [
    { key: 'telegram', icon: 'fab fa-telegram', label: 'Telegram' },
    { key: 'instagram', icon: 'fab fa-instagram', label: 'Instagram' },
    { key: 'facebook', icon: 'fab fa-facebook', label: 'Facebook' },
    { key: 'linkedin', icon: 'fab fa-linkedin', label: 'LinkedIn' },
    { key: 'github', icon: 'fab fa-github', label: 'GitHub' },
];

const emptyMentor = { name: '', speciality: '', telegram: '', instagram: '', facebook: '', linkedin: '', github: '' };

const MentorsAdmin = () => {
    const [mentors, setMentors] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState(emptyMentor);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const token = getAdminToken();

    const fetchMentors = async () => {
        try {
            const res = await fetch(`${API}/mentors`);
            const data = await res.json();
            if (res.ok) setMentors(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchMentors(); }, []);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (uploading) return;
        setUploading(true);
        const formData = new FormData();
        Object.keys(current).forEach(k => { if (k !== 'imageFile' && k !== 'image') formData.append(k, current[k] || ''); });
        if (current.imageFile) formData.append('image', current.imageFile);

        const url = isEditing ? `${API}/mentors/${current.id}` : `${API}/mentors`;
        const method = isEditing ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            if (res.ok) {
                showMsg(isEditing ? '✅ Mentor yangilandi' : '✅ Mentor qo\'shildi');
                setIsEditing(false);
                setCurrent(emptyMentor);
                setShowForm(false);
                fetchMentors();
            } else {
                showMsg('❌ Xatolik yuz berdi', 'error');
            }
        } catch (err) {
            showMsg('❌ Server bilan aloqa yo\'q', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu mentorni o'chirishni tasdiqlaysizmi?")) return;
        try {
            const res = await fetch(`${API}/mentors/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) { showMsg('🗑️ Mentor o\'chirildi'); fetchMentors(); }
            else { showMsg('❌ O\'chirishda xatolik', 'error'); }
        } catch (err) { showMsg('❌ Server bilan aloqa yo\'q', 'error'); }
    };

    const handleEdit = (mentor) => {
        setIsEditing(true);
        setCurrent({ ...mentor, imageFile: null });
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Mentorlar boshqaruvi</h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Mentorlarni qo'shing, tahrirlang yoki o'chiring</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-purple-600/20 border border-purple-600/30 text-purple-400 text-xs sm:text-sm px-3 py-1 rounded-full font-medium">
                        {mentors.length} ta mentor
                    </span>
                    <button onClick={() => { setShowForm(!showForm); setIsEditing(false); setCurrent(emptyMentor); }}
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

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl border border-gray-700 p-4 sm:p-5 mb-6">
                    <h3 className="text-white font-semibold mb-4 text-xs sm:text-sm uppercase tracking-wider">
                        {isEditing ? '✏️ Mentorni tahrirlash' : '➕ Yangi mentor qo\'shish'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                        <input className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 outline-none text-sm"
                            placeholder="Mentor ismi" value={current.name} onChange={e => setCurrent({...current, name: e.target.value})} required />
                        <input className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 outline-none text-sm"
                            placeholder="Mutaxassislik" value={current.speciality} onChange={e => setCurrent({...current, speciality: e.target.value})} required />
                        <label className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-500 cursor-pointer hover:border-blue-500 text-sm flex items-center gap-2 sm:col-span-2">
                            <i className="fas fa-image text-gray-600"></i>
                            <span className="truncate">{current.imageFile ? current.imageFile.name : 'Rasm yuklash...'}</span>
                            <input type="file" className="hidden" onChange={e => setCurrent({...current, imageFile: e.target.files[0]})} accept="image/*" />
                        </label>
                    </div>
                    <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-3 border-t border-gray-700 pt-4">Ijtimoiy tarmoqlar</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SOCIAL_FIELDS.map(field => (
                            <div key={field.key} className="relative">
                                <i className={`${field.icon} absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm`}></i>
                                <input className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-600 focus:border-blue-500 outline-none text-xs"
                                    placeholder={field.label} value={current[field.key] || ''} onChange={e => setCurrent({...current, [field.key]: e.target.value})} />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button 
                            type="submit" 
                            disabled={uploading}
                            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/25 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {uploading ? (
                                <><i className="fas fa-spinner fa-spin text-xs"></i> Saqlanmoqda...</>
                            ) : (
                                <>
                                    <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} text-xs`}></i>
                                    {isEditing ? 'Saqlash' : 'Qo\'shish'}
                                </>
                            )}
                        </button>
                        <button type="button" onClick={() => { setIsEditing(false); setCurrent(emptyMentor); setShowForm(false); }}
                            className="px-4 sm:px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-semibold text-sm transition-colors">
                            Bekor qilish
                        </button>
                    </div>
                </form>
            )}

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-800 rounded-xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {mentors.map(mentor => (
                        <div key={mentor.id} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-gray-600 transition-all group">
                            <div className="relative h-36 sm:h-44 overflow-hidden bg-gray-900">
                                <img
                                    src={mentor.image ? `${API_URL}/${mentor.image}` : `https://ui-avatars.com/api/?name=${mentor.name}&background=1d4ed8&color=fff&size=200`}
                                    alt={mentor.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent"></div>
                            </div>
                            <div className="p-3 sm:p-4">
                                <h3 className="text-white font-bold text-sm">{mentor.name}</h3>
                                <p className="text-blue-400 text-xs mb-3">{mentor.speciality}</p>
                                <div className="flex gap-1.5 mb-3 flex-wrap">
                                    {SOCIAL_FIELDS.map(f => mentor[f.key] ? (
                                        <a key={f.key} href={mentor[f.key]} target="_blank" rel="noreferrer"
                                            className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                                            <i className={`${f.icon} text-gray-400 text-xs`}></i>
                                        </a>
                                    ) : null)}
                                </div>
                                <div className="flex gap-2 border-t border-gray-700 pt-3">
                                    <button onClick={() => handleEdit(mentor)} className="flex-1 py-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg text-blue-400 text-xs font-medium transition-colors">
                                        <i className="fas fa-edit text-[10px] mr-1"></i>Tahrir
                                    </button>
                                    <button onClick={() => handleDelete(mentor.id)} className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-400 text-xs font-medium transition-colors">
                                        <i className="fas fa-trash text-[10px] mr-1"></i>O'chirish
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {mentors.length === 0 && (
                        <div className="col-span-full text-center py-16 text-gray-600">
                            <i className="fas fa-users text-4xl mb-3 block"></i>
                            Hozircha mentor yo'q
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MentorsAdmin;
