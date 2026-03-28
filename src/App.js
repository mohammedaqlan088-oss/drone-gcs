import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

function App() {
  const [telemetry, setTelemetry] = useState({ alt: 0, bat: 100, speed: 0 });
  const [status, setStatus] = useState('Disconnected');
  const [client, setClient] = useState(null); // تخزين العميل لاستخدامه في الأزرار

  useEffect(() => {
    // إعداد الاتصال بالسيرفر (استخدام wss للمنفذ الآمن)
    const mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    mqttClient.on('connect', () => {
      setStatus('Connected');
      mqttClient.subscribe('drone/aqlan');
      console.log("Connected to HiveMQ");
    });
    mqttClient.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        setTelemetry(data);
      } catch (e) {
        console.log("Received raw data: ", message.toString());
      }
    });

    mqttClient.on('error', (err) => {
      console.error('Connection error: ', err);
      setStatus('Error');
    });

    setClient(mqttClient); // حفظ العميل في الـ State

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  // دالة إرسال الأوامر للـ ESP32
  const sendAction = (action) => {
    if (client && status === 'Connected') {
      client.publish('drone/commands', action);
      console.log("Sent Command:", action);
      
      // تنبيه بسيط للمستخدم عند الضغط
      alert(`تم إرسال أمر: ${action}`);
    } else {
      alert("عذراً، الجهاز غير متصل بالسيرفر حالياً!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-10">
        <div>
          <h1 className="text-2xl font-black text-blue-500 tracking-tighter italic">SKY-CONTROL GCS v1.0</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Engineering Safety Station</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-500 ${
          status === 'Connected' ? 'bg-green-500/10 text-green-400 border border-green-500/50' : 'bg-red-500/10 text-red-400 border border-red-500/50'
        }`}>
          <span className={`w-2 h-2 rounded-full ${status === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          {status}
        </div>
      </div>
   

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-md hover:border-blue-500/50 transition-colors group">
          <p className="text-slate-500 text-xs font-bold uppercase mb-4 tracking-widest group-hover:text-blue-400">Altitude (loction)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-white leading-none">{telemetry.alt}</span>
            <span className="text-xl font-bold text-blue-500">m</span>
          </div>
        </div>
        
        <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-md hover:border-green-500/50 transition-colors group">
          <p className="text-slate-500 text-xs font-bold uppercase mb-4 tracking-widest group-hover:text-green-400">Battery (البطارية)</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-6xl font-black leading-none ${telemetry.bat < 20 ? 'text-red-500 animate-bounce' : 'text-green-400'}`}>
              {telemetry.bat}
            </span>
            <span className="text-xl font-bold text-slate-600">%</span>
          </div>
        </div>

    
      </div>

      {/* Controls */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => sendAction('ARM')}
          className="group relative overflow-hidden bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-black uppercase transition-all active:scale-95 shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)]"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
             Arm Motors (تشغيل)
          </span>
        </button>

        <button 
          onClick={() => sendAction('LAND')}
          className="group relative overflow-hidden bg-red-600 hover:bg-red-500 py-6 rounded-2xl font-black uppercase transition-all active:scale-95 shadow-[0_20px_50px_rgba(184,_8,_8,_0.2)]"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
             Emergency Land (اطفاء)
          </span>
        </button>
      </div>
      
      <div dir="rtl" className="min-h-screen bg-slate-900 text-white p-10 text-center font-sans">
      <h1 className="text-4xl font-bold text-blue-500 mb-4">
       م /المهندس محمد عقلان
      </h1>
      <p className="text-gray-400"> نظام تحكم عن بعد </p>
      
      <div className="mt-10 p-6 bg-slate-800 rounded-2xl border border-blue-500/30 inline-block">
        <p className="text-xl">الرابط الآن يعمل بنجاح!</p>
      </div>
    </div>
 

      <p className="mt-12 text-center text-[10px] text-slate-600 uppercase tracking-widest">
        Designed by Eng. Mohammed Aqlan | Project Alpha v1
      </p>
    </div>
    
  );
}

export default App;
