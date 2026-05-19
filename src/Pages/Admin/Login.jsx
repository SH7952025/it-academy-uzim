import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DynamicLogo from '../../components/DynamicLogo';
import { API } from '../../config/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (res.ok) {
                if (data.user?.role !== 'admin') {
                    setError('Sizda admin huquqi yo\'q');
                    setLoading(false);
                    return;
                }
                localStorage.removeItem('token'); // Student tokenini o'chirish
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/admin/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Server bilan aloqa yo\'q');
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
            <div className="bg-gray-900 p-6 sm:p-8 rounded-[28px] shadow-2xl w-full max-w-[400px] border border-gray-800">
                <div className="text-center mb-8">
                   <div className="flex justify-center mb-3">
                       <DynamicLogo size={52} />
                   </div>
                   <h2 className="text-white text-xl font-bold mt-2">Admin Panel</h2>
                   <p className="text-gray-500 text-sm mt-1">Boshqaruv paneliga kirish</p>
                </div>
                {error && (
                    <div className="p-3 mb-4 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-sm text-center">
                        <i className="fas fa-exclamation-circle mr-2"></i>{error}
                    </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">Login</label>
                        <div className="relative">
                            <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Admin username"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-400">Parol</label>
                            <Link to="/forgot-password" className="text-xs font-semibold text-blue-500 hover:underline">
                                Parolni unutdingizmi?
                            </Link>
                        </div>
                        <div className="relative">
                            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full pl-11 pr-12 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <><i className="fas fa-spinner fa-spin mr-2"></i>Kirish...</>
                        ) : (
                            <><i className="fas fa-sign-in-alt mr-2"></i>Kirish</>
                        )}
                    </button>
                </form>
                <p className="text-center text-gray-600 text-[10px] mt-6">
                    <i className="fas fa-shield-alt mr-1"></i>
                    Xavfsiz ulanish • SSL himoyasi
                </p>
            </div>
        </div>
    );
};

export default Login;
