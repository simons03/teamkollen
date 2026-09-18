interface DeltaProps {
  value: number
  previous: number
  /** T.ex. "vecka 37", visas som tooltip. */
  label: string
  className?: string
}

/** Förändring i hela skalsteg jämfört med en tidigare vecka. */
export function Delta({ value, previous, label, className = '' }: DeltaProps) {
  const diff = Math.round(value) - Math.round(previous)
  const [text, color] =
    diff > 0 ? [`▲ ${diff}`, 'text-green-600'] : diff < 0 ? [`▼ ${-diff}`, 'text-red-600'] : ['±0', 'text-slate-400']

  return (
    <span className={`text-xs font-medium tabular-nums ${color} ${className}`} title={`Jämfört med ${label} (${Math.round(previous)})`}>
      {text}
    </span>
  )
}
