import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import DynamicLogo from "./DynamicLogo"

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const { t, i18n } = useTranslation()

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang)
    }

    const hasToken = !!localStorage.getItem('token');
    const dashboardPath = '/dashboard';

    return (
        <>
            {/* Fixed Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="max-w-[1280px] m-auto px-[15px] flex justify-between items-center py-3">
                    
                    {/* Logo + Nav Links */}
                    <div className="flex gap-8 items-center">
                        <Link to="/" className="flex items-center">
                            <DynamicLogo size={40} />
                        </Link>
                        <ul className="hidden lg:flex gap-1">
                            <li><Link to="/" className="px-3 py-2 text-[15px] font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950">{t('nav.home')}</Link></li>
                            <li><Link to="/Courses" className="px-3 py-2 text-[15px] font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950">{t('nav.courses')}</Link></li>
                            <li><Link to="/news" className="px-3 py-2 text-[15px] font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950">Yangiliklar</Link></li>
                            <li><Link to="/gallery" className="px-3 py-2 text-[15px] font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950">Galereya</Link></li>
                            <li><Link to="/contact" className="px-3 py-2 text-[15px] font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950">{t('nav.contact')}</Link></li>
                        </ul>
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-3">
                        {/* Language Switcher */}
                        <div className="hidden lg:flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                            {['uz', 'en', 'ru'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => changeLanguage(lang)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 uppercase ${
                                        i18n.language === lang || i18n.language.startsWith(lang)
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isDarkMode
                                    ? 'bg-amber-400 text-gray-900 hover:bg-amber-300'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                            title={isDarkMode ? "Yorug' rejim" : "Qorong'u rejim"}
                        >
                            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-sm`}></i>
                        </button>

                        {/* Desktop Login / Cabinet Button */}
                        {hasToken ? (
                            <Link to={dashboardPath} className="hidden lg:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-200 shadow-sm shadow-blue-600/30">
                                <i className="fas fa-th-large text-xs"></i>
                                <span>Kabinet</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="hidden lg:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-200 shadow-sm shadow-blue-600/30">
                                <i className="far fa-user text-xs"></i>
                                <span>Kirish</span>
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="lg:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 px-4 py-4 space-y-1">
                        <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-all">{t('nav.home')}</Link>
                        <Link to="/Courses" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-all">{t('nav.courses')}</Link>
                        <Link to="/news" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-all">Yangiliklar</Link>
                        <Link to="/gallery" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-all">Galereya</Link>
                        <Link to="/contact" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-all">{t('nav.contact')}</Link>
                        
                        {/* Mobile Login / Cabinet Link */}
                        <div className="pt-2 pb-2 border-t border-b dark:border-gray-800">
                            {hasToken ? (
                                <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 transition-all flex items-center gap-2">
                                    <i className="fas fa-th-large text-xs"></i>
                                    <span>Shaxsiy kabinet</span>
                                </Link>
                            ) : (
                                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 transition-all flex items-center gap-2">
                                    <i className="far fa-user text-xs"></i>
                                    <span>Kirish</span>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Language */}
                        <div className="flex gap-2 pt-3">
                            {['uz', 'en', 'ru'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => { changeLanguage(lang); setMenuOpen(false); }}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all uppercase ${
                                        i18n.language === lang || i18n.language.startsWith(lang)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Spacer */}
            <div className="h-[68px]"></div>
        </>
    )
}

export default Navbar
