"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadButton } from "@/utils/uploadthing";
import { createFileAssetFromUpload } from "@/actions/files/createFileAssetFromUpload";
import { deleteFileAction } from "@/actions/files/file";

export function ManagementForm({ formAction }: { formAction: any }) {
  const [photoId, setPhotoId] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="photoFileId" value={photoId} />

      {/* CARD */}
      <div className="card-premium rounded-2xl p-6 space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-lg font-semibold text-white">
            Management Profile
          </h2>
          <p className="text-sm text-muted-soft">
            Add a public-facing team member to build trust and credibility.
          </p>
        </div>

        {/* GRID */}
        <div className="grid gap-5 md:grid-cols-2">
          <input
            name="name"
            placeholder="Full name"
            required
            className="input-premium h-11 rounded-xl px-3"
          />

          <input
            name="title"
            placeholder="Title (e.g. CEO)"
            className="input-premium h-11 rounded-xl px-3"
          />

          <input
            name="role"
            placeholder="Role (optional)"
            className="input-premium h-11 rounded-xl px-3"
          />

          <input
            name="email"
            placeholder="Email"
            className="input-premium h-11 rounded-xl px-3"
          />

          <input
            name="phone"
            placeholder="Phone"
            className="input-premium h-11 rounded-xl px-3"
          />
        </div>

        {/* BIO */}
        <textarea
          name="bio"
          placeholder="Short professional bio..."
          className="input-premium min-h-[120px] w-full rounded-xl px-3 py-3"
        />

        {/* DIVIDER */}
        <div className="divider-premium" />

        {/* IMAGE UPLOAD */}
        <div className="space-y-4 bg-white/[0.03] p-4 rounded-xl">
          <p className="text-sm text-muted-soft">Profile photo</p>

          <div className="flex items-center gap-4">
            <UploadButton
              endpoint="photoManager"
              onClientUploadComplete={async (res) => {
                const file = res?.[0];
                if (!file) return;

                const asset = await createFileAssetFromUpload({
                  url: file.url,
                  key: file.key,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                });

                setPhotoId(asset.id);
                setPreview(file.url);
                setFileKey(file.key);
              }}
              className="
    ut-button:bg-blue-500/10
    ut-button:text-blue-600
    ut-button:border
    ut-button:border-blue-500/30
    ut-button:rounded-full
    ut-button:px-5
    ut-button:py-2
    ut-button:text-sm
    hover:ut-button:bg-blue-500/20
  "
            />

            {preview && (
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={preview}
                    alt="preview"
                    fill
                    className="object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (!fileKey) return;

                    await deleteFileAction(fileKey);
                    setPreview(null);
                    setPhotoId("");
                    setFileKey(null);
                  }}
                  className="btn-ghost-premium rounded-lg px-3 py-1 text-xs"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          className="btn-primary rounded-xl px-6 py-2 text-sm font-medium"
        >
          Save profile
        </button>
      </div>
    </form>
  );
}
