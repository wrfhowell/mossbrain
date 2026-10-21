import { Link } from "react-router-dom";

/** Extended heavy wordmark in brushed steel-blue, after the old SKY™ mark. */
export default function WizardLogo() {
  return (
    <Link
      to="/"
      aria-label="home"
      className="inline-flex items-end select-none"
      style={{ textDecoration: "none" }}
    >
      <span
        className="font-wide text-[19.2px] leading-none tracking-[-0.02em]"
        style={{
          fontWeight: 900,
          fontStretch: "125%",
          fontVariationSettings: '"wdth" 125',
          background: "linear-gradient(180deg, #b9c3d2 0%, #93a1b6 55%, #7f8ea5 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        WIZARD
      </span>
      <span className="font-wide text-[6.4px] leading-none font-extrabold text-[#8a98ae] ml-[2px]">
        TM
      </span>
    </Link>
  );
}
