import { useEffect, useState } from "react";
import Shell from "@/components/eduwatt/Shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

interface Zone {
  id: string;
  name: string;
  zone_type: string;
  current_kw: number;
  grid_kwh: number;
}

const cardStyle: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 20,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-label)",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: 14,
};

function isOutsideSchoolHours() {
  const h = new Date().getHours();
  return h < 7 || h >= 18;
}

export default function Zones() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [zones, setZones] = useState<Zone[]>([]);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("normal");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("zones").select("*").eq("user_id", user.id).order("created_at");
    setZones((data as Zone[]) ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const notifyZones = () => window.dispatchEvent(new Event("eduwatt:zones-updated"));

  const addZone = async () => {
    if (!user || !newName.trim()) return;
    const { data, error } = await supabase
      .from("zones")
      .insert({ user_id: user.id, name: newName.trim(), zone_type: newType, current_kw: 0, grid_kwh: 0 })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setZones((z) => [...z, data as Zone]);
    setNewName("");
    setNewType("normal");
    notifyZones();
    toast.success("Zone added");
  };

  const updateZoneField = async (id: string, field: "current_kw" | "grid_kwh", value: number) => {
    const v = Number.isFinite(value) ? Math.max(0, value) : 0;
    setZones((arr) => arr.map((z) => (z.id === id ? { ...z, [field]: v } : z)));
    const payload = field === "current_kw" ? { current_kw: v } : { grid_kwh: v };
    const { error } = await supabase.from("zones").update(payload).eq("id", id);
    if (error) return toast.error(error.message);
    notifyZones();
  };

  const renameZone = async (id: string) => {
    if (!editingName.trim()) return;
    const { error } = await supabase.from("zones").update({ name: editingName.trim() }).eq("id", id);
    if (error) return toast.error(error.message);
    setZones((arr) => arr.map((z) => (z.id === id ? { ...z, name: editingName.trim() } : z)));
    setEditingId(null);
    setEditingName("");
    notifyZones();
  };

  const deleteZone = async (id: string) => {
    const { error } = await supabase.from("zones").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setZones((arr) => arr.filter((z) => z.id !== id));
    notifyZones();
  };

  const totalKw = zones.reduce((s, z) => s + Number(z.current_kw || 0), 0) || 1;
  const outside = isOutsideSchoolHours();

  return (
    <Shell title={t("nav.zones") as string}>
      <div style={cardStyle}>
        <div style={labelStyle}>Energy Distribution</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {zones.map((z) => {
            const pct = (Number(z.current_kw || 0) / totalKw) * 100;
            const color =
              z.zone_type === "waste" ? "#ff6b6b" : z.zone_type === "thermal" ? "#ffa94d" : "var(--accent)";
            return (
              <div key={z.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                  <span>{z.name}</span>
                  <span style={{ color: "var(--text-meta)" }}>{Number(z.current_kw).toFixed(1)} kW</span>
                </div>
                <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Zones</div>
        <div className="eduwatt-scroll-x">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 620 }}>
          <thead>
            <tr style={{ color: "var(--text-meta)", textAlign: "left", fontSize: 11, textTransform: "uppercase" }}>
              <th style={{ padding: "8px 6px" }}>Name</th>
              <th style={{ padding: "8px 6px" }}>Type</th>
              <th style={{ padding: "8px 6px" }}>Current kW</th>
              <th style={{ padding: "8px 6px" }}>Grid kWh</th>
              <th style={{ padding: "8px 6px" }}>Status</th>
              <th style={{ padding: "8px 6px" }}></th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => {
              const wasteFlag = outside && Number(z.current_kw) > 0.5;
              return (
                <tr key={z.id} style={{ color: "var(--text-secondary)", borderTop: "1px solid var(--border-soft)" }}>
                  <td style={{ padding: "10px 6px" }}>
                    {editingId === z.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => renameZone(z.id)}
                        onKeyDown={(e) => e.key === "Enter" && renameZone(z.id)}
                        autoFocus
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "4px 8px", borderRadius: 6, fontSize: 13 }}
                      />
                    ) : (
                      <span
                        onClick={() => { setEditingId(z.id); setEditingName(z.name); }}
                        style={{ cursor: "pointer" }}
                      >
                        {z.name}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "10px 6px", textTransform: "capitalize" }}>{z.zone_type}</td>
                  <td style={{ padding: "10px 6px" }}>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      defaultValue={Number(z.current_kw).toFixed(1)}
                      onBlur={(e) => updateZoneField(z.id, "current_kw", parseFloat(e.target.value))}
                      style={{ width: 80, background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "4px 8px", borderRadius: 6, fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: "10px 6px" }}>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={Number(z.grid_kwh ?? 0).toFixed(0)}
                      onBlur={(e) => updateZoneField(z.id, "grid_kwh", parseFloat(e.target.value))}
                      style={{ width: 90, background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "4px 8px", borderRadius: 6, fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: "10px 6px" }}>
                    {wasteFlag || z.zone_type === "waste" ? (
                      <span style={{ color: "#ff6b6b", fontSize: 11, fontWeight: 600 }}>⚠ WASTE</span>
                    ) : (
                      <span style={{ color: "var(--text-meta)", fontSize: 11 }}>OK</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 6px", textAlign: "right" }}>
                    <button
                      onClick={() => deleteZone(z.id)}
                      style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-meta)", padding: "4px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-meta)" }}>
          Total grid usage across zones: <strong style={{ color: "var(--text-primary)" }}>{zones.reduce((s, z) => s + Number(z.grid_kwh || 0), 0).toFixed(0)} kWh</strong>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-soft)" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New zone name"
            style={{ flex: 1, background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "8px 10px", borderRadius: 6, fontSize: 13 }}
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "8px 10px", borderRadius: 6, fontSize: 13 }}
          >
            <option value="normal">Normal</option>
            <option value="thermal">Thermal</option>
            <option value="waste">Waste</option>
          </select>
          <button
            onClick={addZone}
            style={{ background: "var(--accent)", color: "var(--accent-text)", border: "none", padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            Add Zone
          </button>
        </div>
      </div>
    </Shell>
  );
}
