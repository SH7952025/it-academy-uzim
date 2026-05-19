import React, { useState, useEffect } from 'react';
import { API, getAdminToken } from '../../config/api';

const ContactsAdmin = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selected, setSelected] = useState(null);
    const token = getAdminToken();

    const fetchContacts = async () => {
        try {
            const res = await fetch(`${API}/contacts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setContacts(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchContacts(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Bu lidni o'chirishni tasdiqlaysizmi?")) return;
        const res = await fetch(`${API}/contacts/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setMessage('Lid o\'chirildi');
            setTimeout(() => setMessage(''), 3000);
            setSelected(null);
            fetchContacts();
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return {
            date: d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }),
            time: d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
            relative: getRelativeTime(d),
        };
    };

    const getRelativeTime = (date) => {
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Hozir';
        if (mins < 60) return `${mins} daq oldin`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} soat oldin`;
        const days = Math.floor(hours / 24);
        return `${days} kun oldin`;
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Lidlar / Contacts</h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Foydalanuvchilardan kelgan xabarlar</p>
                </div>
                <span className="bg-blue-600/20 border border-blue-600/30 text-blue-400 text-xs sm:text-sm px-3 py-1 rounded-full font-medium self-start sm:self-auto">
                    {contacts.length} ta lid
                </span>
            </div>

            {message && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-700 text-green-400 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                    <i className="fas fa-check-circle"></i> {message}
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse"></div>)}
                </div>
            ) : (
                <>
                    {/* Mobile: Stacked list | Desktop: Split view */}
                    <div className="block lg:hidden space-y-3">
                        {contacts.length === 0 ? (
                            <div className="text-center py-16 text-gray-600">
                                <i className="fas fa-inbox text-4xl mb-3 block"></i>
                                Hozircha xabar yo'q
                            </div>
                        ) : contacts.map(contact => {
                            const { relative } = formatDate(contact.createdAt);
                            return (
                                <div key={contact.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-white font-semibold text-sm">{contact.name}</h3>
                                            <p className="text-gray-400 text-xs font-mono mt-0.5">{contact.phone}</p>
                                        </div>
                                        <span className="text-gray-500 text-[10px]">{relative}</span>
                                    </div>
                                    <p className="text-gray-400 text-xs mb-3">{contact.message}</p>
                                    <div className="flex gap-2">
                                        <a href={`tel:${contact.phone}`} className="flex-1 py-2 bg-green-600/20 text-green-400 rounded-lg text-xs text-center font-medium">
                                            <i className="fas fa-phone-alt mr-1"></i>Qo'ng'iroq
                                        </a>
                                        <a href={`https://t.me/${contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-xs text-center font-medium">
                                            <i className="fab fa-telegram mr-1"></i>Telegram
                                        </a>
                                        <button onClick={() => handleDelete(contact.id)} className="py-2 px-3 bg-red-600/20 text-red-400 rounded-lg text-xs font-medium">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop: Split view */}
                    <div className="hidden lg:flex gap-5 h-[calc(100vh-280px)]">
                        <div className="w-80 flex-shrink-0 overflow-y-auto space-y-2 pr-1">
                            {contacts.length === 0 ? (
                                <div className="text-center py-16 text-gray-600">
                                    <i className="fas fa-inbox text-4xl mb-3 block"></i>Hozircha xabar yo'q
                                </div>
                            ) : contacts.map(contact => {
                                const { relative } = formatDate(contact.createdAt);
                                return (
                                    <button key={contact.id} onClick={() => setSelected(contact)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                                            selected?.id === contact.id
                                                ? 'bg-blue-600/20 border-blue-600/50'
                                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                        }`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-white font-semibold text-sm truncate">{contact.name}</span>
                                            <span className="text-gray-500 text-[10px] flex-shrink-0 ml-2">{relative}</span>
                                        </div>
                                        <p className="text-gray-400 text-xs font-mono">{contact.phone}</p>
                                        <p className="text-gray-500 text-xs mt-1 truncate">{contact.message}</p>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {selected ? (() => {
                                const { date, time } = formatDate(selected.createdAt);
                                return (
                                    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                                                <p className="text-gray-400 text-sm mt-1 font-mono">{selected.phone}</p>
                                            </div>
                                            <button onClick={() => handleDelete(selected.id)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 border border-red-700/50 text-red-400 hover:bg-red-900/50 rounded-lg text-sm transition-colors">
                                                <i className="fas fa-trash text-xs"></i>O'chirish
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
                                                <p className="text-gray-500 text-xs mb-1"><i className="fas fa-calendar-alt mr-1"></i>Sana</p>
                                                <p className="text-white text-sm font-semibold">{date}</p>
                                            </div>
                                            <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
                                                <p className="text-gray-500 text-xs mb-1"><i className="fas fa-clock mr-1"></i>Vaqt</p>
                                                <p className="text-white text-sm font-semibold">{time}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
                                            <p className="text-gray-500 text-xs mb-3 uppercase tracking-wider font-semibold">Xabar matni</p>
                                            <p className="text-gray-200 leading-relaxed">{selected.message}</p>
                                        </div>
                                        <div className="flex gap-3 mt-5">
                                            <a href={`tel:${selected.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600/20 border border-green-600/40 text-green-400 rounded-xl text-sm font-medium transition-colors">
                                                <i className="fas fa-phone-alt text-xs"></i>Qo'ng'iroq
                                            </a>
                                            <a href={`https://t.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600/20 border border-blue-600/40 text-blue-400 rounded-xl text-sm font-medium transition-colors">
                                                <i className="fab fa-telegram text-xs"></i>Telegram
                                            </a>
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div className="flex items-center justify-center h-full text-gray-600">
                                    <div className="text-center">
                                        <i className="fas fa-hand-pointer text-4xl mb-3 block"></i>
                                        <p>Chap tomondagi lidni tanlang</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ContactsAdmin;
