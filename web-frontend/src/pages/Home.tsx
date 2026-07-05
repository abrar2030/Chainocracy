import { Link } from "react-router-dom";
import ChainMark from "@/components/brand/ChainMark";
import Logo from "@/components/brand/Logo";

const steps = [
  {
    n: "01",
    title: "Register",
    body: "Voters enroll with their electoral ID. The committee reviews and approves each registration.",
  },
  {
    n: "02",
    title: "Verify",
    body: "A one-time code confirms identity before any ballot is cast, so every voter is who they claim to be.",
  },
  {
    n: "03",
    title: "Vote",
    body: "Each ballot is sealed into a block and linked to the chain. Once written, it cannot be quietly changed.",
  },
  {
    n: "04",
    title: "Publish",
    body: "Results are tallied from the chain and published province by province, open for anyone to check.",
  },
];

const assurances = [
  {
    title: "Tamper-evident by design",
    body: "Every vote is a linked block. Altering one breaks the chain, so tampering shows.",
  },
  {
    title: "Verified before counted",
    body: "Identity is confirmed at the door. One eligible voter, one recorded ballot.",
  },
  {
    title: "Open to inspection",
    body: "The committee, observers, and the public read the same results from the same chain.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-qb-paper text-qb-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link
            to="/signin"
            className="rounded-lg px-4 py-2 text-sm font-medium text-qb-ink transition-colors hover:bg-white"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-qb-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-qb-primary600 focus:outline-none focus-visible:ring-2 focus-visible:ring-qb-primary focus-visible:ring-offset-2"
          >
            Create account
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pb-8 pt-10 md:pt-16">
        <p className="qb-rise font-mono text-xs uppercase tracking-[0.2em] text-qb-primary">
          Blockchain election infrastructure
        </p>
        <h1
          className="qb-rise mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
          style={{ animationDelay: "0.05s" }}
        >
          Elections you can count on, and anyone can check.
        </h1>
        <p
          className="qb-rise mt-6 max-w-xl text-lg leading-relaxed text-qb-muted"
          style={{ animationDelay: "0.12s" }}
        >
          QuantumBallot records every vote as a verified block in a shared
          chain. The committee runs the election; the chain keeps it honest.
        </p>
        <div
          className="qb-rise mt-8 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "0.18s" }}
        >
          <Link
            to="/signup"
            className="rounded-xl bg-qb-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-qb-primary600 focus:outline-none focus-visible:ring-2 focus-visible:ring-qb-primary focus-visible:ring-offset-2"
          >
            Create account
          </Link>
          <Link
            to="/signin"
            className="rounded-xl border border-qb-line bg-white px-6 py-3 text-sm font-semibold text-qb-ink transition-colors hover:border-qb-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-qb-primary focus-visible:ring-offset-2"
          >
            Committee sign in
          </Link>
        </div>

        <div className="mt-14 rounded-2xl border border-qb-line bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-qb-muted">
              Live chain
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-qb-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-qb-accent" />
              sealed
            </span>
          </div>
          <ChainMark count={5} className="mt-4 h-24 w-full" />
          <p className="mt-2 font-mono text-xs text-qb-muted">
            block 0x4f…a19 linked to 0x9c…3e2, verified
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          Four steps, in order
        </h2>
        <p className="mt-2 max-w-lg text-qb-muted">
          The flow is a sequence for a reason. Each step depends on the one
          before it.
        </p>
        <ol className="mt-8 grid gap-5 md:grid-cols-4">
          {steps.map((s) => (
            <li
              key={s.n}
              className="rounded-2xl border border-qb-line bg-white p-6"
            >
              <span className="font-mono text-sm font-medium text-qb-primary">
                {s.n}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-qb-muted">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-qb-ink text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="max-w-xl font-display text-2xl font-bold md:text-3xl">
            Trust that does not ask you to take its word for it.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {assurances.map((a) => (
              <div key={a.title}>
                <div className="h-px w-10 bg-qb-accent" />
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {a.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link
              to="/signup"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-qb-ink transition-colors hover:bg-white/90"
            >
              Get started
            </Link>
            <Link
              to="/signin"
              className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <Logo />
          <p className="font-mono text-xs text-qb-muted">
            QuantumBallot. Verifiable elections on a shared chain.
          </p>
        </div>
      </footer>
    </div>
  );
}
