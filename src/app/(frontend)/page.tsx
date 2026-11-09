import Link from 'next/link'
import Image from 'next/image'
import { Icon } from './components/Icons'

export default function HomePage() {
  const services = [
    { icon: 'building', title: 'Profil & WLKP', copy: 'Pendataan profil usaha dan wajib lapor ketenagakerjaan.', type: 'company', tone: 'blue' },
    { icon: 'briefcase', title: 'Lowongan & Penempatan', copy: 'Laporkan kebutuhan tenaga kerja dan realisasi penempatan.', type: 'vacancies', tone: 'green' },
    { icon: 'university', title: 'Universitas & BKK', copy: 'Data lulusan baru, BKK, atau lowongan tenaga pendukung.', type: 'university', tone: 'orange' },
    { icon: 'users', title: 'Fresh Graduate', copy: 'Rekap lulusan, kesiapan kerja, dan status penyerapan alumni.', type: 'graduates', tone: 'purple' },
    { icon: 'access', title: 'Penempatan Disabilitas', copy: 'Pendataan kuota dan penyerapan tenaga kerja disabilitas.', type: 'disability', tone: 'red' },
    { icon: 'chart', title: 'Survei TKA', copy: 'Pelaporan penggunaan dan pendampingan tenaga kerja asing.', type: 'foreign-workers', tone: 'cyan' },
  ]
  return (
    <main>
      <section className="hero-grid relative overflow-hidden bg-[#082c5c] text-white">
        <div className="absolute -right-24 -top-32 size-[480px] rounded-full bg-[#ff9d17]/15 blur-3xl" />
        <div className="mx-auto grid min-h-[500px] max-w-[1240px] items-center gap-10 px-5 py-16 lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold tracking-[.16em] text-[#ffd27b]">
              <span className="size-2 rounded-full bg-[#ffad1b]" /> PUSAT DATA KETENAGAKERJAAN TERPADU
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-[-.035em] sm:text-6xl">
              Data terhubung.<br /><span className="text-[#ffb421]">Keputusan lebih cepat.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">SiapKerja Service Unit menyatukan pelaporan perusahaan, data lulusan, lowongan, penempatan, BKK, TKA, dan tenaga kerja disabilitas di Kota Makassar.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/form" className="inline-flex items-center gap-2 rounded-xl bg-[#ffad1b] px-6 py-3.5 text-sm font-extrabold text-[#082c5c] shadow-xl shadow-black/15 transition hover:-translate-y-0.5 hover:bg-[#ffc047]">
                Mulai pengisian data <Icon name="arrow" className="size-4" />
              </Link>
              <Link href="/monitoring" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold transition hover:bg-white/15">
                Lihat monitoring
              </Link>
            </div>
          </div>
          <div className="relative hidden min-h-[330px] lg:block">
            <div className="absolute inset-0 rotate-3 rounded-[36px] border border-white/10 bg-white/5" />
            <div className="absolute inset-5 -rotate-2 overflow-hidden rounded-[30px] border border-white/10 bg-[#061d3d] shadow-2xl">
              <Image src="/sksu-logo.png" alt="Logo SKSU SiapKerja Service Unit" fill className="object-cover opacity-90" priority />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16">
        <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Direktori layanan</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0c2b52]">Pilih data yang ingin Anda laporkan</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Setiap jenis lembaga mendapatkan formulir yang sesuai—tanpa bidang yang tidak relevan.</p>
          </div>
          <span className="text-sm font-semibold text-slate-400">6 kelompok layanan</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link href={`/form?type=${service.type}`} key={service.title} className="service-card group">
              <span className={`service-icon service-${service.tone}`}><Icon name={service.icon} className="size-6" /></span>
              <h3 className="mt-6 text-lg font-extrabold text-[#112d51]">{service.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{service.copy}</p>
              <span className="mt-6 flex items-center gap-2 text-sm font-bold text-[#0d5594]">Isi formulir <Icon name="arrow" className="size-4 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-12 sm:grid-cols-3">
          {[
            ['01', 'Pilih kategori', 'Tentukan jenis lembaga dan tujuan pelaporan.'],
            ['02', 'Lengkapi data', 'Hanya bidang yang relevan yang akan ditampilkan.'],
            ['03', 'Diverifikasi', 'Admin Disnaker memeriksa laporan di ruang kerja aman.'],
          ].map(([number, title, copy]) => (
            <div key={number} className="flex gap-4">
              <span className="text-3xl font-black text-[#f6a313]">{number}</span>
              <div><h3 className="font-extrabold text-[#0c2b52]">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{copy}</p></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#061d3d] text-blue-100">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 px-5 py-8 text-xs sm:flex-row">
          <span>© 2026 Dinas Ketenagakerjaan Kota Makassar · Bidang Penta</span>
          <span>SKSU · Satu data untuk kesempatan kerja yang lebih luas</span>
        </div>
      </footer>
    </main>
  )
}
