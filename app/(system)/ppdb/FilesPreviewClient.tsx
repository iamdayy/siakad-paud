"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function FilesPreviewClient({
  filesRaw,
}: {
  filesRaw?: string | null;
}) {
  const [loading, setLoading] = useState(false);

  const parseFiles = (): string[] => {
    if (!filesRaw) return [];
    // files may be stored as 'Files: url1, url2' appended in notes
    const idx = filesRaw.indexOf("Files:");
    const raw = idx >= 0 ? filesRaw.slice(idx + "Files:".length) : filesRaw;
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  async function handlePreview() {
    const items = parseFiles();
    if (items.length === 0) return;
    setLoading(true);
    try {
      const keysToSign = items.filter(
        (k) => !k.startsWith("http://") && !k.startsWith("https://"),
      );
      let signed: Array<{ key: string; url: string }> = [];
      if (keysToSign.length) {
        const res = await fetch("/api/ppdb/file-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keys: keysToSign }),
        });
        const json = await res.json();
        if (json.ok && Array.isArray(json.urls)) signed = json.urls;
      }

      for (const it of items) {
        if (it.startsWith("http://") || it.startsWith("https://")) {
          window.open(it, "_blank");
        } else {
          const found = signed.find((s) => s.key === it);
          if (found) window.open(found.url, "_blank");
          else console.warn("No signed url for", it);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function openOne(it: string) {
    if (it.startsWith("http://") || it.startsWith("https://")) {
      window.open(it, "_blank");
      return;
    }
    try {
      const res = await fetch("/api/ppdb/file-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: it }),
      });
      const json = await res.json();
      if (json.ok && Array.isArray(json.urls) && json.urls[0]?.url) {
        window.open(json.urls[0].url, "_blank");
      } else {
        console.warn("No signed url for", it);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const items = parseFiles();
  if (items.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Preview Files</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preview Lampiran</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          {items.map((it) => (
            <div key={it} className="flex items-center justify-between gap-2">
              <div className="truncate">{it}</div>
              <div>
                <Button size="sm" onClick={() => openOne(it)}>
                  Open
                </Button>
              </div>
            </div>
          ))}
          <div className="flex justify-end mt-4">
            <Button onClick={handlePreview} disabled={loading}>
              {loading ? "Loading..." : "Open Signed"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
