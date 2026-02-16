import { type ButtonHTMLAttributes } from 'react'

export type SystemButtonVariant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: SystemButtonVariant
}

export default function SystemButton({ variant = 'primary', className = '', ...rest }: Props) {
  const classes = ['system-btn', `system-btn-${variant}`, className].filter(Boolean).join(' ')
  return <button className={classes} {...rest} />
}
