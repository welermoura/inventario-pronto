
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api';
import { useAuth } from '../AuthContext';
import { useBranding } from '../BrandingContext';
import { useNavigate } from 'react-router-dom';
import { Package, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const { branding } = useBranding();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await api.get('/setup-status', { timeout: 3000 });
                if (!response.data.is_setup) {
                    navigate('/setup');
                }
            } catch (error) {
                console.log("Check status failed");
            }
        };
        checkStatus();
    }, [navigate]);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('username', data.email);
            formData.append('password', data.password);

            const response = await api.post('/token', formData);
            login(response.data.access_token);
            navigate('/');
        } catch (err: any) {
            if (!err.response) {
                setError('Erro de conexão. Verifique o servidor.');
            } else if (err.response.status === 401) {
                setError('E-mail ou senha incorretos.');
            } else {
                setError('Ocorreu um erro ao entrar.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans">
            {/* Left panel - branding */}
            <div
                className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col items-center justify-center p-12 relative overflow-hidden"
                style={{ backgroundColor: branding.primaryColor }}
            >
                {/* Background circles */}
                <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] rounded-full bg-white/10" />
                <div className="absolute bottom-[-15%] left-[-15%] w-[350px] h-[350px] rounded-full bg-black/10" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Logo — no box, free floating */}
                    <div className="mb-6 flex items-center justify-center drop-shadow-xl">
                        {branding.logoUrl ? (
                            <img
                                src={branding.logoUrl}
                                alt="Logo"
                                style={{ maxHeight: '96px', maxWidth: '200px', width: 'auto', height: 'auto' }}
                                className="object-contain"
                            />
                        ) : (
                            <Package className="text-white" size={72} strokeWidth={1.5} />
                        )}
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">{branding.appName}</h1>
                    <p className="text-white/70 text-lg max-w-xs leading-relaxed">
                        Gestão completa do seu patrimônio em um só lugar
                    </p>

                    {/* Decorative card */}
                    <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 w-full max-w-xs text-left">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <Package size={16} className="text-white" />
                            </div>
                            <span className="text-white font-semibold text-sm">Controle total</span>
                        </div>
                        <p className="text-white/60 text-xs leading-relaxed">
                            Inventário, filiais, fornecedores e relatórios centralizados com segurança e rastreabilidade.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right panel - form */}
            <div className="flex-1 flex items-center justify-center bg-slate-50 relative overflow-hidden p-6">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-slate-100 mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-slate-100 mix-blend-multiply" />

                <div className="bg-white p-10 rounded-2xl shadow-sm w-full max-w-md z-10 border border-slate-100">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 overflow-hidden"
                            style={{ backgroundColor: branding.primaryColor }}
                        >
                            {branding.logoUrl ? (
                                <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <Package className="text-white" size={28} />
                            )}
                        </div>
                        <h2 className="text-xl font-bold" style={{ color: branding.primaryColor }}>{branding.appName}</h2>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">Bem-vindo</h2>
                        <p className="text-slate-500 text-sm mt-1">Acesse sua conta para continuar</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2 animate-fade-in">
                            <span className="block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                <input
                                    {...register('email', { required: true })}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    placeholder="seu@email.com"
                                    style={{ ['--tw-ring-color' as any]: `${branding.primaryColor}33` }}
                                />
                            </div>
                            {errors.email && <span className="text-red-500 text-xs ml-1">Campo obrigatório</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    {...register('password', { required: true })}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <span className="text-red-500 text-xs ml-1">Campo obrigatório</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-white py-3.5 rounded-xl font-medium transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-4 hover:opacity-90"
                            style={{ backgroundColor: branding.primaryColor }}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Entrar
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
