'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

export type SubmissionState = {
  ok: boolean
  message: string
  reference?: string
  errors?: Record<string, string>
}

export type CompanyProfileData = {
  found: boolean
  organizationType?: string
  organizationName?: string
  sector?: string
  address?: string
  district?: string
  subDistrict?: string
  email?: string
  phone?: string
}

const organizationTypes = new Set([
  'company',
  'umkm',
  'university',
  'school',
  'disability-organization',
  'other',
])

const reportTypes = new Set([
  'profile',
  'vacancies',
  'placement',
  'foreign-workers',
  'disability',
  'bkk',
  'profile-change',
])

const clean = (value: FormDataEntryValue | null, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const numberValue = (value: FormDataEntryValue | null) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0
}

export async function lookupCompanyByNib(nib: string): Promise<CompanyProfileData> {
  const cleanedNib = nib.trim().slice(0, 30)
  if (cleanedNib.length < 5) return { found: false }

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'submissions',
      where: {
        officialId: { equals: cleanedNib },
      },
      sort: '-createdAt',
      limit: 1,
      overrideAccess: true,
    })

    if (result.docs.length === 0) return { found: false }

    const doc = result.docs[0] as unknown as Record<string, string>
    return {
      found: true,
      organizationType: doc.organizationType,
      organizationName: doc.organizationName,
      sector: doc.sector,
      address: doc.address,
      district: doc.district,
      subDistrict: doc.subDistrict,
      email: doc.email,
      phone: doc.phone,
    }
  } catch {
    return { found: false }
  }
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
  const subDistrict = clean(formData.get('subDistrict'), 80)
  const email = clean(formData.get('email'), 150).toLowerCase()
  const phone = clean(formData.get('phone'), 24)
  const periodMonth = clean(formData.get('periodMonth'), 5) || '01'
  const periodYear = numberValue(formData.get('periodYear'))

  const errors: Record<string, string> = {}
  if (!organizationTypes.has(organizationType)) errors.organizationType = 'Pilih jenis lembaga.'
  if (!reportTypes.has(reportType)) errors.reportType = 'Pilih jenis pelaporan.'
  if (officialId.length < 5) errors.officialId = 'Masukkan NIB atau nomor identitas resmi (min. 5 digit).'
  if (organizationName.length < 3) errors.organizationName = 'Nama lembaga minimal 3 karakter.'
  if (!sector) errors.sector = 'Sektor atau bidang usaha wajib diisi.'
  if (address.length < 8) errors.address = 'Alamat operasional belum lengkap.'
  if (!district) errors.district = 'Kecamatan wajib diisi.'
  if (!subDistrict) errors.subDistrict = 'Kelurahan wajib diisi.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Format email belum sesuai.'
  if (!/^[+\d][\d\s-]{7,23}$/.test(phone)) errors.phone = 'Nomor telepon belum sesuai.'
  if (periodYear < 2020 || periodYear > 2100) errors.periodYear = 'Tahun pelaporan tidak valid.'

  let parsedVacancyItems: {
    positionTitle: string
    vacancyCount: number
    maleCount: number
    femaleCount: number
    educationLevel: string
    disabilityInclusive: boolean
  }[] = []

  if (reportType === 'vacancies') {
    const rawItems = clean(formData.get('vacancyItemsJson'), 10000)
    try {
      const items = JSON.parse(rawItems)
      if (Array.isArray(items)) {
        parsedVacancyItems = items
          .filter((item) => item && typeof item.positionTitle === 'string' && item.positionTitle.trim())
          .map((item) => ({
            positionTitle: String(item.positionTitle).trim().slice(0, 150),
            vacancyCount: Math.max(0, Math.round(Number(item.vacancyCount) || 0)),
            maleCount: Math.max(0, Math.round(Number(item.maleCount) || 0)),
            femaleCount: Math.max(0, Math.round(Number(item.femaleCount) || 0)),
            educationLevel: String(item.educationLevel || 'SMA/SMK'),
            disabilityInclusive: Boolean(item.disabilityInclusive),
          }))
      }
    } catch {
      parsedVacancyItems = []
    }

    if (parsedVacancyItems.length === 0) {
      errors.vacancyTitle = 'Tambahkan minimal satu posisi jabatan lowongan.'
    }
  }

  const studyProgram = clean(formData.get('studyProgram'), 150)
  if (reportType === 'bkk' && !studyProgram) {
    errors.studyProgram = 'Program studi atau jurusan wajib diisi.'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: 'Periksa kembali beberapa bidang yang ditandai.', errors }
  }

  const totalVacancyCount =
    reportType === 'vacancies'
      ? parsedVacancyItems.reduce((sum, item) => sum + item.vacancyCount, 0)
      : 0

  const malePlaced = numberValue(formData.get('malePlaced'))
  const femalePlaced = numberValue(formData.get('femalePlaced'))
  const disabilityPlaced = numberValue(formData.get('disabilityPlaced'))
  const totalPlacementCount =
    numberValue(formData.get('placementCount')) || malePlaced + femalePlaced

  try {
    const payload = await getPayload({ config })
    const document = await payload.create({
      collection: 'submissions',
      draft: false,
      overrideAccess: true,
      data: {
        organizationType,
        reportType,
        organizationName,
        officialId,
        sector,
        address,
        district,
        subDistrict,
        email,
        phone,
        periodMonth,
        periodYear,
        localWorkers: numberValue(formData.get('localWorkers')),
        foreignWorkers: numberValue(formData.get('foreignWorkers')),
        disabledWorkers: numberValue(formData.get('disabledWorkers')),
        vacancyItems: parsedVacancyItems,
        vacancyCount: totalVacancyCount,
        vacancyRequirements: clean(formData.get('vacancyRequirements'), 1000),
        placementType: clean(formData.get('placementType'), 20) || 'AKL',
        placementCount: totalPlacementCount,
        malePlaced,
        femalePlaced,
        disabilityPlaced,
        placementEducation: clean(formData.get('placementEducation'), 30) || 'SMA/SMK',
        placementLocation: clean(formData.get('placementLocation'), 150),
        studyProgram,
        graduateCount: numberValue(formData.get('graduateCount')),
        jobReadyCount: numberValue(formData.get('jobReadyCount')),
        employedGraduateCount: numberValue(formData.get('employedGraduateCount')),
        bkkPartner: formData.get('bkkPartner') === 'on',
        notes: clean(formData.get('notes'), 1200),
        status: 'submitted',
      } as never,
    })

    return {
      ok: true,
      message:
        reportType === 'profile-change'
          ? 'Permohonan perubahan data profil perusahaan telah dikirim ke Super Admin Disnaker.'
          : 'Laporan bulanan berhasil dikirim dan masuk ke database SKSU Disnaker Kota Makassar.',
      reference: `SKSU-${String(document.id).slice(-8).toUpperCase()}`,
    }
  } catch {
    return {
      ok: false,
      message: 'Laporan belum dapat disimpan. Silakan periksa data lalu coba kembali.',
    }
  }
}