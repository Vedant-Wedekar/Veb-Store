import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import Button from "../components/common/Button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute left-1/4 top-10 h-72 w-72 animate-blob rounded-full bg-brand-purple/10 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-10 h-72 w-72 animate-blob rounded-full bg-brand-cyan/10 blur-3xl" />
      <p className="relative text-7xl font-black text-gradient">404</p>
      <h1 className="relative mt-3 text-xl font-bold text-ink">This page hasn't launched yet. 🚀</h1>
      <p className="relative mt-2 max-w-sm text-sm text-ink/50">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <div className="relative mt-6 flex gap-3">
        <Link to="/">
          <Button variant="outline">
            <Home size={15} /> Go Home
          </Button>
        </Link>
        <Link to="/discover">
          <Button>
            <Compass size={15} /> Explore Products
          </Button>
        </Link>
      </div>
    </div>
  );
}
