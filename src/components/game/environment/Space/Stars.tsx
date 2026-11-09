import { Stars as DreiStars } from "@react-three/drei";

// Layer 2 of the space backdrop: the star point cloud — drei's <Stars>.
// fade: radial opacity falloff per point (round soft stars, not squares).
// speed={0}: freeze the shader time — static stars, no synchronized pulsing.
export function Stars() {
  return <DreiStars  fade speed={0} />;
}
