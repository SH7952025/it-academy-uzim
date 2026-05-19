import React, { useState, useEffect } from "react";
import img from "../assets/headerBG.png";
import { useTranslation } from "react-i18next";
import { API, API_URL } from "../config/api";
import { Link } from "react-router-dom";

const Kurslar = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("all");

  useEffect(() => {
    fetch(`${API}/courses`)
      .then(res => res.json())
      .then(data => {
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const categories = [
    { key: "all", label: t('courses.all') },
    { key: "Frontend", label: "Frontend" },
    { key: "Backend", label: "Backend" },
    { key: "Full Stack", label: "Full Stack" },
    { key: "Dizayn", label: "Dizayn" },
    { key: "Mobil", label: "Mobil" },
    { key: "Sun'iy intellekt", label: "Sun'iy intellekt" },
    { key: "Boshqalar", label: "Boshqalar" },
  ];

  const filteredCards = selected === "all" ? courses : courses.filter(c => c.category?.trim().toLowerCase() === selected.toLowerCase());

  return (
    <section className="w-full py-16 md:py-24 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Title Section */}
        <div className="flex flex-col gap-4 items-center text-center mb-10 md:mb-16">
          <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold rounded-full uppercase tracking-wider">
            {t('courses.badge') || 'Katalog'}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
            {t('courses.title')}
          </h2>
        </div>

        {/* Filter Buttons */}
        <div className="flex overflow-x-auto pb-6 md:pb-0 md:flex-wrap md:justify-center gap-3 mb-12 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelected(cat.key)}
              className={`whitespace-nowrap px-6 py-2 rounded-xl border text-sm font-bold transition-all duration-300 ${
                selected === cat.key
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-blue-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 🚨 STRIKT GRID SYSTEM - 100% EQUAL WIDTHS 🚨 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
            {loading ? (
                [1,2,3].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-[32px] aspect-[4/5] animate-pulse border dark:border-gray-800"></div>
                ))
            ) : (
                filteredCards.map((card) => (
                    <Link 
                      to={`/course/${card.id}`}
                      key={card.id}
                      className="flex flex-col h-full w-full bg-[#111827] rounded-[32px] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-800 hover:-translate-y-2 group"
                      style={{ minWidth: 0 }}
                    >
                        {/* 🖼️ Fixed Aspect Ratio Image Container */}
                        <div className="relative w-full aspect-[16/9] bg-gray-800 overflow-hidden">
                            <img
                                src={card.image ? `${API_URL}/${card.image}` : img}
                                alt={card.title}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest z-10">
                                {card.category}
                            </div>
                        </div>

                        {/* 📝 Content Area - Fixed Height for alignment */}
                        <div className="p-6 md:p-8 flex flex-col flex-1">
                            <h3 className="text-lg md:text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-blue-500 transition-colors h-7 md:h-8">
                                {card.title}
                            </h3>
                            <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-6 min-h-[40px]">
                                {card.description}
                            </p>
                            
                            {/* 💳 Bottom Info - Always Aligned */}
                            <div className="mt-auto pt-5 border-t border-gray-800 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Kurs narxi:</span>
                                    <span className="text-lg font-black text-blue-500">
                                        {card.price}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500 text-[10px] sm:text-xs bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                                    <i className="far fa-play-circle text-blue-500"></i>
                                    <span>{card.lessonsCount || 0} dars</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))
            )}
        </div>

        {filteredCards.length === 0 && !loading && (
          <div className="text-center py-24 bg-gray-900/50 rounded-[32px] border border-dashed border-gray-800">
            <i className="fas fa-search text-4xl text-gray-700 mb-4 block"></i>
            <p className="text-gray-500 text-lg font-medium">Bu kategoriyada kurslar topilmadi</p>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </section>
  );
};

export default Kurslar;
