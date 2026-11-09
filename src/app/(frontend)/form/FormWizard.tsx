'use client'

import { useActionState, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { submitReport, type SubmissionState } from '../actions'
import { Icon } from '../components/Icons'

const initialState: SubmissionState = { ok: false, message: '' }

const organizations = [
  { value: 'company', title: 'Perusahaan', copy: 'Swasta, industri, atau pemberi kerja', icon: 'building' },
  { value: 'umkm', title: 'UMKM / Koperasi', copy: 'Usaha mikro, kecil, menengah, koperasi', icon: 'briefcase' },
  { value: 'university', title: 'Universitas', copy: 'Perguruan tinggi dan institusi pendidikan', icon: 'university' },
  { value: 'school', title: 'SMK / Sekolah', copy: 'Sekolah dengan BKK atau data alumni', icon: 'users' },
  { value: 'disability-organization', title: 'Organisasi Disabilitas', copy: 'Lembaga pendamping dan penempatan', icon: 'access' },
  { value: 'other', title: 'Lembaga Lainnya', copy: 'Instansi atau organisasi ketenagakerjaan', icon: 'form' },
]

const reportOptions: Record<string, { value: string; title: string; copy: string }[]> = {
  company: [
    { value: 'profile', title: 'Profil & WLKP', copy: 'Profil usaha dan data tenaga kerja' },
    { value: 'vacancies', title: 'Lowongan pekerjaan', copy: 'Kebutuhan pekerja dan kuota disabilitas' },
    { value: 'placement', title: 'Realisasi penempatan', copy: 'Pekerja yang telah ditempatkan' },
    { value: 'foreign-workers', title: 'Tenaga kerja asing', copy: 'Data penggunaan TKA' },
    { value: 'disability', title: 'Pekerja disabilitas', copy: 'Penyerapan dan penempatan' },
  ],
  university: [
    { value: 'graduates', title: 'Data fresh graduate', copy: 'Lulusan, siap kerja, dan sudah bekerja' },
    { value: 'vacancies', title: 'Lowongan internal', copy: 'OB, satpam, administrasi, dan posisi lain' },
    { value: 'bkk', title: 'Bursa Kerja Khusus', copy: 'Aktivitas BKK dan penyaluran alumni' },
  ],
  school: [
    { value: 'graduates', title: 'Data alumni baru', copy: 'Lulusan dan kesiapan kerja' },
    { value: 'bkk', title: 'Bursa Kerja Khusus', copy: 'Kegiatan dan mitra penempatan' },
    { value: 'vacancies', title: 'Lowongan internal', copy: 'Tenaga pendukung sekolah' },
  ],
  'disability-organization': [
    { value: 'disability', title: 'Penempatan disabilitas', copy: 'Peserta, pendampingan, dan penempatan' },
    { value: 'graduates', title: 'Pencari kerja', copy: 'Data peserta siap kerja' },
  ],
}

export function FormWizard() {
  const searchParams = useSearchParams()
  const preset = searchParams.get('type') || ''
  const presetOrg = ['company', 'university', 'school', 'disability-organization'].includes(preset) ? preset : ''
  const presetReport = ['vacancies', 'graduates', 'disability', 'foreign-workers'].includes(preset) ? preset : ''
  const [organizationType, setOrganizationType] = useState(presetOrg || (presetReport ? 'company' : ''))
  const [reportType, setReportType] = useState(presetReport)
  const [step, setStep] = useState(organizationType && reportType ? 3 : organizationType ? 2 : 1)
  const [state, formAction, pending] = useActionState(submitReport, initialState)

  const options = reportOptions[organizationType] || [
    { value: 'profile', title: 'Profil & WLKP', copy: 'Profil lembaga dan ketenagakerjaan' },
    { value: 'vacancies', title: 'Lowongan pekerjaan', copy: 'Kebutuhan tenaga kerja' },
    { value: 'placement', title: 'Realisasi penempatan', copy: 'Data penempatan tenaga kerja' },
  ]

  useEffect(() => {
    if (state.ok) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [state.ok])

  if (state.ok) {
    return (
      <div className="mx-auto max-w-2xl rounded-[28px] border border-emerald-100 bg-white p-8 text-center shadow-xl shadow-slate-200/60 sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Icon name="check" className="size-8" /></span>
        <p className="eyebrow mt-6">Pengiriman berhasil</p>
        <h1 className="mt-2 text-3xl font-black text-[#0c2b52]">Terima kasih atas laporan Anda</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">{state.message}</p>
        <div className="mx-auto mt-6 max-w-sm rounded-xl bg-[#f3f7fb] px-5 py-4">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Nomor referensi</span>
          <strong className="mt-1 block text-lg text-[#0d5594]">{state.reference}</strong>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Kembali ke portal</Link>
          <button onClick={() => window.location.reload()} className="rounded-xl bg-[#082c5c] px-5 py-3 text-sm font-bold text-white">Kirim laporan lain</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1040px]">
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <span className={`grid size-9 place-items-center rounded-full text-sm font-black ${step >= item ? 'bg-[#0d5594] text-white' : 'bg-slate-200 text-slate-500'}`}>{step > item ? <Icon name="check" className="size-4" /> : item}</span>
            {item < 3 && <span className={`h-1 w-12 rounded-full sm:w-24 ${step > item ? 'bg-[#0d5594]' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <section className="form-panel">
          <p className="eyebrow">Langkah 1 dari 3</p>
          <h1 className="form-title">Anda mewakili lembaga apa?</h1>
          <p className="form-copy">Pilihan ini menentukan formulir yang paling relevan untuk Anda.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <button key={org.value} onClick={() => { setOrganizationType(org.value); setReportType(''); setStep(2) }} className="choice-card text-left">
                <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-[#0d5594]"><Icon name={org.icon} className="size-5" /></span>
                <strong className="mt-4 block text-base text-[#112d51]">{org.title}</strong>
                <span className="mt-1 block text-sm leading-5 text-slate-500">{org.copy}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="form-panel">
          <button onClick={() => setStep(1)} className="mb-5 text-sm font-bold text-[#0d5594]">← Ganti jenis lembaga</button>
          <p className="eyebrow">Langkah 2 dari 3</p>
          <h1 className="form-title">Data apa yang ingin dilaporkan?</h1>
          <p className="form-copy">Anda hanya akan melihat bidang yang dibutuhkan untuk laporan ini.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {options.map((option) => (
              <button key={option.value} onClick={() => { setReportType(option.value); setStep(3) }} className="choice-card flex items-start gap-4 text-left">
                <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border-2 border-blue-100 text-[#0d5594]"><Icon name="arrow" className="size-4" /></span>
                <span><strong className="block text-base text-[#112d51]">{option.title}</strong><span className="mt-1 block text-sm text-slate-500">{option.copy}</span></span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 3 && (
        <form action={formAction} className="form-panel">
          <input type="hidden" name="organizationType" value={organizationType} />
          <input type="hidden" name="reportType" value={reportType} />
          <button type="button" onClick={() => setStep(2)} className="mb-5 text-sm font-bold text-[#0d5594]">← Ganti jenis laporan</button>
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Icon name="form" className="size-6" /></span>
            <div><p className="eyebrow">Langkah 3 dari 3</p><h1 className="form-title mt-1">Lengkapi data laporan</h1><p className="form-copy">Data bertanda * wajib diisi.</p></div>
          </div>

          {state.message && <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{state.message}</div>}

          <fieldset className="form-section">
            <legend>Identitas lembaga</legend>
            <div className="form-grid">
              <Field label="Nama lembaga / perusahaan" name="organizationName" error={state.errors?.organizationName} required />
              <Field label="NIB / nomor identitas resmi" name="officialId" error={state.errors?.officialId} required />
              <Field label="Sektor / bidang" name="sector" error={state.errors?.sector} placeholder="Contoh: Pendidikan, Manufaktur" required />
              <Field label="Kecamatan" name="district" error={state.errors?.district} placeholder="Contoh: Rappocini" required />
              <Field label="Email resmi" name="email" type="email" error={state.errors?.email} required />
              <Field label="Nomor telepon" name="phone" type="tel" error={state.errors?.phone} required />
              <Field label="Tahun pelaporan" name="periodYear" type="number" defaultValue={new Date().getFullYear()} error={state.errors?.periodYear} required />
              <label className="field sm:col-span-2"><span>Alamat operasional *</span><textarea name="address" rows={3} placeholder="Alamat lengkap di Kota Makassar" required />{state.errors?.address && <small>{state.errors.address}</small>}</label>
            </div>
          </fieldset>

          {(reportType === 'profile' || reportType === 'placement' || reportType === 'foreign-workers' || reportType === 'disability') && (
            <fieldset className="form-section">
              <legend>Data ketenagakerjaan</legend>
              <div className="form-grid">
                <Field label="Tenaga kerja lokal" name="localWorkers" type="number" defaultValue={0} />
                {reportType === 'foreign-workers' && <Field label="Tenaga kerja asing" name="foreignWorkers" type="number" defaultValue={0} />}
                {(reportType === 'profile' || reportType === 'disability') && <Field label="Pekerja disabilitas" name="disabledWorkers" type="number" defaultValue={0} />}
                {(reportType === 'placement' || reportType === 'disability') && <Field label="Realisasi penempatan" name="placementCount" type="number" defaultValue={0} />}
              </div>
            </fieldset>
          )}

          {reportType === 'vacancies' && (
            <fieldset className="form-section">
              <legend>Informasi lowongan</legend>
              <div className="form-grid">
                <Field label="Posisi / jabatan" name="vacancyTitle" error={state.errors?.vacancyTitle} placeholder="Contoh: Satpam, staf administrasi" required />
                <Field label="Jumlah lowongan dibuka" name="vacancyCount" type="number" defaultValue={0} />
                <Field label="Jumlah pekerja dibutuhkan" name="workersNeeded" type="number" defaultValue={0} />
                <Field label="Kuota pekerja disabilitas" name="disabilityQuota" type="number" defaultValue={0} />
                <label className="field sm:col-span-2"><span>Persyaratan ringkas</span><textarea name="vacancyRequirements" rows={3} placeholder="Pendidikan, pengalaman, atau persyaratan lain" /></label>
              </div>
            </fieldset>
          )}

          {(reportType === 'graduates' || reportType === 'bkk') && (
            <fieldset className="form-section">
              <legend>Data lulusan & BKK</legend>
              <div className="form-grid">
                <Field label="Program studi / jurusan" name="studyProgram" error={state.errors?.studyProgram} required />
                <Field label="Jumlah fresh graduate" name="graduateCount" type="number" defaultValue={0} />
                <Field label="Lulusan siap kerja" name="jobReadyCount" type="number" defaultValue={0} />
                <Field label="Lulusan sudah bekerja" name="employedGraduateCount" type="number" defaultValue={0} />
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-[#173352] sm:col-span-2">
                  <input type="checkbox" name="bkkPartner" className="size-5 accent-[#0d5594]" /> Terdaftar sebagai mitra BKK
                </label>
              </div>
            </fieldset>
          )}

          <fieldset className="form-section">
            <legend>Catatan tambahan</legend>
            <label className="field"><textarea name="notes" rows={3} placeholder="Informasi lain yang perlu diketahui petugas Disnaker" /></label>
          </fieldset>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-7 sm:flex-row">
            <p className="flex items-center gap-2 text-xs leading-5 text-slate-500"><Icon name="shield" className="size-5 shrink-0 text-emerald-600" /> Data hanya dapat dibaca dan dikelola admin Disnaker.</p>
            <button disabled={pending} className="inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-[#f59f0b] px-6 py-3.5 text-sm font-black text-[#082c5c] shadow-lg shadow-orange-200 disabled:opacity-60">
              {pending ? 'Mengirim laporan...' : 'Kirim laporan'} <Icon name="arrow" className="size-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function Field({ label, name, error, type = 'text', required = false, defaultValue, placeholder }: {
  label: string; name: string; error?: string; type?: string; required?: boolean; defaultValue?: string | number; placeholder?: string
}) {
  return (
    <label className="field">
      <span>{label}{required ? ' *' : ''}</span>
      <input name={name} type={type} min={type === 'number' ? 0 : undefined} defaultValue={defaultValue} placeholder={placeholder} required={required} />
      {error && <small>{error}</small>}
    </label>
  )
}
