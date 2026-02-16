import { type HTMLAttributes } from 'react'
import GlassSurface from './GlassSurface'

export default function GlassHeader({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <GlassSurface depth="A" className={`glass-header ${className}`.trim()} {...rest} />
}
