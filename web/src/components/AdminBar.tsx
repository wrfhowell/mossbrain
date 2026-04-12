import { useAuth } from "../context/AuthContext";

export default function AdminBar() {
  const { admin, email, logout } = useAuth();
  if (!admin) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-end gap-3 bg-surface/90 backdrop-blur px-4 py-1.5 text-[10px] text-faint border-b border-border tracking-wider">
      <span>signed in as <span className="text-ink">{email}</span></span>
      <button
        onClick={logout}
        className="text-accent hover:text-accent/80 transition-colors cursor-pointer"
      >
        sign out
      </button>
    </div>
  );
}
