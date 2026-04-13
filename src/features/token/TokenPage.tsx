import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TokenScreen from '../../components/TokenScreen'
import type { PanelColorMode, ReducedMotionMode, TvWallConfig } from '../display/storage'
import {
  MAX_SAFE_AREA_PX,
  MAX_UI_SCALE_PERCENT,
  MIN_SAFE_AREA_PX,
  MIN_UI_SCALE_PERCENT,
  PANEL_COLOR_MODES,
  REDUCED_MOTION_MODES,
  normalizeTvWallConfig,
} from '../display/storage'

type Props = {
  token: string
  wallConfig: TvWallConfig
  onSave: (value: string, wallConfig: TvWallConfig) => void
  onPreviewPanelColorModeChange?: (value: PanelColorMode | null) => void
}

export default function TokenPage({ token, wallConfig, onSave, onPreviewPanelColorModeChange }: Props) {
  const [value, setValue] = useState(token)
  const [screenCountValue, setScreenCountValue] = useState(String(wallConfig.screenCount))
  const [screenNumberValue, setScreenNumberValue] = useState(String(wallConfig.screenIndex + 1))
  const [uiScaleValue, setUiScaleValue] = useState(String(wallConfig.uiScalePercent))
  const [safeAreaValue, setSafeAreaValue] = useState(String(wallConfig.safeAreaPx))
  const [panelColorModeValue, setPanelColorModeValue] = useState(wallConfig.panelColorMode)
  const [reducedMotionModeValue, setReducedMotionModeValue] = useState<ReducedMotionMode>(wallConfig.reducedMotionMode)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const isInitialSetup = token.trim().length === 0

  useEffect(() => {
    setValue(token)
  }, [token])

  useEffect(() => {
    setScreenCountValue(String(wallConfig.screenCount))
    setScreenNumberValue(String(wallConfig.screenIndex + 1))
    setUiScaleValue(String(wallConfig.uiScalePercent))
    setSafeAreaValue(String(wallConfig.safeAreaPx))
    setPanelColorModeValue(wallConfig.panelColorMode)
    setReducedMotionModeValue(wallConfig.reducedMotionMode)
  }, [wallConfig])

  useEffect(() => {
    onPreviewPanelColorModeChange?.(panelColorModeValue)

    return () => onPreviewPanelColorModeChange?.(null)
  }, [onPreviewPanelColorModeChange, panelColorModeValue])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = value.trim()
    const screenCount = Number(screenCountValue)
    const screenNumber = Number(screenNumberValue)
    const uiScalePercent = Number(uiScaleValue)
    const safeAreaPx = Number(safeAreaValue)
    const panelColorMode = panelColorModeValue
    const reducedMotionMode = reducedMotionModeValue

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

    if (!Number.isInteger(uiScalePercent) || uiScalePercent < MIN_UI_SCALE_PERCENT || uiScalePercent > MAX_UI_SCALE_PERCENT) {
      setError(`Масштаб интерфейса должен быть от ${MIN_UI_SCALE_PERCENT}% до ${MAX_UI_SCALE_PERCENT}%.`)
      return
    }

    if (!Number.isInteger(safeAreaPx) || safeAreaPx < MIN_SAFE_AREA_PX || safeAreaPx > MAX_SAFE_AREA_PX) {
      setError(`Безопасная рамка должна быть от ${MIN_SAFE_AREA_PX} до ${MAX_SAFE_AREA_PX} px.`)
      return
    }

    if (!PANEL_COLOR_MODES.includes(panelColorMode)) {
      setError('Выберите корректный режим контраста.')
      return
    }

    if (!REDUCED_MOTION_MODES.includes(reducedMotionMode)) {
      setError('Выберите корректный режим сниженной анимации.')
      return
    }

    const nextWallConfig = normalizeTvWallConfig({
      screenCount,
      screenIndex: screenNumber - 1,
      uiScalePercent,
      safeAreaPx,
      panelColorMode,
      reducedMotionMode,
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
        uiScaleValue={uiScaleValue}
        onUiScaleChange={setUiScaleValue}
        safeAreaValue={safeAreaValue}
        onSafeAreaChange={setSafeAreaValue}
        panelColorModeValue={panelColorModeValue}
        onPanelColorModeChange={setPanelColorModeValue}
        reducedMotionModeValue={reducedMotionModeValue}
        onReducedMotionModeChange={setReducedMotionModeValue}
        onSubmit={handleSubmit}
        validationMessage={error}
      />
    </Layout>
  )
}
