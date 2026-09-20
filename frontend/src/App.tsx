import React, { useState } from 'react';
import { RoleProvider, useRole } from './context/RoleContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { PatientPortal } from './pages/PatientPortal';
import { HealthWorkerPortal } from './pages/HealthWorkerPortal';
import { FacilityPortal } from './pages/FacilityPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AppointmentsPage } from './pages/AppointmentsPage';

const AppContent: React.FC = () => {
  const { role, setRole } = useRole();
  const [currentView, setCurrentView] = useState<'portal' | 'landing' | 'ai_assistant' | 'appointments'>('portal');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
      <Navbar
        onNavigateLanding={() => setCurrentView('landing')}
        onNavigateView={(view) => setCurrentView(view)}
        currentView={currentView}
      />

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => setCurrentView('ai_assistant')}
            onExploreFacilities={() => {
              setRole('patient');
              setCurrentView('portal');
            }}
          />
        )}

        {currentView === 'ai_assistant' && (
          <AIAssistantPage
            onNavigateAppointments={() => setCurrentView('appointments')}
          />
        )}

        {currentView === 'appointments' && (
          <AppointmentsPage
            onBookNew={() => setCurrentView('ai_assistant')}
          />
        )}

        {currentView === 'portal' && (
          <div>
            {role === 'patient' && <PatientPortal />}
            {role === 'health_worker' && <HealthWorkerPortal />}
            {role === 'facility' && <FacilityPortal />}
            {role === 'admin' && <AdminDashboard />}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <RoleProvider>
      <AppContent />
    </RoleProvider>
  );
}

export default App;
