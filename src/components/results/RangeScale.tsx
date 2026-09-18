import type { CSSProperties } from 'react'
import { scoreColor } from '../../lib/color'
import type { QuestionStats } from '../../lib/results'
import styles from './ScoreScale.module.scss'

/** Visar spannet min–max på en bred skala, med snittet markerat. */
export function RangeScale({ stats }: { stats: QuestionStats }) {
  const { min, max, avg } = stats
  const labelsOverlap = max - min < 14

  return (
    <div className={styles.scale}>
      <div className={styles.track}>
        <div className={`${styles.dim} ${styles.left}`} style={{ width: `${min}%` }} />
        <div className={`${styles.dim} ${styles.right}`} style={{ width: `${100 - max}%` }} />
        <div className={styles.range} style={{ left: `${min}%`, width: `${max - min}%` }} />

        {labelsOverlap ? (
          <span className={styles.edgeLabel} style={{ left: `${(min + max) / 2}%` }}>
            {min === max ? `Alla: ${min}` : `Lägst ${min} · Högst ${max}`}
          </span>
        ) : (
          <>
            <span className={styles.edgeLabel} style={{ left: `${min}%` }}>
              Lägst {min}
            </span>
            <span className={styles.edgeLabel} style={{ left: `${max}%` }}>
              Högst {max}
            </span>
          </>
        )}

        <div
          className={styles.avgMarker}
          style={{ left: `${avg}%`, '--marker-color': scoreColor(avg) } as CSSProperties}
          title={`Snitt ${avg.toFixed(1)}`}
        />
        <span className={styles.avgLabel} style={{ left: `${avg}%` }}>
          Snitt {Math.round(avg)}
        </span>
      </div>
    </div>
  )
}
