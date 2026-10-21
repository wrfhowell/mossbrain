import { Link } from "react-router-dom";

/** Unlisted page, reached only from "Canada" in the homepage bio. */
export default function CanadaPage() {
  return (
    <main className="mx-auto max-w-[650px] px-4 pt-10 pb-24">
      <p>
        <Link to="/">← home</Link>
      </p>
      <p className="mt-[1.45em]">I'm currently living in San Francisco but call Vancouver and Edmonton home.</p>
    </main>
  );
}
