import { type HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  depth?: 'base' | 'elevated' | 'modal'
}

export default function GlassContainer({ depth = 'base', className = '', ...rest }: Props) {
  const classes = ['glass-container', `glass-${depth}`, className].filter(Boolean).join(' ')
  return <div className={classes} {...rest} />
}
