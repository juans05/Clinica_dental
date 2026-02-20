import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-cyan-700">Dental SGD Dashboard</h1>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 uppercase">{user?.role}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="p-8">
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Panel Principal</h2>
                    <p className="text-gray-600">
                        Bienvenido al sistema. Su rol actual es <span className="font-bold">{user?.role}</span>.
                    </p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-cyan-50 p-6 rounded-lg border border-cyan-100 text-cyan-800">
                            <h3 className="font-bold text-lg mb-2">Pacientes</h3>
                            <p>Gestionar base de datos</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-blue-800">
                            <h3 className="font-bold text-lg mb-2">Agenda</h3>
                            <p>Ver citas del día</p>
                        </div>
                        <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100 text-emerald-800">
                            <h3 className="font-bold text-lg mb-2">Caja</h3>
                            <p>Registrar ingresos</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
