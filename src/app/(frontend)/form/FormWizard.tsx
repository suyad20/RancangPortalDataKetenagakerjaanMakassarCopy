'use client'

import { useActionState, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { lookupCompanyByNib, submitReport, type SubmissionState } from '../actions'
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
    { value: 'profile', title: 'Profil & WLKP', copy: 'Profil usaha dan rekap jumlah tenaga kerja' },
    { value: 'vacancies', title: 'Info Lowongan Kerja (WLLKP)', copy: 'Input multi-posisi lowongan yang dibuka' },
    { value: 'placement', title: 'Realisasi Penempatan', copy: 'Laporan pekerja yang diterima (AKL/AKAD/AKAN/AKSUS)' },
    { value: 'foreign-workers', title: 'Tenaga Kerja Asing (TKA)', copy: 'Data penggunaan TKA di perusahaan' },
    { value: 'disability', title: 'Penyerapan Disabilitas', copy: 'Rekap pekerja penyandang disabilitas' },
    { value: 'profile-change', title: 'Permohonan Perubahan Profil', copy: 'Ajukan ubah nama/alamat perusahaan ke Super Admin' },
  ],
  university: [
    { value: 'bkk', title: 'Data Fresh Graduate & BKK', copy: 'Lulusan, siap kerja, dan penyaluran alumni' },
    { value: 'vacancies', title: 'Lowongan Internal', copy: 'OB, satpam, administrasi, dan posisi lain' },
    { value: 'placement', title: 'Realisasi Penempatan', copy: 'Alumni/tenaga kerja yang sudah ditempatkan' },
  ],
  school: [
    { value: 'bkk', title: 'Bursa Kerja Khusus (BKK)', copy: 'Data alumni dan mitra penempatan' },
    { value: 'vacancies', title: 'Lowongan Internal', copy: 'Tenaga pendukung sekolah' },
    { value: 'placement', title: 'Realisasi Penempatan', copy: 'Penempatan alumni SMK' },
  ],
  'disability-organization': [
    { value: 'disability', title: 'Penempatan Disabilitas (AKSUS)', copy: 'Peserta, pendampingan, dan penempatan' },
    { value: 'placement', title: 'Realisasi Penempatan', copy: 'Laporan penyaluran kerja disabilitas' },
  ],
}

const months = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

type VacancyRow = {
  positionTitle: string
  vacancyCount: number
  maleCount: number
  femaleCount: number
  educationLevel: string
  disabilityInclusive: boolean
}

