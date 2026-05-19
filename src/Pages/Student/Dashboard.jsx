import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API, API_URL, authFetch, getUser, clearAuth } from '../../config/api';

const StudentDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = getUser();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchMyCourses = async () => {
            try {
                const res = await authFetch(`${API}/my-courses`);
                const data = await res.json();
                if (res.ok) {
                    setCourses(data.map(c => ({
                        ...c,
                        image: c.image ? `${API_URL}/${c.image}` : 'https://via.placeholder.com/400x250',
                        progress: c.progress || 0,
                        lastLesson: 'Davom ettirish'
                    })));
                }
            } catch (error) {
                console.error('Fetch courses error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, [navigate]);

    const handleLogout = () => {
        clearAuth();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Xush kelibsiz, <span className="text-blue-600">{user.fullName || 'Talaba'}</span>! 👋
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                            Bugun yangi bilimlar olish uchun ajoyib kun.
                        </p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-red-600 font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Chiqish</span>
                    </button>
                </div>

                {/* Stats Section - Mobile Scrollable */}
                <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 mb-12 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                    {[
                        { label: 'Sotib olingan', value: `${courses.length} ta`, icon: 'fas fa-book-open', color: 'blue' },
                        { label: 'Tugallangan', value: '0 ta', icon: 'fas fa-certificate', color: 'green' },
                        { label: 'Ballar', value: '1250', icon: 'fas fa-star', color: 'purple' }
                    ].map((stat, i) => (
                        <div key={i} className="min-w-[240px] md:min-w-0 flex-1 bg-white dark:bg-gray-900 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className={`w-12 h-12 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-xl flex items-center justify-center text-${stat.color}-600 mb-4`}>
                                <i className={`${stat.icon} text-xl`}></i>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                            <div className="text-gray-500 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* My Courses Section */}
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">Mening kurslarim</h2>
                
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {courses.map(course => (
                            <div key={course.id} className="group bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-800 flex flex-col">
                                <div className="relative h-48 overflow-hidden">
                                    <img 
                                        src={course.image} 
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <Link 
                                            to={`/course/${course.id}`}
                                            className="bg-white text-blue-600 px-6 py-2.5 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                                        >
                                            O'qishni davom ettirish
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                                        {course.title}
                                    </h3>
                                    
                                    <div className="mt-auto">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold text-gray-400">Progress</span>
                                            <span className="text-xs font-bold text-blue-600">{course.progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                        <Link to={`/course/${course.id}`} className="mt-4 w-full py-3 bg-gray-50 dark:bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                                            Darsni boshlash <i className="fas fa-arrow-right text-xs"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {courses.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800">
                                <i className="fas fa-book-reader text-4xl text-gray-300 mb-4 block"></i>
                                <p className="text-gray-500 mb-6">Sizda hali sotib olingan kurslar yo'q</p>
                                <Link to="/Courses" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all">
                                    Kurslarni ko'rish
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
