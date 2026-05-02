// EduWatt mock data
export const mockData = {
  kpis: {
    solarGenerated: { value: 142.6, unit: "kWh", delta: "+8.2% vs yesterday", deltaPositive: true },
    gridConsumed: { value: 87.3, unit: "kWh", delta: "-4.1% vs yesterday", deltaPositive: true },
    co2Avoided: { value: 64.2, unit: "kg", delta: "+8.2% vs yesterday", deltaPositive: true },
    wasteAlerts: { value: 3, unit: "active", delta: "2 unresolved >1h", deltaPositive: false },
  },
  // Hourly solar output kWh, 07:00 - 17:00, bell curve peaking at 12:00
  hourlySolar: [
    { hour: "07", kwh: 2.1 },
    { hour: "08", kwh: 5.8 },
    { hour: "09", kwh: 11.2 },
    { hour: "10", kwh: 16.4 },
    { hour: "11", kwh: 20.1 },
    { hour: "12", kwh: 22.0 },
    { hour: "13", kwh: 20.6 },
    { hour: "14", kwh: 17.3 },
    { hour: "15", kwh: 12.4 },
    { hour: "16", kwh: 6.9 },
    { hour: "17", kwh: 2.8 },
  ],
  zones: [
    { name: "Classrooms", kw: 28.4, type: "normal" },
    { name: "Science lab", kw: 19.7, type: "normal" },
    { name: "Canteen", kw: 24.1, type: "thermal" },
    { name: "Hallways", kw: 11.6, type: "waste" },
    { name: "Admin", kw: 8.2, type: "normal" },
  ],
  alerts: [
    {
      severity: "critical",
      message: "Hallway lights running at full power — no occupancy detected",
      timestamp: "12 min ago · Block B",
      waste: "Est. waste: 4.2 kWh",
      action: "Switch off zone",
    },
    {
      severity: "warning",
      message: "Canteen oven idle but drawing 3.1 kW standby load",
      timestamp: "38 min ago · Kitchen",
      waste: "Est. waste: 2.0 kWh",
      action: "Schedule shutdown",
    },
    {
      severity: "warning",
      message: "Science lab AC overcooling — setpoint 19°C with windows open",
      timestamp: "1 hr ago · Lab 2",
      waste: "Est. waste: 1.6 kWh",
      action: "Adjust setpoint",
    },
  ],
  recommendations: [
    {
      text: "Shift dishwasher cycle to 12:30 to absorb solar peak surplus",
      saving: "Projected saving: 6.8 kWh / day",
    },
    {
      text: "Reduce hallway lighting to 40% during recess windows",
      saving: "Projected saving: 4.1 kWh / day",
    },
    {
      text: "Pre-cool classrooms 11:30–12:00 using direct solar generation",
      saving: "Projected saving: 9.3 kWh / day",
    },
  ],
};
