import { Link } from "react-router-dom";

export default function MountainsPage() {
  return (
    <main className="mx-auto max-w-[650px] px-4 pt-10 pb-24">
      <p>
        <Link to="/">← home</Link>
      </p>
      <nav className="mt-[1.45em] flex flex-col">
        <Link to="/mountains/climbing">Climbing</Link>
        <Link to="/mountains/rescues">Rescues</Link>
      </nav>
    </main>
  );
}
