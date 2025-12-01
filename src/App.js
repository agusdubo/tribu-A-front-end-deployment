import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
// ========================================
// PAGINAS COMPARTIDAS
// ========================================
import LoginPage from './pages/LoginPage';
import SelectorModulosPage from './pages/SelectorModulosPage';

// ========================================
// MÓDULO FINANZAS
// ========================================
import Dashboard from './pages/Dashboard';
import CostosPage from './pages/CostosPage';
import ReportesPage from './pages/ReportesPage';

// ========================================
// MÓDULO CARGA DE HORAS - MANAGER
// ========================================
import TimeEntryDashboard from './pages/TimeEntryDashboard';
import ApproveHours from './pages/ApproveHours';
import ReportsHome from './pages/ReportsHome';
import WeeklyHoursResourceSelection from './pages/WeeklyHoursResourceSelection';
import ResourceWeeklyHoursReport from './pages/ResourceWeeklyHoursReport';
import ProjectCostSelection from './pages/ProjectCostSelection';
import ProjectCostReport from './pages/ProjectCostReport';

// ========================================
// MÓDULO CARGA DE HORAS - DEVELOPER
// ========================================
import ProjectSelection from './pages/ProjectSelection';
import HourEntry from './pages/HourEntry';
import MyHours from './pages/MyHours';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          {/* Flujo de Entrada */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/modulos" element={<SelectorModulosPage />} />
          
          {/* Módulo Finanzas */}
          <Route path="/finanzas/dashboard" element={<Dashboard />} />
          <Route path="/finanzas/costos" element={<CostosPage />} />
          <Route path="/finanzas/reportes" element={<ReportesPage />} />

          {/* Modulo Carga de Horas */}
          <Route path="/manager/home-carga-horas" element={<TimeEntryDashboard />} />
          <Route path="/manager/aprobar-horas" element={<ApproveHours />} />
          <Route path="/manager/reportes" element={<ReportsHome />} />
          
          <Route path="/manager/reportes/horas-semanales" element={<WeeklyHoursResourceSelection />} />
          <Route path="/manager/reportes/reporte-recurso" element={<ResourceWeeklyHoursReport />} />
          <Route path="/manager/reportes/costos-proyecto" element={<ProjectCostSelection />} />
          <Route path="/manager/reportes/reporte-costos" element={<ProjectCostReport />} />

          <Route path="/desarrollador/seleccion-proyectos" element={<ProjectSelection />} />
          <Route path="/desarrollador/carga-horas" element={<HourEntry />} />
          <Route path="/desarrollador/mis-horas" element={<MyHours />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;