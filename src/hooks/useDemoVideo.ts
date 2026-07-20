import { useCallback, useEffect, useState } from "react";
import defaultDemoVideo from "@/assets/demo-video.mp4";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "telearglass_demo_video_config";

export interface DemoVideoConfig {
  videoUrl: string;
  isCustom: boolean;
  updatedAt?: string;
  fileName?: string;
  storedInIDB?: boolean;
}

/* ── IndexedDB helper for storing large binary video files ── */
function getIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const req = indexedDB.open("telearglass_media", 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("videos")) {
        req.result.createObjectStore("videos");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function setIDBVideo(file: Blob): Promise<void> {
  const db = await getIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("videos", "readwrite");
    tx.objectStore("videos").put(file, "demo_video_blob");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getIDBVideo(): Promise<Blob | null> {
  try {
    const db = await getIDB();
    return new Promise((resolve) => {
      const tx = db.transaction("videos", "readonly");
      const req = tx.objectStore("videos").get("demo_video_blob");
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function clearIDBVideo(): Promise<void> {
  try {
    const db = await getIDB();
    const tx = db.transaction("videos", "readwrite");
    tx.objectStore("videos").delete("demo_video_blob");
  } catch {
    /* ignore */
  }
}

export function useDemoVideo() {
  const [config, setConfig] = useState<DemoVideoConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // Automatically clean up legacy oversized base64 strings to prevent storage errors
        if (saved.length > 500000) {
          localStorage.removeItem(STORAGE_KEY);
          return { videoUrl: defaultDemoVideo, isCustom: false };
        }
        const parsed = JSON.parse(saved);
        if (parsed?.videoUrl !== undefined) return parsed;
      }
    } catch {
      /* fallback */
    }
    return { videoUrl: defaultDemoVideo, isCustom: false };
  });

  const [loading, setLoading] = useState(false);

  // Load IndexedDB video blob if stored locally
  useEffect(() => {
    if (config.storedInIDB) {
      void getIDBVideo().then((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setConfig((prev) => ({ ...prev, videoUrl: url }));
        }
      });
    }
  }, [config.storedInIDB]);

  // Fetch remote settings from Supabase if available
  const fetchRemoteConfig = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("site_settings" as any)
        .select("*")
        .eq("key", "demo_video")
        .single();

      if (data && (data as any).value?.videoUrl !== undefined) {
        const remoteConfig = (data as any).value as DemoVideoConfig;
        if (!remoteConfig.storedInIDB) {
          setConfig(remoteConfig);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteConfig));
          } catch {
            /* ignore quota error */
          }
        }
      }
    } catch {
      // Supabase site_settings table fallback
    }
  }, []);

  useEffect(() => {
    void fetchRemoteConfig();
  }, [fetchRemoteConfig]);

  // Listen to cross-tab updates via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setConfig(parsed);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Safe save config helper (handles quota errors gracefully)
  const saveConfig = async (newConfig: DemoVideoConfig) => {
    setConfig(newConfig);

    // Save lightweight metadata to localStorage
    const metaToSave = {
      videoUrl: newConfig.storedInIDB ? "" : newConfig.videoUrl,
      isCustom: newConfig.isCustom,
      updatedAt: newConfig.updatedAt,
      fileName: newConfig.fileName,
      storedInIDB: newConfig.storedInIDB,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metaToSave));
    } catch (err) {
      console.warn("localStorage quota exceeded, video stored in IndexedDB instead.", err);
    }

    // Sync with Supabase database (only non-blob metadata/URLs)
    if (!newConfig.storedInIDB) {
      try {
        await supabase.from("site_settings" as any).upsert(
          {
            key: "demo_video",
            value: newConfig,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );
      } catch {
        /* ignore */
      }
    }
  };

  // Upload video file directly from device
  const uploadVideoFile = async (file: File): Promise<string> => {
    setLoading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `demo_${Date.now()}.${fileExt}`;
      const filePath = `demo-videos/${fileName}`;

      let publicUrl = "";
      let storedInIDB = false;

      // Try uploading to Supabase Storage bucket 'media'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, { upsert: true });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      } else {
        // Fallback to IndexedDB (stores large video Blobs without localStorage quota errors)
        await setIDBVideo(file);
        publicUrl = URL.createObjectURL(file);
        storedInIDB = true;
      }

      const newConfig: DemoVideoConfig = {
        videoUrl: publicUrl,
        isCustom: true,
        updatedAt: new Date().toISOString(),
        fileName: file.name,
        storedInIDB,
      };

      await saveConfig(newConfig);
      setLoading(false);
      return publicUrl;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Update video using URL string
  const setVideoUrl = async (url: string) => {
    await clearIDBVideo();
    const newConfig: DemoVideoConfig = {
      videoUrl: url,
      isCustom: true,
      updatedAt: new Date().toISOString(),
      storedInIDB: false,
    };
    await saveConfig(newConfig);
  };

  // Delete / Remove current video (reverts to default bundled video)
  const deleteVideo = async () => {
    await clearIDBVideo();
    const defaultConfig: DemoVideoConfig = {
      videoUrl: defaultDemoVideo,
      isCustom: false,
      updatedAt: new Date().toISOString(),
      storedInIDB: false,
    };
    await saveConfig(defaultConfig);
  };

  // Reset back to default bundled video
  const resetToDefault = async () => {
    await deleteVideo();
  };

  return {
    videoUrl: config.videoUrl,
    isCustom: config.isCustom,
    fileName: config.fileName,
    updatedAt: config.updatedAt,
    loading,
    uploadVideoFile,
    setVideoUrl,
    deleteVideo,
    resetToDefault,
  };
}
