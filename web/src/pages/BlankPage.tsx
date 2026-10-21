import { Link } from "react-router-dom";

export default function BlankPage({ message = "nothing here yet." }: { message?: string }) {
  return (
    <main className="mx-auto max-w-[650px] px-4 pt-10 pb-24">
      <p>
        <Link to="/">← home</Link>
      </p>
      <p className="mt-4">{message}</p>
    </main>
  );
}
