import type { CSSProperties } from 'react'
import { scoreColor } from '../../lib/color'
import styles from './ScoreScale.module.scss'

export interface TrendPoint {
  /** Kort etikett, t.ex. "v37". */
  label: string
  /** Snitt för veckan, eller null om ingen svarade. */
  avg: number | null
}

/** Snittet vecka för vecka, äldst till vänster. Skalan går från 0 (nederst) till 100. */
export function TrendScale({ points }: { points: TrendPoint[] }) {
  const x = (i: number) => (points.length === 1 ? 50 : (i / (points.length - 1)) * 100)
  const present = points.flatMap((p, i) => (p.avg === null ? [] : [{ ...p, avg: p.avg, x: x(i) }]))

  return (
    <div className={styles.trendScale}>
      <div className={styles.trendPlot}>
        <svg className={styles.trendLine} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" x2="100" y1="50" y2="50" className={styles.trendMid} vectorEffect="non-scaling-stroke" />
          <polyline
            points={present.map((p) => `${p.x},${100 - p.avg}`).join(' ')}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {present.map((p, i) => (
          <span
            key={p.label}
            className={`${styles.dot} ${styles.trendDot} ${i === present.length - 1 ? styles.trendDotLast : ''}`}
            style={{ left: `${p.x}%`, bottom: `${p.avg}%`, '--dot-color': scoreColor(p.avg) } as CSSProperties}
            tabIndex={0}
            aria-label={`${p.label}: ${Math.round(p.avg)}`}
          >
            <span className={styles.dotTip}>
              {p.label}: {Math.round(p.avg)}
            </span>
          </span>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-slate-400">
        <span>{points[0]?.label}</span>
        <span>{points.at(-1)?.label}</span>
      </div>
    </div>
  )
}
