import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import { API_URL, useAuth } from "@/context/AuthContext";

interface Form {
  electoralId: string;
  name: string;
  email: string;
  address: string;
  province: string;
  password: string;
}

const empty: Form = {
  electoralId: "",
  name: "",
  email: "",
  address: "",
  province: "",
  password: "",
};

export default function SignUp() {
  const { provinces } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<Form>(empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof Form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const submit = async () => {
    setError(null);
    const missing = Object.entries(form).find(([, v]) => !v);
    if (missing) {
      setError("Fill in every field to create your account.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/committee/register-voter`,
        form,
      );
      if (res.status === 201) {
        navigate("/signin", { state: { registered: true } });
        return;
      }
      setError("We could not complete your registration. Try again.");
    } catch (e: any) {
      if (e?.response?.status === 409) {
        setError("An account with that electoral ID already exists.");
      } else {
        setError("We could not reach the server. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register to take part in the election."
      footer={
        <>
          Already registered?{" "}
          <Link
            to="/signin"
            className="font-semibold text-qb-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Electoral ID"
            value={form.electoralId}
            onChange={set("electoralId")}
          />
          <Field label="Full name" value={form.name} onChange={set("name")} />
        </div>

        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={set("email")}
          autoComplete="email"
        />
        <Field label="Address" value={form.address} onChange={set("address")} />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-qb-ink">
            Province
          </span>
          <select
            value={form.province}
            onChange={(e) => set("province")(e.target.value)}
            className="w-full rounded-xl border border-qb-line bg-white px-4 py-2.5 text-sm text-qb-ink outline-none transition-colors focus:border-qb-primary focus:ring-2 focus:ring-qb-primary/20"
          >
            <option value="">Select your province</option>
            {provinces?.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={set("password")}
          autoComplete="new-password"
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
          {loading ? "Creating account…" : "Create account"}
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
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
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
        className="w-full rounded-xl border border-qb-line bg-white px-4 py-2.5 text-sm text-qb-ink outline-none transition-colors placeholder:text-qb-muted/60 focus:border-qb-primary focus:ring-2 focus:ring-qb-primary/20"
      />
    </label>
  );
}
