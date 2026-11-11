// The player's intentions: actions as 0-1 values, not keys.
// Written only by game/controls/, read by the actors and newton.
export interface InputIntent {
  thrust: number; // 0 = no thrust, 1 = full thrust
}
