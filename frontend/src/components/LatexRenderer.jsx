/* eslint-disable no-unused-vars */

import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * LatexRenderer
 *
 * Behavior:
 * - Finds inline math delimited by single dollar signs: $...$
 * - Renders math segments with KaTeX (without the $ delimiters)
 * - Renders non-math text as normal text
 * - If KaTeX fails for a math segment, it falls back to rendering the raw text content
 *
 * Example:
 *  "Solve $\\frac{1}{2}$ of 10" -> "Solve ½ of 10" (where ½ is rendered by KaTeX)
 */
export default function LatexRenderer({ content = "" }) {
  if (!content && content !== 0) return null; // allow numeric 0

  // fast path: no $ at all -> just plain text
  if (typeof content !== "string" || !content.includes("$")) {
    return <span>{content}</span>;
  }

  const parts = [];
  const pattern = /\$(.+?)\$/gs; // non-greedy, dot matches newline
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    const matchStart = match.index;
    const matchEnd = pattern.lastIndex;
    const mathText = match[1];

    if (matchStart > lastIndex) {
      // push plain text between previous index and current match
      parts.push({ type: "text", text: content.slice(lastIndex, matchStart) });
    }

    parts.push({ type: "math", text: mathText });
    lastIndex = matchEnd;
  }

  // trailing text after last match
  if (lastIndex < content.length) {
    parts.push({ type: "text", text: content.slice(lastIndex) });
  }

  return (
    <span>
      {parts.map((part, i) => {
        if (part.type === "text") {
          // React will safely escape this text
          return <span key={i}>{part.text}</span>;
        }

        // math part — try to render with KaTeX
        try {
          const html = katex.renderToString(part.text, {
            throwOnError: true,
            displayMode: false,
          });
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (err) {
          // If parsing fails, fall back to showing the raw inner text (no $)
          return <span key={i}>{part.text}</span>;
        }
      })}
    </span>
  );
}
