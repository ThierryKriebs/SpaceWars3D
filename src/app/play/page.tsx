"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/game/Scene"), {
  ssr: false,
});

export default function Page() {
  // Black behind the scene: while the Suspense fallback (null) shows during texture
  // loading, the Canvas is not mounted yet — the page background must be black, not
  // the default white body.
  return (
    <div className="bg-black">
      <Scene />
    </div>
  );
}
