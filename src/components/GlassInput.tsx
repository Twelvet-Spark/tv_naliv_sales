import { type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
}

export default function GlassInput({ label, hint, className = '', ...rest }: Props) {
  return (
    <label className={`glass-input-field ${className}`.trim()}>
      <span className="glass-input-label">{label}</span>
      <input className="glass-input" {...rest} />
      {hint ? <span className="glass-input-hint">{hint}</span> : null}
    </label>
  )
}
