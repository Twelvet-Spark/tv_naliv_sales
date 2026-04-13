import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TokenScreen from '../../components/TokenScreen'

type Props = {
  token: string
  onSave: (value: string) => void
}

export default function TokenPage({ token, onSave }: Props) {
  const [value, setValue] = useState(token)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setValue(token)
  }, [token])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = value.trim()

    if (!next) {
      setError('Введите бизнес-токен, чтобы загрузить Акции на экран.')
      return
    }

    setError(null)
    onSave(next)
    navigate('/')
  }

  return (
    <Layout hideHeader>
      <TokenScreen value={value} onChange={setValue} onSubmit={handleSubmit} validationMessage={error} />
    </Layout>
  )
}
