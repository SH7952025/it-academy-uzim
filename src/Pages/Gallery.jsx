import React, { useState, useEffect } from 'react';
import { API, API_URL } from '../config/api';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/gallery`)
            .then(res => res.json())
            .then(data => {
                setImages(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 md:py-24 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12 md:mb-16">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">Galereya</h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        O'quv markazimizdagi tadbirlardan va dars jarayonlaridan eng yaxshi lahzalar.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[4/3] bg-white dark:bg-gray-900 rounded-2xl animate-pulse border dark:border-gray-800"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((img) => (
                            <div key={img.id} className="relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 aspect-[4/3]">
                                <img 
                                    src={`${API_URL}/${img.image}`} 
                                    alt={img.caption || 'Academy Event'}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                    <p className="text-white text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        {img.caption || 'Tadbirdan lavha'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && images.length === 0 && (
                    <div className="text-center py-20">
                        <i className="fas fa-images text-5xl text-gray-200 mb-4 block"></i>
                        <p className="text-gray-500">Hozircha rasmlar yuklanmagan</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;
