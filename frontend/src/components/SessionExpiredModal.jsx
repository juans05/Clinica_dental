import { useState, useEffect } from 'react';

const SessionExpiredModal = ({ onContinue }) => {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) { clearInterval(timer); onContinue(); return 0; }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onContinue]);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-rose-500 to-orange-500 p-8 text-white text-center">
                    <div className="text-5xl mb-4">⏱️</div>
                    <h2 className="text-xl font-black">Sesión Expirada</h2>
                    <p className="text-sm text-white/80 mt-2">Tu sesión ha vencido por inactividad o seguridad.</p>
                </div>
                <div className="p-8 text-center space-y-4">
                    <p className="text-slate-500 text-sm font-medium">
                        Serás redirigido al inicio de sesión en
                    </p>
                    <div className="text-5xl font-black text-rose-500">{countdown}</div>
                    <button
                        onClick={onContinue}
                        className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-sm rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-rose-200"
                    >
                        Iniciar Sesión Ahora
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredModal;
