import { Hero } from "@/components/Hero";
import dynamic from "next/dynamic";
import Chat from "@/components/Chat";

export default function Page() {
  return (
    <main>
      <Hero />
      <Chat />
    </main>
  );
}
