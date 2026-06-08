import { ArrowRight, BadgePercent, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function PromoBanners() {
  return (
    <section className="section py-16 sm:py-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
        
        {/* Main Promo Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-8 relative overflow-hidden rounded-[2.5rem] bg-primary group"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent)]" />
          <div className="relative z-10 h-full p-8 md:p-12 flex flex-col justify-center max-w-lg">
            <div className="flex items-center gap-2 text-primary-foreground/80 mb-4">
              <Sparkles size={18} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Exclusive Offer</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-primary-foreground mb-6 leading-tight">
              Summer Drop <br/> Up to 40% Off
            </h2>
            <Link 
              to="/products" 
              className="w-fit flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform"
            >
              Shop Now
              <ArrowRight size={20} />
            </Link>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=600&q=80" 
            alt="Promo"
            className="absolute right-0 bottom-0 h-full w-1/2 object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 hidden md:block"
          />
        </motion.div>

        {/* Side Card 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="md:col-span-4 relative overflow-hidden rounded-[2.5rem] bg-secondary text-secondary-foreground p-8 flex flex-col justify-between group"
        >
          <div className="relative z-10">
            <Zap className="text-accent mb-4" size={32} />
            <h3 className="text-2xl font-black mb-2">Fast Checkout</h3>
            <p className="text-sm opacity-80 leading-relaxed">Guest checkout and lightning fast payment processing.</p>
          </div>
          <Link to="/products" className="relative z-10 text-sm font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
            Learn More <ArrowRight size={18} />
          </Link>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent/20 blur-3xl rounded-full group-hover:scale-150 transition-transform" />
        </motion.div>

        {/* Bottom Card 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="md:col-span-4 relative overflow-hidden rounded-[2.5rem] bg-card border border-border p-8 group"
        >
          <div className="relative z-10 h-full flex flex-col justify-between">
            <ShieldCheck className="text-primary mb-4" size={32} />
            <div>
              <h3 className="text-2xl font-black mb-2">Secure Shipping</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Every order is tracked and insured for your peace of mind.</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Bottom Card 2 - Visual */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="md:col-span-8 relative overflow-hidden rounded-[2.5rem] group"
        >
          <img 
            src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=80" 
            alt="Experience"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
            <h3 className="text-3xl font-black text-white mb-2">Join the Community</h3>
            <p className="text-white/80 max-w-md">Connect with thousands of shoe enthusiasts and get early access to new drops.</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
