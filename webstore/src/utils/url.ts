const ALLOWED_PROTOCOLS = ["https:", "http:"];

/** Validates that a URL is safe to store/render (blocks javascript:, data:, file:, etc). */
export function isSafeUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value.trim());
    return ALLOWED_PROTOCOLS.includes(url.protocol);
  } catch {
    return false;
  }
}

/** Validates a URL and requires https (used for website/screenshot/logo fields). */
export function isValidHttpsUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function safeExternalHref(value?: string): string | undefined {
  if (!value) return undefined;
  return isSafeUrl(value) ? value : undefined;
}

export function hostnameOf(value?: string): string {
  if (!value) return "";
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
