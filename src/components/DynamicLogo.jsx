import React, { useState, useEffect } from 'react';
import { API, API_URL } from '../config/api';
import CrescentLogo from './CrescentLogo';

const DynamicLogo = ({ size = 40, className = "" }) => {
    const [logo, setLogo] = useState(null);

    useEffect(() => {
        // Cache settings in session storage to avoid multiple fetches
        const cached = sessionStorage.getItem('site_logo');
        if (cached) {
            setLogo(cached);
        } else {
            fetch(`${API}/settings`)
                .then(res => res.json())
                .then(data => {
                    if (data.logo) {
                        setLogo(data.logo);
                        sessionStorage.setItem('site_logo', data.logo);
                    }
                })
                .catch(() => {});
        }
    }, []);

    if (logo) {
        return (
            <img 
                src={`${API_URL}${logo}`} 
                alt="Logo" 
                style={{ height: size, width: 'auto' }} 
                className={`object-contain ${className}`} 
            />
        );
    }

    return <CrescentLogo size={size} className={className} />;
};

export default DynamicLogo;
