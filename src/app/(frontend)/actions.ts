'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

export type SubmissionState = {
  ok: boolean
  message: string
  reference?: string
  errors?: Record<string, string>
}

const organizationTypes = new Set([
  'company',
  'umkm',
  'university',
  'school',
  'cooperative',
  'disability-organization',
  'other',
])
const reportTypes = new Set([
  'profile',
  'vacancies',
  'graduates',
  'bkk',
  'placement',
  'foreign-workers',
  'disability',
])

const clean = (value: FormDataEntryValue | null, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const numberValue = (value: FormDataEntryValue | null) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0
}

export async function submitReport(
  _previous: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const organizationType = clean(formData.get('organizationType'), 40)
  const reportType = clean(formData.get('reportType'), 40)
  const organizationName = clean(formData.get('organizationName'), 150)
  const officialId = clean(formData.get('officialId'), 30)
  const sector = clean(formData.get('sector'), 100)
  const address = clean(formData.get('address'), 500)
  const district = clean(formData.get('district'), 80)
  const email = clean(formData.get('email'), 150).toLowerCase()
  const phone = clean(formData.get('phone'), 24)
  const periodYear = numberValue(formData.get('periodYear'))

  const errors: Record<string, string> = {}
  if (!organizationTypes.has(organizationType)) errors.organizationType = 'Pilih jenis lembaga.'
  if (!reportTypes.has(reportType)) errors.reportType = 'Pilih jenis pelaporan.'
  if (organizationName.length < 3) errors.organizationName = 'Nama lembaga minimal 3 karakter.'
  if (officialId.length < 5) errors.officialId = 'Masukkan NIB atau nomor identitas resmi.'
  if (!sector) errors.sector = 'Sektor atau bidang wajib diisi.'
  if (address.length < 8) errors.address = 'Alamat operasional belum lengkap.'
  if (!district) errors.district = 'Kecamatan wajib diisi.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Format email belum sesuai.'
  if (!/^[+\d][\d\s-]{7,23}$/.test(phone)) errors.phone = 'Nomor telepon belum sesuai.'
  if (periodYear < 2020 || periodYear > 2100) errors.periodYear = 'Tahun pelaporan tidak valid.'

  const vacancyTitle = clean(formData.get('vacancyTitle'), 150)
  const studyProgram = clean(formData.get('studyProgram'), 150)
  if (reportType === 'vacancies' && !vacancyTitle) errors.vacancyTitle = 'Posisi lowongan wajib diisi.'
  if ((reportType === 'graduates' || reportType === 'bkk') && !studyProgram) {
    errors.studyProgram = 'Program studi atau jurusan wajib diisi.'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: 'Periksa kembali beberapa bidang yang ditandai.', errors }
  }

  try {
    const payload = await getPayload({ config })
    const document = await payload.create({
      collection: 'submissions',
      draft: false,
      overrideAccess: false,
      data: {
        organizationType: organizationType as 'company',
        reportType: reportType as 'profile',
        organizationName,
        officialId,
        sector,
        address,
        district,
        email,
        phone,
        periodYear,
        localWorkers: numberValue(formData.get('localWorkers')),
        foreignWorkers: numberValue(formData.get('foreignWorkers')),
        disabledWorkers: numberValue(formData.get('disabledWorkers')),
        placementCount: numberValue(formData.get('placementCount')),
        vacancyTitle,
        vacancyCount: numberValue(formData.get('vacancyCount')),
        workersNeeded: numberValue(formData.get('workersNeeded')),
        disabilityQuota: numberValue(formData.get('disabilityQuota')),
        vacancyRequirements: clean(formData.get('vacancyRequirements'), 1000),
        studyProgram,
        graduateCount: numberValue(formData.get('graduateCount')),
        jobReadyCount: numberValue(formData.get('jobReadyCount')),
        employedGraduateCount: numberValue(formData.get('employedGraduateCount')),
        bkkPartner: formData.get('bkkPartner') === 'on',
        notes: clean(formData.get('notes'), 1200),
        status: 'submitted',
      },
    })

    return {
      ok: true,
      message: 'Laporan berhasil dikirim dan masuk ke antrean verifikasi Disnaker.',
      reference: `SKSU-${String(document.id).slice(-8).toUpperCase()}`,
    }
  } catch {
    return {
      ok: false,
      message: 'Laporan belum dapat disimpan. Silakan periksa data lalu coba kembali.',
    }
  }
}
