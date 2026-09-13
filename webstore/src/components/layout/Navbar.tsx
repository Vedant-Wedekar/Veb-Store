import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, Bookmark, LayoutDashboard, Rocket, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/authService";
import { Avatar } from "../common/Primitives";
import toast from "react-hot-toast";

const navLinks = [
  { to: "/discover", label: "Discover" },
  { to: "/categories", label: "Categories" },
  { to: "/developers", label: "Developers" },
  { to: "/trending", label: "Trending" },
];

export default function Navbar() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  async function handleLogout() {
    await logoutUser();
    toast.success("Signed out");
    navigate("/");
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all ${
        scrolled ? "border-b border-line bg-white/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2 focus-ring rounded-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-grad-primary text-sm font-black text-white">
            W
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink">
            Web<span className="text-gradient">Store</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink/65 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-sm flex-1 items-center md:flex">
          <div className="flex w-full items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 focus-within:border-brand-purple/50">
            <Search size={16} className="text-ink/35" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, developers, tech..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
              aria-label="Search"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            to="/saved"
            className="hidden rounded-lg p-2 text-ink/60 hover:bg-ink/5 hover:text-ink sm:inline-flex focus-ring"
            aria-label="Saved products"
          >
            <Bookmark size={19} />
          </Link>

          {user && profile ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="flex items-center gap-2 rounded-full p-0.5 focus-ring"
                aria-label="Account menu"
              >
                <Avatar src={profile.photoURL} name={profile.name} size={34} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-lift"
                  >
                    <p className="truncate px-3 py-2 text-xs text-ink/40">@{profile.username}</p>
                    <Link to="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-ink/5">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link to="/product/new" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-ink/5">
                      <Rocket size={15} /> Launch Product
                    </Link>
                    <Link to={`/developer/${profile.username}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-ink/5">
                      <UserIcon size={15} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="rounded-lg px-3.5 py-2 text-sm font-semibold text-ink/70 hover:bg-ink/5">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-grad-primary px-3.5 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
              >
                Launch Your Product
              </Link>
            </div>
          )}

          <button
            onClick={() => setOpen((s) => !s)}
            className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 lg:hidden focus-ring"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-white lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              <form onSubmit={submitSearch} className="mb-3 flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5">
                <Search size={16} className="text-ink/35" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search WebStore..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </form>
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/70 hover:bg-ink/5">
                  {l.label}
                </Link>
              ))}
              <Link to="/saved" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/70 hover:bg-ink/5">
                Saved
              </Link>
              {!user && (
                <div className="mt-3 flex gap-2 border-t border-line pt-3">
                  <Link to="/login" className="flex-1 rounded-lg border border-line px-3 py-2.5 text-center text-sm font-semibold">
                    Log in
                  </Link>
                  <Link to="/register" className="flex-1 rounded-lg bg-grad-primary px-3 py-2.5 text-center text-sm font-semibold text-white">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
