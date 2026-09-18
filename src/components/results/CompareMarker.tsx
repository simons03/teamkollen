import styles from './ScoreScale.module.scss'

export interface Comparison {
  avg: number
  /** T.ex. "vecka 37". */
  label: string
}

/** Jämförelseveckans snitt som en streckad ring på skalan. */
export function CompareMarker({ avg, label }: Comparison) {
  return (
    <span
      className={styles.ghostMarker}
      style={{ left: `${avg}%` }}
      title={`Snitt ${label}: ${Math.round(avg)}`}
    />
  )
}
