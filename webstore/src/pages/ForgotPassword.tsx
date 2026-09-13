import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { resetPassword, friendlyAuthError } from "../services/authService";
import Button from "../components/common/Button";
import { Input } from "../components/common/FormControls";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(friendlyAuthError(err.code || ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-card"
      >
        {sent ? (
          <div className="text-center">
            <MailCheck className="mx-auto mb-3 text-brand-green" size={36} />
            <h1 className="text-xl font-bold text-ink">Check your inbox</h1>
            <p className="mt-2 text-sm text-ink/50">
              We sent a password reset link to <span className="font-medium text-ink">{email}</span>.
            </p>
            <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-brand-purple hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-ink">Reset password</h1>
            <p className="mt-1 text-sm text-ink/50">We'll email you a reset link.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" fullWidth loading={loading}>
                Send reset link
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-ink/50">
              <Link to="/login" className="font-semibold text-brand-purple hover:underline">
                Back to login
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
