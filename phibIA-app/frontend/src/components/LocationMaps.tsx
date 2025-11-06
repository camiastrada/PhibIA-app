import { useState, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import { SearchBox } from "@mapbox/search-js-react";
import "mapbox-gl/dist/mapbox-gl.css";
import frogIcon from "../assets/frog1.png";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYWdvc3JvZHJpZ3VleiIsImEiOiJjbWhjeWRmcHcwZ2Y4MmxwdHRxa2x2Zm15In0.9cwGVix-S-zFHfXSs1DgBw";

export default function LocationMap() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [pins, setPins] = useState<
    { id: number; coords: [number, number]; address: string }[]
  >([]);
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<{
    coords: [number, number];
    address: string;
  } | null>(null);

  {
    /*It convert the gps coordenate by using mapbox geocoding */
  }
  async function fetchAddressFromCoords(lng: number, lat: number) {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es`
      );
      const data = await res.json();
      return data.features[0]?.place_name || "Dirección desconocida";
    } catch {
      return "Dirección desconocida";
    }
  }

  {
    /*Gets the user's real time location*/
  }
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([longitude, latitude]);

        const address = await fetchAddressFromCoords(longitude, latitude);
        setUserAddress(address);
      },
      (err) => console.error("Error ubicacion:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div style={{ height: "80vh", width: "80vw", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          zIndex: 2,
          top: 10,
          left: 10,
          width: "300px",
        }}
      >
        <SearchBox
          accessToken={MAPBOX_TOKEN}
          onRetrieve={(res) => {
            const feature: any = res.features[0];
            if (!feature) return;
            const [lng, lat] = feature.geometry.coordinates;

            const address =
              feature.properties.full_address ||
              feature.place_name ||
              "Dirección no encontrada";

            setPendingPin({ coords: [lng, lat], address });
          }}
          options={{
            country: "AR",
            language: "es",
            proximity: [-64.3493, -33.123],
          }}
        />
      </div>

      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: userLocation?.[0] || -64.3493,
          latitude: userLocation?.[1] || -33.123,
          zoom: 13,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {userLocation && (
          <Marker
            longitude={userLocation[0]}
            latitude={userLocation[1]}
            anchor="bottom"
          >
            {""}
            <img
              src={frogIcon}
              alt="Pin"
              style={{
                width: "25px",
                cursor: "pointer",
              }}
              onMouseEnter={() => setHoveredPin(-1)}
              onMouseLeave={() => setHoveredPin(null)}
            />
          </Marker>
        )}

        {hoveredPin === -1 && userLocation && userAddress && (
          <Popup
            longitude={userLocation[0]}
            latitude={userLocation[1]}
            closeButton={false}
            closeOnClick={false}
            anchor="top"
          >
            <div style={{ padding: "8px", color: "black", fontSize: "14px" }}>
              {userAddress}
            </div>
          </Popup>
        )}

        {pins.map((pin) => (
          <Marker
            key={pin.id}
            longitude={pin.coords[0]}
            latitude={pin.coords[1]}
            anchor="bottom"
          >
            {" "}
            <img
              src={frogIcon}
              alt="Pin"
              style={{
                width: "25px",
                cursor: "pointer",
              }}
              onMouseEnter={() => {
                setHoveredPin(pin.id);
              }}
              onMouseLeave={() => setHoveredPin(null)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPin(pin.id);
              }}
            />
          </Marker>
        ))}

        {hoveredPin && hoveredPin !== -1 && (
          <Popup
            longitude={pins.find((p) => p.id === hoveredPin)!.coords[0]}
            latitude={pins.find((p) => p.id === hoveredPin)!.coords[1]}
            closeButton={false}
            closeOnClick={false}
            anchor="top"
          >
            <div style={{ padding: "8px", color: "black", fontSize: "14px" }}>
              {pins.find((p) => p.id === hoveredPin)?.address}
            </div>
          </Popup>
        )}

        {/* Remove pin */}

        {pendingPin && (
          <Popup
            longitude={pendingPin.coords[0]}
            latitude={pendingPin.coords[1]}
            closeButton={true}
            onClose={() => setPendingPin(null)}
            anchor="top"
          >
            <div
              style={{ textAlign: "center", color: "black", fontSize: "14px" }}
            >
              <p>¿Agregar esta ubicación?</p>
              <button
                onClick={() => {
                  setPins((prev) => [
                    ...prev,
                    {
                      id: Date.now(),
                      coords: pendingPin.coords,
                      address: pendingPin.address,
                    },
                  ]);
                  setPendingPin(null);
                }}
              >
                Si
              </button>
              <button onClick={() => setPendingPin(null)}>Cancelar</button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
