import React, { useState, useEffect } from 'react';
import { API, getAdminToken } from '../../config/api';

const StudentsAdmin = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [enrollData, setEnrollData] = useState({ courseId: '' });
    const [studentEnrollments, setStudentEnrollments] = useState([]);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const token = getAdminToken();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API}/users?role=student`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setStudents(await res.json());
            else setStudents([]);

            const coursesRes = await fetch(`${API}/courses`);
            if (coursesRes.ok) setCourses(await coursesRes.json());
        } catch (error) { console.error('Fetch error:', error); }
        finally { setLoading(false); }
    };

    const fetchStudentEnrollments = async (userId) => {
        const res = await fetch(`${API}/enrollments?userId=${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setStudentEnrollments(await res.json());
    };

    const handleOpenModal = (student) => {
        setSelectedStudent(student);
        fetchStudentEnrollments(student.id);
        setShowEnrollModal(true);
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/enrollments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ userId: selectedStudent.id, courseId: enrollData.courseId })
            });
            if (res.ok) {
                fetchStudentEnrollments(selectedStudent.id);
                setEnrollData({ courseId: '' });
                setMessage('✅ Kursga qo\'shildi');
                setTimeout(() => setMessage(''), 3000);
            } else {
                const err = await res.json().catch(() => ({}));
                setMessage('❌ ' + (err.message || 'Xatolik'));
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            setMessage('❌ Server bilan aloqa yo\'q');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDeleteEnrollment = async (id) => {
        if (!window.confirm("Talabani ushbu kursdan o'chirishni tasdiqlaysizmi?")) return;
        try {
            const res = await fetch(`${API}/enrollments/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (res.ok) {
                fetchStudentEnrollments(selectedStudent.id);
                setMessage('✅ Talaba kursdan muvaffaqiyatli o\'chirildi');
                setTimeout(() => setMessage(''), 3000);
            } else {
                const errData = await res.json().catch(() => ({}));
                setMessage('❌ O\'chirishda xatolik: ' + (errData.message || 'Server xatosi'));
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Delete enrollment error:', error);
            setMessage('❌ Server bilan aloqa yo\'q');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm("DIQQAT! Ushbu talabani butunlay o'chirmoqchimisiz?\n\nBu harakat uning barcha kurslarini va qurilmalardagi (sessiya) ruxsatlarini ham tozalab tashlaydi. Bu jarayonni ortga qaytarib bo'lmaydi!")) return;
        
        try {
            const res = await fetch(`${API}/users/${studentId}`, {
                method: 'DELETE', 
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Talaba muvaffaqiyatli o'chirildi.");
                fetchData(); // Ro'yxatni yangilash
            } else {
                alert("O'chirishda xatolik yuz berdi.");
            }
        } catch (error) {
            alert("Server bilan aloqa yo'q.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/users/${selectedStudent.id}/reset-password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newPassword })
            });
            if (res.ok) {
                alert(`Talaba (${selectedStudent.fullName}) paroli yangilandi. Barcha qurilmalardan chiqarib yuborildi.`);
                setShowResetModal(false);
                setNewPassword('');
            } else {
                const data = await res.json();
                alert(data.message || "Xatolik yuz berdi");
            }
        } catch (err) {
            alert("Server bilan aloqa yo'q");
        }
    };

    const filteredStudents = students.filter(s => 
        (s.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.phone || '').includes(searchQuery)
    );

    return (
        <div className="text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 sm:mb-8">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold">Talabalar ro'yxati</h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Ro'yxatdan o'tgan talabalar va ularning kurslari</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input 
                            type="text" 
                            placeholder="Ism yoki raqam bo'yicha izlash..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-800/80 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <i className="fas fa-search absolute left-3.5 top-3.5 text-gray-400 text-sm"></i>
                    </div>
                    <span className="bg-green-600/20 border border-green-600/30 text-green-400 text-xs sm:text-sm px-4 py-2.5 rounded-xl font-bold whitespace-nowrap hidden sm:block">
                        {filteredStudents.length} ta natija
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="p-10 sm:p-20 text-center text-gray-500">
                    <i className="fas fa-spinner fa-spin text-2xl mb-3 block"></i>Yuklanmoqda...
                </div>
            ) : (
                <>
                    {/* Mobile Cards */}
                    <div className="block sm:hidden space-y-3">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {student.fullName?.charAt(0) || '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-semibold text-sm truncate">{student.fullName}</p>
                                        <p className="text-gray-400 text-xs font-mono">{student.phone}</p>
                                        <p className="text-blue-400 text-[10px] mt-1">Login: {student.username}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleOpenModal(student)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold transition-all">
                                        <i className="fas fa-graduation-cap mr-1"></i>Kurslar
                                    </button>
                                    <button onClick={() => { setSelectedStudent(student); setShowResetModal(true); }}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg text-xs font-bold transition-all">
                                        <i className="fas fa-key"></i>
                                    </button>
                                    <button onClick={() => handleDeleteStudent(student.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="p-4 text-gray-400 font-medium text-sm">Ism Sharif</th>
                                    <th className="p-4 text-gray-400 font-medium text-sm">Telefon</th>
                                    <th className="p-4 text-gray-400 font-medium text-sm">Login (Username)</th>
                                    <th className="p-4 text-gray-400 font-medium text-right text-sm">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                        <td className="p-4 font-semibold text-sm">{student.fullName}</td>
                                        <td className="p-4 text-gray-400 text-sm font-mono">{student.phone}</td>
                                        <td className="p-4 text-blue-400 text-sm font-semibold">{student.username}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(student)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all">
                                                    Kurslar
                                                </button>
                                                <button onClick={() => { setSelectedStudent(student); setShowResetModal(true); }}
                                                    className="bg-yellow-600 hover:bg-yellow-700 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                                    title="Parolni yangilash">
                                                    <i className="fas fa-key text-xs"></i>
                                                </button>
                                                <button onClick={() => handleDeleteStudent(student.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                                    title="Talabani butunlay o'chirish">
                                                    <i className="fas fa-trash text-sm"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-16 text-gray-600">
                            <i className="fas fa-user-graduate text-4xl mb-3 block"></i>
                            Hali talabalar yo'q
                        </div>
                    )}
                </>
            )}

            {/* Enroll Modal */}
            {showEnrollModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 w-full sm:max-w-lg overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-base sm:text-xl font-bold">{selectedStudent?.fullName}</h3>
                                <p className="text-gray-500 text-xs font-mono">{selectedStudent?.phone}</p>
                            </div>
                            <button onClick={() => setShowEnrollModal(false)} className="text-gray-500 hover:text-white w-10 h-10 flex items-center justify-center">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        {message && (
                            <div className={`mb-4 p-3 rounded-xl text-xs border ${message.startsWith('✅') ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}>
                                {message}
                            </div>
                        )}
                        
                        <div className="mb-6 sm:mb-8">
                            <h4 className="text-xs font-bold text-gray-400 mb-3 sm:mb-4 uppercase tracking-wider">A'zo bo'lgan kurslari:</h4>
                            <div className="space-y-2 sm:space-y-3">
                                {studentEnrollments.length === 0 && <p className="text-gray-500 text-xs sm:text-sm italic">Hali hech qanday kursga a'zo emas</p>}
                                {studentEnrollments.map(en => {
                                    const joinedDate = new Date(en.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' });
                                    const lastActiveDate = new Date(en.updatedAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                    const isCompleted = en.status === 'completed';
                                    
                                    return (
                                        <div key={en.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-700 gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-white truncate">{en.Course?.title || 'Noma\'lum kurs'}</span>
                                                    {isCompleted && <i className="fas fa-check-circle text-green-500 text-xs" title="Tugallangan"></i>}
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] sm:text-xs text-gray-400 font-mono">
                                                    <span title="Kursga qo'shilgan sana"><i className="far fa-calendar-alt text-blue-400 mr-1"></i> Boshladi: {joinedDate}</span>
                                                    <span title="So'nggi bor faol bo'lgan yoki tugatgan vaqt"><i className="far fa-clock text-green-400 mr-1"></i> So'nggi faollik: {lastActiveDate}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteEnrollment(en.id)}
                                                className="text-red-500 hover:bg-red-500/10 hover:text-red-400 py-1.5 px-3 rounded-lg border border-red-500/20 hover:border-red-500/50 transition-all flex-shrink-0 text-xs font-bold self-end sm:self-center"
                                                title="Talabani kursdan chetlatish">
                                                <i className="fas fa-user-minus mr-1.5"></i> Kursdan o'chirish
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <form onSubmit={handleEnroll} className="border-t border-gray-800 pt-4 sm:pt-6">
                            <h4 className="text-xs font-bold text-gray-400 mb-3 sm:mb-4 uppercase tracking-wider">Yangi kursga qo'shish:</h4>
                            <div className="flex gap-2 sm:gap-3">
                                <select className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white text-xs sm:text-sm"
                                    value={enrollData.courseId} onChange={(e) => setEnrollData({ courseId: e.target.value })} required>
                                    <option value="">Kursni tanlang...</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/20">
                                    Qo'shish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Parolni yangilash</h3>
                            <button onClick={() => setShowResetModal(false)} className="text-gray-500 hover:text-white">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <p className="text-sm text-gray-400">
                                Ism: <span className="text-white font-bold">{selectedStudent?.fullName}</span>
                            </p>
                            <p className="text-sm text-gray-400">
                                Login (Username): <span className="text-blue-400 font-bold bg-blue-400/10 px-2 py-1 rounded">{selectedStudent?.username}</span>
                            </p>
                            <p className="text-sm text-gray-400">
                                Telefon: <span className="text-gray-200 font-mono">{selectedStudent?.phone}</span>
                            </p>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-4 pt-4 border-t border-gray-800">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Yangi Parol</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                                    placeholder="Yangi parol..."
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    minLength="6"
                                />
                            </div>
                            <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-yellow-600/20">
                                Parolni o'zgartirish
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsAdmin;
