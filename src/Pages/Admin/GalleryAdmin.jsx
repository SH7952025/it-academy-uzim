import React, { useState, useEffect } from 'react';
import { API, API_URL, getAdminToken } from '../../config/api';

const GalleryAdmin = () => {
    const [images, setImages] = useState([]);
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const token = getAdminToken();

    const fetchGallery = async () => {
        try {
            const res = await fetch(`${API}/gallery`);
            const data = await res.json();
            if (res.ok) setImages(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchGallery(); }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || uploading) return;
        setUploading(true);
        const data = new FormData();
        data.append('image', file);
        data.append('caption', caption);

        try {
            const res = await fetch(`${API}/gallery`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                setFile(null);
                setCaption('');
                e.target.reset();
                fetchGallery();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const adminToken = getAdminToken();
            await fetch(`${API}/gallery/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            fetchGallery();
        } catch (err) {
            console.error(err);
        } finally {
            setImageToDelete(null);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-6">Galereya boshqaruvi</h2>
            
            <form onSubmit={handleUpload} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 mb-8 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Rasm tanlang</label>
                    <input type="file" onChange={e => setFile(e.target.files[0])} className="text-gray-400 w-full" required />
                </div>
                <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Tavsif (ixtiyoriy)</label>
                    <input className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white" value={caption} onChange={e => setCaption(e.target.value)} />
                </div>
                <button 
                    type="submit" 
                    disabled={uploading}
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center min-w-[120px] gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {uploading ? (
                        <><i className="fas fa-spinner fa-spin text-sm"></i> Yuklash...</>
                    ) : (
                        'Yuklash'
                    )}
                </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map(img => (
                    <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-700">
                        <img src={`${API_URL}/${img.image}`} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setImageToDelete(img.id);
                                }} 
                                className="text-red-500 bg-white w-10 h-10 rounded-full"
                            >
                                <i className="fas fa-trash pointer-events-none"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            {imageToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center">
                        <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">O'chirishni tasdiqlaysizmi?</h3>
                        <p className="text-gray-400 text-sm mb-6">Ushbu rasmni o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleDelete(imageToDelete)}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                            >
                                Ha, o'chirish
                            </button>
                            <button 
                                onClick={() => setImageToDelete(null)}
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

export default GalleryAdmin;
