import { jsx as _jsx } from "react/jsx-runtime";
import { useSearchParams } from "react-router-dom";
import Feed from "../components/Feed";
export default function HomePage({ onLabelsChange }) {
    const [params] = useSearchParams();
    const label = params.get("label") ?? undefined;
    return _jsx(Feed, { label: label, onLabelsChange: onLabelsChange });
}
