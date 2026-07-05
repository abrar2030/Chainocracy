import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const { onLogin } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!username || !password) {
      setError("Enter your username and password to continue.");
      return;
    }
    setLoading(true);
    try {
      const result: any = await onLogin(username, password);
      if (result?.error || !result?.data?.accessToken) {
        setError("Those credentials did not match. Check them and try again.");
        return;
      }
      navigate("/dashboard");
    } catch {
      setError("We could not reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Committee sign in"
      subtitle="Access the election control center."
      footer={
        <>
          New committee member?{" "}
          <Link
            to="/signup"
            className="font-semibold text-qb-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <Field
          label="Username"
          value={username}
          onChange={setUsername}
          autoComplete="username"
          onEnter={submit}
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          onEnter={submit}
        />

        {error && (
          <p className="rounded-lg border border-qb-danger/30 bg-qb-danger/5 px-3 py-2 text-sm text-qb-danger">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="w-full rounded-xl bg-qb-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-qb-primary600 focus:outline-none focus-visible:ring-2 focus-visible:ring-qb-primary focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </AuthLayout>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  onEnter?: () => void;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  onEnter,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-qb-ink">
        {label}
      </span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full rounded-xl border border-qb-line bg-white px-4 py-2.5 text-sm text-qb-ink outline-none transition-colors placeholder:text-qb-muted/60 focus:border-qb-primary focus:ring-2 focus:ring-qb-primary/20"
      />
    </label>
  );
}
