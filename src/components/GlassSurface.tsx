import { type HTMLAttributes } from 'react'

type Depth = 'A' | 'B' | 'C'

type Props = HTMLAttributes<HTMLDivElement> & {
  depth?: Depth
}

export default function GlassSurface({ depth = 'A', className = '', ...rest }: Props) {
  const classes = ['glass-surface', `glass-depth-${depth.toLowerCase()}`, className].filter(Boolean).join(' ')
  return <div className={classes} {...rest} />
}
