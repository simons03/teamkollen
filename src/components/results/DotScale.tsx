import type { CSSProperties } from 'react'
import { scoreColor } from '../../lib/color'
import type { QuestionStats } from '../../lib/results'
import { CompareMarker, type Comparison } from './CompareMarker'
import styles from './ScoreScale.module.scss'

const DOT_SIZE = 14
const STACK_STEP = 11
/** Svar inom samma intervall (i skalsteg) staplas på varandra. */
const BIN_WIDTH = 2

/** Visar varje enskilt svar som en prick ovanför skalan. */
export function DotScale({ stats, compare }: { stats: QuestionStats; compare?: Comparison }) {
  const bins = new Map<number, number>()
  const dots = [...stats.values]
    .sort((a, b) => a - b)
    .map((value) => {
      const bin = Math.round(value / BIN_WIDTH)
      const stack = bins.get(bin) ?? 0
      bins.set(bin, stack + 1)
      return { value, stack }
    })
  const maxStack = Math.max(...bins.values())
  const height = (maxStack - 1) * STACK_STEP + DOT_SIZE

  return (
    <div className={styles.scale}>
      <div className={styles.dots} style={{ height }}>
        {dots.map(({ value, stack }, i) => (
          <span
            key={i}
            className={styles.dot}
            style={
              {
                left: `${value}%`,
                bottom: stack * STACK_STEP,
                '--dot-color': scoreColor(value),
                '--drop': `${stack * STACK_STEP}px`,
              } as CSSProperties
            }
            tabIndex={0}
            aria-label={`Svar: ${value}`}
          >
            <span className={styles.dotTip}>{value}</span>
          </span>
        ))}
      </div>
      <div className={`${styles.track} ${styles.trackThin}`}>{compare && <CompareMarker {...compare} />}</div>
      <div className={styles.avgLine} style={{ left: `${stats.avg}%` }}>
        <span className={styles.avgLabel} style={{ left: '50%' }}>
          Snitt {Math.round(stats.avg)}
        </span>
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  )
}
