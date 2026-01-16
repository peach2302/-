import { GoogleGenAI } from "@google/genai";
import { Incident } from "../types";

// In a real n8n workflow, this would be a node in the n8n pipeline.
// Here we call it directly from the client for the demo.
export const analyzeIncident = async (incident: Incident): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found");
    return "ไม่สามารถเชื่อมต่อ AI ได้ (No API Key)";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const prompt = `
    คุณคือผู้ช่วยเจ้าหน้าที่กู้ภัย อบต.หนองทุ่ม
    วิเคราะห์ข้อมูลเหตุการณ์ต่อไปนี้ และสรุปสั้นๆ (ไม่เกิน 3 บรรทัด) สำหรับเจ้าหน้าที่วิทยุสื่อสาร
    
    ข้อมูลเหตุ:
    ประเภท: ${incident.type}
    รายละเอียด: ${incident.description}
    สถานที่: ${incident.location.address || 'ไม่ระบุ'}
    
    สิ่งที่ต้องการ:
    1. ระดับความรุนแรง (ต่ำ/กลาง/สูง/วิกฤต)
    2. อุปกรณ์ที่ควรเตรียม
    3. ข้อควรระวังพิเศษ
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "ไม่สามารถวิเคราะห์ข้อมูลได้";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อ AI";
  }
};