import React, { useState, useEffect } from 'react';
import { IncidentType, IncidentStatus, Incident } from '../types';
import { saveIncident } from '../services/storageService';
import { sendReportToN8n } from '../services/n8nService';
import { Flame, Ambulance, Car, MoreHorizontal, Camera, MapPin, Loader2, CheckCircle2, RefreshCw, Navigation, ArrowLeft } from 'lucide-react';

const CitizenReportView: React.FC = () => {
  const [step, setStep] = useState<'TYPE' | 'DETAILS' | 'SUCCESS'>('TYPE');
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Function to fetch location
  const fetchLocation = () => {
    if (navigator.geolocation) {
      setLocLoading(true);
      setLocation(null); // Reset to show loading state clearly
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Add a small artificial delay to show the "Finding..." animation which reassures users it's working
          setTimeout(() => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLocLoading(false);
          }, 800);
        },
        (err) => {
          console.error("GPS Error", err);
          setLocLoading(false);
          alert("ไม่สามารถระบุพิกัดได้ กรุณาเปิด GPS และอนุญาตให้เข้าถึงตำแหน่ง");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("อุปกรณ์ของท่านไม่รองรับการระบุพิกัด");
    }
  };

  // Auto-fetch on component mount
  useEffect(() => {
    fetchLocation();
  }, []);

  const handleTypeSelect = (type: IncidentType) => {
    setSelectedType(type);
    setStep('DETAILS');
    // Re-verify location when moving to details step
    if (!location && !locLoading) {
      fetchLocation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !location) return;

    setSubmitting(true);

    // Simulate image processing
    let imageBase64 = undefined;
    if (imageFile) {
      imageBase64 = "simulated_image_data"; 
    }

    const newIncident: Incident = {
      id: `INC-${Date.now().toString().slice(-6)}`,
      type: selectedType,
      reporterName: name,
      reporterPhone: phone,
      description: description,
      image: imageBase64,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: 'พิกัด GPS อัตโนมัติ'
      },
      status: IncidentStatus.PENDING,
      timestamp: Date.now()
    };

    // 1. Send to n8n (Fire and forget, or wait if critical)
    // We don't await strictly to keep UI fast, or we can await to ensure it reached server
    sendReportToN8n(newIncident).catch(err => console.error("N8N Error", err));

    // 2. Simulate local network delay and save locally
    await new Promise(r => setTimeout(r, 1500));
    saveIncident(newIncident);
    
    setSubmitting(false);
    setStep('SUCCESS');
  };

  const getIcon = (type: IncidentType) => {
    switch (type) {
      case IncidentType.FIRE: return <Flame size={32} />;
      case IncidentType.MEDICAL: return <Ambulance size={32} />;
      case IncidentType.ACCIDENT: return <Car size={32} />;
      default: return <MoreHorizontal size={32} />;
    }
  };

  if (step === 'SUCCESS') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-green-50 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">รับแจ้งเหตุแล้ว</h2>
        <p className="text-green-700 mb-8">
          ระบบได้ส่งข้อมูลไปยังศูนย์วิทยุ อบต.หนองทุ่ม แล้ว <br/>เจ้าหน้าที่กำลังตรวจสอบ
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full max-w-sm bg-green-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-green-700 transition-colors"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  if (step === 'DETAILS') {
    return (
      <div className="h-full bg-white flex flex-col">
        <header className="bg-slate-100 p-4 border-b flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setStep('TYPE')} className="text-slate-500 text-sm hover:underline flex items-center gap-1">
            <ArrowLeft size={16} /> ย้อนกลับ
          </button>
          <h2 className="font-bold text-lg text-slate-800 flex-1 text-center pr-10">รายละเอียด</h2>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
          
          {/* Selected Type Badge */}
          <div className={`p-4 rounded-xl flex items-center gap-4 text-white shadow-md
            ${selectedType === IncidentType.FIRE ? 'bg-red-500' : 
              selectedType === IncidentType.MEDICAL ? 'bg-blue-500' : 
              selectedType === IncidentType.ACCIDENT ? 'bg-orange-500' : 'bg-gray-500'}`}>
            {selectedType && getIcon(selectedType)}
            <div>
              <p className="text-sm opacity-90">ประเภทเหตุ</p>
              <h3 className="text-xl font-bold">
                {selectedType === IncidentType.FIRE && 'เพลิงไหม้'}
                {selectedType === IncidentType.MEDICAL && 'เจ็บป่วยฉุกเฉิน'}
                {selectedType === IncidentType.ACCIDENT && 'อุบัติเหตุ'}
                {selectedType === IncidentType.OTHER && 'อื่นๆ'}
              </h3>
            </div>
          </div>

          {/* Location - Enhanced UI */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Navigation size={18} className="text-blue-600" /> 
              ตำแหน่งของคุณ (GPS)
            </label>
            
            <div className={`relative p-4 rounded-xl border-2 transition-all duration-300
              ${locLoading ? 'bg-gray-50 border-gray-200' : 
                location ? 'bg-blue-50 border-blue-400' : 'bg-red-50 border-red-200'}`}>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {locLoading ? (
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                  ) : location ? (
                    <div className="bg-blue-500 text-white p-2 rounded-full">
                      <MapPin size={20} />
                    </div>
                  ) : (
                    <MapPin className="text-red-400" size={24} />
                  )}
                  
                  <div>
                    {locLoading ? (
                      <span className="text-gray-500 font-medium">กำลังค้นหาตำแหน่ง...</span>
                    ) : location ? (
                      <div>
                         <span className="text-blue-900 font-bold block">ระบุพิกัดสำเร็จ</span>
                         <span className="text-blue-700 text-xs font-mono">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                      </div>
                    ) : (
                      <span className="text-red-600 font-medium">ไม่พบสัญญาณ GPS</span>
                    )}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={fetchLocation}
                  disabled={locLoading}
                  className="px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 active:scale-95 transition-all"
                >
                  {locLoading ? '...' : <RefreshCw size={18} />}
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 flex items-center gap-1 pl-1">
              {location ? <CheckCircle2 size={12} className="text-green-500" /> : null}
              {location ? 'ระบบดึงพิกัดจากมือถืออัตโนมัติ' : 'กรุณาอนุญาตให้เข้าถึงตำแหน่ง หรือกดปุ่มรีเฟรช'}
            </p>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Camera size={18} className="text-gray-500" /> รูปถ่าย (ถ้ามี)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative group">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {imageFile ? (
                 <div className="text-green-600 font-medium flex flex-col items-center">
                    <CheckCircle2 size={32} className="mb-2" />
                    <span>แนบรูปภาพแล้ว</span>
                    <span className="text-xs text-gray-400 mt-1">{imageFile.name}</span>
                 </div>
              ) : (
                 <div className="text-gray-400 flex flex-col items-center pointer-events-none">
                    <Camera size={32} className="mb-2" />
                    <span className="text-sm">แตะเพื่อถ่ายรูป หรือเลือกรูปภาพ</span>
                 </div>
              )}
            </div>
          </div>

          {/* Details & Contact */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">รายละเอียดเพิ่มเติม</label>
              <textarea 
                required
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                placeholder="อธิบายลักษณะเหตุการณ์..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">ชื่อผู้แจ้ง</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1"
                  placeholder="ชื่อ-สกุล"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">เบอร์โทร</label>
                <input 
                  type="tel" 
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1"
                  placeholder="0xx-xxxxxxx"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
        </form>

        <div className="p-4 bg-white border-t fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button 
            onClick={handleSubmit}
            disabled={submitting || !location}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex justify-center items-center gap-2 transition-all
              ${submitting || !location ? 'bg-slate-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'}`}
          >
            {submitting ? <><Loader2 className="animate-spin" /> กำลังส่งข้อมูล...</> : 
             !location ? 'รอพิกัด GPS...' : 'แจ้งเหตุทันที'}
          </button>
        </div>
      </div>
    );
  }

  // Initial Step: Type Selection (No Changes needed here mostly, just keeping imports consistent if any)
  return (
    <div className="h-full bg-slate-50 p-6 flex flex-col items-center">
      <div className="mb-6 mt-4 text-center">
         <h1 className="text-2xl font-bold text-slate-800">แจ้งเหตุฉุกเฉิน</h1>
         <p className="text-slate-500">เลือกประเภทเหตุการณ์ที่ต้องการแจ้ง</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <button 
          onClick={() => handleTypeSelect(IncidentType.FIRE)}
          className="aspect-square bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-red-500 p-4 flex flex-col items-center justify-center gap-3 transition-all group active:scale-95"
        >
          <div className="bg-red-100 p-4 rounded-full group-hover:bg-red-200 text-red-600 transition-colors">
            <Flame size={40} />
          </div>
          <span className="font-bold text-slate-700 text-lg">เพลิงไหม้</span>
        </button>

        <button 
          onClick={() => handleTypeSelect(IncidentType.MEDICAL)}
          className="aspect-square bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-500 p-4 flex flex-col items-center justify-center gap-3 transition-all group active:scale-95"
        >
          <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-200 text-blue-600 transition-colors">
            <Ambulance size={40} />
          </div>
          <span className="font-bold text-slate-700 text-lg">กู้ชีพ/ป่วย</span>
        </button>

        <button 
          onClick={() => handleTypeSelect(IncidentType.ACCIDENT)}
          className="aspect-square bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-orange-500 p-4 flex flex-col items-center justify-center gap-3 transition-all group active:scale-95"
        >
          <div className="bg-orange-100 p-4 rounded-full group-hover:bg-orange-200 text-orange-600 transition-colors">
            <Car size={40} />
          </div>
          <span className="font-bold text-slate-700 text-lg">อุบัติเหตุ</span>
        </button>

        <button 
          onClick={() => handleTypeSelect(IncidentType.OTHER)}
          className="aspect-square bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-gray-500 p-4 flex flex-col items-center justify-center gap-3 transition-all group active:scale-95"
        >
          <div className="bg-gray-100 p-4 rounded-full group-hover:bg-gray-200 text-gray-600 transition-colors">
            <MoreHorizontal size={40} />
          </div>
          <span className="font-bold text-slate-700 text-lg">อื่นๆ</span>
        </button>
      </div>

      <div className="mt-auto mb-4 w-full max-w-md">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-green-100 p-2 rounded-full text-green-600">
               <Navigation size={24} />
            </div>
            <div>
               <h4 className="font-bold text-slate-700 text-sm">พิกัด GPS อัตโนมัติ</h4>
               <p className="text-xs text-slate-400">ระบบจะระบุตำแหน่งของคุณทันทีที่กดเลือกประเภทเหตุ</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CitizenReportView;