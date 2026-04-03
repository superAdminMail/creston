import { ImageResponse } from "next/og";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageContentType = "image/png";

type RenderDefaultSocialImageOptions = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function renderDefaultSocialImage(
  options: RenderDefaultSocialImageOptions = {},
) {
  const eyebrow = options.eyebrow ?? "Secure wealth growth";
  const title = options.title ?? "Havenstone";
  const description =
    options.description ??
    "Long-term investing, retirement security, and financial confidence.";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background:
          "radial-gradient(circle at top right, rgba(59,130,246,0.22), transparent 38%), linear-gradient(135deg, #050B1F, #0F172A)",
        color: "#F8FAFC",
        padding: "68px",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          fontSize: 34,
          color: "#93C5FD",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "9999px",
            backgroundColor: "#3B82F6",
            boxShadow: "0 0 28px rgba(59,130,246,0.55)",
          }}
        />
        {eyebrow}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "22px",
          maxWidth: "980px",
        }}
      >
        <div
          style={{
            fontSize: 82,
            fontWeight: 700,
            lineHeight: 1.02,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 32,
            lineHeight: 1.35,
            color: "#CBD5E1",
            maxWidth: "900px",
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 28,
          color: "#BFDBFE",
        }}
      >
        <div>Havenstone</div>
        <div>Premium wealth platform</div>
      </div>
    </div>,
    socialImageSize,
  );
}
