import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { submitRecruitmentFn } from "@/lib/email.functions";

export const Route = createFileRoute("/recruitment")({
  head: () => ({ meta: [{ title: "Join TeleARGlass - Careers" }] }),
  component: Recruitment,
});

function Recruitment() {
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    contact: "",
    email: "",
    aadhaar: "",
    address: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFile = (f: File) => {
    setFileName(f.name);
    setProgress(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { if (timer.current) clearInterval(timer.current); return 100; }
        return p + 7;
      });
    }, 80);
    if (errors.resume) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.resume;
        return next;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 12);
    const formattedVal = rawVal.replace(/(\d{4})(?=\d)/g, "$1 ");
    setFormData((prev) => ({ ...prev, aadhaar: formattedVal }));
    if (errors.aadhaar) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.aadhaar;
        return next;
      });
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, contact: rawVal }));
    if (errors.contact) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.contact;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (isNaN(dobDate.getTime())) {
        newErrors.dob = "Invalid date format";
      } else if (dobDate >= today) {
        newErrors.dob = "Date of birth must be in the past";
      }
    }
    if (!formData.gender) newErrors.gender = "Gender is required";
    
    const cleanContact = formData.contact.replace(/\D/g, "");
    if (!cleanContact) {
      newErrors.contact = "Contact number is required";
    } else if (cleanContact.length !== 10) {
      newErrors.contact = "Contact number must be exactly 10 digits";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    const cleanAadhaar = formData.aadhaar.replace(/\D/g, "");
    if (!cleanAadhaar) {
      newErrors.aadhaar = "Aadhaar number is required";
    } else if (cleanAadhaar.length !== 12) {
      newErrors.aadhaar = "Aadhaar number must be exactly 12 digits";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Full address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Address should be detailed (at least 10 characters)";
    }
    
    if (!fileName) {
      newErrors.resume = "Please upload your resume";
    } else if (progress < 100) {
      newErrors.resume = "Please wait for the resume upload to complete";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message to join and contribute is required";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Please write a slightly longer message (at least 20 characters)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }

    // Persist the application server-side and email the applicant.
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await submitRecruitmentFn({ data: formData });
      if (!res.ok) {
        setSubmitError(
          "We couldn't submit your application right now. Please try again.",
        );
        return;
      }
      setDone(true);
    } catch {
      setSubmitError(
        "Something went wrong submitting your application. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-container py-16 max-w-4xl">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Join the TeleARGlass <span className="gradient-text">Team</span>
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          We are always looking for passionate builders, researchers, and innovators. Submit your details below to apply and contribute as a team.
        </p>
      </div>

      <div className="max-w-2xl mx-auto rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card">
        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-4">
            <div className="mx-auto w-16 h-16 bg-surface-green rounded-full grid place-items-center text-accent-dark animate-pulse shadow-glow-accent">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-foreground">Application Received!</h3>
              <p className="text-text-secondary text-sm mt-2">
                Thank you for applying to join the TeleARGlass team. We are excited about your interest in collaborating with us!
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 text-left text-sm space-y-3 font-medium">
              <div className="text-xs font-mono uppercase tracking-wider text-text-muted border-b border-border-light pb-2 mb-2">Application Summary</div>
              <div className="grid grid-cols-3 gap-y-2">
                <span className="text-text-muted col-span-1">Full Name:</span>
                <span className="text-text-secondary col-span-2">{formData.fullName}</span>
                
                <span className="text-text-muted col-span-1">Email:</span>
                <span className="text-text-secondary col-span-2">{formData.email}</span>
                
                <span className="text-text-muted col-span-1">DOB:</span>
                <span className="text-text-secondary col-span-2">{formData.dob}</span>
                
                <span className="text-text-muted col-span-1">Gender:</span>
                <span className="text-text-secondary col-span-2">{formData.gender}</span>
                
                <span className="text-text-muted col-span-1">Contact:</span>
                <span className="text-text-secondary col-span-2">{formData.contact}</span>

                <span className="text-text-muted col-span-1">Aadhaar:</span>
                <span className="text-text-secondary col-span-2 font-mono">XXXX XXXX {formData.aadhaar.slice(-4)}</span>
                
                <span className="text-text-muted col-span-1">Resume:</span>
                <span className="text-text-secondary col-span-2 truncate">{fileName}</span>
              </div>
            </div>

            <p className="text-xs text-text-muted">
              Our Talent team will review your profile and contact you within 5 business days if there is a potential fit.
            </p>
            
            <button
              onClick={() => {
                setDone(false);
                setFormData({
                  fullName: "",
                  dob: "",
                  gender: "",
                  contact: "",
                  email: "",
                  aadhaar: "",
                  address: "",
                  message: "",
                });
                setFileName(null);
                setProgress(0);
              }}
              className="w-full rounded-xl bg-surface border border-border py-3 text-sm font-semibold hover:bg-muted transition text-foreground cursor-pointer select-none"
            >
              Submit Another Application
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Full Name <span className="text-destructive">*</span></label>
                <input
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition-all ${
                    errors.fullName ? "border-destructive focus:ring-2 focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.fullName && <span className="text-xs text-destructive font-medium">{errors.fullName}</span>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Email Address <span className="text-destructive">*</span></label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. aarav@example.com"
                  className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition-all ${
                    errors.email ? "border-destructive focus:ring-2 focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.email && <span className="text-xs text-destructive font-medium">{errors.email}</span>}
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Date of Birth <span className="text-destructive">*</span></label>
                <input
                  required
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition-all ${
                    errors.dob ? "border-destructive focus:ring-2 focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.dob && <span className="text-xs text-destructive font-medium">{errors.dob}</span>}
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Gender <span className="text-destructive">*</span></label>
                <select
                  required
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition-all ${
                    errors.gender ? "border-destructive focus:ring-2 focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <span className="text-xs text-destructive font-medium">{errors.gender}</span>}
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Contact Number <span className="text-destructive">*</span></label>
                <input
                  required
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleContactChange}
                  placeholder="e.g. 9876543210"
                  className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition-all ${
                    errors.contact ? "border-destructive focus:ring-2 focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.contact && <span className="text-xs text-destructive font-medium">{errors.contact}</span>}
              </div>

              {/* Aadhaar Number */}
              <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Aadhaar Number <span className="text-destructive">*</span></label>
                <input
                  required
                  type="text"
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleAadhaarChange}
                  placeholder="e.g. 1234 5678 9012"
                  className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition-all ${
                    errors.aadhaar ? "border-destructive focus:ring-2 focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.aadhaar && <span className="text-xs text-destructive font-medium">{errors.aadhaar}</span>}
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Full Address <span className="text-destructive">*</span></label>
                <textarea
                  required
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, Landmark, City, State, PIN"
                  className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition-all resize-none ${
                    errors.address ? "border-destructive focus:ring-2 focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.address && <span className="text-xs text-destructive font-medium">{errors.address}</span>}
              </div>

              {/* Message to Join */}
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Message to Join & Contribute as Teams <span className="text-destructive">*</span></label>
                <textarea
                  required
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us why you want to join and how you plan to contribute as part of our teams..."
                  className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition-all resize-none ${
                    errors.message ? "border-destructive focus:ring-2 focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.message && <span className="text-xs text-destructive font-medium">{errors.message}</span>}
              </div>

              {/* Resume Upload */}
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Resume Upload <span className="text-destructive">*</span></label>
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                  className={`block cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center text-sm text-text-secondary transition-all hover:border-primary bg-surface/50 border-border hover:bg-surface-violet/10 ${
                    errors.resume ? "border-destructive/60 bg-destructive/5" : "border-border"
                  }`}>
                  <Upload className="mx-auto h-6 w-6 text-text-muted" />
                  <div className="mt-2 font-medium">{fileName ? fileName : "Drop your résumé (PDF/DOC) or click to upload"}</div>
                  <div className="text-xs text-text-muted mt-1">Accepts .pdf, .doc, .docx (Max 5MB)</div>
                  <input type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  {fileName && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1 font-semibold text-primary">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                        <motion.div className="h-full bg-gradient-primary" animate={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </label>
                {errors.resume && <span className="text-xs text-destructive font-medium">{errors.resume}</span>}
              </div>

            </div>

            {submitError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
                {submitError}
              </div>
            )}

            <button
              disabled={submitting || (!!fileName && progress < 100)}
              className="w-full rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-white hover:shadow-glow-primary transition disabled:opacity-50 mt-2 select-none cursor-pointer text-center"
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}