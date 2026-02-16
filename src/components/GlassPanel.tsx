import { type HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  tone?: 'base' | 'strong'
}

export default function GlassPanel({ tone = 'base', className = '', ...rest }: Props) {
  const classes = ['glass-panel', tone === 'strong' ? 'glass-strong' : '', className]
    .filter(Boolean)
    .join(' ')

  return <div className={classes} {...rest} />
}
