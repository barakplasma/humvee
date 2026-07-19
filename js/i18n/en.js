// English strings (base locale). Keys are shared with he.js.
export const en = {
  // ---- Global / shared UI ----
  rotate_hint: "Rotate your device to landscape to play.",
  app_title: "HUMVEE A2",
  app_subtitle: "Driver Trainer",
  disclaimer:
    "Training aid only — a simplified simulation, not an official manual (see TM 9-2320-280-10). Always follow real training and supervision.",
  btn_start: "Start Training",
  btn_back: "Back",
  btn_next: "Next",
  btn_continue: "Continue",
  btn_retry: "Retry",
  btn_menu: "Menu",
  btn_got_it: "Got it",
  btn_begin: "Begin",
  tap_to_continue: "Tap to continue",
  tilt_hint: "Tilt phone to steer • tap wheel to re-centre",
  fullscreen: "Fullscreen",
  locked: "Locked",
  objective: "Objective",
  language: "Language",

  // ---- Menu / stage select ----
  menu_select: "Select a stage",
  stage: "Stage {n}",
  stage1_title: "Driver Controls",
  stage1_blurb: "Learn every control, then start the engine.",
  stage2_title: "City Driving",
  stage2_blurb: "Obey the road and reach your destination.",
  stage3_title: "Off-Road & Gears",
  stage3_blurb: "Master the transfer case and gear ranges.",
  stage4_title: "Technical Off-Road",
  stage4_blurb: "Slopes, side-slopes, traction loss and fording.",
  stage5_title: "Trailer Parking",
  stage5_blurb: "Reverse the water trailer into the bay.",
  best_score: "Best: {score}",
  no_score: "No score yet",
  stage_locked_msg: "Finish the previous stage to unlock this one.",
  progress_reset: "Reset scores",
  progress_reset_confirm: "Reset all scores?",

  // ---- Stage complete ----
  stage_complete: "Stage Complete!",
  well_done: "Well done, driver.",
  score: "Score: {score}",
  btn_next_stage: "Next Stage",
  all_complete_title: "Training Complete",
  all_complete_msg: "You have completed all five stages. Outstanding.",

  // ---- Controls (names + teaching text), used by Stage 1 tour ----
  ctrl_tour_intro:
    "Tap each highlighted control to learn what it does. Learn them all to continue.",
  ctrl_tour_all_seen: "All controls reviewed — now run the start-up sequence.",

  ctrl_ignition_name: "Ignition Switch",
  ctrl_ignition_desc:
    "Rotary switch: OFF → RUN → START. The 6.5L diesel has glow plugs — after RUN, wait for the WAIT-TO-START light to go out before cranking to START.",
  ctrl_accel_name: "Accelerator Pedal",
  ctrl_accel_desc: "Right pedal. Press to add throttle. Ease on gently off-road.",
  ctrl_brake_name: "Service Brake",
  ctrl_brake_desc:
    "Center/left pedal. Hydraulic disc brakes on all four wheels. Press to slow and stop.",
  ctrl_pbrake_name: "Parking Brake",
  ctrl_pbrake_desc:
    "Hand lever. Set it before starting and whenever parked. Release fully before driving off.",
  ctrl_steering_name: "Steering Wheel",
  ctrl_steering_desc:
    "Power-assisted steering. The Humvee is wide — give obstacles extra clearance.",
  ctrl_trans_name: "Transmission Selector",
  ctrl_trans_desc:
    "4-speed automatic: P (park), R (reverse), N (neutral), OD (overdrive, road cruising), D (drive), 2 and 1 (low gears for grades and control).",
  ctrl_transfer_name: "Transfer Case",
  ctrl_transfer_desc:
    "Range lever: H (high, normal), HL (high + locked differential for slippery ground), N (neutral), L (low range for steep or technical terrain).",
  ctrl_lights_name: "Light Switch",
  ctrl_lights_desc:
    "Tactical light panel: service drive (normal), blackout drive, and blackout marker lights for low-visibility operations.",
  ctrl_turn_name: "Turn Signals",
  ctrl_turn_desc: "Column lever. Signal every turn and lane change.",
  ctrl_horn_name: "Horn",
  ctrl_horn_desc: "Warns others. Use sparingly.",
  ctrl_wipers_name: "Wipers",
  ctrl_wipers_desc: "Clear the windshield in rain, snow, or mud spray.",
  ctrl_gauges_name: "Gauge Cluster",
  ctrl_gauges_desc:
    "Watch speed, tachometer, fuel, engine temperature, oil pressure, voltmeter and brake air/vacuum. Scan them constantly.",

  // ---- Stage 1 start-up sequence ----
  startup_title: "Start-Up Sequence",
  startup_intro: "Complete the steps in order.",
  startup_step_pbrake: "Set the parking brake",
  startup_step_park: "Put the transmission in P (Park)",
  startup_step_run: "Turn the ignition to RUN",
  startup_step_wait: "Wait for the WAIT-TO-START light to go out",
  startup_step_start: "Turn the ignition to START",
  startup_step_release: "Release the parking brake",
  startup_step_drive: "Select D (Drive)",
  startup_hint_next: "Next: {step}",
  startup_wait_light: "WAIT TO START",
  startup_engine_running: "Engine running",
  startup_done: "Engine started and ready to roll!",

  // ---- Shared driving HUD / controls ----
  hud_speed: "SPD",
  hud_gear: "GEAR",
  hud_range: "RANGE",
  gas: "GAS",
  brake: "BRAKE",
  transmission_short: "TRANS",
  transfer_short: "T-CASE",

  // ---- Stage 2 city ----
  s2_obj: "Drive to the destination. Stop for red lights and stop signs.",
  s2_light_red: "Red light — stop!",
  s2_ran_light: "You ran a red light. Ease off and wait next time.",
  s2_stopsign: "Stop sign ahead — come to a full stop.",
  s2_offroad: "Stay on the road.",
  s2_arrived: "You reached the destination!",
  s2_reminder_drive: "Keep it in D for city driving.",

  // ---- Stage 3 off-road & gears ----
  s3_obj: "Pick the correct gears for each section of trail, then drive through it.",
  s3_prompt_reverse: "Back out of the staging area. Which transmission gear?",
  s3_prompt_cruise: "Flat, firm trail ahead. Set an efficient cruising setup.",
  s3_prompt_slippery: "Loose, slippery mud. You need locked drive to both axles.",
  s3_prompt_climb: "Short, steep climb. You need maximum low-range torque.",
  s3_need_trans: "Set the transmission.",
  s3_need_transfer: "Set the transfer case.",
  s3_wrong_reverse: "To move backward you need R (Reverse).",
  s3_wrong_cruise: "On firm flat ground use H range with D or OD — save the engine.",
  s3_wrong_slippery: "Slippery ground needs HL (high, differential locked) for grip.",
  s3_wrong_climb: "A steep climb needs L (low range) with gear 1 for torque.",
  s3_correct: "Correct — drive on.",
  s3_section_done: "Section cleared!",
  s3_complete: "Trail complete. You matched gears to terrain.",

  // ---- Stage 4 technical off-road ----
  s4_obj: "Cross the technical course. Read the terrain and use the right technique.",
  s4_pitch: "PITCH",
  s4_roll: "ROLL",
  s4_hint_climb: "Steep climb — low range, steady throttle, keep momentum.",
  s4_hint_descend: "Descent — low gear, let engine braking hold you back. Ease off the gas.",
  s4_hint_sideslope: "Side-slope — keep speed low and steady. Do not turn uphill sharply.",
  s4_hint_3wheel: "A wheel is off the ground! Keep gentle, steady throttle to crawl across.",
  s4_hint_ford: "Water crossing — enter slowly, keep a steady bow wave, do not stop.",
  s4_warn_rollover: "Rollover risk! Reduce the side angle.",
  s4_warn_stall: "You lost momentum. Back down and try again with steady power.",
  s4_rolled: "The vehicle rolled. Reset and take the side-slope slower.",
  s4_stalled: "Stalled on the obstacle. Use low range and momentum.",
  s4_flooded: "You stopped in the water and flooded the engine. Keep steady next time.",
  s4_complete: "Course cleared. Expert-level driving!",

  // ---- Stage 5 trailer parking ----
  s5_intro_title: "Water Trailer (M149)",
  s5_intro_body:
    "You're towing a 400-gallon water trailer. When REVERSING, the trailer swings the OPPOSITE way to the steering wheel — go slow and make small corrections. Pull forward to straighten out if it jackknifes.",
  s5_obj: "Park the water trailer inside the marked bay, straight and stopped.",
  s5_hint_reverse: "Select R and back the trailer into the bay. Steering is reversed when backing.",
  s5_align: "Line the trailer up straight with the bay.",
  s5_jackknife: "Jackknifing! Pull forward (D) to straighten the trailer.",
  s5_inbay: "In the bay — straighten up and stop.",
  s5_parked: "Trailer parked in the perfect spot. Outstanding!",
};
