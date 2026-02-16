import { type ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export default function Button({ variant = 'primary', className = '', ...rest }: Props) {
  const classes = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ')
  return <button className={classes} {...rest} />
}
