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
          Hey, I'm Will. Engineer from <Link to="/canada">Canada</Link> currently living in San
          Francisco. I'm currently focused on post-training research for healthcare and CUA. I am interested in frontier work in RL on classically
          "hard" problems in the medical and healthcare space. I have strong interests in growth and
          design. Outside of work I spend time trying to get better at moving through, and saving
          people's lives in, the mountains. Talk to me about cooking, rock/folk music, piano, ice
          hockey, alpine climbing, and climate change.
        </p>
        <p className="italic-ok my-[0.5em]">What has your life meant to others?</p>

        <nav className="flex flex-col">
          {PAGES.map((p) => (
            <Link key={p.path} to={p.path}>
              {p.title}
            </Link>
          ))}
        </nav>
        {/* Two blank lines between the links and the figures */}
        <div className="h-[2.9em]" />

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
