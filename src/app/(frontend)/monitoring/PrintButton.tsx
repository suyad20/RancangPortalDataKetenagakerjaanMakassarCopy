'use client'

import { Icon } from '../components/Icons'

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0c2b52] shadow-sm hover:bg-slate-50 print:hidden"
    >
      <Icon name="chart" className="size-4 text-[#0d5594]" /> Cetak Laporan
    </button>
  )
}