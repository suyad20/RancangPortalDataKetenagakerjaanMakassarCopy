import { Suspense } from 'react'
import { FormWizard } from './FormWizard'

export default function FormPage() {
  return (
    <main className="form-page-grid min-h-[calc(100vh-76px)] px-5 py-12">
      <div className="mx-auto mb-9 max-w-[1040px]">
        <p className="eyebrow">Formulir terpadu SKSU</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0c2b52]">Pelaporan data ketenagakerjaan</h1>
        <p className="mt-2 text-sm text-slate-500">Satu alur yang menyesuaikan kebutuhan perusahaan, sekolah, universitas, dan lembaga.</p>
      </div>
      <Suspense fallback={<div className="mx-auto max-w-[1040px] rounded-3xl bg-white p-10 text-center text-slate-500">Memuat formulir…</div>}>
        <FormWizard />
      </Suspense>
    </main>
  )
}
