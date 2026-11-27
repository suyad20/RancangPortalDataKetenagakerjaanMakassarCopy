import type { Access, CollectionConfig } from 'payload'

const isSuperAdmin: Access = ({ req }) =>
  req.user?.collection === 'admins' && req.user?.role === 'super-admin'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const Admins: CollectionConfig = {
  slug: 'admins',
  labels: {
    singular: 'Admin Disnaker',
    plural: 'Admin Disnaker',
  },
  access: {
    // Mengizinkan pembuatan akun pertama kali jika belum ada admin, atau oleh Super Admin
    create: async ({ req }) => {
      if (req.user?.collection === 'admins' && req.user?.role === 'super-admin') return true
      const existing = await req.payload.count({
        collection: 'admins',
        overrideAccess: true,
      })
      return existing.totalDocs === 0
    },
    delete: isSuperAdmin,
    read: isPayloadAdmin,
    update: isSuperAdmin,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
  },
  auth: true,
  fields: [
    {
      name: 'name',
      label: 'Nama Lengkap Petugas',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      label: 'Tingkat Hak Akses',
      type: 'select',
      required: true,
      defaultValue: 'super-admin',
      options: [
        { label: 'Super Admin (Kelola Master Perusahaan & Akun)', value: 'super-admin' },
        { label: 'Admin Bidang Penta (Verifikasi & Cetak Laporan)', value: 'admin' },
      ],
    },
  ],
  versions: false,
}