import { Link } from "react-router-dom";
import FlagFigure from "../components/figures/FlagFigure";

const TEAMS: { name: string; years?: string; current?: boolean; notes: string[] }[] = [
  {
    name: "Kinetic Systems",
    years: "2026",
    current: true,
    notes: [
      "Spun out of the Stanford labs of Nigam Shah and Chris Ré.",
      "Research and growth on post-training frontier agents for healthcare and medical work.",
      "Small team, moving quickly.",
    ],
  },
  {
    name: "BAMRU (Bay Area Mountain Rescue Unit)",
    years: "2026",
    current: true,
    notes: ["All-terrain technical rescue team based out of the Bay Area."],
  },
  {
    name: "Commure",
    years: "2024-2026",
    notes: [
      "Applied AI powering 1% of all healthcare appointments in the USA.",
      "Athelas and Commure merger.",
    ],
  },
  {
    name: "Genesys",
    years: "2023-2024",
    notes: ["Big data optimization."],
  },
  {
    name: "Rivian",
    years: "2022-2023",
    notes: ["Mobile-to-device edge gateway.", "Great alignment."],
  },
  {
    name: "Launchpad UBC",
    years: "2021-2022",
    notes: ["Honed skills pre-AI."],
  },
];

export default function TeamsPage() {
  return (
    <main className="mx-auto max-w-[650px] px-4 pt-10 pb-24">
      <p>
        <Link to="/">← home</Link>
      </p>
      {TEAMS.map((team) => (
        <section key={team.name} className="mt-[1.45em]">
          <p>
            <b>{team.name}</b>
            {team.years && ` ${team.years}`}
            {team.current && " (currently)"}
          </p>
          {team.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </section>
      ))}
      <section className="mt-[1.45em]">
        <p>
          <b>Education</b>
        </p>
        <p>UBC</p>
        <FlagFigure />
      </section>
    </main>
  );
}
