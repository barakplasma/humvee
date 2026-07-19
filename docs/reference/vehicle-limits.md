# Vehicle Limits

Tags: #limits #stage-3 #stage-4 #sources

These are gameplay thresholds. They must be presented as simplified training logic,
not as official go/no-go instructions.

## Slope And Grade

| Concept | Game Threshold | Source Basis | Confidence |
| --- | ---: | --- | --- |
| Climb grade | 60% / 31 degrees | TM 9-2320-280-10 text; TC 21-305-20 Figure 7-13 | High |
| Side slope | 40% / 22 degrees | TM 9-2320-280-10 text; TC 21-305-20 Figure 7-13 | High |
| Side slope while towing | 30% | TM 9-2320-280-10 trailer towing note | High |

## Obstacles

| Concept | Game Threshold | Source Basis | Confidence |
| --- | ---: | --- | --- |
| Vertical step | 18 in | ATPD-2099E vertical step test context | Medium |
| Trench width | 30 in | Simplified training threshold | Low |
| Tree/log height | 10 in | Simplified threshold informed by FM 5-102 obstacle guidance | Low |

## Implementation Notes

- Stage 3 obstacle quiz randomizes values around these thresholds and requires a
  passable/impassable answer.
- The quiz displays a source/threshold note after the player answers.
- If better HMMWV-specific trench/log values are found, update this note first,
  then update `StageObstacleScene`.
