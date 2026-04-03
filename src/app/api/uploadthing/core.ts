import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const handleAuth = async () => {
  const user = await getCurrentSessionUser();
  if (!user) throw new UploadThingError("Unauthorized access");

  return { user };
};

export const ourFileRouter = {
  profilePhotos: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 6,
    },
  })
    .middleware(() => handleAuth())

    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.user.id);

      console.log("file url", file.ufsUrl);

      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
