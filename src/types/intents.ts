// The player's intentions: actions as 0-1 values, not keys.
// Written only by game/controls/, read by the actors and newton.
export interface InputIntent {
  thrust: number; // 0 = no thrust, 1 = full thrust
  brake: number; // 0 = none, 1 = full retro-thrust (backward)
  stop: number; // 1 while Space is held: auto-brake to a full stop
  yawLeft: number; // 0-1: turn left around Y (lacet)
  yawRight: number; // 0-1: turn right around Y (lacet)
  pitchUp: number; // 0-1: nose up around X (tangage)
  pitchDown: number; // 0-1: nose down around X (tangage)
}
