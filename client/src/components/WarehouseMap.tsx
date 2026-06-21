import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Warehouse {
  _id: string;
  name: string;
  city: string;
  capacity: number;
  lat: number;
  lng: number;
}

interface Order {
  _id: string;
  customerName: string;
  customerLat: number;
  customerLng: number;
  assignedWarehouseId?: {
    _id: string;
    lat: number;
    lng: number;
  };
}

const WarehouseMap = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/warehouses`)
      .then(res => res.json())
      .then(data => setWarehouses(data));

    fetch(`${API_BASE_URL}/api/orders`)
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
    <div className="animate-in">
      <h2 style={{ marginBottom: '1.5rem' }}>Network Visualization</h2>
      <div className="glass" style={{ padding: '0.5rem', borderRadius: '20px' }}>
        <MapContainer center={warehouses.length > 0 ? [warehouses[0].lat, warehouses[0].lng] : [20.5937, 78.9629]} zoom={warehouses.length > 0 ? 5 : 4} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {warehouses.map(w => (
            <Marker key={w._id} position={[w.lat, w.lng]}>
              <Popup>
                <strong>{w.name}</strong><br/>
                {w.city}<br/>
                Capacity: {w.capacity}
              </Popup>
            </Marker>
          ))}

          {orders.map(o => (
            <React.Fragment key={o._id}>
              <Marker position={[o.customerLat, o.customerLng]}>
                <Popup>
                  <strong>Order: {o.customerName}</strong><br/>
                  Fulfillment Target
                </Popup>
              </Marker>
              
              {o.assignedWarehouseId && (
                <Polyline 
                  positions={[
                    [o.customerLat, o.customerLng],
                    [o.assignedWarehouseId.lat, o.assignedWarehouseId.lng]
                  ]}
                  pathOptions={{ color: 'var(--primary)', weight: 3, dashArray: '10, 10' }}
                />
              )}
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default WarehouseMap;
