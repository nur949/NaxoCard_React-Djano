import { motion } from "framer-motion";
import { Headphones, Mail, MapPin, Phone, Send, ShieldCheck } from "lucide-react";

const contactCards = [
  {
    icon: Phone,
    title: "Call us",
    text: "09666200300",
    subtext: "Sat - Thu, 9 AM - 9 PM",
  },
  {
    icon: Mail,
    title: "Email support",
    text: "support@myshop.test",
    subtext: "We reply within 24 hours",
  },
  {
    icon: MapPin,
    title: "Visit store",
    text: "Dhaka, Bangladesh",
    subtext: "Flagship customer service desk",
  },
];

export default function Contact() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(120deg,#d8eef8_0%,#edf5ff_40%,#efe7ff_100%)] dark:bg-[linear-gradient(120deg,#0f1f33_0%,#162235_40%,#221a35_100%)]" />

      <div className="section relative z-10 py-14 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-5xl"
        >
          <div className="rounded-[32px] border bg-card/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur xl:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">Contact</p>
                <h1 className="mt-4 text-4xl font-black text-foreground sm:text-5xl">Let’s talk about your next order.</h1>
                <p className="mt-5 max-w-md text-base leading-8 text-muted-foreground">
                  For delivery help, product questions, order updates, or store support, reach out through any of the channels below.
                </p>

                <div className="mt-8 grid gap-4">
                  {contactCards.map(({ icon: Icon, title, text, subtext }) => (
                    <div key={title} className="flex items-start gap-4 rounded-2xl border bg-background/70 p-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-black text-foreground">{title}</p>
                        <p className="mt-1 text-base text-foreground">{text}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{subtext}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl bg-muted p-5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-primary" size={22} />
                    <p className="font-black text-foreground">Priority customer care</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Our support team handles order, refund, and product queries with fast follow-up and clear updates.
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border bg-background p-6 shadow-soft sm:p-8">
                <div className="flex items-center gap-3">
                  <Headphones className="text-primary" size={22} />
                  <h2 className="text-2xl font-black text-foreground">Send a message</h2>
                </div>

                <form className="mt-6 grid gap-4" onSubmit={(event) => event.preventDefault()}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className="input" placeholder="First name" />
                    <input className="input" placeholder="Last name" />
                  </div>
                  <input className="input" type="email" placeholder="Email address" />
                  <input className="input" placeholder="Phone number" />
                  <select className="input" defaultValue="">
                    <option value="" disabled>Select topic</option>
                    <option>Order support</option>
                    <option>Delivery issue</option>
                    <option>Product inquiry</option>
                    <option>Refund request</option>
                  </select>
                  <textarea className="input min-h-36" placeholder="Write your message" />
                  <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">
                    <Send size={16} />
                    Send message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
