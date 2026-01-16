import { Incident, IncidentStatus } from '../types';

// ---------------------------------------------------------
// ⚙️ CONFIGURATION: ใส่ n8n Webhook URL ของคุณที่นี่
// ---------------------------------------------------------
const N8N_CONFIG = {
  // Webhook สำหรับรับแจ้งเหตุใหม่ (Method: POST)
  REPORT_WEBHOOK: 'https://primary.n8n.cloud/webhook/YOUR-UNIQUE-ID/report',
  
  // Webhook สำหรับอัปเดตสถานะงาน (Method: POST)
  UPDATE_WEBHOOK: 'https://primary.n8n.cloud/webhook/YOUR-UNIQUE-ID/update-status',
};

export const sendReportToN8n = async (incident: Incident) => {
  try {
    console.log("🚀 Sending report to n8n...", incident);
    
    // In a real scenario, use fetch:
    /*
    const response = await fetch(N8N_CONFIG.REPORT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident)
    });
    if (!response.ok) throw new Error('n8n response not ok');
    */

    // For demo purposes, we just log it because the URL is fake
    console.log(`✅ Sent to ${N8N_CONFIG.REPORT_WEBHOOK}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send to n8n:", error);
    return false;
  }
};

export const updateStatusToN8n = async (id: string, status: IncidentStatus, notes?: string, aiSummary?: string) => {
  try {
    console.log("🚀 Updating status to n8n...", { id, status });
    
    /*
    const response = await fetch(N8N_CONFIG.UPDATE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        status,
        officerNotes: notes,
        aiSummary: aiSummary,
        timestamp: Date.now()
      })
    });
    if (!response.ok) throw new Error('n8n response not ok');
    */

    console.log(`✅ Update sent to ${N8N_CONFIG.UPDATE_WEBHOOK}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to update n8n:", error);
    return false;
  }
};