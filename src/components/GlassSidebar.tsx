import { type HTMLAttributes } from 'react'
import GlassSurface from './GlassSurface'

export default function GlassSidebar({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <GlassSurface depth="A" className={`glass-sidebar ${className}`.trim()} {...rest} />
}
