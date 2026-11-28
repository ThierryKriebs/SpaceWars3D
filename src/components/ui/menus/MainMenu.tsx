"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// MainMenu.tsx — the home screen. Pure 2D React (components/ui/): no WebGL here.
// Two levels: title + PLAY button, then the submenu (Campaign / Options / Free flight).

// Display data for the Options key map (AZERTY labels). Keep in sync with the
// KEYMAP table in game/controls/keyboard.ts.
const KEY_LIST: { label: string; action: string }[] = [
  { label: "Z", action: "Poussée avant" },
  { label: "S", action: "Rétrofusée" },
  { label: "Q", action: "Strafe gauche" },
  { label: "D", action: "Strafe droite" },
  { label: "Maj gauche", action: "Monter" },
  { label: "Ctrl gauche", action: "Descendre" },
  { label: "Espace", action: "Frein translation" },
  { label: "Alt gauche", action: "Frein rotation" },
  { label: "Pavé 8", action: "Tangage nez bas (= rotation axe X)" },
  { label: "Pavé 5", action: "Tangage nez haut (= rotation axe X)" },
  { label: "Pavé 4", action: "Lacet gauche (= rotation axe Y)" },
  { label: "Pavé 6", action: "Lacet droite (= rotation axe Y)" },
  { label: "Flèche droite", action: "Roulis droite (= rotation axe Z)" },
  { label: "Entrée pavé", action: "Roulis gauche (= rotation axe Z)" },
];

const BUTTON =
  "w-64 rounded border border-zinc-700 px-6 py-3 text-lg tracking-widest " +
  "transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40";

export default function DisplayMainMenu() {
  const router = useRouter();
  const [inSubmenu, setInSubmenu] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  if (showKeys) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black text-zinc-100">
        <h1 className="text-3xl font-bold tracking-widest">TOUCHES</h1>
        <ul className="grid grid-cols-2 gap-x-16 gap-y-2 text-sm">
          {KEY_LIST.map((k) => (
            <li key={k.label} className="flex gap-4">
              <span className="w-28 text-right font-mono text-zinc-400">{k.label}</span>
              <span>{k.action}</span>
            </li>
          ))}
        </ul>
        <button onClick={() => setShowKeys(false)} className={BUTTON}>
          RETOUR
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-black text-zinc-100">
      <h1 className="text-6xl font-bold tracking-[0.3em]">SPACE WARS 3D</h1>
      {!inSubmenu ? (
        <button onClick={() => setInSubmenu(true)} className={BUTTON}>
          JOUER
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          <button disabled className={BUTTON}>
            CAMPAGNE (à venir)
          </button>
          <button onClick={() => setShowKeys(true)} className={BUTTON}>
            OPTIONS
          </button>
          <button onClick={() => router.push("/play")} className={BUTTON}>
            VOL LIBRE
          </button>
        </div>
      )}
    </main>
  );
}
