import type { Media } from "../types";
interface Props {
    media: Media[];
    index: number;
    onClose: () => void;
    onChange: (i: number) => void;
}
export default function Lightbox({ media, index, onClose, onChange }: Props): import("react/jsx-runtime").JSX.Element | null;
export {};
