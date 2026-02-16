import { type HTMLAttributes } from 'react'
import GlassSurface from './GlassSurface'

export default function PromoDetailsSurface({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <GlassSurface depth="B" className={`promo-details-surface ${className}`.trim()} {...rest} />
}
