import config from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Icon } from '../components/Icons'
import { PrintButton } from './PrintButton'

type Report = {
  id: string | number
  officialId?: string | null
  organizationName?: string | null
  organizationType?: string | null
  reportType?: string | null
  periodMonth?: string | null
  periodYear?: number | null
  localWorkers?: number | null
  foreignWorkers?: number | null
  disabledWorkers?: number | null
  placementType?: string | null
  placementCount?: number | null
  disabilityPlaced?: number | null
  vacancyCount?: number | null
  graduateCount?: number | null
  status?: string | null
}

export default async function MonitoringPage() {
  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: await headers() })
  if (!auth.user || auth.user.collection !== 'admins') redirect('/?admin=1')

  const result = await payload.find({
    collection: 'submissions',
    limit: 500,
    pagination: false,
    sort: '-createdAt',
    overrideAccess: false,
    user: auth.user,
  })

  const reports = result.docs as unknown as Report[]
  const sum = (key: keyof Report) =>
    reports.reduce((total, report) => total + (Number(report[key]) || 0), 0)

  const verified = reports.filter((report) => report.status === 'verified').length
  const totalVacancies = sum('vacancyCount')
  const totalPlacement = sum('placementCount')
  const totalDisability = sum('disabledWorkers') + sum('disabilityPlaced')

  const categories = [
    { label: 'Perusahaan', value: reports.filter((r) => r.organizationType === 'company').length, color: '#0d5594' },
    { label: 'Pendidikan', value: reports.filter((r) => r.organizationType === 'university' || r.organizationType === 'school').length, color: '#f5a20a' },
    { label: 'UMKM / Kop', value: reports.filter((r) => r.organizationType === 'umkm').length, color: '#16a06d' },
    { label: 'OpDis / Lain', value: reports.filter((r) => !['company', 'university', 'school', 'umkm'].includes(r.organizationType || '')).length, color: '#7c4bd4' },
  ]

  const placementPaths = [
    { label: 'AKL (Lokal)', value: reports.filter((r) => r.placementType === 'AKL').reduce((t, r) => t + (Number(r.placementCount) || 0), 0), color: '#0d5594' },
    { label: 'AKAD (Daerah)', value: reports.filter((r) => r.placementType === 'AKAD').reduce((t, r) => t + (Number(r.placementCount) || 0), 0), color: '#0284c7' },
    { label: 'AKAN (PMI)', value: reports.filter((r) => r.placementType === 'AKAN').reduce((t, r) => t + (Number(r.placementCount) || 0), 0), color: '#f5a20a' },
    { label: 'AKSUS (Disabilitas)', value: reports.filter((r) => r.placementType === 'AKSUS').reduce((t, r) => t + (Number(r.placementCount) || 0), 0), color: '#16a06d' },
  ]

  const currentYear = new Date().getFullYear()
  const yearly = Array.from({ length: 6 }, (_, index) => {
    const year = currentYear - 5 + index
    const docs = reports.filter((r) => r.periodYear === year)
    return { year, value: docs.reduce((total, r) => total + (Number(r.placementCount) || 0), 0) }
  })

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#f4f7fb]">
      <div className="mx-auto max-w-[1240px] px-5 py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Ruang kerja admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0c2b52]">Monitoring & evaluasi</h1>
            <p className="mt-2 text-sm text-slate-500">Rekapitulasi data Bidang Penta Disnaker Kota Makassar.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <PrintButton />
            <a href="/admin/collections/submissions" className="inline-flex items-center gap-2 rounded-xl bg-[#082c5c] px-5 py-3 text-sm font-bold text-white">
              <Icon name="form" className="size-4" /> Kelola laporan
            </a>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Laporan masuk" value={reports.length} note={`${verified} telah terverifikasi`} color="blue" />
          <Stat label="Lowongan tersedia" value={totalVacancies} note="Total posisi dilaporkan" color="orange" />
          <Stat label="Realisasi penempatan" value={totalPlacement} note={`Selisih belum terisi: ${Math.max(0, totalVacancies - totalPlacement)}`} color="green" />
          <Stat label="Tenaga kerja disabilitas" value={totalDisability} note="Pekerja & penempatan AKSUS" color="purple" />
        </section>

        {reports.length === 0 && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800 print:hidden">
            <Icon name="chart" className="size-5" /> Belum ada laporan. Grafik akan terisi otomatis setelah pengguna mengirim data.
          </div>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="chart-card">
            <div>
              <p className="chart-kicker">Grafik batang</p>
              <h2 className="chart-title">Perbandingan serapan & kebutuhan</h2>
            </div>
            <BarChart
              values={[
                { label: 'Pekerja lokal', value: sum('localWorkers'), color: '#0d5594' },
                { label: 'Lowongan dibuka', value: totalVacancies, color: '#f5a20a' },
                { label: 'Penempatan', value: totalPlacement, color: '#16a06d' },
                { label: 'Disabilitas', value: totalDisability, color: '#7c4bd4' },
              ]}
            />
          </div>

          <div className="chart-card">
            <div>
              <p className="chart-kicker">Grafik batang</p>
              <h2 className="chart-title">Realisasi per jalur penempatan</h2>
            </div>
            <BarChart values={placementPaths} />
          </div>

          <div className="chart-card">
            <div>
              <p className="chart-kicker">Grafik lingkaran</p>
              <h2 className="chart-title">Komposisi lembaga pelapor</h2>
            </div>
            <DonutChart values={categories} />
          </div>

          <div className="chart-card">
            <div>
              <p className="chart-kicker">Grafik area</p>
              <h2 className="chart-title">Tren penempatan tenaga kerja</h2>
            </div>
            <AreaChart values={yearly} />
          </div>
        </section>

        {/* Tabel Rekapitulasi untuk Cetak / Audit */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <p className="chart-kicker">Rekapitulasi data</p>
            <h2 className="chart-title">Daftar laporan bulanan masuk</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">NIB</th>
                  <th className="px-5 py-3.5">Nama Lembaga / Perusahaan</th>
                  <th className="px-5 py-3.5">Jenis Laporan</th>
                  <th className="px-5 py-3.5">Periode</th>
                  <th className="px-5 py-3.5">Lowongan</th>
                  <th className="px-5 py-3.5">Penempatan</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      Belum ada data laporan yang tercatat.
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={String(r.id)} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-600">{r.officialId || '-'}</td>
                      <td className="px-5 py-3.5 font-bold text-[#0c2b52]">{r.organizationName || '-'}</td>
                      <td className="px-5 py-3.5 text-slate-600">{r.reportType || '-'}</td>
                      <td className="px-5 py-3.5 text-slate-600">{`${r.periodMonth || '-'}/${r.periodYear || '-'}`}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-700">{Number(r.vacancyCount || 0)}</td>
                      <td className="px-5 py-3.5 font-bold text-emerald-700">{Number(r.placementCount || 0)}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#0d5594]">
                          {r.status || 'submitted'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

function Stat({ label, value, note, color }: { label: string; value: number; note: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 h-1.5 w-10 rounded-full stat-${color}`} />
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <strong className="mt-2 block text-3xl font-black text-[#0c2b52]">{value.toLocaleString('id-ID')}</strong>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  )
}

function BarChart({ values }: { values: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...values.map((item) => item.value), 1)
  return (
    <div className="mt-8 flex h-64 items-end gap-4 border-b border-l border-slate-200 px-5">
      {values.map((item) => (
        <div key={item.label} className="flex h-full flex-1 flex-col justify-end text-center">
          <span className="mb-2 text-xs font-extrabold text-slate-600">{item.value}</span>
          <div className="mx-auto w-full max-w-16 rounded-t-lg" style={{ height: `${Math.max((item.value / max) * 80, 3)}%`, backgroundColor: item.color }} />
          <span className="mt-3 min-h-8 text-[10px] font-semibold text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ values }: { values: { label: string; value: number; color: string }[] }) {
  const total = values.reduce((sum, item) => sum + item.value, 0)
  let offset = 0
  const segments = values.map((item) => {
    const percentage = total ? (item.value / total) * 100 : 0
    const segment = `${item.color} ${offset}% ${offset + percentage}%`
    offset += percentage
    return segment
  })
  const background = total ? `conic-gradient(${segments.join(',')})` : 'conic-gradient(#e7edf4 0 100%)'
  return (
    <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
      <div className="relative size-48 shrink-0 rounded-full" style={{ background }}>
        <div className="absolute inset-10 grid place-items-center rounded-full bg-white text-center">
          <span>
            <strong className="block text-2xl text-[#0c2b52]">{total}</strong>
            <small className="text-slate-400">pelapor</small>
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {values.map((item) => (
          <div key={item.label} className="flex items-center gap-3 text-sm">
            <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="min-w-24 text-slate-500">{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function AreaChart({ values }: { values: { year: number; value: number }[] }) {
  const width = 650
  const height = 230
  const max = Math.max(...values.map((item) => item.value), 1)
  const points = values.map((item, index) => `${(index / (values.length - 1)) * width},${height - (item.value / max) * 180 - 20}`).join(' ')
  const area = `0,${height} ${points} ${width},${height}`
  return (
    <div className="mt-6 overflow-x-auto">
      <div className="min-w-[480px]">
        <svg viewBox={`0 0 ${width} ${height + 35}`} className="w-full" role="img" aria-label="Tren penempatan per tahun">
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0d5594" stopOpacity=".35" />
              <stop offset="1" stopColor="#0d5594" stopOpacity=".02" />
            </linearGradient>
          </defs>
          <line x1="0" x2={width} y1={height} y2={height} stroke="#dce5ef" />
          <polygon points={area} fill="url(#area)" />
          <polyline points={points} fill="none" stroke="#0d5594" strokeWidth="5" strokeLinejoin="round" />
          {values.map((item, index) => {
            const x = (index / (values.length - 1)) * width
            const y = height - (item.value / max) * 180 - 20
            return (
              <g key={item.year}>
                <circle cx={x} cy={y} r="7" fill="#fff" stroke="#f5a20a" strokeWidth="4" />
                <text x={x} y={height + 25} textAnchor="middle" fontSize="13" fill="#64748b">{item.year}</text>
                <text x={x} y={y - 14} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0c2b52">{item.value}</text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}