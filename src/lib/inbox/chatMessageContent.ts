export type ChatMessageTextContent = {
  kind: "text";
  text: string;
};

export type ChatMessageImageContent = {
  kind: "image";
  imageUrl: string;
  imageKey: string;
  imageName?: string | null;
  imageAssetId?: string | null;
  caption?: string | null;
};

export type ChatMessageContent =
  | ChatMessageTextContent
  | ChatMessageImageContent;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseChatMessageContent(
  content: string,
): ChatMessageContent | null {
  try {
    const parsed = JSON.parse(content) as unknown;
    if (!isRecord(parsed) || typeof parsed.kind !== "string") {
      return null;
    }

    if (parsed.kind === "text" && typeof parsed.text === "string") {
      return {
        kind: "text",
        text: parsed.text,
      };
    }

    if (
      parsed.kind === "image" &&
      typeof parsed.imageUrl === "string" &&
      typeof parsed.imageKey === "string"
    ) {
      return {
        kind: "image",
        imageUrl: parsed.imageUrl,
        imageKey: parsed.imageKey,
        imageName:
          typeof parsed.imageName === "string" ? parsed.imageName : null,
        imageAssetId:
          typeof parsed.imageAssetId === "string" ? parsed.imageAssetId : null,
        caption:
          typeof parsed.caption === "string" ? parsed.caption : null,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function serializeChatMessageContent(content: ChatMessageContent) {
  return JSON.stringify(content);
}

export function getChatMessagePreviewText(content: string) {
  const parsed = parseChatMessageContent(content);

  if (!parsed) {
    return content;
  }

  if (parsed.kind === "text") {
    return parsed.text;
  }

  const caption = parsed.caption?.trim();
  return caption ? `Photo: ${caption}` : "Photo";
}
