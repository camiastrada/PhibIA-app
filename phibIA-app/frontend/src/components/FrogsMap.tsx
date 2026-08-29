import { useState, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { SearchBox } from "@mapbox/search-js-react";
import { useSearchParams } from "react-router-dom";
import ranaIcon from "../assets/frog2.png";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYWdvc3JvZHJpZ3VleiIsImEiOiJjbWhjeWRmcHcwZ2Y4MmxwdHRxa2x2Zm15In0.9cwGVix-S-zFHfXSs1DgBw";

type UbicacionBackend = {
  latitud: number;
  longitud: number;
  nombre: string;
  fecha_grabacion?: string;
  tipo?: "especie" | "rana_toro";
};

interface Location {
  id: number;
  lat: number;
  lng: number;
  species: string;
  recorded_at: string;
  type: "registered" | "user" | "current_detection";
  address?: string;
  esRanaToro?: boolean;
}

interface FrogsMapProps {
  onSelectLocation?: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  especieDetectada?: string;
  initialLocation?: { lat: number; lng: number };
  mode?: "select" | "view";
}

export default function FrogsMap({
  onSelectLocation,
  especieDetectada = "",
  initialLocation,
  mode = "view",
}: FrogsMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [mapLoaded, setMapLoaded] = useState(false);

  // Ubicación a confirmar al hacer click en el mapa
  const [clickPin, setClickPin] = useState<{
    coords: [number, number];
    address: string;
  } | null>(null);

  // Ubicación a confirmar desde la búsqueda
  const [searchPin, setSearchPin] = useState<{
    coords: [number, number];
    address: string;
  } | null>(null);

  // ✅ Leer especie de la URL
  const [searchParams] = useSearchParams();
  const especieFromUrl = searchParams.get("especie") || "";

  // ✅ Combinar especie detectada y especie de URL
  const especieParaMostrar = especieDetectada || especieFromUrl;

  const extractStreetAndNumber = (fullAddress: string): string => {
    if (!fullAddress || fullAddress === "Ubicación desconocida") {
      return "Ubicación desconocida";
    }

    const parts = fullAddress.split(",");
    if (parts.length > 0) {
      return parts[0].trim();
    }

    return fullAddress;
  };

  async function fetchAddressFromCoords(lng: number, lat: number) {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es`
      );
      const data = await res.json();
      const fullAddress =
        data.features[0]?.place_name || "Ubicación desconocida";
      return extractStreetAndNumber(fullAddress);
    } catch {
      return "Ubicación desconocida";
    }
  }

  // ✅ Cargar TODAS las ubicaciones (sin filtro)
  const fetchLocations = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? "/api";
      const url = `${API_URL}/ubicaciones`;

      const response = await fetch(url);
      console.log("🔍 Fetching todas las ubicaciones");

      if (response.ok) {
        const data: UbicacionBackend[] = await response.json();
        console.log("📍 Ubicaciones recibidas:", data);

        // Obtener direcciones para cada ubicación
        const locationsWithAddresses = await Promise.all(
          data.map(async (ubicacion, index) => {
            const address = await fetchAddressFromCoords(
              ubicacion.longitud,
              ubicacion.latitud
            );
            return {
              id: index + 1,
              lat: ubicacion.latitud,
              lng: ubicacion.longitud,
              species: ubicacion.nombre,
              recorded_at:
                ubicacion.fecha_grabacion || new Date().toISOString(),
              type: "registered" as const,
              address: address,
              esRanaToro: ubicacion.tipo === "rana_toro",
            };
          })
        );

        setFilteredLocations(locationsWithAddresses);
      } else {
        console.error("Error en response:", response.status);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  // Cargar ubicaciones al montar el componente
  useEffect(() => {
    fetchLocations();
  }, []);

  // Ubicación del usuario en tiempo real
  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocalización no soportada");
      return;
    }

    console.log("📍 Iniciando seguimiento de ubicación...");

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([longitude, latitude]);
        const address = await fetchAddressFromCoords(longitude, latitude);
        setUserAddress(address);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          console.log("Permiso de ubicación denegado por el usuario");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location);
  };

  const renderLocationPopup = (location: Location) => (
    <div style={{ color: "black", minWidth: "200px" }}>
      <h3
        style={{
          margin: "0 0 8px 0",
          color: "#004D40",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        {location.type === "user"
          ? "Tu ubicación actual"
          : location.type === "current_detection"
          ? `Especie detectada: ${location.species}`
          : location.esRanaToro
          ? `🐸 Avistamiento de ${location.species}`
          : location.species}
      </h3>

      <p style={{ margin: "6px 0", fontSize: "14px" }}>
        <strong>Dirección:</strong>
        <br />
        {location.address || userAddress || "Ubicación desconocida"}
      </p>

      <p style={{ margin: "6px 0", fontSize: "12px", color: "#666" }}>
        <strong>Fecha:</strong>
        <br />
        {new Date(location.recorded_at).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </p>
    </div>
  );

  // Determinar la ubicación inicial del mapa
  const getInitialViewState = () => {
    if (mode === "view" && initialLocation) {
      return {
        longitude: initialLocation.lng,
        latitude: initialLocation.lat,
        zoom: 14,
      };
    }

    if (userLocation) {
      return {
        longitude: userLocation[0],
        latitude: userLocation[1],
        zoom: 14,
      };
    }

    return {
      longitude: -64.3493,
      latitude: -33.123,
      zoom: 12,
    };
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Loading mientras carga el mapa */}
      {!mapLoaded && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: "10px" }}>🔄</div>
          Cargando mapa...
        </div>
      )}

      {/* Caja de búsqueda - Solo mostrar si es modo selección */}
      {onSelectLocation && (
        <div
          style={{
            position: "absolute",
            zIndex: 2,
            top: 10,
            left: 10,
            width: "min(300px, calc(100% - 20px))",
          }}
        >
          <SearchBox
            accessToken={MAPBOX_TOKEN}
            onRetrieve={(res) => {
              const feature = res.features?.[0];
              if (!feature) return;

              const [lng, lat] = feature.geometry.coordinates;
              const address =
                feature.properties.full_address ||
                feature.properties.name ||
                "Dirección no encontrada";

              setSearchPin({ coords: [lng, lat], address });
            }}
            options={{
              country: "AR",
              language: "es",
            }}
          />
        </div>
      )}

      {/* Mapa */}
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={getInitialViewState()}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onLoad={() => setMapLoaded(true)}
        onClick={async (e) => {
          if (!onSelectLocation) return;

          const { lng, lat } = e.lngLat;
          const address = await fetchAddressFromCoords(lng, lat);

          setClickPin({
            coords: [lng, lat],
            address,
          });
        }}
      >
        {/* Marcador de ubicación del usuario en tiempo real*/}
        {userLocation && (
          <Marker
            key="user-location"
            longitude={userLocation[0]}
            latitude={userLocation[1]}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick({
                id: 0,
                lat: userLocation[1],
                lng: userLocation[0],
                species: especieParaMostrar || "Ubicación actual",
                recorded_at: new Date().toISOString(),
                type: especieParaMostrar ? "current_detection" : "user",
                address: userAddress || undefined,
              });
            }}
          >
            <div
              style={{
                background: "#43A047", // ✅ MISMO COLOR VERDE
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              <img
                src={ranaIcon}
                alt={
                  especieParaMostrar
                    ? `Especie detectada: ${especieParaMostrar}`
                    : "Tu ubicación"
                }
                style={{
                  width: "18px",
                  height: "18px",
                  filter: "brightness(0) invert(1)",
                }}
              />
            </div>
          </Marker>
        )}

        {/*Marcador de ubicación inicial en modo view */}
        {mode === "view" && initialLocation && (
          <Marker
            key="initial-location"
            longitude={initialLocation.lng}
            latitude={initialLocation.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick({
                id: -1,
                lat: initialLocation.lat,
                lng: initialLocation.lng,
                species: especieParaMostrar || "Ubicación de grabación",
                recorded_at: new Date().toISOString(),
                type: especieParaMostrar ? "current_detection" : "registered",
                address: userAddress || undefined,
              });
            }}
          >
            <div
              style={{
                background: "#43A047",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              <img
                src={ranaIcon}
                alt="Ubicación de grabación"
                style={{
                  width: "18px",
                  height: "18px",
                  filter: "brightness(0) invert(1)",
                }}
              />
            </div>
          </Marker>
        )}

        {/* Marcadores de TODAS las ubicaciones */}
        {filteredLocations.map((location) => (
          <Marker
            key={location.id}
            longitude={location.lng}
            latitude={location.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(location);
            }}
          >
            <div
              style={{
                background: location.esRanaToro ? "#E53935" : "#43A047",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              <img
                src={ranaIcon}
                alt={
                  location.esRanaToro
                    ? "Avistamiento de rana toro"
                    : "Especie detectada"
                }
                style={{
                  width: "18px",
                  height: "18px",
                  filter: "brightness(0) invert(1)",
                }}
              />
            </div>
          </Marker>
        ))}

        {/* Popup único para TODAS las ubicaciones */}
        {selectedLocation && (
          <Popup
            longitude={selectedLocation.lng}
            latitude={selectedLocation.lat}
            closeButton={true}
            onClose={() => setSelectedLocation(null)}
            anchor="top"
          >
            {renderLocationPopup(selectedLocation)}
          </Popup>
        )}

        {/* Popup para click en el mapa - Solo en modo selección */}
        {clickPin && onSelectLocation && (
          <Popup
            longitude={clickPin.coords[0]}
            latitude={clickPin.coords[1]}
            closeButton={true}
            onClose={() => setClickPin(null)}
            anchor="top"
          >
            <div
              style={{
                textAlign: "center",
                color: "black",
                fontSize: "14px",
              }}
            >
              <p>¿Usar esta ubicación?</p>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "center",
                  marginTop: "8px",
                }}
              >
                <button
                  onClick={() => {
                    onSelectLocation({
                      lat: clickPin.coords[1],
                      lng: clickPin.coords[0],
                      address: clickPin.address,
                    });
                    setClickPin(null);
                  }}
                  style={{
                    background: "#43A047",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Sí
                </button>
                <button
                  onClick={() => setClickPin(null)}
                  style={{
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Popup>
        )}

        {/* Popup para búsqueda - Solo en modo selección */}
        {searchPin && onSelectLocation && (
          <Popup
            longitude={searchPin.coords[0]}
            latitude={searchPin.coords[1]}
            closeButton={true}
            onClose={() => setSearchPin(null)}
            anchor="top"
          >
            <div
              style={{
                textAlign: "center",
                color: "black",
                fontSize: "14px",
              }}
            >
              <p>¿Usar esta ubicación buscada?</p>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "center",
                  marginTop: "8px",
                }}
              >
                <button
                  onClick={() => {
                    onSelectLocation({
                      lat: searchPin.coords[1],
                      lng: searchPin.coords[0],
                      address: searchPin.address,
                    });
                    setSearchPin(null);
                  }}
                  style={{
                    background: "#43A047",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Sí
                </button>
                <button
                  onClick={() => setSearchPin(null)}
                  style={{
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