export function FormWizard() {
  const searchParams = useSearchParams()
  const preset = searchParams.get('type') || ''
  const presetOrg = ['company', 'university', 'school', 'disability-organization'].includes(preset) ? preset : ''
  const presetReport = ['vacancies', 'bkk', 'disability', 'foreign-workers', 'placement'].includes(preset) ? preset : ''

  const [organizationType, setOrganizationType] = useState(presetOrg || (presetReport ? 'company' : ''))
  const [reportType, setReportType] = useState(presetReport)
  const [step, setStep] = useState(organizationType && reportType ? 3 : organizationType ? 2 : 1)
  const [state, formAction, pending] = useActionState(submitReport, initialState)

  // State Identitas untuk fitur Auto-Fill NIB
  const [nib, setNib] = useState('')
  const [nibStatus, setNibStatus] = useState<'idle' | 'loading' | 'found' | 'new'>('idle')
  const [orgName, setOrgName] = useState('')
  const [sector, setSector] = useState('')
  const [district, setDistrict] = useState('')
  const [subDistrict, setSubDistrict] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  // State Multi-Posisi Lowongan
  const [vacancyItems, setVacancyItems] = useState<VacancyRow[]>([
    { positionTitle: '', vacancyCount: 1, maleCount: 0, femaleCount: 0, educationLevel: 'SMA/SMK', disabilityInclusive: false },
  ])

  const options = reportOptions[organizationType] || [
    { value: 'profile', title: 'Profil & WLKP', copy: 'Profil lembaga dan ketenagakerjaan' },
    { value: 'vacancies', title: 'Info Lowongan Kerja', copy: 'Kebutuhan tenaga kerja dibuka' },
    { value: 'placement', title: 'Realisasi Penempatan', copy: 'Data penempatan tenaga kerja' },
    { value: 'profile-change', title: 'Permohonan Perubahan Profil', copy: 'Ajukan perubahan data lembaga' },
  ]

  useEffect(() => {
    if (state.ok) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [state.ok])

  async function handleCheckNib() {
    if (nib.trim().length < 5) return
    setNibStatus('loading')
    const res = await lookupCompanyByNib(nib)
    if (res.found) {
      setNibStatus('found')
      if (res.organizationName) setOrgName(res.organizationName)
      if (res.sector) setSector(res.sector)
      if (res.district) setDistrict(res.district)
      if (res.subDistrict) setSubDistrict(res.subDistrict)
      if (res.email) setEmail(res.email)
      if (res.phone) setPhone(res.phone)
      if (res.address) setAddress(res.address)
    } else {
      setNibStatus('new')
    }
  }

  function addVacancyRow() {
    setVacancyItems((prev) => [
      ...prev,
      { positionTitle: '', vacancyCount: 1, maleCount: 0, femaleCount: 0, educationLevel: 'SMA/SMK', disabilityInclusive: false },
    ])
  }

  function removeVacancyRow(idx: number) {
    if (vacancyItems.length <= 1) return
    setVacancyItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateVacancyRow<K extends keyof VacancyRow>(idx: number, key: K, val: VacancyRow[K]) {
    setVacancyItems((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: val } : row)))
  }

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
          <Link href="/" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">← Kembali ke Portal SKSU</Link>
          <button onClick={() => window.location.reload()} className="rounded-xl bg-[#082c5c] px-5 py-3 text-sm font-bold text-white">Kirim laporan lain</button>
        </div>
      </div>
    )
  }

  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0')
  const isLockedExisting = nibStatus === 'found' && reportType !== 'profile-change'

  return (
    <div className="mx-auto max-w-[1040px]">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50">
          ← Kembali ke Beranda SKSU
        </Link>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className={`grid size-8 place-items-center rounded-full text-xs font-black ${step >= item ? 'bg-[#0d5594] text-white' : 'bg-slate-200 text-slate-500'}`}>
                {step > item ? <Icon name="check" className="size-4" /> : item}
              </span>
              {item < 3 && <span className={`h-1 w-8 rounded-full sm:w-16 ${step > item ? 'bg-[#0d5594]' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
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
          <p className="form-copy">Pilih jenis pelaporan bulanan atau ajukan pembaruan profil.</p>
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
          <input type="hidden" name="vacancyItemsJson" value={JSON.stringify(vacancyItems)} />

          <button type="button" onClick={() => setStep(2)} className="mb-5 text-sm font-bold text-[#0d5594]">← Ganti jenis laporan</button>
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Icon name="form" className="size-6" /></span>
            <div>
              <p className="eyebrow">Langkah 3 dari 3</p>
              <h1 className="form-title mt-1">
                {reportType === 'profile-change' ? 'Permohonan Perubahan Data Profil' : 'Lengkapi Laporan Bulanan'}
              </h1>
              <p className="form-copy">Masukkan NIB lalu klik Cek NIB untuk mengisi otomatis data perusahaan yang sudah terdaftar.</p>
            </div>
          </div>

          {state.message && <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{state.message}</div>}

          <fieldset className="form-section">
            <legend>Identitas Lembaga & Periode Laporan</legend>
            <div className="form-grid">
              <div className="field sm:col-span-2">
                <span>NIB / Nomor Identitas Resmi *</span>
                <div className="flex gap-2">
                  <input
                    name="officialId"
                    value={nib}
                    onChange={(e) => { setNib(e.target.value); setNibStatus('idle') }}
                    placeholder="Contoh: 1234567890123"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleCheckNib}
                    disabled={nibStatus === 'loading'}
                    className="shrink-0 rounded-xl bg-[#0d5594] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#082c5c]"
                  >
                    {nibStatus === 'loading' ? 'Mencari...' : 'Cek NIB'}
                  </button>
                </div>
                {nibStatus === 'found' && (
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    ✓ NIB ditemukan! Data profil otomatis diisi. Jika ada perubahan nama/alamat, pilih menu &quot;Permohonan Perubahan Profil&quot;.
                  </p>
                )}
                {nibStatus === 'new' && (
                  <p className="mt-1 text-xs font-semibold text-amber-700">
                    • NIB belum terdaftar di database SKSU. Silakan lengkapi profil perusahaan di bawah ini.
                  </p>
                )}
                {state.errors?.officialId && <small>{state.errors.officialId}</small>}
              </div>

              <label className="field">
                <span>Nama Lembaga / Perusahaan *</span>
                <input name="organizationName" value={orgName} onChange={(e) => setOrgName(e.target.value)} readOnly={isLockedExisting} required />
                {state.errors?.organizationName && <small>{state.errors.organizationName}</small>}
              </label>

              <label className="field">
                <span>Sektor / Bidang Usaha *</span>
                <input name="sector" value={sector} onChange={(e) => setSector(e.target.value)} readOnly={isLockedExisting} placeholder="Contoh: Perdagangan, Manufaktur, Jasa" required />
                {state.errors?.sector && <small>{state.errors.sector}</small>}
              </label>

              <label className="field">
                <span>Kecamatan (Kota Makassar) *</span>
                <input name="district" value={district} onChange={(e) => setDistrict(e.target.value)} readOnly={isLockedExisting} placeholder="Contoh: Panakkukang" required />
                {state.errors?.district && <small>{state.errors.district}</small>}
              </label>

              <label className="field">
                <span>Kelurahan *</span>
                <input name="subDistrict" value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} readOnly={isLockedExisting} placeholder="Contoh: Masale" required />
                {state.errors?.subDistrict && <small>{state.errors.subDistrict}</small>}
              </label>

              <label className="field">
                <span>Email Resmi / HRD *</span>
                <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                {state.errors?.email && <small>{state.errors.email}</small>}
              </label>

              <label className="field">
                <span>Nomor Telepon / WhatsApp *</span>
                <input name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                {state.errors?.phone && <small>{state.errors.phone}</small>}
              </label>

              <label className="field">
                <span>Bulan Pelaporan *</span>
                <select name="periodMonth" defaultValue={currentMonthStr} required>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Tahun Pelaporan *</span>
                <input name="periodYear" type="number" defaultValue={new Date().getFullYear()} required />
                {state.errors?.periodYear && <small>{state.errors.periodYear}</small>}
              </label>

              <label className="field sm:col-span-2">
                <span>Alamat Operasional di Makassar *</span>
                <textarea name="address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} readOnly={isLockedExisting} placeholder="Jalan, nomor gedung, RT/RW" required />
                {state.errors?.address && <small>{state.errors.address}</small>}
              </label>
            </div>
          </fieldset>

          {(reportType === 'profile' || reportType === 'foreign-workers' || reportType === 'disability') && (
            <fieldset className="form-section">
              <legend>Rekapitulasi Tenaga Kerja</legend>
              <div className="form-grid">
                <Field label="Total Tenaga Kerja Lokal" name="localWorkers" type="number" defaultValue={0} />
                {reportType === 'foreign-workers' && <Field label="Total Tenaga Kerja Asing (TKA)" name="foreignWorkers" type="number" defaultValue={0} />}
                {(reportType === 'profile' || reportType === 'disability') && <Field label="Total Pekerja Disabilitas" name="disabledWorkers" type="number" defaultValue={0} />}
              </div>
            </fieldset>
          )}

          {reportType === 'vacancies' && (
            <fieldset className="form-section">
              <div className="mb-4 flex items-center justify-between">
                <legend className="!mb-0">Daftar Posisi Lowongan Dibuka</legend>
                <button type="button" onClick={addVacancyRow} className="rounded-xl bg-[#0d5594] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#082c5c]">
                  + Tambah Posisi Jabatan
                </button>
              </div>
              {state.errors?.vacancyTitle && <p className="mb-3 text-xs font-bold text-red-600">{state.errors.vacancyTitle}</p>}

              <div className="space-y-4">
                {vacancyItems.map((row, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-[#0d5594]">Posisi #{idx + 1}</span>
                      {vacancyItems.length > 1 && (
                        <button type="button" onClick={() => removeVacancyRow(idx)} className="text-xs font-bold text-red-600 hover:underline">
                          Hapus posisi
                        </button>
                      )}
                    </div>
                    <div className="form-grid">
                      <label className="field">
                        <span>Nama Jabatan / Posisi *</span>
                        <input
                          value={row.positionTitle}
                          onChange={(e) => updateVacancyRow(idx, 'positionTitle', e.target.value)}
                          placeholder="Contoh: Satpam, Staf Admin, OB"
                          required
                        />
                      </label>
                      <label className="field">
                        <span>Jumlah Lowongan Dibuka *</span>
                        <input
                          type="number"
                          min={1}
                          value={row.vacancyCount}
                          onChange={(e) => updateVacancyRow(idx, 'vacancyCount', Number(e.target.value))}
                          required
                        />
                      </label>
                      <label className="field">
                        <span>Kuota Laki-laki</span>
                        <input
                          type="number"
                          min={0}
                          value={row.maleCount}
                          onChange={(e) => updateVacancyRow(idx, 'maleCount', Number(e.target.value))}
                        />
                      </label>
                      <label className="field">
                        <span>Kuota Perempuan</span>
                        <input
                          type="number"
                          min={0}
                          value={row.femaleCount}
                          onChange={(e) => updateVacancyRow(idx, 'femaleCount', Number(e.target.value))}
                        />
                      </label>
                      <label className="field">
                        <span>Kualifikasi Pendidikan</span>
                        <select value={row.educationLevel} onChange={(e) => updateVacancyRow(idx, 'educationLevel', e.target.value)}>
                          <option value="SD/SMP">SD / SMP</option>
                          <option value="SMA/SMK">SMA / SMK Sederajat</option>
                          <option value="D3">Diploma (D1 - D3)</option>
                          <option value="S1">Sarjana (S1 / D4)</option>
                          <option value="S2">Pascasarjana (S2 / S3)</option>
                          <option value="Semua Jenjang">Semua Jenjang</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-[#173352]">
                        <input
                          type="checkbox"
                          checked={row.disabilityInclusive}
                          onChange={(e) => updateVacancyRow(idx, 'disabilityInclusive', e.target.checked)}
                          className="size-4 accent-[#0d5594]"
                        />
                        Terbuka untuk Disabilitas (Inklusi)
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label className="field">
                  <span>Persyaratan Ringkas / Uraian Umum</span>
                  <textarea name="vacancyRequirements" rows={3} placeholder="Tuliskan syarat umum seperti pengalaman kerja, sertifikasi, atau dokumen lamaran" />
                </label>
              </div>
            </fieldset>
          )}

          {(reportType === 'placement' || reportType === 'disability') && (
            <fieldset className="form-section">
              <legend>Realisasi Penempatan Tenaga Kerja</legend>
              <div className="form-grid">
                <label className="field sm:col-span-2">
                  <span>Jalur / Kategori Penempatan *</span>
                  <select name="placementType" defaultValue={reportType === 'disability' ? 'AKSUS' : 'AKL'} required>
                    <option value="AKL">AKL — Antar Kerja Lokal (Dalam Kota Makassar)</option>
                    <option value="AKAD">AKAD — Antar Kerja Antar Daerah (Luar Makassar)</option>
                    <option value="AKAN">AKAN — Antar Kerja Antar Negara (Pekerja Migran Indonesia / PMI)</option>
                    <option value="AKSUS">AKSUS — Penempatan Khusus / Penyandang Disabilitas</option>
                  </select>
                </label>
                <Field label="Jumlah Diterima Laki-laki" name="malePlaced" type="number" defaultValue={0} />
                <Field label="Jumlah Diterima Perempuan" name="femalePlaced" type="number" defaultValue={0} />
                <Field label="Jumlah Diterima Penyandang Disabilitas" name="disabilityPlaced" type="number" defaultValue={0} />
                <label className="field">
                  <span>Mayoritas Jenjang Pendidikan Diterima</span>
                  <select name="placementEducation" defaultValue="SMA/SMK">
                    <option value="SD/SMP">SD / SMP</option>
                    <option value="SMA/SMK">SMA / SMK Sederajat</option>
                    <option value="D3">Diploma (D1 - D3)</option>
                    <option value="S1">Sarjana (S1 / D4)</option>
                    <option value="S2">Pascasarjana (S2 / S3)</option>
                  </select>
                </label>
                <Field
                  label="Lokasi Penempatan (Kecamatan / Kota / Negara)"
                  name="placementLocation"
                  placeholder="Contoh: Kec. Tamalanrea, Makassar"
                />
              </div>
            </fieldset>
          )}

          {reportType === 'bkk' && (
            <fieldset className="form-section">
              <legend>Data Lulusan & Bursa Kerja Khusus (BKK)</legend>
              <div className="form-grid">
                <Field label="Program Studi / Jurusan" name="studyProgram" error={state.errors?.studyProgram} required />
                <Field label="Jumlah Fresh Graduate" name="graduateCount" type="number" defaultValue={0} />
                <Field label="Lulusan Siap Kerja" name="jobReadyCount" type="number" defaultValue={0} />
                <Field label="Lulusan Sudah Bekerja" name="employedGraduateCount" type="number" defaultValue={0} />
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-[#173352] sm:col-span-2">
                  <input type="checkbox" name="bkkPartner" className="size-5 accent-[#0d5594]" /> Terdaftar sebagai mitra BKK
                </label>
              </div>
            </fieldset>
          )}

          <fieldset className="form-section">
            <legend>{reportType === 'profile-change' ? 'Detail Data yang Ingin Diubah *' : 'Catatan Tambahan'}</legend>
            <label className="field">
              <textarea
                name="notes"
                rows={3}
                placeholder={
                  reportType === 'profile-change'
                    ? 'Jelaskan perubahan data profil (misal: Perubahan nama PT atau pindah alamat kantor baru)'
                    : 'Informasi tambahan yang perlu diketahui staf Bidang Penta Disnaker'
                }
                required={reportType === 'profile-change'}
              />
            </label>
          </fieldset>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-7 sm:flex-row">
            <p className="flex items-center gap-2 text-xs leading-5 text-slate-500">
              <Icon name="shield" className="size-5 shrink-0 text-emerald-600" /> Data tersimpan terpusat berdasarkan NIB perusahaan.
            </p>
            <button disabled={pending} className="inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-[#f59f0b] px-6 py-3.5 text-sm font-black text-[#082c5c] shadow-lg shadow-orange-200 disabled:opacity-60">
              {pending ? 'Menyimpan...' : 'Kirim Laporan'} <Icon name="arrow" className="size-4" />
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