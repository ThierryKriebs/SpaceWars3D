"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/game/Scene"), {
  ssr: false,
});

export default function Page() {
  return <Scene />;
}
