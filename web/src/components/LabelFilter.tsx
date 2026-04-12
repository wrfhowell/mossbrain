import { useSearchParams } from "react-router-dom";

interface Props {
  labels: string[];
}

export default function LabelFilter({ labels }: Props) {
  const [params, setParams] = useSearchParams();
  const active = params.get("label") ?? "";

  function select(label: string) {
    if (label) {
      setParams({ label });
    } else {
      setParams({});
    }
  }

  return (
    <nav className="flex gap-2 flex-wrap">
      <button
        onClick={() => select("")}
        className={`text-[10px] tracking-[1.5px] uppercase px-2 py-0.5 border rounded cursor-pointer transition-all ${
          !active
            ? "border-border-light text-ink bg-surface-2"
            : "border-transparent text-faint hover:border-border-light hover:text-muted"
        }`}
      >
        all
      </button>
      {labels.map((l) => (
        <button
          key={l}
          onClick={() => select(l)}
          className={`text-[10px] tracking-[1.5px] uppercase px-2 py-0.5 border rounded cursor-pointer transition-all ${
            active === l
              ? "border-border-light text-ink bg-surface-2"
              : "border-transparent text-faint hover:border-border-light hover:text-muted"
          }`}
        >
          {l}
        </button>
      ))}
    </nav>
  );
}
