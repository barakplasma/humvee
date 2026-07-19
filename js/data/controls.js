// HMMWV A2 driver controls. Text is stored as i18n KEYS (resolved via t()).
// `pos` is the hotspot centre in the 1280x720 design space, tuned to sit over the
// real controls in the shipped `dashboard_panel` cockpit image (cover-fit). If you
// swap that image for a differently-framed photo, nudge these to match.
// `icon` picks a simple procedural glyph drawn at the hotspot.
export const CONTROLS = [
  {
    id: "gauges",
    nameKey: "ctrl_gauges_name",
    descKey: "ctrl_gauges_desc",
    pos: { x: 650, y: 250 },
    icon: "gauge",
  },
  {
    id: "lights",
    nameKey: "ctrl_lights_name",
    descKey: "ctrl_lights_desc",
    pos: { x: 110, y: 205 },
    icon: "panel",
  },
  {
    id: "turn",
    nameKey: "ctrl_turn_name",
    descKey: "ctrl_turn_desc",
    pos: { x: 255, y: 355 },
    icon: "stalk",
  },
  {
    id: "ignition",
    nameKey: "ctrl_ignition_name",
    descKey: "ctrl_ignition_desc",
    pos: { x: 150, y: 300 },
    icon: "key",
  },
  {
    id: "wipers",
    nameKey: "ctrl_wipers_name",
    descKey: "ctrl_wipers_desc",
    pos: { x: 760, y: 120 },
    icon: "stalk",
  },
  {
    id: "steering",
    nameKey: "ctrl_steering_name",
    descKey: "ctrl_steering_desc",
    pos: { x: 500, y: 250 },
    icon: "wheel",
  },
  {
    id: "pbrake",
    nameKey: "ctrl_pbrake_name",
    descKey: "ctrl_pbrake_desc",
    pos: { x: 75, y: 385 },
    icon: "lever",
  },
  {
    id: "trans",
    nameKey: "ctrl_trans_name",
    descKey: "ctrl_trans_desc",
    pos: { x: 1000, y: 565 },
    icon: "lever",
  },
  {
    id: "transfer",
    nameKey: "ctrl_transfer_name",
    descKey: "ctrl_transfer_desc",
    pos: { x: 958, y: 445 },
    icon: "lever",
  },
  {
    id: "horn",
    nameKey: "ctrl_horn_name",
    descKey: "ctrl_horn_desc",
    pos: { x: 205, y: 120 },
    icon: "button",
  },
  {
    id: "brake",
    nameKey: "ctrl_brake_name",
    descKey: "ctrl_brake_desc",
    pos: { x: 360, y: 545 },
    icon: "pedal",
  },
  {
    id: "accel",
    nameKey: "ctrl_accel_name",
    descKey: "ctrl_accel_desc",
    pos: { x: 460, y: 545 },
    icon: "pedal",
  },
];

// Transmission selector positions (order matters for the on-screen selector).
export const TRANSMISSION = ["P", "R", "N", "OD", "D", "2", "1"];

// Transfer-case range positions.
export const TRANSFER = ["H", "HL", "N", "L"];
