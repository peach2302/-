import React, { useState, useEffect } from 'react';
import { getIncidents, updateIncidentStatus, getStats } from '../services/storageService';
import { analyzeIncident } from '../services/geminiService';
import { updateStatusToN8n } from '../services/n8nService';
import { Incident, IncidentStatus, IncidentType, DashboardStats } from '../types';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  BellRing, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Search,
  BrainCircuit,
  Loader2,
  RefreshCcw,
  Navigation,
  ArrowLeft
} from 'lucide-react';

const OfficerDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'MAP'>('LIST');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, active: 0, closed: 0 });
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const refreshData = () => {
    setIncidents(getIncidents());
    setStats(getStats());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = (id: string, newStatus: IncidentStatus) => {
    // 1. Update Local Storage
    updateIncidentStatus(id, newStatus);
    
    // 2. Trigger N8N Webhook (Async)
    updateStatusToN8n(id, newStatus).catch(err => console.error("N8N Update Error", err));

    refreshData();
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleAIAnalysis = async (incident: Incident) => {
    setAnalyzing(true);
    const summary = await analyzeIncident(incident);
    updateIncidentStatus(incident.id, incident.status, undefined, summary);
    
    // Also send AI summary to N8N if needed
    updateStatusToN8n(incident.id, incident.status, undefined, summary).catch(err => console.error("N8N AI Update Error", err));

    setAnalyzing(false);
    refreshData();
    if (selectedIncident && selectedIncident.id === incident.id) {
      setSelectedIncident(prev => prev ? { ...prev, aiSummary: summary } : null);
    }
  };

  return (
    <div className="h-full flex bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full p-0.5 overflow-hidden">
              <img src="https://placehold.co/100x100/1e3a8a/ffffff?text=SAO" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">ศูนย์สั่งการ</h1>
            <p className="text-[10px] text-slate-400">อบต.หนองทุ่ม</p>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('LIST')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'LIST' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} /> ภาพรวมเหตุการณ์
          </button>
          <button 
            onClick={() => setActiveTab('MAP')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'MAP' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <MapIcon size={20} /> แผนที่พิกัด
          </button>
        </nav>
        <div className="mt-auto p-4 border-t border-slate-700">
          <div className="bg-slate-800 rounded-lg p-3">
             <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">System Status</h4>
             <div className="flex items-center gap-2 text-xs text-green-400 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>n8n Controller: Connected</span>
             </div>
             <div className="flex items-center gap-2 text-xs text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>LINE Webhook: Active</span>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">
              {activeTab === 'LIST' ? 'รายการแจ้งเหตุล่าสุด' : 'แผนที่จุดเกิดเหตุ'}
            </h2>
            <button onClick={refreshData} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full" title="Refresh">
               <RefreshCcw size={18} />
            </button>
          </div>
          <div className="flex gap-4 text-sm">
             <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-100">
               <BellRing size={14} /> รอรับเรื่อง: {stats.pending}
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
               <Clock size={14} /> กำลังดำเนินการ: {stats.active}
             </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* List View */}
          <div className={`${selectedIncident ? 'hidden lg:block lg:w-1/2' : 'w-full'} flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 border-r border-gray-200`}>
             {incidents.length === 0 ? (
               <div className="text-center py-20 text-gray-400">
                 <p>ยังไม่มีการแจ้งเหตุ</p>
               </div>
             ) : (
               incidents.map((incident) => (
                 <div 
                   key={incident.id}
                   onClick={() => setSelectedIncident(incident)}
                   className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-all
                     ${selectedIncident?.id === incident.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}
                   `}
                 >
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold
                          ${incident.type === IncidentType.FIRE ? 'bg-red-100 text-red-700' : 
                            incident.type === IncidentType.MEDICAL ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'}
                        `}>
                          {incident.type}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(incident.timestamp).toLocaleTimeString('th-TH')}</span>
                     </div>
                     <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1
                       ${incident.status === IncidentStatus.PENDING ? 'bg-red-50 text-red-600 animate-pulse' : 
                         incident.status === IncidentStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-600' : 
                         'bg-gray-100 text-gray-500'}
                     `}>
                       {incident.status === IncidentStatus.PENDING && <BellRing size={12}/>}
                       {incident.status === IncidentStatus.PENDING ? 'รอรับเรื่อง' : 
                        incident.status === IncidentStatus.IN_PROGRESS ? 'กำลังดำเนินการ' : 'ปิดงานแล้ว'}
                     </span>
                   </div>
                   <h3 className="font-semibold text-slate-800 line-clamp-1">{incident.description}</h3>
                   <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                     <MapIcon size={14}/> {incident.location.address}
                   </p>
                 </div>
               ))
             )}
          </div>

          {/* Detail View / Panel */}
          {selectedIncident && (
            <div className="w-full lg:w-1/2 bg-white flex flex-col h-full overflow-y-auto absolute lg:relative z-20 top-0 left-0 lg:top-auto lg:left-auto">
              {/* Detail Header */}
              <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
                <button onClick={() => setSelectedIncident(null)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded flex items-center gap-1">
                  <ArrowLeft size={18} /> กลับ
                </button>
                <h3 className="font-bold text-lg">รหัสเหตุ: {selectedIncident.id}</h3>
                <div className="flex gap-2">
                  {selectedIncident.status === IncidentStatus.PENDING && (
                    <button 
                      onClick={() => handleStatusChange(selectedIncident.id, IncidentStatus.IN_PROGRESS)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                    >
                      รับแจ้งเหตุ
                    </button>
                  )}
                  {selectedIncident.status === IncidentStatus.IN_PROGRESS && (
                     <button 
                     onClick={() => handleStatusChange(selectedIncident.id, IncidentStatus.CLOSED)}
                     className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-2 shadow-sm"
                   >
                     <CheckCircle size={16} /> ปิดงาน
                   </button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                
                {/* AI Analysis Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                      <BrainCircuit size={18} className="text-indigo-600" /> 
                      AI วิเคราะห์เบื้องต้น
                    </h4>
                    {!selectedIncident.aiSummary && (
                      <button 
                        onClick={() => handleAIAnalysis(selectedIncident)}
                        disabled={analyzing}
                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {analyzing ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ข้อมูล'}
                      </button>
                    )}
                  </div>
                  
                  {analyzing ? (
                     <div className="flex items-center gap-2 text-indigo-600 text-sm py-4 justify-center">
                        <Loader2 className="animate-spin" /> กำลังประมวลผลข้อมูลผ่าน Gemini...
                     </div>
                  ) : selectedIncident.aiSummary ? (
                    <div className="text-sm text-indigo-800 bg-white/60 p-3 rounded-lg border border-indigo-100 leading-relaxed whitespace-pre-line">
                      {selectedIncident.aiSummary}
                    </div>
                  ) : (
                    <p className="text-xs text-indigo-400">กดปุ่มเพื่อใช้ AI ประเมินสถานการณ์และแนะนำการเตรียมพร้อม</p>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">ผู้แจ้ง</h4>
                    <p className="text-base text-gray-900">{selectedIncident.reporterName}</p>
                    <a href={`tel:${selectedIncident.reporterPhone}`} className="text-blue-600 text-sm hover:underline block mt-1">
                      {selectedIncident.reporterPhone}
                    </a>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">เวลาแจ้ง</h4>
                    <p className="text-base text-gray-900">{new Date(selectedIncident.timestamp).toLocaleString('th-TH')}</p>
                  </div>
                </div>

                <div>
                   <h4 className="text-sm font-semibold text-gray-500 mb-2">รายละเอียด</h4>
                   <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                     {selectedIncident.description}
                   </div>
                </div>

                <div>
                   <h4 className="text-sm font-semibold text-gray-500 mb-2">ตำแหน่งที่ตั้ง</h4>
                   <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-800">
                        <MapIcon size={18} />
                        <span className="text-sm">{selectedIncident.location.lat.toFixed(6)}, {selectedIncident.location.lng.toFixed(6)}</span>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedIncident.location.lat},${selectedIncident.location.lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded-md hover:bg-orange-700 flex items-center gap-1"
                      >
                        <Navigation size={12} /> นำทาง
                      </a>
                   </div>
                </div>

                {/* Mock Image Display */}
                {selectedIncident.image && (
                   <div>
                     <h4 className="text-sm font-semibold text-gray-500 mb-2">รูปภาพประกอบ</h4>
                     <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden">
                        {/* Placeholder for demo since we don't have real uploaded images in local storage easily */}
                        <img src={`https://placehold.co/600x400/e2e8f0/64748b?text=Incident+Image`} alt="Incident" className="w-full h-full object-cover opacity-50" />
                     </div>
                   </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OfficerDashboardView;