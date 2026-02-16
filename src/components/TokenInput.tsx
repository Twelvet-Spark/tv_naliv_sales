import { type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
}

export default function TokenInput({ label, hint, className = '', ...rest }: Props) {
  return (
    <label className={`token-input-field ${className}`.trim()}>
      <span className="token-input-label">{label}</span>
      <input className="token-input" {...rest} />
      {hint ? <span className="token-input-hint">{hint}</span> : null}
    </label>
  )
}
