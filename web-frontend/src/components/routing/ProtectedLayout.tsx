import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import ChainMark from "@/components/brand/ChainMark";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedLayout() {
  const { authState, isLoggedIn } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    if (authState?.authenticated === null) {
      Promise.resolve(isLoggedIn?.()).finally(() => {
        if (active) setChecked(true);
      });
    } else {
      setChecked(true);
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-qb-paper">
        <ChainMark count={4} className="h-16 w-64" />
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-qb-muted">
          Verifying session
        </p>
      </div>
    );
  }

  if (!authState?.authenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <AppShell />;
}
