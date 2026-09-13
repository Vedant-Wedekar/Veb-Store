export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(username);
}

export function randomSuffix(length = 4): string {
  return Math.random().toString(36).slice(2, 2 + length);
}
