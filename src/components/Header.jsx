import headerBG from "../assets/headerBG.png";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { API, API_URL } from "../config/api";

const Header = () => {
  const { t } = useTranslation();
  // Synchronously initialize from cache to prevent any skeleton flash or flickering on first mount!
  const [heroImage, setHeroImage] = useState(() => {
    return sessionStorage.getItem('hero_image') || null;
  });
  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem('hero_image');
  });

  useEffect(() => {
    const cached = sessionStorage.getItem('hero_image');
    if (cached) {
      setHeroImage(cached);
      setLoading(false);
    } else {
      fetch(`${API}/settings`)
        .then(res => res.json())
        .then(data => {
          if (data.hero_image) {
            const fullUrl = `${API_URL}${data.hero_image}`;
            setHeroImage(fullUrl);
            sessionStorage.setItem('hero_image', fullUrl);
          } else {
            setHeroImage(headerBG);
            sessionStorage.setItem('hero_image', headerBG);
          }
          setLoading(false);
        })
        .catch(() => {
          setHeroImage(headerBG);
          setLoading(false);
        });
    }
  }, []);

  return (
    <header className="w-full bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-screen-xl mx-auto px-4 py-10 lg:py-20 flex flex-col lg:flex-row justify-between items-center gap-10">
        {/* Matn qismi */}
        <div className="lg:w-1/2 flex flex-col gap-6 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight dark:text-white">
            <span className="bg-gradient-to-r from-[#615DFF] to-[#EE452A] bg-clip-text text-transparent">
              {t('hero.title1')}
            </span>{" "}
            {t('hero.title2')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <Link to="/Courses">
            <button className="self-center lg:self-start px-6 py-3 bg-blue-600 text-white rounded-full text-sm sm:text-base font-medium hover:bg-blue-700 transition">
              {t('hero.cta')}
            </button>
          </Link>
        </div>

        {/* Rasm qismi */}
        <div className="lg:w-1/2 w-full flex items-center justify-center min-h-[300px]">
          {loading ? (
            <div className="w-full aspect-[16/10] rounded-3xl bg-gray-100 dark:bg-gray-900 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
            </div>
          ) : (
            <img
              src={heroImage}
              alt="IT kurslar banneri"
              className="w-full h-auto object-contain rounded-2xl"
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
