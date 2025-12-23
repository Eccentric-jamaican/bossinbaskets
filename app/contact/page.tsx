import Nav from "@/components/site/nav";
import ContactForm from "@/components/site/ContactForm";

export const metadata = {
  title: "Contact BossinBaskets",
  description: "Reach the BossinBaskets concierge team for gifting consultations, order support, or partnership inquiries.",
};

const contactDetails = [
  { label: "Email", value: "hello@bossinbaskets.com" },
  { label: "Phone", value: "+1 (404) 555-0118" },
  { label: "Studio", value: "125 Peachtree St NE, Atlanta" },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f4ee] font-sans">
      <Nav />
      <main className="flex-1 px-4 py-10 md:px-8 md:py-16">
        <section className="mx-auto w-full max-w-3xl space-y-6 rounded-3xl border border-[#002684]/10 bg-white/80 p-6 shadow-sm md:p-8">
          <ContactForm />
          <div className="space-y-3 text-body text-[#002684]">
            {contactDetails.map((detail) => (
              <div key={detail.label} className="flex items-center justify-between border-b border-[#002684]/10 pb-2 last:border-b-0">
                <span className="text-sm-fluid text-[#002684]/60">{detail.label}</span>
                <span className="font-medium">{detail.value}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
