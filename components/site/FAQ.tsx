"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQ() {
  const faqs = [
    {
      question: "Do you include a gift note?",
      answer: "Yes! Every basket comes with a complimentary card. You can add your personal message at checkout, and we'll hand-write it for that extra special touch."
    },
    {
      question: "How long does shipping take?",
      answer: "We typically process orders within 1-2 business days. Standard shipping takes 3-5 business days, while expedited options are available if you need your gift to arrive sooner."
    },
    {
      question: "Can I customize the products in a basket?",
      answer: "We carefully curate each basket to ensure a perfect pairing of items. While we don't offer full customization online yet, for corporate or bulk orders, we can definitely tailor the contents to your needs."
    },
    {
      question: "What if the recipient has allergies?",
      answer: "We list all ingredients and potential allergens on our product pages. If you have specific concerns, please check the 'Details' tab on any basket or contact our support team for guidance."
    },
    {
      question: "Do you offer corporate gifting?",
      answer: "Absolutely. We specialize in corporate orders for teams, clients, and events. Visit our Corporate Gifting page or contact us to get a custom quote and volume pricing."
    }
  ]

  return (
    <section className="w-full bg-[#f7f4ee] py-16 md:py-24">
      <div className="mx-auto w-full max-w-3xl px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#002684] mb-4">
            Common questions
          </h2>
          <p className="text-lg md:text-xl text-[#002684]/70">
            Everything you need to know about your order.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-[#002684]/10">
              <AccordionTrigger className="text-lg font-medium text-[#002684] hover:text-[#002684]/80 text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-[#002684]/70 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </div>
    </section>
  )
}
