import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Video, RefreshCw, Link as LinkIcon, CheckCircle2, Film, Trash2, AlertTriangle, X, Loader2, Sparkles } from "lucide-react";
import { AdminHeading } from "@/components/admin/AdminHeading";
import { useDemoVideo } from "@/hooks/useDemoVideo";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/media")({
  head: () => ({ meta: [{ title: "Media & Demo Video — Admin" }] }),
  component: AdminMediaPage,
});

function AdminMediaPage() {
  const { videoUrl, isCustom, fileName, loading, uploadVideoFile, setVideoUrl, deleteVideo, resetToDefault } =
    useDemoVideo();
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState("");
  const [uploadingFileSize, setUploadingFileSize] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file (MP4, WebM, etc.).");
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setUploadingFileName(file.name);
    setUploadingFileSize((file.size / (1024 * 1024)).toFixed(1) + " MB");

    // Smooth progress animation simulator
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 18;
      });
    }, 150);

    try {
      await uploadVideoFile(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      await new Promise((r) => setTimeout(r, 600));
      toast.success(`Successfully uploaded "${file.name}"! It will now play in the demo area.`);
    } catch (err: any) {
      clearInterval(progressInterval);
      toast.error(err?.message || "Failed to upload video.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      toast.error("Please enter a valid video URL.");
      return;
    }

    try {
      await setVideoUrl(urlInput.trim());
      toast.success("Demo video URL updated! It will now play in the demo area.");
      setUrlInput("");
    } catch {
      toast.error("Failed to update video URL.");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteVideo();
      setShowDeleteConfirm(false);
      toast.success("Active custom video deleted! You can now upload a new video file.");
    } catch {
      toast.error("Failed to delete video.");
    }
  };

  return (
    <div className="space-y-8 pb-12 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <AdminHeading
          word="Media & Demo Video"
          sub="Manage, delete, or upload the TeleARGlass product demo video displayed in the main demo modal."
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column — Upload & URL Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 lg:col-span-6"
        >
          {/* Card 1: Device Upload with Animated UI */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm overflow-hidden relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Upload New Video</h3>
                <p className="text-xs text-gray-500">Select an MP4 or WebM video file from your computer to play in the demo area</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              onChange={handleFileChange}
              className="hidden"
              id="video-upload-input"
            />

            <AnimatePresence mode="wait">
              {isUploading ? (
                <motion.div
                  key="uploading-state"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="rounded-xl border-2 border-primary/30 bg-blue-50/40 p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-primary text-white shadow-md">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-primary">Uploading File</div>
                        <div className="text-sm font-semibold text-gray-900 truncate max-w-[220px]">
                          {uploadingFileName}
                        </div>
                      </div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                      {uploadingFileSize}
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-600">
                        {uploadProgress === 100 ? "Processing Complete!" : "Uploading & Saving Video..."}
                      </span>
                      <span className="font-mono text-primary font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary via-blue-500 to-indigo-600 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.label
                  key="idle-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  htmlFor="video-upload-input"
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer transition hover:border-primary hover:bg-gray-50/80 group"
                >
                  <div className="relative grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary transition duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <Film className="h-7 w-7" />
                    <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-primary transition">
                      Click to browse & upload video file
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Supports MP4, WebM, MOV files up to 100MB</p>
                  </div>
                </motion.label>
              )}
            </AnimatePresence>
          </div>

          {/* Card 2: Video URL Input */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <LinkIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Set Video URL</h3>
                <p className="text-xs text-gray-500">Or paste a direct CDN link / hosted MP4 video URL</p>
              </div>
            </div>

            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/demo.mp4"
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover shadow-sm"
              >
                Save URL
              </button>
            </form>
          </div>

          {/* Card 3: Status & Delete Video Action */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`grid h-9 w-9 place-items-center rounded-lg ${isCustom ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Current Active Video</div>
                <div className="text-sm font-semibold text-gray-900 truncate max-w-[240px]">
                  {isCustom ? `Custom Upload (${fileName || "Uploaded File/URL"})` : "Default Demo Video"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isCustom && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Current Video
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column — Video Live Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-6"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-gray-900">Live Demo Area Preview</h3>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {isCustom ? "Custom Active" : "Default Active"}
              </span>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-gray-800 shadow-inner">
              <video
                key={videoUrl}
                src={videoUrl}
                controls
                playsInline
                className="h-full w-full object-cover"
              />
            </div>

            <p className="text-xs text-gray-500 text-center">
              This is the exact video customers see when clicking "Watch Product Demo" on the website.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal for Video Deletion */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl border border-gray-100"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Confirm Video Deletion</h3>
                    <p className="text-xs text-gray-500">Action requires admin confirmation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 py-2">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Are you sure you want to delete the current active custom video?
                </p>
                <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  Deleting this video will reset the demo area back to default. You can upload a new video file anytime to replace it.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Yes, Delete Video
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
