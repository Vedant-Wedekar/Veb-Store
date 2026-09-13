import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { registerUser, signInWithGoogle, friendlyAuthError } from "../services/authService";
import Button from "../components/common/Button";
import { Input } from "../components/common/FormControls";
import { slugify } from "../utils/slug";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(name, username, email, password);
      toast.success("Account created! Welcome to WebStore.");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || friendlyAuthError(err.code || ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      toast.success("Welcome to WebStore!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(friendlyAuthError(err.code || ""));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 animate-blob rounded-full bg-brand-purple/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 animate-blob rounded-full bg-brand-cyan/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-card"
      >
        <h1 className="text-2xl font-extrabold text-ink">Launch your work</h1>
        <p className="mt-1 text-sm text-ink/50">Create an account to publish products.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          <Input
            label="Username"
            required
            value={username}
            onChange={(e) => setUsername(slugify(e.target.value))}
            placeholder="janedoe"
            hint="This becomes your profile URL: webstore.app/developer/username"
          />
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" fullWidth loading={loading}>
            Create account
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
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-purple hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
