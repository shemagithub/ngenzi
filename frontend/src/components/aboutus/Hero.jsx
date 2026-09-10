import PageHero from "../PageHero";

export default function Hero() {
  return (
    <PageHero
      eyebrow="About Us"
      title={
        <>
          Building Your Future,{" "}
          <span className="italic text-accent-300">One Home at a Time</span>
        </>
      }
      subtitle="We're more than just a property platform — we're your partner in finding the perfect place to call home."
    />
  );
}
