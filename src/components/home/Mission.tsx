import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

export function Mission() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 bg-[#fdfdfb]">
      {/* Subtle styling grids & orbs */}
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div className="orb" style={{ width: 500, height: 500, background: "#10b981", top: -150, right: -100, opacity: 0.08 }} />
      <div className="orb" style={{ width: 400, height: 400, background: "#7c3aed", bottom: -100, left: -150, opacity: 0.08 }} />

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
          className="rounded-[32px] border border-[#e5e5df] bg-white p-8 sm:p-12 shadow-soft max-w-4xl mx-auto"
        >
          <p className="text-[#3c3c36] text-lg sm:text-xl leading-relaxed text-justify font-sans">
            At <strong>TeleARGlass</strong>, We are Functioning Sustainable Innovation by building the User Friendly TeleARGlass Minimum Viable Products that Works with Technologies including <strong>Indian ARMY & Defence</strong>, <strong>ISRO Communication</strong>, <strong>Forensic Science Laboratories</strong>, Social Media, Gaming, Mobile, Computer, Home Automation, Auto EV & Robotics, Education etc. From User's Think, Immersive AR Display, Speaking Accessibility & More.
          </p>

          <div className="my-8 border-t border-[#e5e5df]/60" />

          <p className="text-[#3c3c36] text-lg sm:text-xl leading-relaxed text-justify font-sans">
            It works by Our Operating System <strong>PanOS</strong> & its <strong>33 Customize Apps</strong>. The TeleARGlass' User Interface(UI) Allows to take Think Inputs from Targeted Head Skin Nerve pulse Vibrations through inbuilt Telepathy Sensor in its frame to generate the Meaningful Output. Thus, TeleARGlass converts our Thought into Write, Speak, Image, Music, Video Selection & appropriate Controlled Actions.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
