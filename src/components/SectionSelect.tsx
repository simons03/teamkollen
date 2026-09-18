import { SECTIONS } from '../config/sections'

interface SectionSelectProps {
  value: string
  onChange: (value: string) => void
}

export function SectionSelect({ value, onChange }: SectionSelectProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <label htmlFor="section" className="font-medium text-slate-700">
        Välj din sektion
      </label>
      <select
        id="section"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-64"
      >
        <option value="" disabled>
          – Välj sektion –
        </option>
        {SECTIONS.map((section) => (
          <option key={section.id} value={section.id} disabled={section.disabled}>
            {section.name}
          </option>
        ))}
      </select>
    </div>
  )
}
