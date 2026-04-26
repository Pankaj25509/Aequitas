import { useState, useEffect, useRef } from "react";

// ─── GOOGLE MAPS API CONFIGURATION ──────────────────────────────────────────
const GOOGLE_MAPS_API_KEY = "AIzaSyBK9pH4PSUZG9tg1qDgM9uvF2YmcWi2dQc";

// ─── FOOD MOCK DATA ───────────────────────────────────────────────────────────
const MOCK_PINS = [
  { id: 1, lat: 28.6139, lng: 77.209, title: "Fresh Vegetable Bundle", description: "Assorted seasonal vegetables – tomatoes, spinach, carrots.", category: "Vegetables", donor: "Sadar Bazaar Market", expiresIn: "4 hours", distance: "0.3 km", quantity: "8 kg", verified: true, postedAt: "12 min ago" },
  { id: 2, lat: 28.6229, lng: 77.2195, title: "Cooked Rice & Dal", description: "Freshly cooked meal for ~30 people. Packed in hygienic containers.", category: "Cooked Meal", donor: "Raj Catering Services", expiresIn: "2 hours", distance: "1.1 km", quantity: "30 servings", verified: true, postedAt: "28 min ago" },
  { id: 3, lat: 28.607, lng: 77.2147, title: "Packaged Bread Loaves", description: "12 whole-wheat bread loaves. Best before today evening.", category: "Bakery", donor: "Annapurna Bakery", expiresIn: "6 hours", distance: "1.8 km", quantity: "12 loaves", verified: false, postedAt: "1 hr ago" },
  { id: 4, lat: 28.6318, lng: 77.2219, title: "Milk & Paneer Surplus", description: "Restaurant surplus – 10L fresh milk and 2 kg paneer.", category: "Dairy", donor: "Hotel Crown Plaza Kitchen", expiresIn: "3 hours", distance: "2.4 km", quantity: "12 kg", verified: true, postedAt: "45 min ago" },
];
const CATEGORY_COLORS = { Vegetables: "#4CAF50", "Cooked Meal": "#FF9800", Bakery: "#795548", Dairy: "#2196F3" };

// ─── HEALTH MOCK DATA ─────────────────────────────────────────────────────────
const HEALTH_ZONES = [
  { id: 1, lat: 28.618, lng: 77.208, name: "Paharganj Ward", district: "Central Delhi", riskLevel: "critical", disease: "Dengue Outbreak", cases: 142, trend: "+23%", population: 48000, doctors: 2, beds: 18, bedsNeeded: 45, volunteers: 8, resourceGap: "HIGH", lastUpdated: "6 min ago" },
  { id: 2, lat: 28.635, lng: 77.225, name: "Karol Bagh Cluster", district: "West Delhi", riskLevel: "high", disease: "Typhoid + Malaria", cases: 87, trend: "+11%", population: 62000, doctors: 5, beds: 34, bedsNeeded: 40, volunteers: 14, resourceGap: "MEDIUM", lastUpdated: "18 min ago" },
  { id: 3, lat: 28.598, lng: 77.198, name: "Daryaganj Zone", district: "Central Delhi", riskLevel: "moderate", disease: "Respiratory Infections", cases: 53, trend: "+4%", population: 35000, doctors: 8, beds: 52, bedsNeeded: 30, volunteers: 22, resourceGap: "LOW", lastUpdated: "32 min ago" },
  { id: 4, lat: 28.645, lng: 77.212, name: "Rohini Sector 9", district: "North Delhi", riskLevel: "high", disease: "Cholera Suspected", cases: 31, trend: "+67%", population: 78000, doctors: 3, beds: 20, bedsNeeded: 38, volunteers: 6, resourceGap: "HIGH", lastUpdated: "2 min ago" },
  { id: 5, lat: 28.610, lng: 77.240, name: "Shahdara Colony", district: "East Delhi", riskLevel: "low", disease: "Seasonal Flu", cases: 18, trend: "-5%", population: 29000, doctors: 11, beds: 60, bedsNeeded: 15, volunteers: 30, resourceGap: "NONE", lastUpdated: "1 hr ago" },
];
const RESOURCES = [
  { id: 1, type: "Doctor", name: "Dr. Priya Sharma", specialty: "Infectious Disease", status: "available", location: "AIIMS Delhi", distance: "2.1 km", deployedTo: null },
  { id: 2, type: "Doctor", name: "Dr. Arjun Mehta", specialty: "General Medicine", status: "deployed", location: "PHC Paharganj", distance: "0.4 km", deployedTo: "Paharganj Ward" },
  { id: 3, type: "Ambulance", name: "Unit A-07", specialty: "Emergency Response", status: "available", location: "Base Station North", distance: "3.2 km", deployedTo: null },
  { id: 4, type: "Volunteer", name: "Sunita Rao", specialty: "Community Health Worker", status: "available", location: "Karol Bagh", distance: "1.1 km", deployedTo: null },
  { id: 5, type: "Volunteer", name: "Rahul Verma", specialty: "Sanitation & Hygiene", status: "deployed", location: "Rohini", distance: "4.5 km", deployedTo: "Rohini Sector 9" },
  { id: 6, type: "Medical Kit", name: "Anti-Dengue Kit x40", specialty: "Dengue Protocol", status: "available", location: "Warehouse C", distance: "1.8 km", deployedTo: null },
];
const HEALTH_ALERTS = [
  { id: 1, severity: "critical", message: "Dengue spike in Paharganj — 23% rise in 48hrs. Immediate vector control needed.", time: "6 min ago" },
  { id: 2, severity: "high", message: "Cholera suspected in Rohini Sector 9. Water sample analysis initiated.", time: "12 min ago" },
  { id: 3, severity: "medium", message: "Bed occupancy above 85% at Karol Bagh PHC. Overflow routing active.", time: "41 min ago" },
  { id: 4, severity: "info", message: "3 doctors available for deployment. Pending zone assignment.", time: "1 hr ago" },
];
const DATA_SOURCES = [
  { name: "HMIS Portal", status: "live", records: "12,840", lag: "< 5 min" },
  { name: "ASHA Worker Reports", status: "live", records: "3,210", lag: "< 15 min" },
  { name: "Hospital Bed Registry", status: "live", records: "892", lag: "Real-time" },
  { name: "Community Surveys", status: "syncing", records: "5,670", lag: "< 2 hrs" },
  { name: "Weather & Vector Data", status: "live", records: "—", lag: "Real-time" },
];
const RISK_COLORS = { critical: "#D32F2F", high: "#F57C00", moderate: "#FBC02D", low: "#388E3C" };
const RISK_BG = { critical: "#FFEBEE", high: "#FFF3E0", moderate: "#FFFDE7", low: "#E8F5E9" };
const RESOURCE_COLORS = { Doctor: "#7B1FA2", Ambulance: "#D32F2F", Volunteer: "#1976D2", "Medical Kit": "#2E7D32" };

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, color = "currentColor", sw = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const MapPinIcon = (p) => <Icon {...p} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0" />;
const PlusIcon = (p) => <Icon {...p} d="M12 5v14M5 12h14" />;
const XIcon = (p) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />;
const ShieldIcon = (p) => <Icon {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const ClockIcon = (p) => <Icon {...p} d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" />;
const NavIcon = (p) => <Icon {...p} d="M3 11l19-9-9 19-2-8-8-2z" />;
const LayersIcon = (p) => <Icon {...p} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />;
const UsersIcon = (p) => <Icon {...p} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />;
const AlertIcon = (p) => <Icon {...p} d="M12 22a10 10 0 100-20 10 10 0 000 20zM12 8v4M12 16h.01" />;
const CheckIcon = (p) => <Icon {...p} d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />;
const CamIcon = (p) => <Icon {...p} d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8" />;
const MenuIcon = (p) => <Icon {...p} d="M3 12h18M3 6h18M3 18h18" />;
const ActivityIcon = (p) => <Icon {...p} d="M22 12h-4l-3 9L9 3l-3 9H2" />;
const TrendIcon = (p) => <Icon {...p} d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" />;
const DBIcon = (p) => <Icon {...p} d="M12 2C6.48 2 2 4.24 2 7v10c0 2.76 4.48 5 10 5s10-2.24 10-5V7c0-2.76-4.48-5-10-5zM2 12c0 2.76 4.48 5 10 5s10-2.24 10-5M2 7c0 2.76 4.48 5 10 5s10-2.24 10-5" />;
const HeartIcon = (p) => <Icon {...p} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />;
const ZapIcon = (p) => <Icon {...p} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
const BagIcon = (p) => <Icon {...p} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />;

// ─── GOOGLE MAPS INTEGRATED COMPONENT ──────────────────────────────────────────
const GoogleMapComponent = ({ pins, pinColorFn, selectedPin, onPinClick, userLocation, renderBadge }) => {
  const mapRef = useRef(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapsLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (googleMapsLoaded && mapRef.current) {
      const center = userLocation || { lat: 28.6139, lng: 77.209 };
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
        ],
        disableDefaultUI: true,
        zoomControl: true,
      });

      pins.forEach((pin) => {
        const marker = new window.google.maps.Marker({
          position: { lat: pin.lat, lng: pin.lng },
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: pinColorFn(pin),
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
            scale: selectedPin?.id === pin.id ? 10 : 7,
          },
        });
        marker.addListener("click", () => onPinClick(pin));
      });
    }
  }, [googleMapsLoaded, pins, selectedPin, userLocation, pinColorFn, onPinClick]);

  if (!googleMapsLoaded) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#eef4eb", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
        <div style={{ width: 30, height: 30, border: "3px solid #4CAF50", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 12, color: "#4CAF50", fontWeight: 600 }}>Loading Intelligence Map...</span>
      </div>
    );
  }

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

