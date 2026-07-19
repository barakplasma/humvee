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
  stage6_title: "Pre/Post Checks",
  stage6_blurb: "Inspect tires, oil, fluids and leaks.",
  stage7_title: "Gauge Scan",
  stage7_blurb: "Learn what each instrument is telling you.",
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
  all_complete_msg: "You have completed all seven stages. Outstanding.",

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

  // ---- Stage 6 pre/post driving checks ----
  s6_obj: "Review each pre-drive and post-drive inspection item.",
  s6_progress: "Inspection checks: {done} / {total}",
  s6_tire_title: "Tire Pressure & Condition",
  s6_tire_body:
    "Before driving, check all tires for obvious low pressure, cuts, exposed cord, missing valve caps, and loose or missing lug nuts. Use the correct pressure from the vehicle data plate or unit SOP.",
  s6_oil_title: "Engine Oil",
  s6_oil_body:
    "With the vehicle level and engine off, pull the dipstick, wipe it, reinsert, then read the level. Oil should be in range and not milky, gritty, or burnt-smelling.",
  s6_fluids_title: "Fluid Levels",
  s6_fluids_body:
    "Check coolant, brake fluid, power steering fluid, and other visible reservoirs according to the operator checklist. Do not open a hot cooling system.",
  s6_belts_title: "Belts, Hoses & Wiring",
  s6_belts_body:
    "Look for cracked belts, loose clamps, worn hoses, damaged wiring, or anything rubbing near moving parts. Small issues become breakdowns off-road.",
  s6_post_leaks_title: "Post-Drive Leaks",
  s6_post_leaks_body:
    "After driving, look under the engine, transmission, transfer case, axles, and hubs for fresh leaks. New drips after a hard run matter.",
  s6_post_tires_title: "Post-Drive Tires & Hubs",
  s6_post_tires_body:
    "After driving, recheck tire damage and feel near hubs cautiously for abnormal heat. Heat, smell, or fresh noise can point to brake or bearing trouble.",

  // ---- Stage 7 gauges ----
  s7_obj: "Tap every highlighted gauge and answer the quiz.",
  s7_progress: "Gauge quiz: {done} / {total}",
  s7_correct: "Correct.",
  s7_wrong: "Not quite. Try that gauge again.",
  s7_oil_title: "Oil Pressure",
  s7_oil_body:
    "Oil pressure confirms the engine is being lubricated. A sudden drop, flicker, or reading outside the normal range means stop safely and investigate.",
  s7_oil_question: "The oil pressure drops suddenly while driving. What should you do?",
  s7_oil_choice_stop: "Stop safely and investigate",
  s7_temp_title: "Engine Temperature",
  s7_temp_body:
    "Temperature shows cooling-system health. Rising temperature under load means reduce strain, check airflow, coolant, fan belts, and leaks.",
  s7_temp_question: "The temperature gauge climbs under load. What is the best first response?",
  s7_temp_choice_reduce: "Reduce strain and check cooling",
  s7_fuel_title: "Fuel Level",
  s7_fuel_body:
    "Fuel level is part of route planning. Off-road work and low range burn more fuel than steady road driving.",
  s7_fuel_question: "You are entering a long low-range off-road section. What does this gauge affect?",
  s7_fuel_choice_plan: "Fuel and route planning",
  s7_speed_title: "Speedometer / Odometer",
  s7_speed_body:
    "Speed helps you obey limits and choose the right gear range. The odometer supports fuel, maintenance, and mission tracking.",
  s7_speed_question: "Why scan speed while choosing gear range?",
  s7_speed_choice_adjust: "Match speed to limits and gear range",
  s7_volt_title: "Voltmeter",
  s7_volt_body:
    "Voltage shows charging-system health. Low voltage can mean battery or alternator trouble; unusually high voltage can damage equipment.",
  s7_volt_question: "The voltmeter shows an abnormal charge reading. What does that suggest?",
  s7_volt_choice_check: "Check the charging system",
  s7_choice_ignore: "Ignore it if the engine runs",
  s7_choice_speedup: "Speed up to clear the problem",
  s7_choice_lights: "Switch lighting modes",
  s7_choice_park: "Shift the transmission to P",
};
