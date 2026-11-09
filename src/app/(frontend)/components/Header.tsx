'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Icon } from './Icons'

export function Header() {
  const [adminOpen, setAdminOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('admin') === '1') setAdminOpen(true)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#082c5c]/95 text-white shadow-[0_10px_30px_rgba(7,33,72,.16)] backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3" aria-label="SKSU Beranda">
            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[#ffb000] to-[#f47521] shadow-lg shadow-orange-950/20">
              <Icon name="briefcase" className="size-6" />
            </span>
            <span>
              <strong className="block text-[17px] leading-tight tracking-wide">SKSU DISNAKER</strong>
              <span className="block text-[11px] text-blue-100">SiapKerja Service Unit · Kota Makassar</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            <Link className="nav-link" href="/"><Icon name="home" className="size-4" />Portal Layanan</Link>
            <Link className="nav-link" href="/form"><Icon name="form" className="size-4" />Pengisian Data</Link>
            <Link className="nav-link" href="/monitoring"><Icon name="chart" className="size-4" />Monitoring & Grafik</Link>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setAdminOpen(true)} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/20">
              <Icon name="shield" className="size-4" /> Admin
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-xl bg-white/10 lg:hidden" aria-label="Buka menu">
              <Icon name={menuOpen ? 'close' : 'menu'} className="size-5" />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="grid gap-1 border-t border-white/10 px-5 py-3 lg:hidden">
            <Link className="nav-link" href="/" onClick={() => setMenuOpen(false)}>Portal Layanan</Link>
            <Link className="nav-link" href="/form" onClick={() => setMenuOpen(false)}>Pengisian Data</Link>
            <Link className="nav-link" href="/monitoring" onClick={() => setMenuOpen(false)}>Monitoring & Grafik</Link>
          </nav>
        )}
      </header>

      {adminOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#04152f]/70 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="admin-title">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="relative bg-gradient-to-br from-[#0b3972] to-[#075b9d] px-7 py-8 text-white">
              <button onClick={() => setAdminOpen(false)} className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Tutup">
                <Icon name="close" className="size-5" />
              </button>
              <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-[#ffac18] text-[#082c5c]">
                <Icon name="shield" className="size-7" />
              </div>
              <h2 id="admin-title" className="text-2xl font-extrabold">Akses Admin Disnaker</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">Ruang kerja khusus pegawai yang ditunjuk untuk memverifikasi laporan dan mengelola data SKSU.</p>
            </div>
            <div className="space-y-5 p-7">
              <div className="flex gap-3 rounded-2xl bg-[#f3f7fb] p-4 text-sm leading-6 text-slate-600">
                <Icon name="lock" className="mt-0.5 size-5 shrink-0 text-[#0d5594]" />
                Login dikelola melalui sistem autentikasi aman Payload. Pengguna umum tidak memiliki akses ke data internal.
              </div>
              <a href="/admin" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#082c5c] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/20 transition hover:bg-[#0c447f]">
                Masuk sebagai pegawai <Icon name="arrow" className="size-4" />
              </a>
              <button onClick={() => setAdminOpen(false)} className="w-full text-sm font-semibold text-slate-500 hover:text-slate-800">Kembali ke portal</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
