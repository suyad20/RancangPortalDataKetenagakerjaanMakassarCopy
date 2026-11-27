import type { Access, CollectionConfig, FieldAccess } from 'payload'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const isSuperAdminField: FieldAccess = ({ req }) =>
  req.user?.collection === 'admins' && req.user?.role === 'super-admin'
const isAdminField: FieldAccess = ({ req }) => req.user?.collection === 'admins'

const nonNegative = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === 'number' && value >= 0) ||
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
    defaultColumns: [
      'organizationName',
      'officialId',
      'reportType',
      'periodMonth',
      'periodYear',
      'status',
    ],
  },
  fields: [
    {
      name: 'organizationType',
      label: 'Jenis Lembaga',
      type: 'select',
      required: true,
      options: [
        { label: 'Perusahaan', value: 'company' },
        { label: 'UMKM / Koperasi', value: 'umkm' },
        { label: 'Universitas / Perguruan Tinggi', value: 'university' },
        { label: 'SMK / Sekolah', value: 'school' },
        { label: 'Organisasi Disabilitas (OpDis)', value: 'disability-organization' },
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
        { label: 'Laporan Lowongan Kerja (WLLKP)', value: 'vacancies' },
        { label: 'Realisasi Penempatan Tenaga Kerja', value: 'placement' },
        { label: 'Tenaga Kerja Asing (TKA)', value: 'foreign-workers' },
        { label: 'Penempatan Disabilitas (AKSUS)', value: 'disability' },
        { label: 'Data Fresh Graduate / BKK', value: 'bkk' },
        { label: 'Permohonan Perubahan Profil Perusahaan', value: 'profile-change' },
      ],
    },
    {
      name: 'officialId',
      label: 'NIB / Nomor Identitas Resmi',
      type: 'text',
      required: true,
      maxLength: 30,
      index: true,
      access: { update: isSuperAdminField },
    },
    {
      name: 'organizationName',
      label: 'Nama Lembaga / Perusahaan',
      type: 'text',
      required: true,
      maxLength: 150,
      index: true,
      access: { update: isSuperAdminField },
    },
    {
      name: 'sector',
      label: 'Sektor / Bidang Usaha',
      type: 'text',
      required: true,
      maxLength: 100,
      access: { update: isSuperAdminField },
    },
    {
      name: 'address',
      label: 'Alamat Operasional di Kota Makassar',
      type: 'textarea',
      required: true,
      maxLength: 500,
      access: { update: isSuperAdminField },
    },
    {
      name: 'district',
      label: 'Kecamatan',
      type: 'text',
      required: true,
      maxLength: 80,
      access: { update: isSuperAdminField },
    },
    {
      name: 'subDistrict',
      label: 'Kelurahan',
      type: 'text',
      required: true,
      maxLength: 80,
      access: { update: isSuperAdminField },
    },
    { name: 'email', label: 'Email Resmi / HRD', type: 'email', required: true },
    { name: 'phone', label: 'Nomor Telepon / WA', type: 'text', required: true, maxLength: 24 },
    {
      name: 'periodMonth',
      label: 'Bulan Pelaporan',
      type: 'select',
      required: true,
      defaultValue: '01',
      index: true,
      options: [
        { label: 'Januari', value: '01' },
        { label: 'Februari', value: '02' },
        { label: 'Maret', value: '03' },
        { label: 'April', value: '04' },
        { label: 'Mei', value: '05' },
        { label: 'Juni', value: '06' },
        { label: 'Juli', value: '07' },
        { label: 'Agustus', value: '08' },
        { label: 'September', value: '09' },
        { label: 'Oktober', value: '10' },
        { label: 'November', value: '11' },
        { label: 'Desember', value: '12' },
      ],
    },
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
      label: 'Rekapitulasi Tenaga Kerja & WLKP',
      fields: [
        { name: 'localWorkers', label: 'Total Pekerja Lokal', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'foreignWorkers', label: 'Total Tenaga Kerja Asing (TKA)', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'disabledWorkers', label: 'Total Pekerja Disabilitas', type: 'number', defaultValue: 0, validate: nonNegative },
      ],
    },
    {
      type: 'collapsible',
      label: 'Data Lowongan Kerja (Multi-Posisi)',
      fields: [
        {
          name: 'vacancyItems',
          label: 'Daftar Posisi Lowongan Dibuka',
          type: 'array',
          fields: [
            { name: 'positionTitle', label: 'Nama Jabatan / Posisi', type: 'text', required: true },
            { name: 'vacancyCount', label: 'Jumlah Lowongan Dibuka', type: 'number', defaultValue: 1, validate: nonNegative },
            { name: 'maleCount', label: 'Kuota Laki-laki', type: 'number', defaultValue: 0, validate: nonNegative },
            { name: 'femaleCount', label: 'Kuota Perempuan', type: 'number', defaultValue: 0, validate: nonNegative },
            {
              name: 'educationLevel',
              label: 'Kualifikasi Pendidikan',
              type: 'select',
              defaultValue: 'SMA/SMK',
              options: [
                { label: 'SD / SMP', value: 'SD/SMP' },
                { label: 'SMA / SMK Sederajat', value: 'SMA/SMK' },
                { label: 'Diploma (D1 - D3)', value: 'D3' },
                { label: 'Sarjana (S1 / D4)', value: 'S1' },
                { label: 'Pascasarjana (S2 / S3)', value: 'S2' },
                { label: 'Semua Jenjang', value: 'Semua Jenjang' },
              ],
            },
            {
              name: 'disabilityInclusive',
              label: 'Terbuka untuk Penyandang Disabilitas (Inklusi)',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        { name: 'vacancyCount', label: 'Total Akumulasi Lowongan', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'vacancyRequirements', label: 'Persyaratan Ringkas / Uraian Umum', type: 'textarea', maxLength: 1000 },
      ],
    },
    {
      type: 'collapsible',
      label: 'Data Realisasi Penempatan Tenaga Kerja',
      fields: [
        {
          name: 'placementType',
          label: 'Jalur / Kategori Penempatan',
          type: 'select',
          defaultValue: 'AKL',
          options: [
            { label: 'AKL (Antar Kerja Lokal - Wilayah Makassar)', value: 'AKL' },
            { label: 'AKAD (Antar Kerja Antar Daerah)', value: 'AKAD' },
            { label: 'AKAN (Antar Kerja Antar Negara / PMI)', value: 'AKAN' },
            { label: 'AKSUS (Penempatan Khusus / Disabilitas)', value: 'AKSUS' },
          ],
        },
        { name: 'placementCount', label: 'Total Diterima / Ditempatkan', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'malePlaced', label: 'Diterima Laki-laki', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'femalePlaced', label: 'Diterima Perempuan', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'disabilityPlaced', label: 'Diterima Penyandang Disabilitas', type: 'number', defaultValue: 0, validate: nonNegative },
        {
          name: 'placementEducation',
          label: 'Mayoritas Pendidikan Diterima',
          type: 'select',
          defaultValue: 'SMA/SMK',
          options: [
            { label: 'SD / SMP', value: 'SD/SMP' },
            { label: 'SMA / SMK Sederajat', value: 'SMA/SMK' },
            { label: 'Diploma (D1 - D3)', value: 'D3' },
            { label: 'Sarjana (S1 / D4)', value: 'S1' },
            { label: 'Pascasarjana (S2 / S3)', value: 'S2' },
          ],
        },
        { name: 'placementLocation', label: 'Lokasi Penempatan (Kecamatan / Kota / Negara)', type: 'text', maxLength: 150 },
      ],
    },
    {
      type: 'collapsible',
      label: 'Data Lulusan / BKK',
      fields: [
        { name: 'studyProgram', label: 'Program Studi / Jurusan', type: 'text', maxLength: 150 },
        { name: 'graduateCount', label: 'Fresh Graduate', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'jobReadyCount', label: 'Siap Kerja', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'employedGraduateCount', label: 'Sudah Bekerja', type: 'number', defaultValue: 0, validate: nonNegative },
        { name: 'bkkPartner', label: 'Terdaftar sebagai Mitra BKK', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'notes',
      label: 'Catatan Tambahan / Detail Permohonan Perubahan',
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