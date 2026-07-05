import { motion } from "framer-motion";
import { Compass, Gamepad2, GraduationCap } from "lucide-react";
import logo from "@/assets/logo.png";
import BorderGlow from "@/components/ui/BorderGlow";
import { GlowCard } from "@/components/ui/GlowCard";

const GLOW_COLORS = ["#7c3aed", "#2563eb", "#10b981"];

export function Mission() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 bg-[#fdfdfb]">
      {/* Subtle styling grids & orbs */}
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          background: "#10b981",
          top: -150,
          right: -100,
          opacity: 0.08,
        }}
      />
      <div
        className="orb"
        style={{
          width: 400,
          height: 400,
          background: "#7c3aed",
          bottom: -100,
          left: -150,
          opacity: 0.08,
        }}
      />

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.img
            src={logo}
            alt="TeleARGlass"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto h-16 w-auto sm:h-20"
          />
        </div>

        {/* Main Statement card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <BorderGlow
            backgroundColor="#ffffff"
            borderRadius={32}
            glowColor="265 85 62"
            glowIntensity={1}
            glowRadius={30}
            coneSpread={22}
            colors={GLOW_COLORS}
          >
            <div className="p-8 sm:p-12">
              <p className="text-[#3c3c36] text-lg sm:text-xl leading-relaxed text-justify font-sans">
                At <strong>TeleARGlass</strong>, We are Functioning Sustainable Innovation by building
                the User Friendly TeleARGlass Minimum Viable Products that Works with Technologies
                including <strong>Indian ARMY & Defence</strong>, <strong>ISRO Communication</strong>,{" "}
                <strong>Forensic Science Laboratories</strong>, Social Media, Gaming, Mobile, Computer,
                Home Automation, Auto EV & Robotics, Education etc. From User's Think, Immersive AR
                Display, Speaking Accessibility & More.
              </p>

              <div className="my-8 border-t border-[#e5e5df]/60" />

              <p className="text-[#3c3c36] text-lg sm:text-xl leading-relaxed text-justify font-sans">
                It works by Our Operating System <strong>PanOS</strong> & its{" "}
                <strong>33 Customize Apps</strong>. The TeleARGlass' User Interface(UI) Allows to take
                Think Inputs from Targeted Head Skin Nerve pulse Vibrations through inbuilt Telepathy
                Sensor in its frame to generate the Meaningful Output. Thus, TeleARGlass converts our
                Thought into Write, Speak, Image, Music, Video Selection & appropriate Controlled
                Actions.
              </p>
            </div>
          </BorderGlow>
        </motion.div>

        {/* WhatsApp Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative overflow-hidden rounded-[24px] border border-[#25d366]/20 bg-gradient-to-r from-[#0d1511] via-[#102319] to-[#0d1511] p-6 sm:p-8 shadow-[0_15px_35px_-15px_rgba(37,211,102,0.15)] max-w-4xl mx-auto mt-12"
        >
          {/* Subtle ambient light */}
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#25d366]/10 blur-[40px] pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-[#7c3aed]/5 blur-[40px] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#25d366]/10 text-[#25d366] shadow-[0_0_15px_rgba(37,211,102,0.1)]">
                {/* Official WhatsApp SVG logo */}
                <svg className="h-5.5 w-5.5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white text-lg font-semibold font-heading leading-snug">
                  Telemmersing channel on WhatsApp
                </h3>
                <p className="text-[#25d366] text-xs font-mono font-semibold uppercase tracking-wider mt-0.5">
                  TELEPATHIC COMMUNICATION DEVICE
                </p>
                <p className="text-white/60 text-xs mt-0.5">
                  Empowering Humanity Through Technology
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/917862939627"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-2.5 text-xs font-semibold text-black shadow-[0_4px_15px_rgba(37,211,102,0.3)] transition hover:scale-105 hover:bg-[#20ba59] active:scale-95"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Watch Later Share
            </a>
          </div>
        </motion.div>

        {/* Innovative Solutions Section */}
        <div className="mt-24">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl font-bold font-heading tracking-tight text-foreground"
            >
              Our <span className="gradient-text">innovative solutions</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-base text-text-secondary max-w-xl mx-auto"
            >
              Purpose-built AR experiences for learning, navigation, and play—aligned with how you
              already move through the world.
            </motion.p>
          </div>

          {/* Solution Cards */}
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Card 1: Learning */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="group h-full"
            >
              <GlowCard glowColor="265 85 62" className="h-full">
                <div className="relative flex h-full flex-col overflow-hidden p-8">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold font-heading text-foreground">
                    Interactive learning experiences
                  </h3>
                  <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                    Immerse yourself in knowledge with our interactive learning tools. Our smart glasses
                    enhance educational experiences by overlaying digital information onto the real
                    world.
                  </p>
                </div>
              </GlowCard>
            </motion.div>

            {/* Card 2: Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="group h-full"
            >
              <GlowCard glowColor="221 83 53" className="h-full">
                <div className="relative flex h-full flex-col overflow-hidden p-8">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-secondary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary/10 text-secondary transition-transform duration-300 group-hover:scale-110">
                    <Compass className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold font-heading text-foreground">
                    Smart navigation assistance
                  </h3>
                  <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                    TeleARGlass base model works with Telepathy app, Music & Video Streaming, Home
                    Automation, and Car driving controls.
                  </p>
                </div>
              </GlowCard>
            </motion.div>

            {/* Card 3: Gaming */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="group h-full"
            >
              <GlowCard glowColor="160 84 42" className="h-full">
                <div className="relative flex h-full flex-col overflow-hidden p-8">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                    <Gamepad2 className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold font-heading text-foreground">
                    Enhanced gaming adventures
                  </h3>
                  <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                    Step into a new realm of gaming with augmented reality. Experience immersive
                    gameplay blending virtual and real worlds.
                  </p>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
