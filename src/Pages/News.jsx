import React, { useState, useEffect } from 'react';
import { API, API_URL } from '../config/api';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/news`)
            .then(res => res.json())
            .then(data => {
                setNews(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 md:py-24 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12 md:mb-16">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">Yangiliklar</h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        O'quv markazimizdagi so'nggi yangiliklar va e'lonlar bilan tanishib boring.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1,2,3].map(i => <div key={i} className="h-[400px] bg-white dark:bg-gray-900 rounded-[32px] animate-pulse shadow-sm border dark:border-gray-800"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((item) => (
                            <div key={item.id} className="group bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-800 flex flex-col h-full">
                                <div className="relative w-full aspect-video overflow-hidden">
                                    <img 
                                        src={item.image ? `${API_URL}/${item.image}` : 'https://via.placeholder.com/600x400'} 
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4 px-4 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full text-[10px] font-bold text-blue-600 shadow-sm">
                                        {new Date(item.date).toLocaleDateString('uz-UZ')}
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {item.content}
                                    </p>
                                    <button className="mt-auto flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                        Batafsil o'qish <i className="fas fa-arrow-right text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && news.length === 0 && (
                    <div className="text-center py-20">
                        <i className="fas fa-newspaper text-5xl text-gray-200 mb-4 block"></i>
                        <p className="text-gray-500">Hozircha yangiliklar yo'q</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
