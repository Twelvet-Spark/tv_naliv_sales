import { type HTMLAttributes } from 'react'
import GlassSurface from './GlassSurface'

export default function StatusSurface({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <GlassSurface depth="C" className={`status-surface ${className}`.trim()} {...rest} />
}
