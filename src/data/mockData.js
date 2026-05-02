// EduWatt mock data
export const mockData = {
  schoolName: "Greenfield Secondary School",
  kpis: {
    solarGenerated: { value: 142.6, unit: "kWh", delta: "+8.2% vs yesterday", deltaPositive: true },
    gridConsumed: { value: 87.3, unit: "kWh", delta: "-4.1% vs yesterday", deltaPositive: true },
    co2Avoided: { value: 64.2, unit: "kg", delta: "+8.2% vs yesterday", deltaPositive: true },
    wasteAlerts: { value: 3, unit: "active", delta: "2 unresolved >1h", deltaPositive: false },
  },
  hourlySolar: [
    { hour: "07", kwh: 2.1, irradianceWm2: 120 },
    { hour: "08", kwh: 5.8, irradianceWm2: 320 },
    { hour: "09", kwh: 11.2, irradianceWm2: 540 },
    { hour: "10", kwh: 16.4, irradianceWm2: 740 },
    { hour: "11", kwh: 20.1, irradianceWm2: 880 },
    { hour: "12", kwh: 22.0, irradianceWm2: 950 },
    { hour: "13", kwh: 20.6, irradianceWm2: 900 },
    { hour: "14", kwh: 17.3, irradianceWm2: 770 },
    { hour: "15", kwh: 12.4, irradianceWm2: 580 },
    { hour: "16", kwh: 6.9, irradianceWm2: 340 },
    { hour: "17", kwh: 2.8, irradianceWm2: 150 },
  ],
  zones: [
    { name: "Classrooms", kw: 28.4, type: "normal" },
    { name: "Science lab", kw: 19.7, type: "normal" },
    { name: "Canteen", kw: 24.1, type: "thermal" },
    { name: "Hallways", kw: 11.6, type: "waste" },
    { name: "Admin", kw: 8.2, type: "normal" },
  ],
  alerts: [
    { severity: "critical", message: "Hallway lights running at full power — no occupancy detected", timestamp: "12 min ago · Block B", waste: "Est. waste: 4.2 kWh", action: "Switch off zone" },
    { severity: "warning", message: "Canteen oven idle but drawing 3.1 kW standby load", timestamp: "38 min ago · Kitchen", waste: "Est. waste: 2.0 kWh", action: "Schedule shutdown" },
    { severity: "warning", message: "Science lab AC overcooling — setpoint 19°C with windows open", timestamp: "1 hr ago · Lab 2", waste: "Est. waste: 1.6 kWh", action: "Adjust setpoint" },
  ],
  recommendations: [
    { id: "REC-001", priority: "high", category: "scheduling", title: "Shift dishwasher to solar peak", detail: "Shift dishwasher cycle to 12:30 to absorb solar peak surplus", projectedSavingKwhPerDay: 6.8, projectedCo2KgPerMonth: 92, effort: "Low" },
    { id: "REC-002", priority: "medium", category: "behavioral", title: "Dim hallway lighting at recess", detail: "Reduce hallway lighting to 40% during recess windows", projectedSavingKwhPerDay: 4.1, projectedCo2KgPerMonth: 56, effort: "Low" },
    { id: "REC-003", priority: "medium", category: "scheduling", title: "Pre-cool with direct solar", detail: "Pre-cool classrooms 11:30–12:00 using direct solar generation", projectedSavingKwhPerDay: 9.3, projectedCo2KgPerMonth: 126, effort: "Medium" },
  ],
};
