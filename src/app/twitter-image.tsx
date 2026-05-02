import {
  renderDefaultSocialImage,
  socialImageContentType,
  socialImageSize,
} from "@/lib/seo/renderDefaultSocialImage";

export const size = socialImageSize;

export const contentType = socialImageContentType;

export default async function Image() {
  return renderDefaultSocialImage({
    eyebrow: "Investment-focused wealth platform",
  });
}
