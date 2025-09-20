import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

export default function LatexRenderer({ text }) {
  try {
    return <BlockMath math={text} />;
  } catch {
    return <span>{text}</span>;
  }
}
