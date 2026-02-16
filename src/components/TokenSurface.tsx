import { type HTMLAttributes } from 'react'
import GlassSurface from './GlassSurface'

export default function TokenSurface({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <GlassSurface depth="C" className={`token-surface ${className}`.trim()} {...rest} />
}
