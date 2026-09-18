import type { CSSProperties } from 'react'
import { scoreColor } from '../lib/color'
import styles from './GradientSlider.module.scss'

interface GradientSliderProps {
  id: string
  value: number
  touched: boolean
  label: string
  onChange: (value: number) => void
}

export function GradientSlider({ id, value, touched, label, onChange }: GradientSliderProps) {
  return (
    <input
      id={id}
      type="range"
      min={0}
      max={100}
      step={1}
      value={value}
      aria-label={label}
      aria-valuetext={`${value} av 100`}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`${styles.slider} ${touched ? '' : styles.untouched}`}
      style={{ '--thumb-color': scoreColor(value) } as CSSProperties}
    />
  )
}
