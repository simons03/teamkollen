import type { CSSProperties } from 'react'
import { scoreColor } from '../../lib/color'
import type { QuestionStats } from '../../lib/results'
import { CompareMarker, type Comparison } from './CompareMarker'
import styles from './ScoreScale.module.scss'

/** Neutral bana där bara spannet min–max färgas, med snittet som en ring. */
export function RangeScale({ stats, compare }: { stats: QuestionStats; compare?: Comparison }) {
  const { min, max, avg } = stats
  const labelsOverlap = max - min < 14

  return (
    <div className={styles.rangeScale}>
      <div className={styles.rangeTrack}>
        <div className={styles.rangeFill} style={{ '--min': min, '--max': max } as CSSProperties} />

        {labelsOverlap ? (
          <span className={styles.edgeLabel} style={{ left: `${(min + max) / 2}%` }}>
            {min === max ? min : `${min}–${max}`}
          </span>
        ) : (
          <>
            <span className={styles.edgeLabel} style={{ left: `${min}%` }} title="Lägsta svar">
              {min}
            </span>
            <span className={styles.edgeLabel} style={{ left: `${max}%` }} title="Högsta svar">
              {max}
            </span>
          </>
        )}

        {compare && <CompareMarker {...compare} />}
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
