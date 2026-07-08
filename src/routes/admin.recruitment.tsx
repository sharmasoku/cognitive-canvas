import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Search, Trash2, Mail, Phone, Calendar, User, FileText, Download, MapPin, Eye, EyeOff } from "lucide-react";
import { useAllJobApplications, deleteJobApplication, type JobApplication } from "@/hooks/useAdminData";
import { AdminHeading } from "@/components/admin/AdminHeading";
import { shortDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/recruitment")({
  component: AdminRecruitmentPage,
});

interface ParsedApplication {
  id: string;
  fullName: string;
  email: string;
  dob: string | null;
  gender: string | null;
  contact: string | null;
  aadhaar: string | null;
  address: string | null;
  message: string;
  createdAt: string;
  resume: { url: string; name: string } | null;
}

function parseApplication(app: JobApplication): ParsedApplication {
  const msg = app.message || "";
  const match = msg.match(/^\[RESUME:(.*?)\|NAME:(.*?)\]/);
  if (match) {
    return {
      id: app.id,
      fullName: app.full_name,
      email: app.email,
      dob: app.dob,
      gender: app.gender,
      contact: app.contact,
      aadhaar: app.aadhaar,
      address: app.address,
      message: msg.replace(/^\[RESUME:(.*?)\|NAME:(.*?)\]/, ""),
      createdAt: app.created_at,
      resume: { url: match[1], name: match[2] }
    };
  }
  return {
    id: app.id,
    fullName: app.full_name,
    email: app.email,
    dob: app.dob,
    gender: app.gender,
    contact: app.contact,
    aadhaar: app.aadhaar,
    address: app.address,
    message: msg,
    createdAt: app.created_at,
    resume: null
  };
}

function AdminRecruitmentPage() {
  const { applications, loading, refetch } = useAllJobApplications();
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<ParsedApplication | null>(null);
  const [previewingResumeId, setPreviewingResumeId] = useState<string | null>(null);

  const parsedApps = applications.map(parseApplication);

  const filteredApps = parsedApps.filter((app) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      !term ||
      app.fullName.toLowerCase().includes(term) ||
      app.email.toLowerCase().includes(term) ||
      (app.contact || "").includes(term) ||
      (app.aadhaar || "").includes(term) ||
      (app.message || "").toLowerCase().includes(term)
    );
  });

  const handleDelete = async (app: ParsedApplication) => {
    const { ok, error } = await deleteJobApplication(app.id);
    if (ok) {
      toast.success("Application deleted");
      setConfirmDelete(null);
      refetch();
    } else {
      toast.error(error || "Failed to delete application");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <AdminHeading word="Recruitment" sub={`${applications.length} candidate applications`} />
        
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-gray-400 w-64 shadow-sm"
            />
          </div>

          <button onClick={refetch} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:text-gray-900 transition shadow-sm" title="Refresh list">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-500 shadow-sm">
          No candidate applications found
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredApps.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start"
            >
              {/* Left Column: Candidate Info */}
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-start justify-between md:justify-start gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-primary">{app.fullName}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Applied on {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2 border border-gray-50 rounded-lg p-2 bg-gray-50/40">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <a href={`mailto:${app.email}`} className="hover:text-primary transition font-medium truncate">{app.email}</a>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-50 rounded-lg p-2 bg-gray-50/40">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <a href={`tel:${app.contact}`} className="hover:text-primary transition font-medium">{app.contact || "—"}</a>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-50 rounded-lg p-2 bg-gray-50/40">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span>DOB: <span className="font-semibold text-gray-700">{app.dob ? shortDate(app.dob) : "—"}</span> ({app.gender || "—"})</span>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-50 rounded-lg p-2 bg-gray-50/40 sm:col-span-2 md:col-span-1">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span>Aadhaar: <span className="font-mono text-gray-700 font-semibold">{app.aadhaar || "—"}</span></span>
                  </div>
                  <div className="flex items-start gap-2 border border-gray-50 rounded-lg p-2 bg-gray-50/40 sm:col-span-2">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="leading-normal">{app.address || "—"}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Message / Cover Letter</h4>
                  <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {app.message}
                  </div>
                </div>

                {/* Resume block */}
                {app.resume && (
                  <div className="pt-2 border-t border-gray-50 space-y-3">
                    <div className="flex items-center justify-between gap-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{app.resume.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Resume Attachment</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.resume.name.toLowerCase().endsWith(".pdf") && (
                          <button
                            onClick={() => setPreviewingResumeId(previewingResumeId === app.id ? null : app.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-primary/20 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition"
                          >
                            {previewingResumeId === app.id ? (
                              <><EyeOff className="h-3.5 w-3.5" /> Hide Preview</>
                            ) : (
                              <><Eye className="h-3.5 w-3.5" /> Preview Resume</>
                            )}
                          </button>
                        )}
                        <a
                          href={app.resume.url}
                          download={app.resume.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-primary rounded-lg text-xs font-semibold text-white shadow-sm hover:opacity-90 transition"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </a>
                      </div>
                    </div>

                    {/* Resume iframe preview */}
                    {previewingResumeId === app.id && app.resume.name.toLowerCase().endsWith(".pdf") && (
                      <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-100 shadow-inner h-[480px]">
                        <iframe
                          src={`${app.resume.url}#toolbar=0`}
                          className="w-full h-full"
                          title={`Resume of ${app.fullName}`}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Delete Action */}
              <div className="shrink-0 flex items-center md:self-stretch justify-end md:justify-center">
                <button
                  onClick={() => setConfirmDelete(app)}
                  className="rounded-xl border border-red-200 p-3 text-red-500 hover:bg-red-50 transition"
                  title="Delete Application"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary">Delete application?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete the job application of <span className="font-semibold text-gray-700">{confirmDelete.fullName}</span>? This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
