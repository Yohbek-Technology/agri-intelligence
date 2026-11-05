import Image from 'next/image'

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/85 backdrop-blur-md">
      <div className="relative flex flex-col items-center">
        <div className="absolute -inset-6 rounded-full bg-primary/20 blur-2xl animate-pulse" />

        <div className="absolute inset-0 flex items-center justify-center filter blur-md opacity-40 scale-110 pointer-events-none">
          <Image
            src="/images/logo.png"
            alt=""
            width={120}
            height={60}
            priority
            className="object-contain"
          />
        </div>

        <div className="relative z-10 p-3 transition-transform duration-700 animate-pulse">
          <Image
            src="/images/logo.png"
            alt="AgriIntel"
            width={140}
            height={70}
            priority
            className="object-contain drop-shadow-sm"
          />
        </div>

        <div className="relative z-10 mt-6 flex flex-col items-center gap-3">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <span className="text-xs font-mono tracking-widest text-text-muted uppercase animate-pulse">
            Loading AgriIntel…
          </span>
        </div>
      </div>
    </div>
  )
}

