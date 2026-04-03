import {
  renderDefaultSocialImage,
  socialImageContentType,
  socialImageSize,
} from "@/lib/seo/renderDefaultSocialImage";

export const size = socialImageSize;

export const contentType = socialImageContentType;

export default function Image() {
  return renderDefaultSocialImage({
    eyebrow: "Retirement-focused wealth platform",
  });
}
