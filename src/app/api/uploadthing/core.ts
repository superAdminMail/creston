import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getCurrentUserRole } from "@/lib/getCurrentUser";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const handleAuth = async () => {
  const user = await getCurrentSessionUser();
  if (!user) throw new UploadThingError("Unauthorized access");

  return { user };
};

const handleAdminAuth = async () => {
  const user = await getCurrentSessionUser();
  const role = await getCurrentUserRole();

  if (!user || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new UploadThingError("Unauthorized access");
  }

  return { user, role };
};

export const ourFileRouter = {
  profileAvatar: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(() => handleAuth())

    .onUploadComplete(async ({ metadata }) => ({
      uploadedBy: metadata.user.id,
    })),

  siteLogo: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(() => handleAuth())

    .onUploadComplete(async ({ metadata }) => ({
      uploadedBy: metadata.user.id,
    })),

  photoManager: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(() => handleAuth())

    .onUploadComplete(async ({ metadata }) => ({
      uploadedBy: metadata.user.id,
    })),

  conversationImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(() => handleAuth())

    .onUploadComplete(async ({ metadata }) => ({
      uploadedBy: metadata.user.id,
    })),

  testimonialVideo: f({
    video: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(() => handleAdminAuth())
    .onUploadComplete(async ({ metadata }) => ({
      uploadedBy: metadata.user.id,
      uploadedByRole: metadata.role,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
