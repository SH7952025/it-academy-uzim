import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { API } from "../config/api";
import DynamicLogo from "./DynamicLogo";

export default function Footer() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    phone1: "90 123 45 67",
    phone2: "",
    email: "info@it.uz",
    address: "Toshkent sh., Yunusobod tumani",
    telegram: "#",
    instagram: "#",
    facebook: "#",
    youtube: "#"
  });

  useEffect(() => {
    fetch(`${API}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.phone1) setSettings(prev => ({ ...prev, ...data }));
        // Backward compatibility if old phone is there
        if (data.phone && !data.phone1) setSettings(prev => ({ ...prev, phone1: data.phone.replace('+998', '').trim() }));
      })
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  const getSocialUrl = (platform, username) => {
    if (!username || username === "#") return "#";
    if (username.startsWith("http")) return username;
    
    switch(platform) {
      case 'telegram': return `https://t.me/${username}`;
      case 'instagram': return `https://instagram.com/${username}`;
      case 'facebook': return `https://facebook.com/${username}`;
      case 'youtube': return `https://youtube.com/@${username}`;
      default: return "#";
    }
  };

  return (
    <footer className="w-full bg-gray-900 dark:bg-gray-950 text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <DynamicLogo size={38} />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {t('footer.subtitle')}
            </p>
            <div className="flex gap-3">
              <a href={getSocialUrl('telegram', settings.telegram)} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                <i className="fab fa-telegram text-sm"></i>
              </a>
              <a href={getSocialUrl('instagram', settings.instagram)} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                <i className="fab fa-instagram text-sm"></i>
              </a>
              <a href={getSocialUrl('facebook', settings.facebook)} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors duration-200">
                <i className="fab fa-facebook text-sm"></i>
              </a>
              <a href={getSocialUrl('youtube', settings.youtube)} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                <i className="fab fa-youtube text-sm"></i>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{t('nav.courses')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Frontend</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Backend</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Full Stack</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Dizayn</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Mobil</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{t('nav.contact')}</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <i className="fas fa-phone-alt text-blue-500 w-4"></i>
                +998 {settings.phone1}
              </li>
              {settings.phone2 && (
                <li className="flex items-center gap-2">
                  <i className="fas fa-phone-alt text-blue-500 w-4"></i>
                  +998 {settings.phone2}
                </li>
              )}
              <li className="flex items-center gap-2">
                <i className="fas fa-envelope text-blue-500 w-4"></i>
                {settings.email}
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-blue-500 w-4"></i>
                {settings.address}
              </li>
            </ul>
            <Link to="/contact">
              <button className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors duration-200">
                {t('nav.contact')} →
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <p>{t('footer.rights')}</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gray-300 transition-colors">{t('footer.terms')}</a>
            <a href="#" className="hover:text-gray-300 transition-colors">{t('footer.privacy')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

