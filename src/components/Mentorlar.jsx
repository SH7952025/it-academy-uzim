import React, { useState, useEffect } from 'react';
import mentorimg from "../assets/mentor.png";
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import { API, API_URL } from '../config/api';

const Mentors = () => {
    const { t } = useTranslation();
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/mentors`)
            .then(res => res.json())
            .then(data => {
                setMentors(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const SOCIAL_ICONS = {
        telegram: 'fab fa-telegram',
        instagram: 'fab fa-instagram',
        facebook: 'fab fa-facebook',
        linkedin: 'fab fa-linkedin',
        github: 'fab fa-github'
    };

    return (
        <section className="w-full bg-white dark:bg-gray-900 transition-colors duration-300 py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col items-center gap-4 mb-12 md:mb-16">
                    <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold rounded-full uppercase tracking-wider">
                        Team
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-center text-gray-900 dark:text-white leading-tight">
                        {t('mentors.title')}
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1,2,4,4].map(i => <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse"></div>)}
                    </div>
                ) : (
                    <Swiper
                        slidesPerView={1}
                        spaceBetween={20}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        modules={[Pagination, Autoplay]}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 2, spaceBetween: 24 },
                            1024: { slidesPerView: 3, spaceBetween: 30 },
                            1280: { slidesPerView: 4, spaceBetween: 30 },
                        }}
                        className="mySwiper pb-16 px-1"
                    >
                        {mentors.map((mentor, index) => (
                            <SwiperSlide key={mentor.id || index}>
                                <div className="group relative rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 h-full">
                                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800 w-full">
                                        <img
                                            src={mentor.image ? `${API_URL}/${mentor.image}` : mentorimg}
                                            alt={mentor.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-90 md:opacity-0 group-hover:opacity-95 transition-opacity duration-500"></div>
                                        
                                        <div className="absolute bottom-0 left-0 w-full p-6 text-white transform md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <h4 className="text-xl font-bold mb-1 truncate">{mentor.name}</h4>
                                            <span className="text-blue-400 text-sm font-semibold block mb-4 uppercase tracking-wider line-clamp-1">{mentor.speciality}</span>
                                            
                                            <div className="flex gap-3 mt-4">
                                                {Object.entries(SOCIAL_ICONS).map(([key, icon]) => (
                                                    mentor[key] && (
                                                        <a 
                                                            key={key}
                                                            href={mentor[key]} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="w-9 h-9 bg-white/10 hover:bg-blue-600 backdrop-blur-md rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                                                        >
                                                            <i className={`${icon} text-sm`}></i>
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>
        </section>
    );
};

export default Mentors;
