import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TokenScreen from '../../components/TokenScreen'
import type { TvWallConfig } from '../display/storage'
import { normalizeTvWallConfig } from '../display/storage'

type Props = {
  token: string
  wallConfig: TvWallConfig
  onSave: (value: string, wallConfig: TvWallConfig) => void
}

export default function TokenPage({ token, wallConfig, onSave }: Props) {
  const [value, setValue] = useState(token)
  const [screenCountValue, setScreenCountValue] = useState(String(wallConfig.screenCount))
  const [screenNumberValue, setScreenNumberValue] = useState(String(wallConfig.screenIndex + 1))
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const isInitialSetup = token.trim().length === 0

  useEffect(() => {
    setValue(token)
  }, [token])

  useEffect(() => {
    setScreenCountValue(String(wallConfig.screenCount))
    setScreenNumberValue(String(wallConfig.screenIndex + 1))
  }, [wallConfig])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = value.trim()
    const screenCount = Number(screenCountValue)
    const screenNumber = Number(screenNumberValue)

    if (!next) {
      setError('Введите бизнес-токен, чтобы загрузить Акции на экран.')
      return
    }

    if (!Number.isInteger(screenCount) || screenCount < 1 || screenCount > 12) {
      setError('Укажите корректное количество ТВ: от 1 до 12.')
      return
    }

    if (!Number.isInteger(screenNumber) || screenNumber < 1 || screenNumber > screenCount) {
      setError('Номер этого ТВ должен быть не меньше 1 и не больше количества экранов.')
      return
    }

    const nextWallConfig = normalizeTvWallConfig({
      screenCount,
      screenIndex: screenNumber - 1,
    })

    setError(null)
    onSave(next, nextWallConfig)
    navigate('/')
  }

  return (
    <Layout hideHeader>
      <TokenScreen
        isInitialSetup={isInitialSetup}
        value={value}
        onChange={setValue}
        screenCountValue={screenCountValue}
        onScreenCountChange={setScreenCountValue}
        screenNumberValue={screenNumberValue}
        onScreenNumberChange={setScreenNumberValue}
        onSubmit={handleSubmit}
        validationMessage={error}
      />
    </Layout>
  )
}
