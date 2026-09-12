"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { GripVertical, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type ImageEntry = { url: string; altText?: string };

export function ImageUploader({ images, onChange }: { images: ImageEntry[]; onChange: (images: ImageEntry[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setUploading(true);
      try {
        const uploaded: ImageEntry[] = [];
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Upload failed");
          uploaded.push({ url: data.url, altText: file.name });
        }
        onChange([...images, ...uploaded]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed — check Supabase Storage configuration.");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: uploadFiles,
  });

  function addUrl() {
    if (!urlInput.trim()) return;
    onChange([...images, { url: urlInput.trim() }]);
    setUrlInput("");
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          isDragActive ? "border-forest-700 bg-beige-100" : "border-border"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? <Loader2 className="size-6 animate-spin text-forest-700" /> : <UploadCloud className="size-6 text-muted-foreground" />}
        <p className="text-sm text-muted-foreground">Drag &amp; drop images, or click to browse (max 5MB each)</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Or paste an image URL"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addUrl}>
          Add
        </Button>
      </div>

      {images.length > 0 && (
        <div className="flex flex-col gap-2">
          {images.map((img, i) => (
            <div key={img.url + i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-2">
              <GripVertical className="size-4 text-muted-foreground" />
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-beige-100">
                <Image src={img.url} alt={img.altText ?? ""} fill sizes="56px" className="object-cover" unoptimized={img.url.startsWith("data:")} />
              </div>
              <span className="flex-1 truncate text-xs text-muted-foreground">{img.url}</span>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </Button>
                <Button type="button" variant="ghost" size="sm" disabled={i === images.length - 1} onClick={() => move(i, 1)}>
                  ↓
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove image">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
