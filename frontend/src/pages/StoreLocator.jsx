import { Clock3, ExternalLink, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { Button } from "../components/ui/button.jsx";

const googleMapsUrl = "https://www.google.com/maps/@23.8208847,90.2652184,16z?entry=ttu&g_ep=EgoyMDI2MDQyMi4wIKXMDSoASAFQAw%3D%3D";
const embeddedMapUrl = "https://www.google.com/maps?q=23.8208847,90.2652184&z=16&output=embed";

const storeHighlights = [
  { icon: MapPin, label: "Location", value: "Dhaka, Bangladesh" },
  { icon: Phone, label: "Phone", value: "09666200300" },
  { icon: Mail, label: "Email", value: "admin@gmail.com" },
  { icon: Clock3, label: "Hours", value: "Every day, 10:00 AM - 10:00 PM" },
];

export default function StoreLocator() {
  return (
    <section className="section py-12">
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#dbeafe_100%)] p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">Store Locator</p>
          <h1 className="mt-4 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
            Visit NaxoCard or open the store location instantly on Google Maps
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-blue-50/90">
            Use this page to find the store faster, confirm contact details, and open the exact map route in one tap. The
            layout is built to feel like a real location hub instead of a plain external link.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {storeHighlights.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14">
                    <Icon size={19} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="h-12 rounded-full bg-white px-6 font-bold text-slate-900 hover:bg-blue-50">
              <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                <Navigation size={17} /> Open Google Maps
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-white/30 bg-white/10 px-6 font-bold text-white hover:bg-white/15 hover:text-white"
            >
              <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={17} /> Open exact map link
              </a>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/70">Map Preview</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Live location view</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              The preview below shows the pinned area. For full navigation, traffic, and route planning, use the Google Maps
              button.
            </p>
          </div>

          <div className="aspect-[16/12] w-full bg-slate-100">
            <iframe
              title="NaxoCard store map"
              src={embeddedMapUrl}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="grid gap-4 px-6 py-6 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="text-lg font-black text-slate-900">Need turn-by-turn directions?</h3>
              <p className="mt-1 text-sm leading-7 text-slate-600">
                Open the external map to navigate directly to the location at <strong>23.8208847, 90.2652184</strong>.
              </p>
            </div>
            <Button asChild className="h-11 rounded-full px-5 font-bold">
              <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={16} /> Launch Maps
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
