import { type ReactNode } from 'react'
import GlassHeader from './GlassHeader'

type Props = {
  eyebrow?: string
  title?: string
  description?: string
  actions?: ReactNode
  meta?: ReactNode
  hideHeader?: boolean
  children: ReactNode
}

export default function Layout({ eyebrow, title, description, actions, meta, hideHeader = false, children }: Props) {
  return (
    <div className="layout">
      {!hideHeader && (
        <GlassHeader className="layout-header">
          <div className="layout-heading">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            {title ? <h1>{title}</h1> : null}
            {description ? <p className="lede">{description}</p> : null}
          </div>
          {(actions || meta) && (
            <div className="layout-right">
              {actions ? <div className="layout-actions">{actions}</div> : null}
              {meta ? <div className="layout-meta">{meta}</div> : null}
            </div>
          )}
        </GlassHeader>
      )}

      <div className="layout-body">{children}</div>
    </div>
  )
}
