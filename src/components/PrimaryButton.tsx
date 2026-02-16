import { type ButtonHTMLAttributes } from 'react'
import SystemButton from './SystemButton'

export default function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <SystemButton variant="primary" {...props} />
}
