import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const { onLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const registeredState = location.state as
    { registered?: boolean; electoralId?: string } | undefined;

  const [electoralId, setElectoralId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!electoralId || !password) {
      setError("Enter your Electoral ID and password to continue.");
      return;
    }
    setLoading(true);
    try {
      const result: any = await onLogin(electoralId, password);
      if (result?.error) {
        if (result.status === 401) {
          setError(
            "Those credentials did not match. Check them and try again.",
          );
        } else if (result.status) {
          setError("Something went wrong on our end. Try again in a moment.");
        } else {
          setError("We could not reach the server. Check your connection.");
        }
        return;
      }
      if (!result?.data?.accessToken) {
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
      title="Sign in"
      subtitle="Access your QuantumBallot account."
      footer={
        <>
          New here?{" "}
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
        {registeredState?.registered && (
          <p className="rounded-lg border border-qb-primary/30 bg-qb-primary/5 px-3 py-2 text-sm text-qb-ink">
            Account created.
            {registeredState.electoralId && (
              <>
                {" "}
                Your Electoral ID is{" "}
                <span className="font-semibold">
                  {registeredState.electoralId}
                </span>
                . Save it, you'll need it later.
              </>
            )}
          </p>
        )}
        <Field
          label="Electoral ID"
          value={electoralId}
          onChange={setElectoralId}
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
