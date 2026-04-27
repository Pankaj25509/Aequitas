import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Plus, X, Clock, Package, User } from "lucide-react";
import { loadModel, analyzeFoodImage } from "./ai";

// Colored pin icons
const createColoredIcon = (color) =>
  new L.DivIcon({
    className: "",
    html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px ${color};"></div>`,
  });

const greenIcon = createColoredIcon("#22c55e");
const yellowIcon = createColoredIcon("#facc15");
const redIcon = createColoredIcon("#ef4444");

export default function FoodRescueApp() {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadModel();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        console.log("Location denied");
      }
    );
  }, []);

  // Mock pins
  const [pins, setPins] = useState([
    {
      id: 1,
      name: "Veg Thali",
      quantity: "15 plates",
      expiry: "2 hrs",
      donor: "NGO Kitchen",
      freshness: "Fresh",
      position: [23.26, 77.41],
      description: "Cooked 1 hour ago",
    },
    {
      id: 2,
      name: "Bread & Curry",
      quantity: "8 servings",
      expiry: "1 hr",
      donor: "Local Cafe",
      freshness: "Okay",
      position: [23.255, 77.42],
      description: "Consume soon",
    },
    {
      id: 3,
      name: "Rice Packets",
      quantity: "20 packs",
      expiry: "30 mins",
      donor: "Event Leftover",
      freshness: "Not Fresh",
      position: [23.265, 77.405],
      description: "Near expiry",
    },
  ]);

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    expiry: "",
    donor: "",
    preview: "",
    freshness: "",
  });

  const getIcon = (freshness) => {
    if (freshness.includes("Fresh")) return greenIcon;
    if (freshness.includes("Okay")) return yellowIcon;
    return redIcon;
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const handleSubmit = () => {
    if (!form.name || !form.quantity || !form.expiry) return;

    const newPin = {
      ...form,
      id: Date.now(),
      position: [23.2599 + Math.random() * 0.01, 77.4126 + Math.random() * 0.01],
      description: "User added food",
    };

    setPins((prev) => [...prev, newPin]);
    setShowModal(false);
    setForm({ name: "", quantity: "", expiry: "", donor: "", preview: "", freshness: "" });
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-black text-white">

      {/* Legend */}
      <div className="absolute top-20 left-4 bg-black/70 text-xs p-3 rounded-lg z-[1000]">
        <p className="text-green-400">🟢 Fresh</p>
        <p className="text-yellow-400">🟡 Expiring</p>
        <p className="text-red-400">🔴 Not Safe</p>
      </div>

      {/* Map */}
      <MapContainer center={[23.2599, 77.4126]} zoom={13} className="h-full w-full">
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri"
          maxZoom={19}
        />

        {/* User location */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={
              new L.DivIcon({
                html: `<div style="width:14px;height:14px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 10px #3b82f6;"></div>`,
              })
            }
          >
            <Popup>You are here 📍</Popup>
          </Marker>
        )}

        {pins.map((pin) => (
          <Marker key={pin.id} position={pin.position} icon={getIcon(pin.freshness)}>
            <Popup>
              <div className="bg-[#0f172a] text-white p-3 rounded-xl space-y-2 w-56">
                <h2 className="font-semibold text-base">{pin.name}</h2>
                <p className="text-xs opacity-70">{pin.description}</p>

                {userLocation && (
                  <p className="text-xs text-blue-400">
                    📍 {getDistance(userLocation[0], userLocation[1], pin.position[0], pin.position[1])} km away
                  </p>
                )}

                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1"><Package size={12} /> {pin.quantity}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {pin.expiry}</span>
                </div>

                <p className="flex items-center gap-2 text-xs"><User size={12} /> {pin.donor}</p>

                <p className="text-[10px] opacity-50">AI freshness analysis</p>

                <p className="text-sm font-medium">
                  {pin.freshness.includes("Fresh") && <span className="text-green-400">{pin.freshness}</span>}
                  {pin.freshness.includes("Okay") && <span className="text-yellow-400">{pin.freshness}</span>}
                  {pin.freshness.includes("Not") && <span className="text-red-400">{pin.freshness}</span>}
                </p>

                <button
                  onClick={() => setPins(pins.filter(p => p.id !== pin.id))}
                  className="w-full mt-2 bg-indigo-500 text-white text-xs py-1 rounded-lg hover:bg-indigo-600"
                >
                  Claim Food
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-[1000] bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all"
      >
        <Plus size={28} />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#0f172a] text-white p-6 rounded-2xl w-[90%] max-w-md shadow-2xl space-y-4 border border-white/10">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Add Food</h2>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>

            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                const url = URL.createObjectURL(file);
                setForm((prev) => ({ ...prev, preview: url }));

                const img = new Image();
                img.src = url;

                img.onload = async () => {
                  const result = await analyzeFoodImage(img);
                  setForm((prev) => ({ ...prev, freshness: result }));
                };
              }}
            />

            {form.preview && (
              <img src={form.preview} className="rounded-xl h-32 w-full object-cover" />
            )}

            {form.freshness && (
              <p className="text-sm font-medium">{form.freshness}</p>
            )}

            <input placeholder="Food Name" className="w-full p-2 bg-black/40 border border-white/20 rounded-lg" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Quantity" className="w-full p-2 bg-black/40 border border-white/20 rounded-lg" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <input placeholder="Expiry" className="w-full p-2 bg-black/40 border border-white/20 rounded-lg" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
            <input placeholder="Donor" className="w-full p-2 bg-black/40 border border-white/20 rounded-lg" value={form.donor} onChange={(e) => setForm({ ...form, donor: e.target.value })} />

            <button onClick={handleSubmit} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-lg shadow-lg">
              Add Food
            </button>

          </div>
        </div>
      )}
    </div>
  );
}