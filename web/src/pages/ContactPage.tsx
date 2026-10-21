import { useState } from "react";
import { Link } from "react-router-dom";

// Email is XOR-encoded so it never appears as plain text in the HTML or the bundle;
// it's only decoded when a visitor asks for it.
const EMAIL_KEY = 0x5a;
const EMAIL_CODES = [45, 40, 60, 50, 53, 45, 63, 54, 54, 26, 61, 55, 59, 51, 54, 116, 57, 53, 55];
const decodeEmail = () => String.fromCharCode(...EMAIL_CODES.map((c) => c ^ EMAIL_KEY));

export default function ContactPage() {
  const [email, setEmail] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-[650px] px-4 pt-10 pb-24">
      <p>
        <Link to="/">← home</Link>
      </p>
      <p className="mt-[1.45em]">
        Email:{" "}
        {email ? (
          <a href={`mailto:${email}`}>{email}</a>
        ) : (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setEmail(decodeEmail());
            }}
          >
            show email
          </a>
        )}
      </p>
      <p>
        LinkedIn:{" "}
        <a href="https://www.linkedin.com/in/will-h-286210166/" target="_blank" rel="noreferrer" className="visited:text-link">
          will-h-286210166
        </a>
      </p>
      <p>
        GitHub:{" "}
        <a href="https://github.com/wrfhowell" target="_blank" rel="noreferrer" className="visited:text-link">
          wrfhowell
        </a>
      </p>
      <p>
        Work GitHub:{" "}
        <a href="https://github.com/will-kinetic" target="_blank" rel="noreferrer" className="visited:text-link">
          will-kinetic
        </a>
      </p>
    </main>
  );
}