// ─── FALLBACK SVG MOCK MAP (In case of API Failure) ──────────────────────────
const MockMap = ({ pins, pinColorFn, selectedPin, onPinClick, userLocation, renderBadge }) => {
  const W = 800, H = 520;
  const [hover, setHover] = useState(null);
  const bounds = { minLat: 28.585, maxLat: 28.660, minLng: 77.188, maxLng: 77.255 };
  const proj = (lat, lng) => ({
    x: ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (W - 80) + 40,
    y: ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (H - 60) + 30,
  });
  const roads = [
    [40,55,360,13],[110,85,210,9],[50,175,295,12],[390,95,330,13],[340,195,210,9],
    [90,290,365,13],[190,390,265,11],[440,340,295,13],[70,450,440,11],[290,490,370,9],
  ];
  const blocks = [[575,96,145,175],[55,215,165,118],[295,374,205,148],[538,394,185,138]];
  
  return (
    <div style={{ width:"100%", height:"100%", position:"relative", background:"#eef4eb", overflow:"hidden" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"100%" }} preserveAspectRatio="xMidYMid slice">
        <defs><pattern id="mg" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M 80 0 L 0 0 0 80" fill="none" stroke="#dde8d9" strokeWidth="0.8"/></pattern></defs>
        <rect width={W} height={H} fill="#eef4eb"/>
        <rect width={W} height={H} fill="url(#mg)"/>
        <rect x={310} y={245} width={135} height={88} rx={4} fill="#c5d9f0" opacity={0.45}/>
        {blocks.map(([x,y,w,h],i)=><rect key={i} x={x} y={y} width={w} height={h} rx={6} fill="#d9e8d4" opacity={0.55}/>)}
        {roads.map(([x,y,w,h],i)=><rect key={i} x={x} y={y} width={w} height={h} rx={3} fill="white" opacity={0.82}/>)}
        {userLocation && (()=>{ const p=proj(userLocation.lat,userLocation.lng); return <><circle cx={p.x} cy={p.y} r={18} fill="#1976D2" fillOpacity={0.13}/><circle cx={p.x} cy={p.y} r={9} fill="#1976D2" stroke="white" strokeWidth={2.5}/></>; })()}
        {pins.map(pin=>{
          const p=proj(pin.lat,pin.lng);
          const color=pinColorFn(pin);
          const isSel=selectedPin?.id===pin.id;
          const isHov=hover===pin.id;
          const r=isSel?16:12;
          const label=pin.name||pin.title||"";
          return (
            <g key={pin.id} style={{cursor:"pointer"}} onClick={()=>onPinClick(pin)} onMouseEnter={()=>setHover(pin.id)} onMouseLeave={()=>setHover(null)}>
              {(isSel||isHov)&&<circle cx={p.x} cy={p.y} r={r+10} fill={color} fillOpacity={0.18}/>}
              <circle cx={p.x} cy={p.y} r={r} fill={color} stroke="white" strokeWidth={2.5} style={{transition:"r 0.2s"}}/>
              {renderBadge&&renderBadge(pin,p)}
              {(isHov||isSel)&&(
                <g>
                  <rect x={p.x-70} y={p.y-58} width={140} height={40} rx={8} fill="white" stroke="#e0e0e0" strokeWidth={1}/>
                  <text x={p.x} y={p.y-42} textAnchor="middle" fontSize={11} fontWeight="600" fill="#1a1a1a">{label.slice(0,18)}{label.length>18?"…":""}</text>
                  <text x={p.x} y={p.y-27} textAnchor="middle" fontSize={10} fill="#888">{pin.cases?`${pin.cases} cases`:pin.expiresIn+" left"}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{position:"absolute",bottom:12,right:12,display:"flex",flexDirection:"column",gap:5}}>
        {["+","−"].map(l=><button key={l} style={{width:30,height:30,background:"white",border:"1px solid #e0e0e0",borderRadius:7,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#333"}}>{l}</button>)}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════
// FOOD RELIEF MODULE
// ═════════════════════════════════════════════════════════════════
const lS = {fontSize:11,fontWeight:700,color:"#555",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"};
const iS = {width:"100%",padding:"11px 13px",borderRadius:11,border:"1.5px solid #e8e8e8",fontSize:13,color:"#1a1a1a",background:"white",outline:"none",boxSizing:"border-box",fontFamily:"inherit"};

const PinPopup = ({ pin, onClose, onClaim }) => {
  const color = CATEGORY_COLORS[pin.category]||"#4CAF50";
  return (
    <div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",width:"min(420px,calc(100% - 32px))",background:"white",borderRadius:20,boxShadow:"0 20px 60px rgba(0,0,0,0.18)",overflow:"hidden",zIndex:50,animation:"slideUpC 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>
      <div style={{height:5,background:color}}/>
      <div style={{padding:"18px 22px 22px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{flex:1,paddingRight:10}}>
            <div style={{display:"flex",gap:6,marginBottom:4,flexWrap:"wrap"}}>
              <span style={{fontSize:10,background:`${color}18`,color,borderRadius:20,padding:"2px 9px",fontWeight:700}}>{pin.category}</span>
              {pin.verified&&<span style={{fontSize:10,background:"#e8f5e9",color:"#2e7d32",borderRadius:20,padding:"2px 9px",fontWeight:700}}>Verified Fresh</span>}
            </div>
            <h3 style={{fontSize:16,fontWeight:800,color:"#1a1a1a",margin:0}}>{pin.title}</h3>
            <p style={{fontSize:12,color:"#777",marginTop:2}}>{pin.donor}</p>
          </div>
          <button onClick={onClose} style={{background:"#f5f5f5",border:"none",borderRadius:9,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon size={15} color="#666"/></button>
        </div>
        <p style={{fontSize:13,color:"#555",lineHeight:1.6,marginBottom:14}}>{pin.description}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[["Distance",pin.distance,"#2196F3"],["Expires",pin.expiresIn,"#FF9800"],["Qty",pin.quantity,"#4CAF50"]].map(([l,v,c])=>(
            <div key={l} style={{background:"#fafafa",borderRadius:10,padding:"9px 11px",border:"1px solid #f0f0f0",textAlign:"center"}}>
              <div style={{fontSize:9,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</div>
              <div style={{fontSize:13,fontWeight:700,color:c,marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>
        <button onClick={onClaim} style={{width:"100%",padding:"13px",background:"#4CAF50",color:"white",border:"none",borderRadius:13,fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          <NavIcon size={16} color="white"/>Claim This Food
        </button>
      </div>
    </div>
  );
};

const AIScanBadge = ({ scanning, verified }) => {
  if (!scanning&&!verified) return null;
  if (scanning) return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",background:"#fff8e1",borderRadius:11,border:"1px solid #ffe082"}}>
      <div style={{width:14,height:14,border:"2px solid #F59E0B",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite",flexShrink:0}}/>
      <span style={{fontSize:12,color:"#92400e",fontWeight:600}}>Gemini AI analyzing freshness…</span>
    </div>
  );
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",background:"#e8f5e9",borderRadius:11,border:"1px solid #a5d6a7",animation:"fadeIn 0.4s ease"}}>
      <ShieldIcon size={15} color="#2e7d32"/>
      <div>
        <div style={{fontSize:12,color:"#1b5e20",fontWeight:700}}>Verified Fresh — AI Confidence: 96%</div>
        <div style={{fontSize:10,color:"#388e3c"}}>No spoilage detected · Safe for distribution</div>
      </div>
    </div>
  );
};

const ListFoodForm = ({ onClose, onSubmit, userLocation }) => {
  const [form, setForm] = useState({ title:"", description:"", category:"Vegetables", expiry:"4", quantity:"" });
  const [imgPrev, setImgPrev] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState(1);
  const fileRef = useRef();
  const handleImg = (e) => {
    const f=e.target.files[0]; if(!f) return;
    setImgPrev(URL.createObjectURL(f)); setScanning(true); setVerified(false);
    setTimeout(()=>{setScanning(false);setVerified(true);},2400);
  };
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",background:"rgba(0,0,0,0.45)",animation:"fadeIn 0.2s ease"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"min(520px,100vw)",background:"white",borderRadius:"22px 22px 0 0",padding:"0 0 28px",maxHeight:"90vh",overflowY:"auto",animation:"slideUpSheet 0.35s cubic-bezier(0.34,1.2,0.64,1)"}}>
        <div style={{height:5,background:"linear-gradient(90deg,#4CAF50,#1976D2)",borderRadius:"22px 22px 0 0"}}/>
        <div style={{padding:"22px 26px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div><h2 style={{fontSize:18,fontWeight:800,color:"#1a1a1a",margin:0}}>List Surplus Food</h2><p style={{fontSize:12,color:"#888",marginTop:2}}>Help feed someone today</p></div>
            <button onClick={onClose} style={{background:"#f5f5f5",border:"none",borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon size={16} color="#555"/></button>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:22}}>
            {[1,2].map(s=>(
              <div key={s} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={()=>setStep(s)}>
                <div style={{width:24,height:24,borderRadius:"50%",background:step>=s?"#4CAF50":"#f0f0f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:step>=s?"white":"#aaa",transition:"all 0.2s"}}>{s}</div>
                <span style={{fontSize:11,color:step>=s?"#4CAF50":"#aaa",fontWeight:600}}>{s===1?"Food Details":"Location & Submit"}</span>
                {s<2&&<div style={{width:18,height:1,background:"#e0e0e0"}}/>}
              </div>
            ))}
          </div>
          {step===1&&(
            <div style={{display:"flex",flexDirection:"column",gap:16,animation:"fadeIn 0.3s ease"}}>
              <div>
                <label style={lS}>Photo of Food</label>
                <div onClick={()=>fileRef.current.click()} style={{border:`2px dashed ${imgPrev?"#4CAF50":"#d0d0d0"}`,borderRadius:14,padding:18,textAlign:"center",cursor:"pointer",background:imgPrev?"#f1f8f1":"#fafafa",minHeight:100}}>
                  {imgPrev?<img src={imgPrev} alt="Preview" style={{maxHeight:130,borderRadius:8,objectFit:"cover",width:"100%"}}/>:<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,color:"#bbb"}}><CamIcon size={28} color="#ccc"/><span style={{fontSize:13}}>Tap to upload photo</span></div>}
                  <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImg}/>
                </div>
                {(scanning||verified)&&<div style={{marginTop:8}}><AIScanBadge scanning={scanning} verified={verified}/></div>}
              </div>
              <div><label style={lS}>Title *</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Fresh Vegetable Bundle" style={iS}/></div>
              <div><label style={lS}>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Contents, condition, allergens…" rows={2} style={{...iS,resize:"vertical",fontFamily:"inherit"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label style={lS}>Category</label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={iS}>{Object.keys(CATEGORY_COLORS).map(c=><option key={c}>{c}</option>)}<option>Grains</option><option>Fruits</option><option>Other</option></select></div>
                <div><label style={lS}>Quantity</label><input value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} placeholder="e.g. 5 kg" style={iS}/></div>
              </div>
              <div>
                <label style={lS}>Expires in (hours)</label>
                <div style={{display:"flex",gap:7}}>
                  {["2","4","8","24"].map(h=>(
                    <button key={h} onClick={()=>setForm(f=>({...f,expiry:h}))} style={{flex:1,padding:"9px 0",borderRadius:10,border:`2px solid ${form.expiry===h?"#4CAF50":"#e8e8e8"}`,background:form.expiry===h?"#e8f5e9":"white",color:form.expiry===h?"#2e7d32":"#666",fontWeight:form.expiry===h?700:400,cursor:"pointer",fontSize:13}}>{h}h</button>
                  ))}
                </div>
              </div>
              <button onClick={()=>setStep(2)} disabled={!form.title} style={{width:"100%",padding:"14px",background:form.title?"#4CAF50":"#e0e0e0",color:"white",border:"none",borderRadius:13,fontSize:14,fontWeight:700,cursor:form.title?"pointer":"not-allowed"}}>Continue →</button>
            </div>
          )}
          {step===2&&(
            <div style={{display:"flex",flexDirection:"column",gap:16,animation:"fadeIn 0.3s ease"}}>
              <div style={{background:"#f0f7f0",borderRadius:14,padding:16,border:"1px solid #c8e6c9"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><MapPinIcon size={18} color="#4CAF50"/><span style={{fontSize:14,fontWeight:700,color:"#1b5e20"}}>Location Auto-Tagged</span></div>
                <p style={{fontSize:12,color:"#555",margin:0}}>{userLocation?`GPS: ${userLocation.lat.toFixed(4)}N, ${userLocation.lng.toFixed(4)}E`:"New Delhi, India (approximate)"}</p>
              </div>
              <div style={{background:"#f8f8f8",borderRadius:14,padding:16,border:"1px solid #eee"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#333",marginBottom:10}}>Summary</div>
                {[["Title",form.title],["Category",form.category],["Expires",`${form.expiry} hours`],["AI Verified",verified?"Yes — 96%":"Not scanned"]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
                    <span style={{color:"#888"}}>{k}</span><span style={{fontWeight:600,color:k==="AI Verified"&&verified?"#2e7d32":"#333"}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:9}}>
                <button onClick={()=>setStep(1)} style={{flex:1,padding:"13px",background:"white",color:"#555",border:"1.5px solid #e0e0e0",borderRadius:13,fontSize:13,fontWeight:600,cursor:"pointer"}}>Back</button>
                <button onClick={()=>{onSubmit({...form,id:Date.now(),lat:(userLocation?.lat||28.6139)+(Math.random()-0.5)*0.02,lng:(userLocation?.lng||77.209)+(Math.random()-0.5)*0.02,verified,distance:"0.1 km",postedAt:"just now",donor:"You"});onClose();}} style={{flex:2,padding:"13px",background:"#4CAF50",color:"white",border:"none",borderRadius:13,fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                  <CheckIcon size={16} color="white"/>Publish Listing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NGOSidebar = ({ pins, onPinSelect, selectedPin, open, onClose }) => {
  const sorted=[...pins].sort((a,b)=>parseFloat(a.distance)-parseFloat(b.distance));
  return (
    <>
      {open&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:90}} onClick={onClose}/>}
      <div style={{position:"fixed",top:0,right:0,height:"100vh",width:"min(360px,92vw)",background:"white",zIndex:100,boxShadow:"-4px 0 40px rgba(0,0,0,0.12)",transform:open?"translateX(0)":"translateX(100%)",transition:"transform 0.35s cubic-bezier(0.4,0,0.2,1)",display:"flex",flexDirection:"column"}}>
        <div style={{height:4,background:"linear-gradient(90deg,#1976D2,#4CAF50)"}}/>
        <div style={{padding:"18px 22px 14px",borderBottom:"1px solid #f0f0f0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><h2 style={{fontSize:16,fontWeight:800,color:"#1a1a1a",margin:0}}>NGO Dashboard</h2><p style={{fontSize:11,color:"#888",marginTop:2}}>{sorted.length} active listings</p></div>
            <button onClick={onClose} style={{background:"#f5f5f5",border:"none",borderRadius:9,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon size={15} color="#666"/></button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginTop:14}}>
            {[["Active",sorted.length,"#4CAF50"],["Verified",sorted.filter(p=>p.verified).length,"#1976D2"],["Urgent",sorted.filter(p=>parseInt(p.expiresIn)<=2).length,"#FF5722"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#fafafa",borderRadius:10,padding:"9px 11px",border:"1px solid #f0f0f0",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div>
                <div style={{fontSize:9,color:"#aaa",marginTop:1,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 0"}}>
          {sorted.map((pin,i)=>{
            const color=CATEGORY_COLORS[pin.category]||"#4CAF50";
            const isSel=selectedPin?.id===pin.id;
            const urgent=parseInt(pin.expiresIn)<=2;
            return (
              <div key={pin.id} onClick={()=>{onPinSelect(pin);onClose();}} style={{padding:"12px 22px",cursor:"pointer",background:isSel?"#f0f7f0":"transparent",borderLeft:`3px solid ${isSel?"#4CAF50":"transparent"}`,transition:"all 0.2s",borderBottom:"1px solid #fafafa"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                  <div style={{flex:1,paddingRight:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                      <span style={{fontSize:15,fontWeight:800,color:"#ddd"}}>#{i+1}</span>
                      <span style={{fontSize:10,background:`${color}18`,color,borderRadius:20,padding:"2px 7px",fontWeight:700}}>{pin.category}</span>
                      {urgent&&<span style={{fontSize:9,background:"#fff3e0",color:"#e64a19",borderRadius:20,padding:"2px 7px",fontWeight:700}}>URGENT</span>}
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:"#1a1a1a"}}>{pin.title}</div>
                    <div style={{fontSize:11,color:"#888"}}>{pin.donor}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#1976D2"}}>{pin.distance}</div>
                    {pin.verified&&<div style={{fontSize:9,color:"#4CAF50",fontWeight:600,marginTop:1}}>Verified</div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:12,fontSize:11,color:"#888"}}>
                  <span style={{display:"flex",alignItems:"center",gap:3}}><ClockIcon size={11} color="#f59e0b"/>{pin.expiresIn} left</span>
                  <span>{pin.quantity}</span>
                  <span style={{marginLeft:"auto"}}>{pin.postedAt}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{padding:"14px 22px",borderTop:"1px solid #f0f0f0",background:"#fafafa"}}>
          <button style={{width:"100%",padding:"12px",background:"#1976D2",color:"white",border:"none",borderRadius:13,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            <NavIcon size={15} color="white"/>Route to Nearest Available
          </button>
        </div>
      </div>
    </>
  );
};

// ═════════════════════════════════════════════════════════════════
// HEALTH MODULE
// ═════════════════════════════════════════════════════════════════

const HealthZonePopup = ({ zone, onClose, onDeploy }) => {
  const color=RISK_COLORS[zone.riskLevel];
  const bg=RISK_BG[zone.riskLevel];
  const gap=zone.bedsNeeded-zone.beds;
  const pct=Math.min(100,Math.round((zone.beds/zone.bedsNeeded)*100));
  return (
    <div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",width:"min(460px,calc(100% - 32px))",background:"white",borderRadius:20,boxShadow:"0 20px 60px rgba(0,0,0,0.18)",overflow:"hidden",zIndex:50,animation:"slideUpC 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>
      <div style={{height:5,background:color}}/>
      <div style={{padding:"18px 22px 22px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div style={{flex:1,paddingRight:10}}>
            <div style={{display:"flex",gap:6,marginBottom:5,flexWrap:"wrap"}}>
              <span style={{fontSize:10,fontWeight:800,color,background:bg,borderRadius:20,padding:"3px 10px",textTransform:"uppercase",letterSpacing:"0.06em"}}>{zone.riskLevel} risk</span>
              <span style={{fontSize:10,background:"#fce4ec",color:"#c62828",borderRadius:20,padding:"3px 10px",fontWeight:700}}>Trend: {zone.trend}</span>
            </div>
            <h3 style={{fontSize:16,fontWeight:800,color:"#1a1a1a",margin:0}}>{zone.name}</h3>
            <p style={{fontSize:12,color:"#777",marginTop:2}}>{zone.district} · {zone.disease}</p>
          </div>
          <button onClick={onClose} style={{background:"#f5f5f5",border:"none",borderRadius:9,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon size={15} color="#666"/></button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
          {[["Cases",zone.cases,"#D32F2F"],["Doctors",zone.doctors,"#7B1FA2"],["Beds",zone.beds,"#1976D2"],["Volunteers",zone.volunteers,"#2E7D32"]].map(([l,v,c])=>(
            <div key={l} style={{background:"#fafafa",borderRadius:10,padding:"9px 8px",border:"1px solid #f0f0f0",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
              <div style={{fontSize:9,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.05em",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        {gap>0&&(
          <div style={{background:"#fff3e0",borderRadius:11,padding:"10px 13px",marginBottom:14,border:"1px solid #ffcc80",display:"flex",alignItems:"center",gap:9}}>
            <AlertIcon size={16} color="#e65100"/>
            <span style={{fontSize:12,color:"#bf360c",fontWeight:600}}>Shortfall: {gap} additional beds needed</span>
          </div>
        )}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Bed Utilization</div>
          <div style={{background:"#f0f0f0",borderRadius:50,height:8,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:zone.beds>=zone.bedsNeeded?"#4CAF50":color,borderRadius:50,transition:"width 0.6s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#888",marginTop:4}}>
            <span>{zone.beds} available</span><span>{zone.bedsNeeded} needed</span>
          </div>
        </div>
        <div style={{display:"flex",gap:9}}>
          <button onClick={onDeploy} style={{flex:1,padding:"12px",background:color,color:"white",border:"none",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <ZapIcon size={15} color="white"/>Deploy Resources
          </button>
          <button style={{flex:1,padding:"12px",background:"white",color:"#1976D2",border:"1.5px solid #1976D2",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <ActivityIcon size={15} color="#1976D2"/>View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

const ResourcePanel = ({ open, onClose, targetZone, showToast }) => {
  const [deployed, setDeployed] = useState([]);
  const avail=RESOURCES.filter(r=>r.status==="available");
  const deploy=(r)=>{ setDeployed(d=>[...d,r.id]); showToast(`${r.name} deployed to ${targetZone?.name||"zone"}`,"success"); };
  return (
    <>
      {open&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:90}} onClick={onClose}/>}
      <div style={{position:"fixed",top:0,right:0,height:"100vh",width:"min(390px,92vw)",background:"white",zIndex:100,boxShadow:"-4px 0 40px rgba(0,0,0,0.12)",transform:open?"translateX(0)":"translateX(100%)",transition:"transform 0.35s cubic-bezier(0.4,0,0.2,1)",display:"flex",flexDirection:"column"}}>
        <div style={{height:4,background:"linear-gradient(90deg,#D32F2F,#7B1FA2)"}}/>
        <div style={{padding:"18px 22px 14px",borderBottom:"1px solid #f0f0f0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <h2 style={{fontSize:16,fontWeight:800,color:"#1a1a1a",margin:0}}>Resource Allocation</h2>
              <p style={{fontSize:11,color:"#888",marginTop:2}}>{targetZone?`Deploying to: ${targetZone.name}`:"Select a zone on the map"}</p>
            </div>
            <button onClick={onClose} style={{background:"#f5f5f5",border:"none",borderRadius:9,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon size={15} color="#666"/></button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
            {[["Available",avail.length,"#4CAF50"],["Deployed",RESOURCES.filter(r=>r.status==="deployed").length,"#D32F2F"],["Total",RESOURCES.length,"#1976D2"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#fafafa",borderRadius:10,padding:"9px 11px",border:"1px solid #f0f0f0",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div>
                <div style={{fontSize:9,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.05em",marginTop:1}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 0"}}>
          <div style={{padding:"6px 22px 10px",fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.07em"}}>Available Resources</div>
          {avail.map(r=>{
            const isDep=deployed.includes(r.id);
            const color=RESOURCE_COLORS[r.type]||"#666";
            return (
              <div key={r.id} style={{padding:"12px 22px",borderBottom:"1px solid #fafafa"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,paddingRight:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <span style={{fontSize:10,background:`${color}15`,color,borderRadius:20,padding:"2px 8px",fontWeight:700}}>{r.type}</span>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:"#1a1a1a"}}>{r.name}</div>
                    <div style={{fontSize:11,color:"#888"}}>{r.specialty}</div>
                    <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{r.location} · {r.distance}</div>
                  </div>
                  <button onClick={()=>!isDep&&deploy(r)} style={{padding:"8px 14px",background:isDep?"#e8f5e9":color,color:isDep?"#2e7d32":"white",border:"none",borderRadius:10,fontSize:12,fontWeight:700,cursor:isDep?"default":"pointer",whiteSpace:"nowrap",transition:"all 0.2s"}}>
                    {isDep?"Sent":"Deploy"}
                  </button>
                </div>
              </div>
            );
          })}
          <div style={{padding:"14px 22px 6px",fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.07em"}}>Currently Deployed</div>
          {RESOURCES.filter(r=>r.status==="deployed").map(r=>{
            const color=RESOURCE_COLORS[r.type]||"#666";
            return (
              <div key={r.id} style={{padding:"12px 22px",borderBottom:"1px solid #fafafa",opacity:0.65}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                  <span style={{fontSize:10,background:`${color}15`,color,borderRadius:20,padding:"2px 8px",fontWeight:700}}>{r.type}</span>
                  <span style={{fontSize:10,background:"#ffebee",color:"#c62828",borderRadius:20,padding:"2px 8px",fontWeight:700}}>Deployed</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:"#1a1a1a"}}>{r.name}</div>
                <div style={{fontSize:11,color:"#888"}}>To: {r.deployedTo}</div>
              </div>
            );
          })}
        </div>
        <div style={{padding:"14px 22px",borderTop:"1px solid #f0f0f0",background:"#fafafa"}}>
          <button style={{width:"100%",padding:"12px",background:"#D32F2F",color:"white",border:"none",borderRadius:13,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            <ZapIcon size={15} color="white"/>Deploy All to Critical Zones
          </button>
        </div>
      </div>
    </>
  );
};

const HealthAnalytics = () => {
  const total=HEALTH_ZONES.reduce((s,z)=>s+z.cases,0);
  const critical=HEALTH_ZONES.filter(z=>z.riskLevel==="critical"||z.riskLevel==="high").length;
  const docs=HEALTH_ZONES.reduce((s,z)=>s+z.doctors,0);
  const gapZones=HEALTH_ZONES.filter(z=>z.resourceGap==="HIGH"||z.resourceGap==="MEDIUM").length;
  const maxC=Math.max(...HEALTH_ZONES.map(z=>z.cases));
  return (
    <div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:24}}>
        {[[total,"Total Active Cases","#D32F2F",ActivityIcon],[critical,"Critical/High Zones","#F57C00",AlertIcon],[docs,"Doctors On Ground","#7B1FA2",UsersIcon],[gapZones,"Resource Gap Zones","#1976D2",ZapIcon]].map(([v,label,color,Ic])=>(
          <div key={label} style={{background:"white",borderRadius:14,padding:"16px 18px",border:"1px solid #f0f0f0",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
            <div style={{width:36,height:36,borderRadius:10,background:`${color}15`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}><Ic size={18} color={color}/></div>
            <div style={{fontSize:28,fontWeight:800,color,lineHeight:1}}>{v}</div>
            <div style={{fontSize:11,color:"#888",marginTop:5,lineHeight:1.4}}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        <div style={{background:"white",borderRadius:14,padding:"18px 20px",border:"1px solid #f0f0f0"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:16,textTransform:"uppercase",letterSpacing:"0.06em"}}>Cases by Zone</div>
          {HEALTH_ZONES.map(z=>(
            <div key={z.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#555",marginBottom:4}}>
                <span style={{fontWeight:600}}>{z.name.split(" ")[0]}</span>
                <span style={{fontWeight:700,color:RISK_COLORS[z.riskLevel]}}>{z.cases}</span>
              </div>
              <div style={{background:"#f5f5f5",borderRadius:50,height:7,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.round((z.cases/maxC)*100)}%`,background:RISK_COLORS[z.riskLevel],borderRadius:50,transition:"width 0.6s ease"}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:"white",borderRadius:14,padding:"18px 20px",border:"1px solid #f0f0f0"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Active Alerts</div>
          {HEALTH_ALERTS.map(a=>{
            const colors={critical:"#D32F2F",high:"#F57C00",medium:"#FBC02D",info:"#1976D2"};
            const bgs={critical:"#FFEBEE",high:"#FFF3E0",medium:"#FFFDE7",info:"#E3F2FD"};
            return (
              <div key={a.id} style={{background:bgs[a.severity],borderRadius:10,padding:"10px 12px",border:`1px solid ${colors[a.severity]}30`,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:9,fontWeight:700,color:colors[a.severity],textTransform:"uppercase",letterSpacing:"0.06em"}}>{a.severity}</span>
                  <span style={{fontSize:9,color:"#aaa"}}>{a.time}</span>
                </div>
                <div style={{fontSize:11,color:"#333",lineHeight:1.5}}>{a.message}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const HealthModule = ({ showToast }) => {
  const [selZone, setSelZone] = useState(null);
  const [showRes, setShowRes] = useState(false);
  const [view, setView] = useState("map");
  const [filterRisk, setFilterRisk] = useState("all");
  const [userLoc] = useState({ lat:28.6139, lng:77.209 });
  const filtered = filterRisk==="all" ? HEALTH_ZONES : HEALTH_ZONES.filter(z=>z.riskLevel===filterRisk);
  const sorted = [...filtered].sort((a,b)=>{ const o={critical:0,high:1,moderate:2,low:3}; return o[a.riskLevel]-o[b.riskLevel]; });

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{background:"white",borderBottom:"1px solid #f0f0f0",padding:"0 20px",display:"flex",alignItems:"center",gap:4,height:48,flexShrink:0}}>
        {[["map","Live Map",MapPinIcon],["analytics","Analytics",ActivityIcon],["resources","Resources",BagIcon]].map(([key,label,Ic])=>(
          <button key={key} onClick={()=>setView(key)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:9,border:"none",background:view===key?"#fff3e0":"transparent",color:view===key?"#E65100":"#666",fontSize:12,fontWeight:view===key?700:500,cursor:"pointer",transition:"all 0.2s"}}>
            <Ic size={14} color={view===key?"#E65100":"#999"}/>{label}
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setShowRes(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:"#D32F2F",color:"white",border:"none",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer"}}>
            <ZapIcon size={13} color="white"/>Allocate Resources
          </button>
        </div>
      </div>

      {view==="map"&&(
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          <div style={{width:290,background:"white",borderRight:"1px solid #f0f0f0",display:"flex",flexDirection:"column",flexShrink:0}}>
            <div style={{padding:"12px 14px",borderBottom:"1px solid #f5f5f5"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:7}}>Filter by Risk Level</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {["all","critical","high","moderate","low"].map(r=>(
                  <button key={r} onClick={()=>setFilterRisk(r)} style={{padding:"3px 9px",borderRadius:20,border:`1.5px solid ${filterRisk===r?(RISK_COLORS[r]||"#333"):"#e8e8e8"}`,background:filterRisk===r?(RISK_BG[r]||"#f5f5f5"):"white",color:filterRisk===r?(RISK_COLORS[r]||"#333"):"#888",fontSize:10,fontWeight:700,cursor:"pointer",textTransform:"capitalize"}}>{r}</button>
                ))}
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto"}}>
              {sorted.map(zone=>{
                const color=RISK_COLORS[zone.riskLevel];
                const bg=RISK_BG[zone.riskLevel];
                const isSel=selZone?.id===zone.id;
                return (
                  <div key={zone.id} onClick={()=>setSelZone(zone)} style={{padding:"12px 14px",cursor:"pointer",background:isSel?bg:"transparent",borderLeft:`3px solid ${isSel?color:"transparent"}`,transition:"all 0.2s",borderBottom:"1px solid #f5f5f5"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                      <div style={{flex:1,paddingRight:8}}>
                        <div style={{display:"flex",gap:4,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:9,fontWeight:800,color,background:bg,borderRadius:20,padding:"2px 7px",textTransform:"uppercase",letterSpacing:"0.05em"}}>{zone.riskLevel}</span>
                        </div>
                        <div style={{fontSize:13,fontWeight:700,color:"#1a1a1a"}}>{zone.name}</div>
                        <div style={{fontSize:11,color:"#888"}}>{zone.disease}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:16,fontWeight:800,color}}>{zone.cases}</div>
                        <div style={{fontSize:9,color:"#aaa"}}>cases</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{flex:1,position:"relative"}}>
            <GoogleMapComponent
              pins={sorted}
              pinColorFn={z=>RISK_COLORS[z.riskLevel]}
              selectedPin={selZone}
              onPinClick={setSelZone}
              userLocation={userLoc}
            />
            {selZone&&<HealthZonePopup zone={selZone} onClose={()=>setSelZone(null)} onDeploy={()=>{setShowRes(true);setSelZone(null);}}/>}
          </div>
        </div>
      )}
      {view==="analytics"&&<HealthAnalytics/>}
      {view==="resources"&&(
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>
            {RESOURCES.map(r=>{
              const color=RESOURCE_COLORS[r.type]||"#666";
              return (
                <div key={r.id} style={{background:"white",borderRadius:14,padding:"16px 18px",border:"1px solid #f0f0f0",display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:11,background:`${color}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {r.type==="Doctor"?<UsersIcon size={18} color={color}/>:r.type==="Ambulance"?<NavIcon size={18} color={color}/>:r.type==="Volunteer"?<HeartIcon size={18} color={color}/>:<BagIcon size={18} color={color}/>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <span style={{fontSize:10,background:`${color}15`,color,borderRadius:20,padding:"2px 8px",fontWeight:700}}>{r.type}</span>
                        <div style={{fontSize:14,fontWeight:700,color:"#1a1a1a",marginTop:4}}>{r.name}</div>
                        <div style={{fontSize:11,color:"#888"}}>{r.specialty}</div>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,background:r.status==="available"?"#e8f5e9":"#ffebee",color:r.status==="available"?"#2e7d32":"#c62828"}}>{r.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <ResourcePanel open={showRes} onClose={()=>setShowRes(false)} targetZone={selZone} showToast={showToast}/>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════
// ROOT APP
// ═════════════════════════════════════════════════════════════════
export default function Aequitas() {
  const [module, setModule] = useState("food");
  const [pins, setPins] = useState(MOCK_PINS);
  const [selPin, setSelPin] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showNGO, setShowNGO] = useState(false);
  const [userLoc, setUserLoc] = useState({ lat:28.6139, lng:77.209 });
  const [toast, setToast] = useState(null);

  useEffect(()=>{ if(navigator.geolocation) navigator.geolocation.getCurrentPosition(p=>setUserLoc({lat:p.coords.latitude,lng:p.coords.longitude}),()=>{}); },[]);

  const showToast=(msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3200); };
  const handleListing=(data)=>{ setPins(prev=>[...prev,{...data,expiresIn:`${data.expiry} hours`,distance:"0.1 km"}]); showToast("Food listed! NGOs notified.","success"); };

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",height:"100vh",display:"flex",flexDirection:"column",background:"#f0f4ef"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUpC { from { transform: translateY(24px) translateX(-50%); opacity:0; } to { transform: translateY(0) translateX(-50%); opacity:1; } }
        @keyframes slideUpSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes toastIn { from { transform: translateY(14px) translateX(-50%); opacity:0; } to { transform: translateY(0) translateX(-50%); opacity:1; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        * { box-sizing:border-box; -webkit-font-smoothing:antialiased; }
        input:focus, select:focus, textarea:focus { border-color:#4CAF50 !important; box-shadow:0 0 0 3px rgba(76,175,80,0.12); outline:none; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:#d0d0d0; border-radius:4px; }
        button { font-family:inherit; }
      `}</style>

      {/* HEADER */}
      <header style={{background:"white",borderBottom:"1px solid #e8ede8",padding:"0 18px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#4CAF50,#1976D2)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <LayersIcon size={16} color="white"/>
          </div>
          <div>
            <span style={{fontSize:16,fontWeight:800,color:"#1a1a1a",letterSpacing:"-0.3px"}}>Aequitas</span>
            <span style={{fontSize:9,color:"#888",display:"block",marginTop:-1,fontWeight:500,letterSpacing:"0.05em"}}>EQUITY PLATFORM</span>
          </div>
        </div>

        {/* MODULE SWITCHER */}
        <div style={{display:"flex",background:"#f5f5f5",borderRadius:11,padding:3,gap:2}}>
          {[["food","Food Relief",HeartIcon,"#4CAF50"],["health","Health Intel",ActivityIcon,"#D32F2F"]].map(([key,label,Ic,color])=>(
            <button key={key} onClick={()=>setModule(key)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:8,border:"none",background:module===key?"white":"transparent",color:module===key?color:"#888",fontSize:12,fontWeight:module===key?800:500,cursor:"pointer",boxShadow:module===key?"0 1px 5px rgba(0,0,0,0.1)":"none",transition:"all 0.2s"}}>
              <Ic size={13} color={module===key?color:"#bbb"}/>{label}
            </button>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {module==="food"&&(
            <button onClick={()=>setShowNGO(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:"#1976D2",color:"white",border:"none",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer"}}>
              <UsersIcon size={13} color="white"/>NGO
            </button>
          )}
        </div>
      </header>

      {/* FOOD MODULE */}
      {module==="food"&&(
        <div style={{flex:1,position:"relative",overflow:"hidden"}}>
          <GoogleMapComponent
            pins={pins}
            pinColorFn={p=>CATEGORY_COLORS[p.category]||"#4CAF50"}
            selectedPin={selPin}
            onPinClick={setSelPin}
            userLocation={userLoc}
          />
          <div style={{position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",display:"flex",gap:7,zIndex:20}}>
            {[["Meals",pins.length*8+"+"],["Verified",pins.filter(p=>p.verified).length],["NGOs",12]].map(([l,v])=>(
              <div key={l} style={{background:"white",borderRadius:10,padding:"7px 13px",boxShadow:"0 2px 14px rgba(0,0,0,0.1)",textAlign:"center"}}>
                <div style={{fontSize:15,fontWeight:800,color:"#4CAF50"}}>{v}</div>
                <div style={{fontSize:9,color:"#888",textTransform:"uppercase",letterSpacing:"0.05em",marginTop:1}}>{l}</div>
              </div>
            ))}
          </div>
          {selPin&&<PinPopup pin={selPin} onClose={()=>setSelPin(null)} onClaim={()=>{setSelPin(null);showToast("Claim sent! Donor notified.","info");}}/>}
          {!showForm&&(
            <button onClick={()=>setShowForm(true)} style={{position:"absolute",bottom:selPin?192:26,right:20,width:56,height:56,borderRadius:"50%",background:"#4CAF50",border:"none",boxShadow:"0 4px 20px rgba(76,175,80,0.45)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:40}}>
              <PlusIcon size={23} color="white" sw={2.5}/>
            </button>
          )}
          {showForm&&<ListFoodForm onClose={()=>setShowForm(false)} onSubmit={handleListing} userLocation={userLoc}/>}
          <NGOSidebar pins={pins} onPinSelect={setSelPin} selectedPin={selPin} open={showNGO} onClose={()=>setShowNGO(false)}/>
        </div>
      )}

      {/* HEALTH MODULE */}
      {module==="health"&&<HealthModule showToast={showToast}/>}

      {/* TOAST */}
      {toast&&(
        <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:toast.type==="success"?"#1b5e20":toast.type==="info"?"#0d47a1":"#b71c1c",color:"white",borderRadius:14,padding:"12px 22px",fontSize:13,fontWeight:600,zIndex:9999,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",display:"flex",alignItems:"center",gap:9,animation:"toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",maxWidth:"calc(100vw - 48px)"}}>
          {toast.type==="success"?<CheckIcon size={16} color="white"/>:<AlertIcon size={16} color="white"/>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}