import { Link } from "react-router-dom";
import ChainMark from "@/components/brand/ChainMark";
import Logo from "@/components/brand/Logo";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/** Two-panel auth shell: brand assurance on the left, form on the right. */
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-qb-paper text-qb-ink">
      <aside className="relative hidden w-[42%] flex-col justify-between bg-qb-ink p-10 text-white lg:flex">
        <Link to="/">
          <Logo tone="light" />
        </Link>
        <div>
          <ChainMark count={4} className="h-24 w-full max-w-sm" />
          <h2 className="mt-8 max-w-sm font-display text-3xl font-bold leading-tight">
            Every vote becomes a verified block.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Sign in to run the election, or create an account to take part. The
            chain keeps the record honest either way.
          </p>
        </div>
        <p className="font-mono text-xs text-white/40">
          QuantumBallot. Verifiable elections.
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
          </div>
          <h1 className="mt-8 font-display text-3xl font-bold tracking-tight lg:mt-0">
            {title}
          </h1>
          <p className="mt-2 text-qb-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-qb-muted">{footer}</div>
        </div>
      </main>
    </div>
  );
}
