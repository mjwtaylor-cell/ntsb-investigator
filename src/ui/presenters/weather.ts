import type { GeneratedCase } from '../../engine';

export interface WeatherView {
  summary: string;
  metar: string;
  taf: string;
  icingBand: string | null;
  sounding: { altFt: number; tempC: number; dewC: number; windKt: number }[];
}

export function presentWeather(bundle: GeneratedCase): WeatherView {
  const e = bundle.world.environment;
  const icao = e.airportId.replace(/[^A-Z0-9]/gi, '').slice(0, 4).toUpperCase() || 'KXXX';
  const icing = bundle.truth.templateId === 'T4' || bundle.truth.templateId === 'T1';
  const wind = e.weatherSummary.match(/wind\s+(\d+)\s*kt/i)?.[1] ?? '9';
  return {
    summary: e.weatherSummary,
    metar: `${icao} 221855Z ${wind}0${wind}KT 1SM -FZDZ OVC012 M02/M03 A2988 RMK AO2`,
    taf: `${icao} 221720Z 2218/2318 ${wind}0${wind}KT 2SM -FZDZ OVC015 TEMPO 2218/2222 1SM FZDZ OVC008`,
    icingBand: icing ? 'Icing band ~2,000–6,000 ft MSL; freezing drizzle in terminal area.' : null,
    sounding: [
      { altFt: e.elevationFt, tempC: -1, dewC: -2, windKt: Number(wind) },
      { altFt: e.elevationFt + 2000, tempC: -4, dewC: -5, windKt: Number(wind) + 4 },
      { altFt: e.elevationFt + 4000, tempC: -8, dewC: -9, windKt: Number(wind) + 8 },
      { altFt: e.elevationFt + 6000, tempC: -12, dewC: -14, windKt: Number(wind) + 12 },
    ],
  };
}
