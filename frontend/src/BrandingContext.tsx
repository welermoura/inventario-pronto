import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

interface BrandingConfig {
    appName: string;
    logoUrl: string | null;
    primaryColor: string;
    primaryColorHover: string;
}

interface BrandingContextType {
    branding: BrandingConfig;
    updateBranding: (updates: Partial<BrandingConfig>) => Promise<void>;
    resetBranding: () => Promise<void>;
    isLoading: boolean;
}

const DEFAULT_BRANDING: BrandingConfig = {
    appName: 'Inventário',
    logoUrl: null,
    primaryColor: '#2563eb', // blue-600
    primaryColorHover: '#1d4ed8', // blue-700
};

const STORAGE_KEY = 'app_branding';

const BrandingContext = createContext<BrandingContextType | null>(null);

const hexToHoverColor = (hex: string): string => {
    // Darken the hex color by ~10% for hover state
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - 30);
    const g = Math.max(0, ((num >> 8) & 0xff) - 30);
    const b = Math.max(0, (num & 0xff) - 30);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const applyBrandingToDOM = (branding: BrandingConfig) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', branding.primaryColor);
    root.style.setProperty('--primary-color-hover', branding.primaryColorHover);
    document.title = branding.appName;

    // Update favicon dynamically
    const updateFavicon = (src: string) => {
        let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = src;
    };

    if (branding.logoUrl) {
        updateFavicon(branding.logoUrl);
    } else {
        // Generate a colored square favicon from the primary color
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, 32, 32);
            ctx.fillStyle = branding.primaryColor;
            ctx.beginPath();
            ctx.roundRect(0, 0, 32, 32, 8);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(branding.appName.charAt(0).toUpperCase(), 16, 17);
        }
        updateFavicon(canvas.toDataURL());
    }
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [branding, setBranding] = useState<BrandingConfig>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...DEFAULT_BRANDING, ...parsed };
            }
        } catch {
            // ignore
        }
        return DEFAULT_BRANDING;
    });

    // Fetch branding from API on mount
    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const response = await api.get('/branding/');
                const data = response.data;
                const config: BrandingConfig = {
                    appName: data.app_name,
                    logoUrl: data.logo_url,
                    primaryColor: data.primary_color,
                    primaryColorHover: data.primary_color_hover || hexToHoverColor(data.primary_color),
                };
                setBranding(config);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
            } catch (error) {
                console.error('Failed to fetch branding:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBranding();
    }, []);

    useEffect(() => {
        applyBrandingToDOM(branding);
    }, [branding]);

    const updateBranding = async (updates: Partial<BrandingConfig>) => {
        // Optimistic update
        setBranding(prev => {
            const next = { ...prev, ...updates };
            if (updates.primaryColor && !updates.primaryColorHover) {
                next.primaryColorHover = hexToHoverColor(updates.primaryColor);
            }
            return next;
        });

        // Persist to API
        try {
            const payload: any = {};
            if (updates.appName !== undefined) payload.app_name = updates.appName;
            if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl;
            if (updates.primaryColor !== undefined) {
                payload.primary_color = updates.primaryColor;
                payload.primary_color_hover = hexToHoverColor(updates.primaryColor);
            }

            const response = await api.patch('/branding/', payload);
            const data = response.data;
            
            const confirmed: BrandingConfig = {
                appName: data.app_name,
                logoUrl: data.logo_url,
                primaryColor: data.primary_color,
                primaryColorHover: data.primary_color_hover,
            };
            
            setBranding(confirmed);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(confirmed));
        } catch (error) {
            console.error('Failed to update branding:', error);
            // Revert on error? Or just log. 
            // In most cases, if patch fails, it's because user is not admin.
        }
    };

    const resetBranding = async () => {
        if (window.confirm('Resetar todas as personalizações para o padrão?')) {
            await updateBranding(DEFAULT_BRANDING);
        }
    };

    return (
        <BrandingContext.Provider value={{ branding, updateBranding, resetBranding, isLoading }}>
            {children}
        </BrandingContext.Provider>
    );
};

export const useBranding = (): BrandingContextType => {
    const ctx = useContext(BrandingContext);
    if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
    return ctx;
};
