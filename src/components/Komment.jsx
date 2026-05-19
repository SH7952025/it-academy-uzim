import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API, API_URL } from "../config/api";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';

const Komment = () => {
    const { t } = useTranslation();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/comments`)
            .then(res => res.json())
            .then(data => {
                setComments(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="w-full bg-white dark:bg-gray-950 transition-colors duration-300 py-20 border-t dark:border-gray-900">
            <div className="max-w-6xl m-auto px-4">
                <div className="flex flex-col items-center gap-4 mb-14">
                    <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-full">
                        {t('reviews.badge') || 'Testimonials'}
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 dark:text-white leading-tight">
                        {t('reviews.title') || 'O’quvchilarimiz fikri'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg text-center max-w-xl">
                        {t('reviews.subtitle') || 'O’quvchilarimiz tomonidan qoldirilgan samimiy izohlar'}
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <Swiper
                        slidesPerView={1}
                        spaceBetween={20}
                        pagination={{ clickable: true }}
                        modules={[Pagination, Autoplay]}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        breakpoints={{
                            768: { slidesPerView: 2, spaceBetween: 30 },
                            1024: { slidesPerView: 3, spaceBetween: 30 },
                        }}
                        className="pb-16"
                    >
                        {comments.map((message, index) => (
                            <SwiperSlide key={message.id || index}>
                                <div className="h-full flex flex-col justify-between bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group">
                                    <div>
                                        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                                            <i className="fas fa-quote-left text-blue-600 group-hover:text-white text-xl"></i>
                                        </div>
                                        <p className="mb-8 text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed">
                                            "{message.text}"
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {message.image ? (
                                            <img src={`${API_URL}/${message.image}`} alt={message.name} className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-white dark:border-gray-800 flex-shrink-0" />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                                                {message.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{message.name}</h4>
                                            <p className="text-sm text-blue-500 font-medium">{message.job}</p>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                        {comments.length === 0 && (
                            <div className="text-center py-20 text-gray-400">Hozircha izohlar mavjud emas.</div>
                        )}
                    </Swiper>
                )}
            </div>
        </div>
    );
};

export default Komment;
