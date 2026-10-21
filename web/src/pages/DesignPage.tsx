import { Link } from "react-router-dom";

interface Row {
  images: { src: string; alt: string }[];
  caption: string;
}

// Old-school contact sheet: each row butts its images together, flush left, caption underneath
const ROWS: Row[] = [
  {
    images: [{ src: "/design/neuralnet.png", alt: "neural net strands passing through three layer planes" }],
    caption: "neural net, strands through three layers",
  },
];

export default function DesignPage() {
  return (
    <main className="pt-10 pb-24">
      <p className="px-4">
        <Link to="/">← home</Link>
      </p>
      {ROWS.map((row) => (
        <section key={row.caption} className="mt-6 px-2">
          <div className="flex flex-wrap">
            {row.images.map((img) => (
              <img
                key={img.src}
                src={img.src}
                alt={img.alt}
                className="block h-auto max-w-full sm:h-[min(620px,60vh)] sm:w-auto"
              />
            ))}
          </div>
          <p className="mt-6">{row.caption}</p>
        </section>
      ))}
    </main>
  );
}
