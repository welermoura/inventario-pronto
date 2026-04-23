import React, { useState, useRef, useEffect } from 'react';
import { useBranding } from '../BrandingContext';
import { Palette, Type, ImagePlus, RotateCcw, Check, Upload, X, Package, Save } from 'lucide-react';

const PRESET_COLORS = [
    { name: 'Azul', value: '#2563eb' },
    { name: 'Índigo', value: '#4f46e5' },
    { name: 'Violeta', value: '#7c3aed' },
    { name: 'Rosa', value: '#db2777' },
    { name: 'Vermelho', value: '#dc2626' },
    { name: 'Laranja', value: '#ea580c' },
    { name: 'Âmbar', value: '#d97706' },
    { name: 'Verde', value: '#16a34a' },
    { name: 'Teal', value: '#0d9488' },
    { name: 'Ciano', value: '#0891b2' },
    { name: 'Cinza', value: '#475569' },
    { name: 'Preto', value: '#1e293b' },
];

const BrandingSettings: React.FC = () => {
    const { branding, updateBranding, resetBranding, isLoading } = useBranding();
    
    // Local state for "draft" changes
    const [appName, setAppName] = useState(branding.appName);
    const [logoUrl, setLogoUrl] = useState(branding.logoUrl);
    const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
    
    const [isSaving, setIsSaving] = useState(false);
    const [savedIndicator, setSavedIndicator] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync draft when global branding loads/changes (e.g. from server)
    useEffect(() => {
        setAppName(branding.appName);
        setLogoUrl(branding.logoUrl);
        setPrimaryColor(branding.primaryColor);
    }, [branding]);

    const showSaved = () => {
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 3000);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            await updateBranding({
                appName: appName.trim() || 'Inventário',
                logoUrl: logoUrl,
                primaryColor: primaryColor
            });
            showSaved();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Falha ao salvar configurações. Verifique se você tem permissão de administrador.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setLogoUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleReset = async () => {
        if (window.confirm('Resetar todas as personalizações para o padrão?')) {
            await resetBranding();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const hasChanges = appName !== branding.appName || 
                      logoUrl !== branding.logoUrl || 
                      primaryColor !== branding.primaryColor;

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in p-1 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Personalização</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Customize a aparência da aplicação globalmente</p>
                </div>
                {savedIndicator && (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-medium transition-all animate-in fade-in slide-in-from-top-2">
                        <Check size={16} />
                        Alterações salvas!
                    </div>
                )}
            </div>

            {/* App Name */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                        <Type size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-800 dark:text-white">Nome da Aplicação</h2>
                        <p className="text-sm text-slate-500">Aparece no menu lateral e na aba do navegador</p>
                    </div>
                </div>
                <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    maxLength={30}
                    placeholder="Nome do sistema..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>

            {/* Logo */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/30">
                        <ImagePlus size={20} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-800 dark:text-white">Logotipo</h2>
                        <p className="text-sm text-slate-500">PNG, JPG ou SVG. Recomendado: 64x64px</p>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="min-w-[48px] min-h-[48px] flex items-center justify-center shrink-0">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="Logo Preview"
                                style={{ maxHeight: '64px', maxWidth: '128px', width: 'auto', height: 'auto' }}
                                className="object-contain drop-shadow-sm"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50">
                                <Upload size={22} className="text-slate-300" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Upload size={16} />
                            Fazer upload
                        </button>
                        {logoUrl && (
                            <button
                                onClick={handleRemoveLogo}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-100 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <X size={16} />
                                Remover logo
                            </button>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                    />
                </div>
            </div>

            {/* Color */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                        <Palette size={20} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-800 dark:text-white">Cor Principal</h2>
                        <p className="text-sm text-slate-500">Aplicada no menu lateral e botões de ação</p>
                    </div>
                </div>

                <div className="grid grid-cols-6 gap-3">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c.value}
                            title={c.name}
                            onClick={() => setPrimaryColor(c.value)}
                            className="relative w-full aspect-square rounded-xl transition-transform hover:scale-110 active:scale-95"
                            style={{ backgroundColor: c.value }}
                        >
                            {primaryColor === c.value && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <Check size={18} className="text-white drop-shadow-md" />
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Cor personalizada:</label>
                    <div className="relative">
                        <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-600 bg-transparent"
                        />
                    </div>
                    <span className="text-sm text-slate-500 font-mono">{primaryColor}</span>
                </div>
            </div>

            {/* Preview Badge */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Pré-visualização (Rascunho)</h2>
                <div
                    className="flex items-center gap-3 p-4 rounded-xl w-fit shadow-md transition-colors duration-500"
                    style={{ backgroundColor: primaryColor }}
                >
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt="Logo"
                            style={{ maxHeight: '36px', maxWidth: '90px', width: 'auto', height: 'auto' }}
                            className="object-contain drop-shadow-sm"
                        />
                    ) : (
                        <Package size={24} className="text-white shrink-0" />
                    )}
                    <span className="font-bold text-lg text-white">
                        {appName || branding.appName}
                    </span>
                </div>
                <p className="text-xs text-slate-400 mt-3">* Esta é uma prévia das alterações não salvas.</p>
            </div>

            {/* Save Floating Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 animate-in slide-in-from-bottom-4">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition-all"
                >
                    <RotateCcw size={16} />
                    Resetar
                </button>
                <button
                    onClick={handleSaveAll}
                    disabled={!hasChanges || isSaving}
                    style={{ backgroundColor: hasChanges ? primaryColor : '#94a3b8' }}
                    className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100`}
                >
                    {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save size={18} />
                    )}
                    {isSaving ? 'Salvando...' : 'Salvar Todas as Alterações'}
                </button>
            </div>
        </div>
    );
};

export default BrandingSettings;
