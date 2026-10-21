import { Link } from "react-router-dom";
import FlagFigure from "../components/figures/FlagFigure";

/** Unlisted page, reached only from "Canada" in the homepage bio. */
export default function CanadaPage() {
  return (
    <main className="mx-auto max-w-[650px] px-4 pt-10 pb-24">
      <p>
        <Link to="/">← home</Link>
      </p>
      <p className="mt-[1.45em]">I'm from Vancouver and Edmonton.</p>
      <FlagFigure />
    </main>
  );
}
