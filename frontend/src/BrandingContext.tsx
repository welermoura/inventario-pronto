import React, { createContext, useContext, useState, useEffect } from 'react';

interface BrandingConfig {
    appName: string;
    logoUrl: string | null;
    primaryColor: string;
    primaryColorHover: string;
}

interface BrandingContextType {
    branding: BrandingConfig;
    updateBranding: (updates: Partial<BrandingConfig>) => void;
    resetBranding: () => void;
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

    useEffect(() => {
        applyBrandingToDOM(branding);
    }, [branding]);

    const updateBranding = (updates: Partial<BrandingConfig>) => {
        setBranding(prev => {
            const next = { ...prev, ...updates };
            // Auto-compute hover color when primary changes
            if (updates.primaryColor && !updates.primaryColorHover) {
                next.primaryColorHover = hexToHoverColor(updates.primaryColor);
            }
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {
                // ignore
            }
            return next;
        });
    };

    const resetBranding = () => {
        localStorage.removeItem(STORAGE_KEY);
        setBranding(DEFAULT_BRANDING);
    };

    return (
        <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
            {children}
        </BrandingContext.Provider>
    );
};

export const useBranding = (): BrandingContextType => {
    const ctx = useContext(BrandingContext);
    if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
    return ctx;
};
