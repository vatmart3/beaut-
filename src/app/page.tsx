import { Hero } from "@/sections/home/Hero";

export default function Home() {
  return (
    <div className="frame space-y-3 pt-3">
      <Hero />
      <section className="shell h-screen" />
    </div>
  );
}
