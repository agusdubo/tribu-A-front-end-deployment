import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Receipt } from 'lucide-react';
import Header from '../components/Header';
import CardModule from '../components/CardModule';

const ReportsHome = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 font-sans">
            <Header
                title="Generar Reportes"
                subtitle="Módulo de Carga de Horas"
                showBack={true}
                backPath="/manager/home-carga-horas"
            />

            <main className="flex-grow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CardModule
                            icon={Users}
                            title="Reporte de Horas Semanales"
                            description="Ver cuántas horas trabajó cada empleado por semana."
                            bgColor="bg-indigo-600"
                            path="/manager/reportes/horas-semanales"
                        />

                        <CardModule
                            icon={Receipt}
                            title="Reporte de Costos por Proyecto"
                            description="Ver cuánto costó cada proyecto (recursos + horas)."
                            bgColor="bg-purple-600"
                            path="/manager/reportes/costos-proyecto"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

// Al final del archivo
export default ReportsHome;