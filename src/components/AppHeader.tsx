type Props = {
  title: string
  subtitle: string
}

export default function AppHeader({ title, subtitle }: Props) {
  return (
    <header className="app-header">
      <p className="eyebrow">TV API · NALIV</p>
      <h1 className="app-header-title">{title}</h1>
      <p className="app-header-subtitle">{subtitle}</p>
    </header>
  )
}
