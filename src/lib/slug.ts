// Turn a title/name into a URL-friendly slug: "Festival Way Kambas!" -> "festival-way-kambas"
export function slugify(input: string): string {
  return (input || "")
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .slice(0, 80);
}

// Build a slug guaranteed unique against a set of already-used slugs.
export function uniqueSlug(base: string, used: Set<string>): string {
  const root = slugify(base) || "item";
  let slug = root;
  let n = 2;
  while (used.has(slug)) slug = `${root}-${n++}`;
  used.add(slug);
  return slug;
}
