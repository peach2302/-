import { Incident, IncidentStatus, IncidentType } from '../types';

const STORAGE_KEY = 'nongthum_incidents';

// Helper to generate fake data if empty
const seedData = (): Incident[] => {
  return [
    {
      id: 'INC-170523-01',
      type: IncidentType.FIRE,
      reporterName: 'สมชาย ใจดี',
      reporterPhone: '081-234-5678',
      description: 'ไฟไหม้หญ้าข้างทาง ลุกลามใกล้บ้านเรือนประชาชน ควันเยอะมาก',
      location: { lat: 16.432, lng: 102.823, address: 'หมู่ 3 บ้านหนองทุ่ม' },
      status: IncidentStatus.PENDING,
      timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
    },
    {
      id: 'INC-170523-02',
      type: IncidentType.MEDICAL,
      reporterName: 'ป้าแมว',
      reporterPhone: '089-999-8888',
      description: 'ผู้สูงอายุหกล้ม ศีรษะแตก เลือดไหลไม่หยุด รู้สึกตัวดี',
      location: { lat: 16.435, lng: 102.825, address: 'ซอย 5 หน้าวัด' },
      status: IncidentStatus.IN_PROGRESS,
      timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    }
  ];
};

export const getIncidents = (): Incident[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const initial = seedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

export const saveIncident = (incident: Incident): void => {
  const current = getIncidents();
  const updated = [incident, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const updateIncidentStatus = (id: string, status: IncidentStatus, officerNotes?: string, aiSummary?: string): void => {
  const current = getIncidents();
  const updated = current.map(inc => {
    if (inc.id === id) {
      return { 
        ...inc, 
        status, 
        officerNotes: officerNotes || inc.officerNotes,
        aiSummary: aiSummary || inc.aiSummary
      };
    }
    return inc;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getStats = (): { total: number; pending: number; active: number; closed: number } => {
  const incidents = getIncidents();
  return {
    total: incidents.length,
    pending: incidents.filter(i => i.status === IncidentStatus.PENDING).length,
    active: incidents.filter(i => i.status === IncidentStatus.IN_PROGRESS).length,
    closed: incidents.filter(i => i.status === IncidentStatus.CLOSED).length,
  };
};