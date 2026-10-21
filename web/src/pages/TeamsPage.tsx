import { Link } from "react-router-dom";
import TeamLogo, { type TeamMark } from "../components/figures/TeamLogo";

const TEAMS: { name: string; mark: TeamMark; years?: string; current?: boolean; notes: string[] }[] = [
  {
    name: "Kinetic Systems",
    mark: "kinetic",
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
    mark: "bamru",
    years: "2026",
    current: true,
    notes: ["All-terrain, high altitude technical rescue team based out of the Bay Area."],
  },
  {
    name: "Commure",
    mark: "commure",
    years: "2024-2026",
    notes: [
      "Applied AI powering 1% of all healthcare appointments in the USA.",
      "Athelas and Commure merger.",
    ],
  },
  {
    name: "Genesys",
    mark: "genesys",
    years: "2023-2024",
    notes: ["Big data optimization."],
  },
  {
    name: "Rivian",
    mark: "rivian",
    years: "2022-2023",
    notes: ["Mobile-to-device edge gateway.", "Great alignment."],
  },
  {
    name: "Launchpad UBC",
    mark: "launchpad",
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
        <section key={team.name} className="mt-[1.45em] flex items-start gap-3">
          <TeamLogo mark={team.mark} />
          <div className="min-w-0 flex-1">
            <p>
              <b>{team.name}</b>
              {team.years && ` ${team.years}`}
              {team.current && " (currently)"}
            </p>
            {team.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </section>
      ))}
      <section className="mt-[1.45em] flex items-start gap-3">
        <TeamLogo mark="ubc" />
        <div className="min-w-0 flex-1">
          <p>
            <b>Education</b>
          </p>
          <p>UBC</p>
        </div>
      </section>
    </main>
  );
}
