import { useSearchParams } from "react-router-dom";
import Feed from "../components/Feed";

interface Props {
  onLabelsChange?: (labels: string[]) => void;
}

export default function HomePage({ onLabelsChange }: Props) {
  const [params] = useSearchParams();
  const label = params.get("label") ?? undefined;

  return <Feed label={label} onLabelsChange={onLabelsChange} />;
}
