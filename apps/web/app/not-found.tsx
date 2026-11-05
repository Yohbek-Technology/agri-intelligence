import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-surface border-2 border-border-ui rounded-3xl p-8 shadow-sm flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="absolute -inset-2 rounded-full bg-accent/20 blur-xl animate-pulse" />
          <Image
            src="/images/logo.png"
            alt="AgriIntel"
            width={160}
            height={80}
            priority
            className="relative z-10 object-contain"
          />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-accent-light text-accent border border-accent/20">
            404 • Page Not Found
          </span>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Lost in the Fields?
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            The agricultural telemetry or page you are trying to access does not exist or has been moved.
          </p>
        </div>

        <div className="w-full pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-center bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm"
          >
            Return to Home
          </Link>
          <Link
            href="/signIn"
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-center bg-surface-subtle text-text-primary border-2 border-border-ui hover:bg-surface transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

