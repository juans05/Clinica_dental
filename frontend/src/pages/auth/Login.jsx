import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Lock, Mail, Loader2, Play } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-sky-50">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row m-4">

                {/* Left Side - Hero/Brand */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-cyan-600 to-blue-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Stethoscope size={32} />
                            </div>
                            <h1 className="text-2xl font-bold tracking-wide">Dental SGD</h1>
                        </div>
                        <h2 className="text-4xl font-bold mb-4 leading-tight">Software de Gestión Dental Profesional</h2>
                        <p className="text-cyan-100 text-lg">Optimice su consultorio y mejore la experiencia de sus pacientes.</p>
                    </div>

                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-12 -right-12 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl"></div>

                    <div className="relative z-10 mt-12 text-sm text-cyan-200">
                        © 2026 Dental SGD System.
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido</h2>
                        <p className="text-gray-500">Ingrese sus credenciales para acceder</p>
                        {/* Quick Fill for Demo */}
                        <button
                            onClick={() => { setEmail('admin@dental.com'); setPassword('admin123') }}
                            className="mt-2 text-xs text-blue-500 hover:underline flex items-center justify-center w-full gap-1"
                            title="Solo para desarrollo"
                        >
                            <Play size={10} /> Autocompletar Admin
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center animate-pulse">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                    placeholder="ejemplo@dental.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-gray-600">Recordarme</label>
                            </div>
                            <a href="#" className="font-medium text-cyan-600 hover:text-cyan-500">¿Olvidaste tu contraseña?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
