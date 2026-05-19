import React, { useState, useEffect } from 'react';
import { API, API_URL, getAdminToken } from '../../config/api';

const CoursesAdmin = () => {
    const [courses, setCourses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState({ title: '', description: '', price: '', category: 'Frontend' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(true);
    const [showLessonsModal, setShowLessonsModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseLessons, setCourseLessons] = useState([]);
    const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '', order: 0, videoType: 'url' });
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [lessonToDelete, setLessonToDelete] = useState(null);
    
    const fixYoutubeUrl = (url) => {
        if (!url) return '';
        if (url.includes('youtube.com/watch?v=')) {
            return url.replace('watch?v=', 'embed/').split('&')[0];
        }
        if (url.includes('youtu.be/')) {
            return url.replace('youtu.be/', 'youtube.com/embed/');
        }
        return url;
    };
    
    const token = getAdminToken();
    const CATEGORIES = ['Frontend', 'Backend', 'Full Stack', 'Dizayn', 'Mobil', 'Sun\'iy intellekt', 'Boshqalar'];

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${API}/courses`);
            const data = await res.json();
            if (res.ok) setCourses(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCourses(); }, []);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(current).forEach(k => { if (k !== 'imageFile') formData.append(k, current[k]); });
        if (current.imageFile) formData.append('image', current.imageFile);

        const url = isEditing ? `${API}/courses/${current.id}` : `${API}/courses`;
        const method = isEditing ? 'PATCH' : 'POST';

        const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
        if (res.ok) {
            showMsg(isEditing ? '✅ Kurs yangilandi' : '✅ Kurs qo\'shildi');
            setIsEditing(false);
            setCurrent({ title: '', description: '', price: '', category: 'Frontend' });
            setShowForm(false);
            fetchCourses();
        } else {
            showMsg('❌ Xatolik yuz berdi', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            const adminToken = getAdminToken();
            const res = await fetch(`${API}/courses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            
            if (res.ok) { 
                showMsg('🗑️ Kurs o\'chirildi'); 
                setCourseToDelete(null);
                fetchCourses(); 
            } else {
                const errData = await res.json().catch(() => ({}));
                showMsg('❌ O\'chirishda xatolik: ' + (errData.message || 'Server xatosi'), 'error');
                setCourseToDelete(null);
            }
        } catch (err) {
            console.error('Delete error:', err);
            showMsg('❌ Server bilan aloqa yo\'q', 'error');
            setCourseToDelete(null);
        }
    };

    const handleEdit = (course) => { 
        setIsEditing(true); 
        setCurrent(course); 
        setShowForm(true);
        window.scrollTo(0,0); 
    };

    const fetchLessons = async (courseId) => {
        try {
            const res = await fetch(`${API}/courses/${courseId}/lessons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setCourseLessons(Array.isArray(data) ? data : data.lessons || []);
        } catch (err) {
            console.error("Darslarni yuklashda xato:", err);
            setCourseLessons([]);
        }
    };

    const handleManageLessons = (course) => {
        setSelectedCourse(course);
        fetchLessons(course.id);
        setShowLessonsModal(true);
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('title', newLesson.title);
            formData.append('courseId', selectedCourse.id);
            formData.append('order', newLesson.order);
            formData.append('videoType', newLesson.videoType || 'url');
            
            if (newLesson.videoType === 'file' && newLesson.videoFile) {
                formData.append('video', newLesson.videoFile);
            } else {
                formData.append('videoUrl', fixYoutubeUrl(newLesson.videoUrl));
            }

            const res = await fetch(`${API}/lessons`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                setNewLesson({ title: '', videoUrl: '', order: 0, videoType: 'url', videoFile: null });
                await fetchLessons(selectedCourse.id);
                showMsg('✅ Dars muvaffaqiyatli qo\'shildi');
            } else {
                const err = await res.json().catch(() => ({}));
                showMsg('❌ Xatolik: ' + (err.message || 'Saqlashda xato'), 'error');
            }
        } catch (err) {
            showMsg('❌ Server bilan aloqa yo\'q', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteLesson = async (id) => {
        try {
            const adminToken = getAdminToken();
            const res = await fetch(`${API}/lessons/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (res.ok) {
                await fetchLessons(selectedCourse.id);
                showMsg('🗑️ Dars o\'chirildi');
            } else {
                showMsg('❌ O\'chirishda xatolik', 'error');
            }
        } catch (err) {
            showMsg('❌ Server bilan aloqa yo\'q', 'error');
        } finally {
            setLessonToDelete(null);
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Kurslar boshqaruvi</h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Kurslarni qo'shing, tahrirlang yoki o'chiring</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-blue-600/20 border border-blue-600/30 text-blue-400 text-xs sm:text-sm px-3 py-1 rounded-full font-medium">
                        {courses.length} ta kurs
                    </span>
                    <button
                        onClick={() => { setShowForm(!showForm); setIsEditing(false); setCurrent({ title: '', description: '', price: '', category: 'Frontend' }); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                    >
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
                        {isEditing ? '✏️ Kursni tahrirlash' : '➕ Yangi kurs qo\'shish'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <input
                            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                            placeholder="Kurs nomi"
                            value={current.title}
                            onChange={e => setCurrent({...current, title: e.target.value})}
                            required
                        />
                        <input
                            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                            placeholder="Narxi (masalan: 500,000 so'm)"
                            value={current.price}
                            onChange={e => setCurrent({...current, price: e.target.value})}
                        />
                        <select
                            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all text-sm"
                            value={current.category}
                            onChange={e => setCurrent({...current, category: e.target.value})}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <label className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-500 cursor-pointer hover:border-blue-500 transition-all text-sm flex items-center gap-2">
                            <i className="fas fa-image text-gray-600"></i>
                            <span className="truncate">{current.imageFile ? current.imageFile.name : 'Rasm yuklash...'}</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => setCurrent({...current, imageFile: e.target.files[0]})} />
                        </label>
                        <textarea
                            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm sm:col-span-2 resize-none"
                            placeholder="Kurs haqida tavsif"
                            value={current.description}
                            onChange={e => setCurrent({...current, description: e.target.value})}
                            rows="3"
                        />
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button type="submit" className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/25">
                            <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} text-xs`}></i>
                            {isEditing ? 'Saqlash' : 'Qo\'shish'}
                        </button>
                        <button type="button" onClick={() => { setIsEditing(false); setCurrent({ title: '', description: '', price: '', category: 'Frontend' }); setShowForm(false); }}
                            className="px-4 sm:px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-semibold text-sm transition-colors">
                            Bekor qilish
                        </button>
                    </div>
                </form>
            )}

            {/* Courses Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-800 rounded-xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {courses.map(course => (
                        <div key={`course-${course.id}`} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-gray-600 transition-all group">
                            {course.image && (
                                <div className="h-32 sm:h-36 overflow-hidden">
                                    <img src={`${API_URL}/${course.image}`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                </div>
                            )}
                            <div className="p-3 sm:p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-white font-semibold text-xs sm:text-sm leading-tight flex-1 pr-2">{course.title}</h3>
                                    <span className="text-[9px] sm:text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full flex-shrink-0">{course.category}</span>
                                </div>
                                <p className="text-gray-500 text-[10px] sm:text-xs mb-2 line-clamp-2">{course.description}</p>
                                <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mb-3">
                                    <span className="text-blue-400 font-bold text-xs sm:text-sm">{course.price}</span>
                                    <span><i className="fas fa-play-circle mr-1"></i>{course.lessonsCount || 0} dars</span>
                                </div>
                                <div className="flex gap-1.5 sm:gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => handleManageLessons(course)} 
                                        className="flex-1 py-1.5 sm:py-2 bg-green-600/20 hover:bg-green-600/40 rounded-lg flex items-center justify-center gap-1 text-green-400 text-[10px] sm:text-xs font-bold transition-colors"
                                    >
                                        <i className="fas fa-play text-[8px] sm:text-[10px] pointer-events-none"></i> Darslar
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleEdit(course)} 
                                        className="w-8 h-8 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg flex items-center justify-center text-blue-400 transition-colors"
                                    >
                                        <i className="fas fa-edit text-xs pointer-events-none"></i>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setCourseToDelete(course.id);
                                        }} 
                                        className="w-8 h-8 bg-red-600/20 hover:bg-red-600/40 rounded-lg flex items-center justify-center text-red-400 transition-colors"
                                    >
                                        <i className="fas fa-trash text-xs pointer-events-none"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {courses.length === 0 && (
                        <div className="col-span-full text-center py-16 text-gray-600">
                            <i className="fas fa-graduation-cap text-4xl mb-3 block"></i>
                            Hozircha kurs yo'q
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {courseToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center">
                        <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">O'chirishni tasdiqlaysizmi?</h3>
                        <p className="text-gray-400 text-sm mb-6">Ushbu kursni o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleDelete(courseToDelete)}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                            >
                                Ha, o'chirish
                            </button>
                            <button 
                                onClick={() => setCourseToDelete(null)}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold transition-colors"
                            >
                                Yo'q, bekor qilish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lessons Modal */}
            {showLessonsModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base sm:text-xl font-bold text-white">"{selectedCourse?.title}" darslari</h3>
                            <button onClick={() => setShowLessonsModal(false)} className="text-gray-500 hover:text-white w-10 h-10 flex items-center justify-center">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        {message.text && (
                            <div className={`mb-4 p-3 rounded-xl text-xs sm:text-sm border flex items-center gap-2 ${message.type === 'error' ? 'bg-red-900/30 border-red-700 text-red-400' : 'bg-green-900/30 border-green-700 text-green-400'}`}>
                                {message.text}
                            </div>
                        )}

                        {/* Add Lesson Form */}
                        <div className="bg-gray-800 p-3 sm:p-4 rounded-xl mb-6">
                            <div className="flex gap-2 sm:gap-4 mb-4">
                                <button 
                                    onClick={() => setNewLesson({...newLesson, videoType: 'url'})}
                                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${newLesson.videoType === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                                >
                                    YouTube/URL
                                </button>
                                <button 
                                    onClick={() => setNewLesson({...newLesson, videoType: 'file'})}
                                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${newLesson.videoType === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                                >
                                    <i className="fas fa-lock mr-1"></i>Xavfsiz yuklash
                                </button>
                            </div>

                            <form onSubmit={handleAddLesson} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none sm:col-span-2"
                                    placeholder="Dars nomi"
                                    value={newLesson.title}
                                    onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                                    required
                                />
                                {newLesson.videoType === 'url' ? (
                                    <input
                                        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none sm:col-span-2"
                                        placeholder="Video URL (YouTube embed link)"
                                        value={newLesson.videoUrl}
                                        onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})}
                                        required={newLesson.videoType === 'url'}
                                    />
                                ) : (
                                    <label className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-400 cursor-pointer hover:border-blue-500 transition-all text-sm sm:col-span-2 flex items-center gap-2">
                                        <i className="fas fa-video"></i>
                                        <span className="truncate">{newLesson.videoFile ? newLesson.videoFile.name : 'Videoni tanlang (MP4)...'}</span>
                                        <input 
                                            type="file" 
                                            accept="video/*"
                                            className="hidden" 
                                            onChange={e => setNewLesson({...newLesson, videoFile: e.target.files[0]})} 
                                            required={newLesson.videoType === 'file'}
                                        />
                                    </label>
                                )}
                                <input
                                    type="number"
                                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none"
                                    placeholder="Tartib"
                                    value={newLesson.order}
                                    onChange={e => setNewLesson({...newLesson, order: parseInt(e.target.value) || 0})}
                                    required
                                />
                                <button type="submit" disabled={uploading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm py-2.5 transition-colors flex items-center justify-center gap-2">
                                    {uploading ? (
                                        <><i className="fas fa-spinner fa-spin"></i> Yuklanmoqda...</>
                                    ) : (
                                        <><i className="fas fa-plus"></i> Qo'shish</>
                                    )}
                                </button>
                            </form>
                            {newLesson.videoType === 'file' && (
                                <p className="text-green-400/60 text-[10px] mt-2 flex items-center gap-1">
                                    <i className="fas fa-shield-alt"></i>
                                    Video serverda xavfsiz saqlanadi, yuklab olish TAQIQLANGAN
                                </p>
                            )}
                        </div>

                        {/* Lessons List */}
                        <div className="space-y-2 sm:space-y-3">
                            {courseLessons.length === 0 && <p className="text-gray-500 text-center py-4 text-sm">Hozircha darslar yo'q</p>}
                            {courseLessons.map((lesson, idx) => (
                                <div key={lesson.id} className="flex items-center justify-between bg-gray-800 p-3 sm:p-4 rounded-xl">
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                        <span className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-gray-400 flex-shrink-0">{idx+1}</span>
                                        <div className="min-w-0">
                                            <p className="text-white font-medium text-xs sm:text-sm truncate">{lesson.title}</p>
                                            <p className="text-gray-500 text-[10px] sm:text-xs flex items-center gap-1">
                                                {lesson.videoType === 'file' ? (
                                                    <><i className="fas fa-lock text-green-500"></i> Xavfsiz</>
                                                ) : (
                                                    <><i className="fas fa-link"></i> URL</>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setLessonToDelete(lesson.id);
                                        }} 
                                        className="text-red-500 hover:text-red-400 p-2 flex-shrink-0"
                                    >
                                        <i className="fas fa-trash-alt pointer-events-none"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Lesson Delete Confirmation Modal */}
            {lessonToDelete && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center">
                        <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">Darsni o'chirishni tasdiqlaysizmi?</h3>
                        <p className="text-gray-400 text-sm mb-6">Ushbu darsni o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleDeleteLesson(lessonToDelete)}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                            >
                                Ha, o'chirish
                            </button>
                            <button 
                                onClick={() => setLessonToDelete(null)}
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

export default CoursesAdmin;
