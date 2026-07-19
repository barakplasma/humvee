# Controls And Drivetrain

Tags: #controls #drivetrain #input #physics

## Shifter Layout

- Transfer case is on the left.
- Transmission selector is on the right.
- Transfer-case physical order in the game: `HL / H / N / L`.
- Transmission order in the game: `P / R / N / OD / D / 2 / 1`.

## Transfer-Case Range Meanings

- `H`: normal/preferred range when traction is good.
- `HL`: high lock for off-highway hills or continuous wheel slip.
- `N`: disabled/towing state.
- `L`: low range for steep climbs, downgrades, or recovery.

Range changes should be a stopped/neutral procedure in training stages that model
drivetrain protection.

## Driving Model

- Top-down driving uses a kinematic bicycle model:
  `yawRate = signedSpeed / wheelbase * tan(steerAngle)`.
- Steering must not rotate the vehicle at zero speed.
- Reverse uses negative signed speed so path curvature naturally reverses.
- Gas is required for meaningful turning because speed is required for yaw.
- Driving stages with gas should show RPM and make gear/range choices affect:
  acceleration, speed ceiling, engine load, and engine braking.

## HUD

- Speed, RPM, gear, and range should be visible in driving stages.
- Use `DriveControls.getDriveSpec()` and `DriveControls.getRpm()` for consistent
  drivetrain behavior.
