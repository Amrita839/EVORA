import { NewsletterForm } from "@/components/shared/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="container-evora pb-24">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-ivory-200 px-8 py-14 text-center">
        <h2 className="font-serif text-2xl text-forest-950 sm:text-3xl">Stay close to the season</h2>
        <p className="max-w-md text-muted-foreground">
          Occasional notes on new collections and festive gifting windows — no spam, unsubscribe anytime.
        </p>
        <div className="w-full max-w-sm pt-2">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
