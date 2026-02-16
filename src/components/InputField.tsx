import { type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
}

export default function InputField({ label, hint, className = '', ...rest }: Props) {
  return (
    <label className={`input-field ${className}`}>
      <span className="input-label">{label}</span>
      <input className="input" {...rest} />
      {hint ? <span className="input-hint">{hint}</span> : null}
    </label>
  )
}
