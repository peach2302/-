import React, { useState } from 'react';
import CitizenReportView from './components/CitizenReportView';
import OfficerDashboardView from './components/OfficerDashboardView';
import OfficerLoginView from './components/OfficerLoginView';
import { AlertTriangle, ShieldCheck, LogOut } from 'lucide-react';

enum AppView {
  CITIZEN_REPORT = 'CITIZEN_REPORT',
  OFFICER_LOGIN = 'OFFICER_LOGIN',
  OFFICER_DASHBOARD = 'OFFICER_DASHBOARD'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CITIZEN_REPORT);

  const navigateToLogin = () => setCurrentView(AppView.OFFICER_LOGIN);
  const navigateToReport = () => setCurrentView(AppView.CITIZEN_REPORT);
  const handleLoginSuccess = () => setCurrentView(AppView.OFFICER_DASHBOARD);
  const handleLogout = () => setCurrentView(AppView.CITIZEN_REPORT);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation */}
      {currentView !== AppView.OFFICER_LOGIN && (
        <nav className="bg-slate-900 text-white p-3 px-4 flex justify-between items-center shadow-md z-50 sticky top-0">
          <div className="flex items-center gap-3" onClick={navigateToReport} role="button">
             {/* Logo in Navbar */}
             <div className="w-10 h-10 bg-white rounded-full p-0.5 flex items-center justify-center overflow-hidden border-2 border-slate-600">
                <img 
                  src="https://placehold.co/100x100/1e3a8a/ffffff?text=SAO" 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-full" 
                />
             </div>
             <div>
               <h1 className="font-bold text-lg leading-tight">อบต.หนองทุ่ม</h1>
               <p className="text-[10px] text-slate-400 font-light">ระบบแจ้งเหตุฉุกเฉิน</p>
             </div>
          </div>
          
          <button 
            onClick={currentView === AppView.CITIZEN_REPORT ? navigateToLogin : handleLogout}
            className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors shadow-sm
              ${currentView === AppView.CITIZEN_REPORT 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                : 'bg-red-900 hover:bg-red-800 text-red-100'}`}
          >
            {currentView === AppView.CITIZEN_REPORT ? (
              <>
                <ShieldCheck size={14} />
                <span> จนท.</span>
              </>
            ) : (
              <>
                <LogOut size={14} />
                <span>ออก</span>
              </>
            )}
          </button>
        </nav>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {currentView === AppView.CITIZEN_REPORT && (
          <CitizenReportView />
        )}
        {currentView === AppView.OFFICER_LOGIN && (
          <OfficerLoginView 
            onLoginSuccess={handleLoginSuccess} 
            onBack={navigateToReport} 
          />
        )}
        {currentView === AppView.OFFICER_DASHBOARD && (
          <OfficerDashboardView />
        )}
      </div>
    </div>
  );
};

export default App;