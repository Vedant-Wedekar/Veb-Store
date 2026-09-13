import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { loginUser, signInWithGoogle, friendlyAuthError } from "../services/authService";
import Button from "../components/common/Button";
import { Input } from "../components/common/FormControls";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(email, password);
      toast.success("Welcome back!");
      navigate(location.state?.from || "/dashboard");
    } catch (err: any) {
      setError(friendlyAuthError(err.code || ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      toast.success("Welcome!");
      navigate(location.state?.from || "/dashboard");
    } catch (err: any) {
      setError(friendlyAuthError(err.code || ""));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 animate-blob rounded-full bg-brand-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 animate-blob rounded-full bg-brand-pink/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-card"
      >
        <h1 className="text-2xl font-extrabold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink/50">Log in to manage your products.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <div>
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Link to="/forgot-password" className="mt-1.5 inline-block text-xs font-medium text-brand-purple hover:underline">
              Forgot password?
            </Link>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" fullWidth loading={loading}>
            Log in
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-ink/35">
          <div className="h-px flex-1 bg-line" />
          or
          <div className="h-px flex-1 bg-line" />
        </div>

        <Button variant="outline" fullWidth loading={googleLoading} onClick={handleGoogle}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-ink/50">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-brand-purple hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
