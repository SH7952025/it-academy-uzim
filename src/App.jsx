import { useState, useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom";
import Main from "./components/main"
import ContactForm from "./Pages/Contact"
import Courses from "./Pages/Courses"
import News from "./Pages/News";
import Gallery from "./Pages/Gallery";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

// Admin
import Login from "./Pages/Admin/Login";
import Dashboard from "./Pages/Admin/Dashboard";
import CoursesAdmin from "./Pages/Admin/CoursesAdmin";
import ContactsAdmin from "./Pages/Admin/ContactsAdmin";
import MentorsAdmin from "./Pages/Admin/MentorsAdmin";
import ReviewsAdmin from "./Pages/Admin/ReviewsAdmin";
import GeneralSettings from "./Pages/Admin/GeneralSettings";
import HeroSettings from "./Pages/Admin/HeroSettings";
import StudentsAdmin from "./Pages/Admin/StudentsAdmin";
import NewsAdmin from "./Pages/Admin/NewsAdmin";
import GalleryAdmin from "./Pages/Admin/GalleryAdmin";
import SocialsAdmin from "./Pages/Admin/SocialsAdmin";
import SecurityAdmin from "./Pages/Admin/SecurityAdmin";
import LogoSettings from "./Pages/Admin/LogoSettings";

// User Auth
import UserLogin from "./Pages/Auth/Login";
import UserRegister from "./Pages/Auth/Register";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword";

// Student
import StudentDashboard from "./Pages/Student/Dashboard";
import CoursePlayer from "./Pages/Student/CoursePlayer";

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const isCoursePlayer = location.pathname.startsWith("/course/");
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {!isAdminPath && !isCoursePlayer && <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/Courses" element={<Courses />} />
        <Route path="/news" element={<News />} />
        <Route path="/gallery" element={<Gallery />} />
        
        {/* User Auth Routes */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Student Routes */}
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/course/:id" element={<CoursePlayer />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />}>
            <Route index element={<div className="p-10 bg-white dark:bg-gray-800 rounded shadow text-xl font-bold text-gray-700 dark:text-white">IT Academy Boshqaruv Paneliga Xush Kelibsiz!</div>} />
            <Route path="courses" element={<CoursesAdmin />} />
            <Route path="contacts" element={<ContactsAdmin />} />
            <Route path="mentors" element={<MentorsAdmin />} />
            <Route path="reviews" element={<ReviewsAdmin />} />
            <Route path="settings" element={<GeneralSettings />} />
            <Route path="hero" element={<HeroSettings />} />
            <Route path="socials" element={<SocialsAdmin />} />
            <Route path="students" element={<StudentsAdmin />} />
            <Route path="news" element={<NewsAdmin />} />
            <Route path="gallery" element={<GalleryAdmin />} />
            <Route path="security" element={<SecurityAdmin />} />
            <Route path="logo" element={<LogoSettings />} />
        </Route>
      </Routes>
      {!isAdminPath && !isCoursePlayer && <Footer />}
    </div>
  )
}

export default App
