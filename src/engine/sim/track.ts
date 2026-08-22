/** Lat/lon integration along a ground track (simple spherical dead reckoning). */

const EARTH_RADIUS_NM = 3440.065;

/** Degrees → radians. */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Radians → degrees. */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export interface LatLon {
  lat_deg: number;
  lon_deg: number;
}

/**
 * Advance position by groundspeed (kt) and track (deg) for `dtSec` seconds.
 * Small-step spherical approximation suitable for 1 Hz GA/RJ tracks.
 */
export function integrateLatLon(
  pos: LatLon,
  groundspeedKt: number,
  trackDeg: number,
  dtSec: number,
): LatLon {
  const distanceNm = (groundspeedKt * dtSec) / 3600;
  const angular = distanceNm / EARTH_RADIUS_NM;
  const lat1 = degToRad(pos.lat_deg);
  const lon1 = degToRad(pos.lon_deg);
  const brng = degToRad(trackDeg);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) +
      Math.cos(lat1) * Math.sin(angular) * Math.cos(brng),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    lat_deg: radToDeg(lat2),
    lon_deg: ((radToDeg(lon2) + 540) % 360) - 180,
  };
}

/** Rough airport coordinates by fictional id (deterministic stubs). */
export const AIRPORT_COORDS: Readonly<Record<string, LatLon>> = {
  KPWD: { lat_deg: 46.8721, lon_deg: -113.994 },
  KCRK: { lat_deg: 44.0582, lon_deg: -121.315 },
  KFAR: { lat_deg: 38.8403, lon_deg: -97.6114 },
  KLKT: { lat_deg: 44.7631, lon_deg: -85.6206 },
  KBRN: { lat_deg: 39.7392, lon_deg: -104.990 },
  KSGR: { lat_deg: 35.9606, lon_deg: -83.9207 },
};

export function airportLatLon(airportId: string): LatLon {
  return AIRPORT_COORDS[airportId] ?? { lat_deg: 39.0, lon_deg: -98.0 };
}
