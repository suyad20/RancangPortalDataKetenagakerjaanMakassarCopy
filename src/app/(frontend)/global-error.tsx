'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="id">
      <body className="grid min-h-screen place-items-center bg-[#f4f7fb] p-5 text-[#11243f]">
        <main className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#0d65a9]">SKSU Disnaker</p>
          <h1 className="mt-3 text-3xl font-black text-[#0c2b52]">Halaman belum dapat ditampilkan</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Terjadi gangguan sementara. Silakan coba memuat ulang halaman.</p>
          <button onClick={reset} className="mt-6 rounded-xl bg-[#082c5c] px-6 py-3 text-sm font-bold text-white">Coba lagi</button>
        </main>
      </body>
    </html>
  )
}
