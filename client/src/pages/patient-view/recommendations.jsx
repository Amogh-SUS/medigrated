// client/src/pages/patient-view/recommendations.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";

/*
  Recommendations page (location-based).
  - Requests browser geolocation
  - Calls backend GET /api/nearby?lat=..&lon=..&type=..
  - Shows list with distance + map link
  - Simple refresh + type selector
*/

function PlaceItem({ place }) {
  const name = place.name || "Unknown";
  const addr = place.address || "";
  const dist = place.distanceKm ?? null;
  const external = place.googleLink || place.osmLink || "#";

  return (
    <div className="p-3 border rounded-md flex items-start gap-3 bg-card">
      <div className="p-2 rounded-md bg-muted/20">
        <MapPin />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-medium text-lg">{name}</h3>
            <div className="text-sm text-muted-foreground mt-1">{addr}</div>
          </div>
          {dist !== null && (
            <div className="text-sm text-muted-foreground text-right">
              <div>{dist} km</div>
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <a className="text-sm underline inline-flex items-center gap-1" target="_blank" rel="noreferrer" href={external}>
            Open in maps <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Recommendations() {
  const [coords, setCoords] = useState(null);
  const [type, setType] = useState("clinic"); // clinic | hospital | pharmacy
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    // ask for geolocation on page load
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mountedRef.current) return;
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setError("Unable to get your location. Allow location access and refresh.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );

    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!coords) return;
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, type]);

  async function fetchRecommendations() {
    setError("");
    setLoading(true);
    try {
      const res = await axios.get("/api/recommendations", {
        params: { lat: coords.lat, lon: coords.lon, type },
        withCredentials: true,
        headers: { "Cache-Control": "no-store, no-cache" },
      });

      if (res?.data?.success) {
        setPlaces(res.data.places || []);
      } else {
        setError(res?.data?.message || "No recommendations found.");
        setPlaces([]);
      }
    } catch (err) {
      console.error("fetchRecommendations error:", err);
      setError(err?.response?.data?.message || err.message || "Network error");
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Recommendations Nearby</h2>
          <p className="text-sm text-muted-foreground">
            Clinically useful locations near you — clinics, hospitals, pharmacies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 border rounded-md bg-transparent"
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Select place type"
          >
            <option value="clinic">Clinics</option>
            <option value="hospital">Hospitals</option>
            <option value="pharmacy">Pharmacies</option>
          </select>

          <Button onClick={fetchRecommendations} disabled={!coords || loading}>
            {loading ? "Searching..." : "Refresh"}
          </Button>
        </div>
      </div>

      {!coords && !error && (
        <div className="p-3 text-sm text-muted-foreground">Waiting for location permission...</div>
      )}

      {error && (
        <div className="p-3 mb-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-3">
        {places.length === 0 && !loading && coords && !error && (
          <div className="p-3 text-sm text-muted-foreground">No places found — try another category or refresh.</div>
        )}

        {places.map((p) => <PlaceItem key={p.id} place={p} />)}
      </div>
    </div>
  );
}
