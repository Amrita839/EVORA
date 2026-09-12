import { SectionHeading } from "./section-heading";
import { InstagramIcon } from "@/components/shared/social-icons";

/**
 * Visual placeholder grid — wire this up to the Instagram Basic Display /
 * Graph API (or a service like Behold/SnapWidget) once the owner connects a
 * real account. Kept purely presentational until then.
 */
export function SocialInspiration({ handle }: { handle?: string }) {
  return (
    <section className="container-evora py-20">
      <SectionHeading
        eyebrow="Inspiration"
        title={handle ? `Follow ${handle}` : "Gifting inspiration"}
        align="center"
        className="mx-auto"
      />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-forest-100 via-champagne-100 to-beige-100"
          >
            <InstagramIcon className="size-6 text-forest-700/40 transition-transform group-hover:scale-110" />
          </div>
        ))}
      </div>
    </section>
  );
}
