import { type HTMLAttributes } from 'react'
import GlassSurface from './GlassSurface'

export default function FloatingCard({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <GlassSurface depth="B" className={`floating-card ${className}`.trim()} {...rest} />
}
