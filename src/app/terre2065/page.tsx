"use client";
import dynamic from "next/dynamic";

const Terre2065 = dynamic(() => import("@/components/Terre2065"), {
  ssr: false,
});

export default function Page() {
  return <Terre2065 />;
}

// export default function Page() {
//   return <div style={{ color: "red", padding: 40 }}>Test page</div>;
// }