import { useEffect, useRef, useState } from "react";
import { mockData } from "@/data/mockData.js";

export interface SolarPoint {
  hour: string;
  kwh: number;
  irradianceWm2: number;
}

const PANEL_AREA_M2 = 44;
const PANEL_EFFICIENCY = 0.185;
const URL =
  "https://api.open-meteo.com/v1/forecast?latitude=41.2995&longitude=69.2401&hourly=shortwave_radiation,direct_radiation&timezone=Asia%2FTashkent&forecast_days=1";

export function useSolarData() {
  const [data, setData] = useState<SolarPoint[]>(mockData.hourlySolar as SolarPoint[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const timerRef = useRef<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const times: string[] = json?.hourly?.time ?? [];
      const irr: number[] = json?.hourly?.shortwave_radiation ?? [];
      if (!times.length || !irr.length) throw new Error("Malformed response");
      const points: SolarPoint[] = [];
      for (let i = 0; i < times.length; i++) {
        const t = times[i];
        const hourStr = t.slice(11, 13);
        const h = parseInt(hourStr, 10);
        if (h >= 7 && h <= 17) {
          const irradiance = irr[i] ?? 0;
          const kwh = (irradiance * PANEL_AREA_M2 * PANEL_EFFICIENCY) / 1000;
          points.push({ hour: hourStr, kwh: Math.max(0, +kwh.toFixed(2)), irradianceWm2: irradiance });
        }
      }
      if (points.length === 0) throw new Error("No daytime data");
      setData(points);
      setIsLive(true);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch");
      setData(mockData.hourlySolar as SolarPoint[]);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    timerRef.current = window.setInterval(fetchData, 60 * 60 * 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, isLive, refresh: fetchData };
}
