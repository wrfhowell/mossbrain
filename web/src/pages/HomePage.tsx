import { useEffect } from "react";
import { Link } from "react-router-dom";
import ConvFigure from "../components/figures/ConvFigure";
import TrainingFigure from "../components/figures/TrainingFigure";
import VesselFigure from "../components/figures/VesselFigure";
import WizardLogo from "../components/WizardLogo";
import WizardModel from "../components/WizardModel";
import { prefetchEntries, prefetchMediaSample } from "../lib/api";
import { PAGES } from "../lib/pages";

export default function HomePage() {
  useEffect(() => {
    prefetchEntries();
    prefetchMediaSample();
  }, []);

  return (
    <>
      <main className="mx-auto max-w-[650px] px-4 pt-10 pb-24 text-left">
        <WizardModel size={150} />

        <h1 className="leading-tight font-normal">
          𝖂𝖎𝖑𝖑 𝕳𝖔𝖜𝖊𝖑𝖑 <span className="text-muted">(ω)</span>
        </h1>

        <p>
          I'm a research engineer from <Link to="/canada">Canada</Link> focused on agent post-training
          research for healthcare and CUA at{" "}
          <a href="https://kineticsystems.ai" target="_blank" rel="noopener noreferrer">
            Kinetic Systems
          </a>
          .
          <br />
          I currently live in San Francisco.
          <br />
          I am interested in frontier work in RL on classically "hard" medical and healthcare problems. Turns out being able to get 100% on the USMLE is 
          very different from the actual world, and machine learning still has lots of room to improve until we can dramatically improve medical outcomes.
          <br />
          I have strong interests in design and growth.
          <br />
          Outside of work I spend time climbing, exploring, and doing volunteer search and rescue in the
          mountains with{" "}
          <a href="https://bamru.org" target="_blank" rel="noopener noreferrer">
            BAMRU
          </a>
          .
          <br />
          Talk to me about cooking, rock/folk music, piano, ice hockey, alpine climbing, and climate
          change.
        </p>
        <p className="italic-ok my-[0.5em]">Measure your life by what it has meant to others.</p>

        <nav className="flex flex-col">
          {PAGES.map((p) => (
            <Link key={p.path} to={p.path}>
              {p.title}
            </Link>
          ))}
        </nav>
        {/* One blank line between the links and the figures */}
        <div className="h-[1.45em]" />

        <div className="w-4/5">
          <VesselFigure />
          <TrainingFigure />
          <ConvFigure />
        </div>
      </main>
      {/* Sits at the bottom of the page against the left edge, scrolling with the content */}
      <footer className="px-3 pb-2">
        <WizardLogo />
      </footer>
    </>
  );
}
