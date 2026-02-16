import { type HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  active?: boolean
}

export default function ListRow({ active = false, className = '', ...rest }: Props) {
  const classes = ['list-row', active ? 'list-row-active' : '', className].filter(Boolean).join(' ')
  return <div className={classes} {...rest} />
}
