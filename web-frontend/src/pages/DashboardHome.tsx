import {
  ArrowUpRight,
  BarChart3,
  Blocks,
  UserSquare2,
  Users2,
} from "lucide-react";
import { Link } from "react-router-dom";
import ChainMark from "@/components/brand/ChainMark";
import { useAuth } from "@/context/AuthContext";

const shortcuts = [
  {
    to: "/candidates",
    label: "Candidates",
    body: "Add, edit, and review candidates on the ballot.",
    icon: UserSquare2,
  },
  {
    to: "/voters",
    label: "Voters",
    body: "Manage registered voters and verification.",
    icon: Users2,
  },
  {
    to: "/blockchain",
    label: "Blockchain",
    body: "Inspect blocks and confirm chain integrity.",
    icon: Blocks,
  },
  {
    to: "/election-results",
    label: "Results",
    body: "Tally and publish results by province.",
    icon: BarChart3,
  },
];

export default function DashboardHome() {
  const { authState } = useAuth();
  const name = authState?.name || authState?.username || "there";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome back, {name}.
        </h1>
        <p className="mt-2 text-qb-muted">
          Here is where the election stands. Pick up wherever you need to.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-qb-line bg-qb-ink text-white">
        <div className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-qb-accent">
              Chain status
            </p>
            <p className="mt-2 max-w-md text-lg leading-relaxed text-white/80">
              The ledger is sealed and linked. Every recorded ballot is
              verifiable end to end.
            </p>
            <Link
              to="/blockchain"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline"
            >
              Inspect the chain
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <ChainMark count={4} className="h-24 w-full max-w-xs" />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Jump back in</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map(({ to, label, body, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-qb-line bg-white p-5 transition-colors hover:border-qb-primary/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-qb-primary/10 text-qb-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">
                {label}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-qb-muted">
                {body}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
