import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API, authFetch, getToken, getUser } from '../../config/api';

const CoursePlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeLesson, setActiveLesson] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const videoRef = useRef(null);
    const user = getUser();

    const getSecureEmbedUrl = (url) => {
        if (!url) return '';
        
        // YouTube video parsing
        let ytId = '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            ytId = match[2];
        }
        
        if (ytId) {
            // Force secure YouTube embed parameters to hide logo and related videos:
            return `https://www.youtube.com/embed/${ytId}?modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&showinfo=0&fs=0`;
        }
        
        // Vimeo video parsing
        if (url.includes('vimeo.com')) {
            const vimeoId = url.split('/').pop().split('?')[0];
            return `https://player.vimeo.com/video/${vimeoId}?badge=0&byline=0&portrait=0&title=0`;
        }
        
        return url;
    };

    const [completedLessonIds, setCompletedLessonIds] = useState([]);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }

        const fetchCourseData = async () => {
            try {
                const [courseRes, lessonsRes] = await Promise.all([
                    authFetch(`${API}/courses/${id}`),
                    authFetch(`${API}/courses/${id}/lessons`)
                ]);

                if (!courseRes.ok) throw new Error('Kurs topilmadi');
                
                const courseData = await courseRes.json();
                const lessonsData = await lessonsRes.json();

                setCourse(courseData);
                
                const loadedLessons = Array.isArray(lessonsData) ? lessonsData : lessonsData.lessons || [];
                const completed = Array.isArray(lessonsData) ? [] : lessonsData.completedLessons || [];
                
                setLessons(loadedLessons);
                setCompletedLessonIds(completed);
                
                if (loadedLessons.length > 0) {
                    // Start with the first uncompleted lesson, or the very first if none
                    const firstUncompleted = loadedLessons.find(l => !completed.includes(l.id));
                    setActiveLesson(firstUncompleted || loadedLessons[0]);
                }
            } catch (error) {
                console.error('Data fetching error:', error);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [id, navigate]);

    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        document.addEventListener('contextmenu', handleContextMenu);
        return () => document.removeEventListener('contextmenu', handleContextMenu);
    }, []);

    const [showCompletionModal, setShowCompletionModal] = useState(false);

    const handleCompleteLesson = async () => {
        try {
            const res = await authFetch(`${API}/courses/${id}/lessons/${activeLesson.id}/complete`, {
                method: 'POST'
            });
            if (res.ok) {
                const data = await res.json();
                const newCompleted = data.completedLessons || [];
                setCompletedLessonIds(newCompleted);
                
                // Avtomatik keyingi darsga o'tish
                const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
                if (currentIndex < lessons.length - 1) {
                    setActiveLesson(lessons[currentIndex + 1]);
                } else if (newCompleted.length === lessons.length) {
                    // Oxirgi dars yakunlandi va hamma dars ko'rildi
                    setShowCompletionModal(true);
                }
            }
        } catch (error) {
            console.error("Progress saqlanmadi:", error);
        }
    };

    const safeCompletedIds = Array.isArray(completedLessonIds) ? completedLessonIds.map(Number) : [];

    const activeCompletedCount = Array.isArray(lessons)
        ? lessons.filter(l => l && safeCompletedIds.includes(Number(l.id))).length
        : 0;
        
    const progressPercentage = (Array.isArray(lessons) && lessons.length > 0)
        ? Math.round((activeCompletedCount / lessons.length) * 100)
        : 0;

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">Video yuklanmoqda...</p>
            </div>
        </div>
    );

    if (!course || !activeLesson) return null;

    return (
        <div className="h-screen bg-gray-950 flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
                    <Link to="/dashboard" className="text-gray-400 hover:text-white">
                        <i className="fas fa-arrow-left"></i>
                    </Link>
                    <h2 className="text-white font-bold text-sm truncate px-4">{activeLesson.title}</h2>
                    <button onClick={() => setSidebarOpen(true)} className="text-blue-500 font-bold text-sm">
                        Mundarija
                    </button>
                </div>

                {/* Video Player Section */}
                <div className="relative aspect-video bg-black w-full shadow-2xl group flex items-center justify-center max-h-[65vh] md:max-h-[70vh] mx-auto">
                    {activeLesson.videoType === 'url' ? (
                        <div className="relative w-full h-full max-h-[65vh] md:max-h-[70vh] flex items-center justify-center bg-black overflow-hidden select-none">
                            <iframe
                                className="w-full h-full max-h-[65vh] md:max-h-[70vh] object-contain relative z-0"
                                src={getSecureEmbedUrl(activeLesson.videoUrl)}
                                title={activeLesson.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                            
                            {/* 🔒 SECURITY CORNER SHIELDS */}
                            {/* Top Shield: blocks clicking YouTube title, channel link, and Share button */}
                            <div className="absolute top-0 left-0 right-0 h-16 bg-transparent z-10 pointer-events-auto" onContextMenu={(e) => e.preventDefault()}></div>
                            
                            {/* Bottom-Right Shield: blocks clicking 'Watch on YouTube' logo and settings options */}
                            <div className="absolute bottom-0 right-0 w-36 h-12 bg-transparent z-10 pointer-events-auto" onContextMenu={(e) => e.preventDefault()}></div>
                        </div>
                    ) : (
                        <div className="w-full h-full max-h-[65vh] md:max-h-[70vh] relative flex items-center justify-center" onContextMenu={(e) => e.preventDefault()}>
                             <video 
                                ref={videoRef}
                                controls 
                                playsInline
                                webkit-playsinline="true"
                                controlsList="nodownload" // Chrome/Edge download tugmasini yashirish
                                onContextMenu={(e) => e.preventDefault()}
                                className="w-full h-full max-h-[65vh] md:max-h-[70vh] object-contain" 
                                src={`${API}/videos/${activeLesson.videoUrl}?token=${getToken()}`}
                            >
                                Sizning brauzeringiz videoni qo'llab-quvvatlamaydi.
                            </video>
                            {/* Overlay to prevent right-click/save-as */}
                            <div className="absolute inset-0 bg-transparent pointer-events-none select-none"></div>
                        </div>
                    )}
                </div>

                {/* Lesson Info */}
                <div className="p-6 md:p-10 max-w-5xl">
                    <div className="hidden lg:flex items-center gap-3 mb-6">
                        <Link to="/dashboard" className="flex items-center gap-2 text-blue-500 font-semibold hover:text-blue-400 transition-colors">
                            <i className="fas fa-arrow-left text-xs"></i> Dashboardga qaytish
                        </Link>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
                                {activeLesson.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <i className="far fa-clock"></i> {activeLesson.duration || 'Davomiylik noma\'lum'}
                                </span>
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded-md text-[10px] uppercase font-bold tracking-wider">
                                    <i className="fas fa-shield-alt"></i> Himoyalangan kontent
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                             {/* Next/Prev Buttons for mobile */}
                             <button 
                                onClick={() => {
                                    const idx = lessons.findIndex(l => l.id === activeLesson.id);
                                    if(idx > 0) setActiveLesson(lessons[idx-1]);
                                }}
                                disabled={lessons.findIndex(l => l.id === activeLesson.id) === 0}
                                className="flex-1 md:flex-none px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-white rounded-lg text-sm font-bold transition-all"
                             >
                                <i className="fas fa-chevron-left mr-2"></i> Oldingi
                             </button>
                             
                             {!safeCompletedIds.includes(Number(activeLesson.id)) ? (
                                <button 
                                    onClick={handleCompleteLesson}
                                    className="flex-1 md:flex-none px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-green-600/20"
                                >
                                    Darsni yakunlash <i className="fas fa-check-circle ml-1"></i>
                                </button>
                             ) : (
                                <button 
                                    onClick={() => {
                                        const idx = lessons.findIndex(l => l.id === activeLesson.id);
                                        if(idx < lessons.length - 1) setActiveLesson(lessons[idx+1]);
                                    }}
                                    disabled={lessons.findIndex(l => l.id === activeLesson.id) === lessons.length - 1}
                                    className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-lg text-sm font-bold transition-all"
                                >
                                    Keyingi <i className="fas fa-chevron-right ml-2"></i>
                                </button>
                             )}
                        </div>
                    </div>
                    
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 sm:p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <i className="fas fa-info-circle text-blue-500"></i> Dars haqida
                        </h3>
                        <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed">
                            <p>Ushbu darsda biz quyidagilarni ko'rib chiqamiz:</p>
                            <ul className="list-disc list-inside mt-4 space-y-3">
                                <li>Nazariy bilimlar va fundamental tushunchalar</li>
                                <li>Amaliy misollar va kod yozish jarayoni</li>
                                <li>Mustaqil bajarish uchun uyga vazifalar</li>
                            </ul>
                            <div className="mt-10 p-4 bg-amber-900/20 border border-amber-900/30 rounded-2xl flex gap-4 items-start">
                                <i className="fas fa-exclamation-triangle text-amber-500 mt-1"></i>
                                <p className="text-xs sm:text-sm text-amber-200/70">
                                    <strong>Eslatma:</strong> IT Academy platformasidagi barcha video darslar mualliflik huquqi bilan himoyalangan. Videolarni ko'paytirish yoki tarqatish qat'iyan taqiqlanadi.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/80 z-[60] lg:hidden" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* Sidebar - Lessons List */}
            <div className={`
                fixed lg:static inset-y-0 right-0 z-[70]
                w-[300px] sm:w-[380px] lg:w-[400px]
                bg-gray-900 border-l border-gray-800
                transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0
                transition-transform duration-300 ease-in-out
                flex flex-col h-full
            `}>
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-1 line-clamp-1">{course.title}</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold tracking-wider">{progressPercentage}%</span>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                    {lessons.map((lesson, index) => {
                        const isCompleted = safeCompletedIds.includes(Number(lesson.id));
                        // A lesson is locked if it's not the first lesson and the previous lesson is NOT completed
                        const isLocked = index > 0 && !safeCompletedIds.includes(Number(lessons[index - 1].id)) && user?.role !== 'admin';

                        return (
                            <button
                                key={lesson.id}
                                disabled={isLocked}
                                onClick={() => {
                                    if (!isLocked) {
                                        setActiveLesson(lesson);
                                        setSidebarOpen(false);
                                        window.scrollTo(0,0);
                                    }
                                }}
                                className={`w-full flex items-start gap-4 p-4 transition-all group ${
                                    activeLesson.id === lesson.id 
                                    ? 'bg-blue-600/10 border-r-4 border-blue-600' 
                                    : 'border-r-4 border-transparent hover:bg-gray-800/50'
                                } ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                            >
                                <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                                    isCompleted ? 'bg-green-500/20 text-green-500' :
                                    activeLesson.id === lesson.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700'
                                }`}>
                                    {isCompleted ? <i className="fas fa-check"></i> : (isLocked ? <i className="fas fa-lock"></i> : index + 1)}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <h4 className={`text-sm font-semibold mb-1 truncate ${
                                        activeLesson.id === lesson.id 
                                        ? 'text-blue-500' 
                                        : 'text-gray-300 group-hover:text-white'
                                    }`}>
                                        {lesson.title}
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                                            <i className="far fa-play-circle"></i> {lesson.duration || 'Video'}
                                        </span>
                                        {isLocked && (
                                            <span className="text-[9px] text-red-400 flex items-center gap-1 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                                Yopiq
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
            {/* Completion Modal */}
            {showCompletionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-gray-900 border border-blue-500/30 rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-2xl shadow-blue-500/20 text-center transform animate-modal-pop relative overflow-hidden">
                        
                        {/* Background glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-purple-600/10 pointer-events-none"></div>
                        
                        {/* Confetti elements (pure CSS) */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className={`confetti-${i} absolute w-2 h-2 rounded-full ${['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500'][Math.floor(Math.random() * 4)]}`}></div>
                            ))}
                        </div>

                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 border-4 border-gray-900 ring-4 ring-blue-500/20 animate-bounce-slow">
                                <i className="fas fa-award text-4xl text-white"></i>
                            </div>
                            
                            <h2 className="text-3xl font-extrabold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                Tabriklaymiz! 🎉
                            </h2>
                            <p className="text-gray-300 text-lg leading-relaxed mb-8">
                                Siz <strong className="text-white">{course.title}</strong> kursini muvaffaqiyatli yakunladingiz! Endi maxsus <span className="text-blue-400 font-bold">sertifikatingizni</span> olib ketish uchun IT Academy o'quv markaziga tashrif buyurishingiz mumkin.
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => setShowCompletionModal(false)}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5"
                                >
                                    Tushunarli, Rahmat!
                                </button>
                                <Link 
                                    to="/dashboard"
                                    className="w-full py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all"
                                >
                                    Dashboardga qaytish
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #111827; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
                video::-internal-media-controls-download-button { display:none; }
                video::-webkit-media-controls-enclosure { overflow:hidden; }
                video::-webkit-media-controls-panel { width: calc(100% + 30px); }
                
                @keyframes modal-pop {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-modal-pop { animation: modal-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-5%); }
                    50% { transform: translateY(5%); }
                }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }

                ${[...Array(20)].map((_, i) => `
                    @keyframes confetti-fall-${i} {
                        0% { transform: translate(0, -10px) rotate(0deg); opacity: 1; }
                        100% { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 + 100}px) rotate(${Math.random() * 360}deg); opacity: 0; }
                    }
                    .confetti-${i} {
                        left: ${50 + (Math.random() * 20 - 10)}%;
                        top: 20%;
                        animation: confetti-fall-${i} ${1 + Math.random() * 2}s ease-out forwards;
                    }
                `).join('')}
            ` }} />
        </div>
    );
};

export default CoursePlayer;
