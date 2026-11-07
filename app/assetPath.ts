/** Works at localhost and under a GitHub Pages repository subdirectory. */
export function assetPath(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}
