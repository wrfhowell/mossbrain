import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import DeidFigure from "../components/figures/DeidFigure";
import SimFigure from "../components/figures/SimFigure";

const PROJECTS: { repo: string; caption: string; figure: ReactNode }[] = [
  {
    repo: "https://github.com/wrfhowell/3d-vehicle-simulation-player",
    caption: "3D vehicle simulation for autonomy.",
    figure: <SimFigure />,
  },
  {
    repo: "https://github.com/wrfhowell/automatic-speech-recognition-service",
    caption: "Tiny BERT deidentification encoder.",
    figure: <DeidFigure />,
  },
];

export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-[650px] px-4 pt-10 pb-24">
      <p>
        <Link to="/">← home</Link>
      </p>
      {PROJECTS.map((p) => (
        <section key={p.repo} className="mt-[1.45em]">
          <p>
            <a href={p.repo} target="_blank" rel="noreferrer" className="visited:text-link">
              {p.repo.split("/").pop()}
            </a>
          </p>
          <p>{p.caption}</p>
          {/* One cell of the three-up grid so panels match the homepage figures */}
          <div className="grid grid-cols-3 gap-3 sm:gap-8">{p.figure}</div>
        </section>
      ))}
      <p className="mt-[1.45em]">
        Work GitHub:{" "}
        <a href="https://github.com/will-kinetic" target="_blank" rel="noreferrer" className="visited:text-link">
          will-kinetic
        </a>
      </p>
    </main>
  );
}
