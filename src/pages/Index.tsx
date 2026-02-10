import { useState } from 'react';
import { PatientProvider, usePatient } from '@/contexts/PatientContext';
import Sidebar from '@/components/emr/Sidebar';
import Dashboard from '@/components/emr/Dashboard';
import ModuleView from '@/components/emr/ModuleView';
import { MODULES } from '@/lib/modules';

function AppContent() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const { currentPatient } = usePatient();

  const currentModuleDef = MODULES.find(m => m.key === activeModule);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeModule={activeModule} onSelectModule={setActiveModule} />
      <main className="flex-1 overflow-auto">
        {activeModule === 'dashboard' || !currentModuleDef ? (
          <Dashboard onNavigate={setActiveModule} />
        ) : currentPatient && currentModuleDef ? (
          <ModuleView module={currentModuleDef} patientId={currentPatient.id} />
        ) : (
          <Dashboard onNavigate={setActiveModule} />
        )}
      </main>
    </div>
  );
}

export default function Index() {
  return (
    <PatientProvider>
      <AppContent />
    </PatientProvider>
  );
}
