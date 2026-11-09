import type { Access, CollectionConfig, FieldAccess } from 'payload'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const isAdminField: FieldAccess = ({ req }) => req.user?.collection === 'admins'

const nonNegative = (value: unknown) =>
  value === undefined || value === null || (typeof value === 'number' && value >= 0) ||
  'Nilai tidak boleh kurang dari 0.'

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  labels: {
    singular: 'Laporan SKSU',
    plural: 'Laporan SKSU',
  },
  access: {
    create: () => true,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    group: 'Pendataan SKSU',
    useAsTitle: 'organizationName',
    defaultColumns: ['organizationName', 'organizationType', 'reportType', 'periodYear', 'status'],
  },
  fields: [
    {
      name: 'organizationType',
      label: 'Jenis Lembaga',
      type: 'select',
      required: true,
      options: [
        { label: 'Perusahaan', value: 'company' },
        { label: 'UMKM', value: 'umkm' },
        { label: 'Universitas / Perguruan Tinggi', value: 'university' },
        { label: 'SMK / Sekolah', value: 'school' },
        { label: 'Koperasi', value: 'cooperative' },
        { label: 'Organisasi Disabilitas', value: 'disability-organization' },
        { label: 'Lembaga Lainnya', value: 'other' },
      ],
    },
    {
      name: 'reportType',
      label: 'Jenis Pelaporan',
      type: 'select',
      required: true,
      options: [
        { label: 'Profil & WLKP', value: 'profile' },
        { label: 'Lowongan Pekerjaan', value: 'vacancies' },
        { label: 'Data Fresh Graduate', value: 'graduates' },
        { label: 'Bursa Kerja Khusus (BKK)', value: 'bkk' },
        { label: 'Penempatan Tenaga Kerja', value: 'placement' },
        { label: 'Tenaga Kerja Asing', value: 'foreign-workers' },
        { label: 'Penempatan Disabilitas', value: 'disability' },
      ],
    },
    {
      name: 'organizationName',
      label: 'Nama Lembaga / Perusahaan',
      type: 'text',
      required: true,
      maxLength: 150,
      index: true,
    },
    {
      name: 'officialId',
      label: 'NIB / Nomor Identitas Resmi',
      type: 'text',
      required: true,
      maxLength: 30,
      index: true,
    },
    { name: 'sector', label: 'Sektor / Bidang', type: 'text', required: true, maxLength: 100 },
    { name: 'address', label: 'Alamat di Kota Makassar', type: 'textarea', required: true, maxLength: 500 },
    { name: 'district', label: 'Kecamatan', type: 'text', required: true, maxLength: 80 },
    { name: 'email', label: 'Email Resmi', type: 'email', required: true },
    { name: 'phone', label: 'Nomor Telepon', type: 'text', required: true, maxLength: 24 },
    {
      name: 'periodYear',
      label: 'Tahun Pelaporan',
      type: 'number',
      required: true,
      min: 2020,
      max: 2100,
      index: true,
    },
    {
      type: 'collapsible',
      label: 'Data Ketenagakerjaan',
      fields: [
        { name: 'localWorkers', label: 'Tenaga Kerja Lokal', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'foreignWorkers', label: 'Tenaga Kerja Asing', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'disabledWorkers', label: 'Pekerja Disabilitas', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'placementCount', label: 'Realisasi Penempatan', type: 'number', defaultValue: 0, validate: nonNegative },
      ],
    },
    {
      type: 'collapsible',
      label: 'Data Lowongan',
      fields: [
        {
          name: 'vacancyTitle',
          label: 'Posisi / Jabatan',
          type: 'text',
          maxLength: 150,
          validate: (value: unknown, { data }: { data?: Record<string, unknown> }) =>
            data?.reportType !== 'vacancies' ||
            (typeof value === 'string' && value.trim().length > 0) ||
            'Posisi atau jabatan wajib diisi untuk laporan lowongan.',
        },
        { name: 'vacancyCount', label: 'Jumlah Lowongan', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'workersNeeded', label: 'Jumlah Pekerja Dibutuhkan', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'disabilityQuota', label: 'Kuota Disabilitas', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'vacancyRequirements', label: 'Persyaratan Ringkas', type: 'textarea', maxLength: 1000 },
      ],
    },
    {
      type: 'collapsible',
      label: 'Data Lulusan / BKK',
      fields: [
        {
          name: 'studyProgram',
          label: 'Program Studi / Jurusan',
          type: 'text',
          maxLength: 150,
          validate: (value: unknown, { data }: { data?: Record<string, unknown> }) =>
            !['graduates', 'bkk'].includes(String(data?.reportType)) ||
            (typeof value === 'string' && value.trim().length > 0) ||
            'Program studi atau jurusan wajib diisi untuk laporan lulusan/BKK.',
        },
        { name: 'graduateCount', label: 'Fresh Graduate', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'jobReadyCount', label: 'Siap Kerja', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'employedGraduateCount', label: 'Sudah Bekerja', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'bkkPartner', label: 'Terdaftar sebagai Mitra BKK', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'notes',
      label: 'Catatan Tambahan',
      type: 'textarea',
      maxLength: 1200,
    },
    {
      name: 'status',
      label: 'Status Verifikasi',
      type: 'select',
      defaultValue: 'submitted',
      required: true,
      access: {
        create: isAdminField,
        update: isAdminField,
      },
      options: [
        { label: 'Baru Masuk', value: 'submitted' },
        { label: 'Sedang Diverifikasi', value: 'review' },
        { label: 'Terverifikasi', value: 'verified' },
        { label: 'Perlu Perbaikan', value: 'revision' },
      ],
    },
  ],
}
