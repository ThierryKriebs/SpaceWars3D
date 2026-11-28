import DisplayMainMenu from "@/components/ui/menus/MainMenu";

// page.tsx — the showcase: it only branches the menu.
// The menu itself lives in components/ui/menus/ (see ARCHITECTURE.md).
export default function Home() {
  return <DisplayMainMenu />;
}
