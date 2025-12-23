import Nav from "@/components/site/Nav";

const beliefs: { title: string; description: string }[] = [
  {
    title: "Craft with intent",
    description:
      "Every basket is a selection of goods, hand-wrapped with a level of detail that reflects your own professional standards.",
  },
  {
    title: "Protect relationships",
    description:
      "In business retention is always cheaper than acquisition. We become your silent partner in client loyalty.",
  },
  {
    title: "Stay nimble",
    description:
      "Your schedule is demanding enough. From storing your business cards to managing your delivery calendar, we keep the process effortless so you never miss a milestone.",
  },
];

export const metadata = {
  title: "About BossinBaskets",
  description: "The story behind BossinBaskets—our mission, values, and the team crafting thoughtful gifting moments.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f4ee] font-sans">
      <Nav />
      <main className="flex-1 px-4 py-12 md:px-8 md:py-20">
        <section className="mx-auto w-full max-w-5xl space-y-6">
          <p className="text-sm-fluid uppercase tracking-[0.2em] text-[#002684]">Who we are</p>
          <h1 className="text-h1 font-serif text-[#002684]">Gifting that feels thoughtful, never forced.</h1>
          <p className="text-body leading-relaxed text-[#002684]/85 max-w-2xl">
            BossinBaskets exists so you can nurture your most important relationships without the
            headache. We source and handle the logistics.
          </p>
        </section>

        <section className="mx-auto mt-16 w-full max-w-5xl border-y border-[#d4ddf9]/60 py-12">
          <p className="text-sm-fluid uppercase tracking-[0.2em] text-[#002684]/60">Our point of view</p>
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            {beliefs.map((belief) => (
              <article key={belief.title} className="space-y-3 border-l border-[#cbd5f5] pl-6">
                <h2 className="text-h2 font-serif text-[#002684]">{belief.title}</h2>
                <p className="text-body text-[#002684]/75">{belief.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 w-full max-w-5xl">
          <div className="relative overflow-hidden rounded-[32px] bg-[#0f172a] p-6 text-white md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_55%)]" aria-hidden="true" />
            <div className="relative space-y-4">
              <p className="text-sm-fluid uppercase tracking-[0.2em] text-white/60">Words we live by</p>
              <p className="text-body italic text-white/90">
                “I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.”
              </p>
              <p className="text-body font-medium">— Maya Angelou</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
