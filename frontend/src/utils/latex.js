export function isValidLatex(text) {
  if (typeof text !== "string") return false;
  const unsafePattern = /<[^>]*>|&lt;|&gt;|script/i;
  return !unsafePattern.test(text);
}
