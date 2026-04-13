export type KzThemeMode = 'day' | 'night'

export type KzDayPeriod = 'night' | 'dawn' | 'morning' | 'day' | 'evening'

export type DebugMessageMode = 'auto' | 'general' | KzDayPeriod
export type PanelColorMode = 'high' | 'low'

export type KzThemePalette = {
  bgBase: string
  bgTop: string
  bgBottom: string
  accent: string
  accentSoft: string
  surface: string
  surfaceStrong: string
  line: string
  textStrong: string
  textMain: string
  textSoft: string
  textMuted: string
  ambientPrimary: string
  ambientSecondary: string
}

export const KZ_TIME_ZONE = 'Asia/Almaty'
export const DAY_THEME_START_HOUR = 7
export const NIGHT_THEME_START_HOUR = 20

export const DEBUG_TIME_PRESETS = [
  { label: 'Авто', hour: null },
  { label: 'Рассвет', hour: 6 },
  { label: 'Утро', hour: 8 },
  { label: 'День', hour: 13 },
  { label: 'Вечер', hour: 19 },
  { label: 'Ночь', hour: 23 },
] as const

type PaletteStop = {
  hour: number
  mode: KzThemeMode
  palette: KzThemePalette
}

const HIGH_CONTRAST_PALETTE_STOPS: PaletteStop[] = [
  {
    hour: 0,
    mode: 'night',
    palette: {
      bgBase: '#090d12',
      bgTop: '#141b25',
      bgBottom: '#05070a',
      accent: '#ff9f4a',
      accentSoft: 'rgba(255, 159, 74, 0.14)',
      surface: 'rgba(255, 255, 255, 0.05)',
      surfaceStrong: 'rgba(255, 255, 255, 0.09)',
      line: 'rgba(255, 255, 255, 0.2)',
      textStrong: '#fffaf5',
      textMain: 'rgba(255, 250, 245, 0.99)',
      textSoft: 'rgba(255, 250, 245, 0.88)',
      textMuted: 'rgba(255, 250, 245, 0.72)',
      ambientPrimary: 'rgba(255, 169, 82, 0.03)',
      ambientSecondary: 'rgba(95, 118, 150, 0.02)',
    },
  },
  {
    hour: 5,
    mode: 'night',
    palette: {
      bgBase: '#11151c',
      bgTop: '#263140',
      bgBottom: '#090c11',
      accent: '#ffb661',
      accentSoft: 'rgba(255, 182, 97, 0.14)',
      surface: 'rgba(255, 255, 255, 0.052)',
      surfaceStrong: 'rgba(255, 255, 255, 0.092)',
      line: 'rgba(255, 255, 255, 0.2)',
      textStrong: '#fffaf5',
      textMain: 'rgba(255, 250, 245, 0.99)',
      textSoft: 'rgba(255, 250, 245, 0.89)',
      textMuted: 'rgba(255, 250, 245, 0.73)',
      ambientPrimary: 'rgba(255, 182, 97, 0.032)',
      ambientSecondary: 'rgba(114, 136, 166, 0.022)',
    },
  },
  {
    hour: 7,
    mode: 'day',
    palette: {
      bgBase: '#131a22',
      bgTop: '#31465c',
      bgBottom: '#0a1016',
      accent: '#ffbd67',
      accentSoft: 'rgba(255, 189, 103, 0.14)',
      surface: 'rgba(255, 255, 255, 0.054)',
      surfaceStrong: 'rgba(255, 255, 255, 0.096)',
      line: 'rgba(255, 255, 255, 0.205)',
      textStrong: '#fffbf6',
      textMain: 'rgba(255, 251, 246, 0.99)',
      textSoft: 'rgba(255, 251, 246, 0.89)',
      textMuted: 'rgba(255, 251, 246, 0.74)',
      ambientPrimary: 'rgba(255, 189, 103, 0.03)',
      ambientSecondary: 'rgba(112, 148, 186, 0.024)',
    },
  },
  {
    hour: 10,
    mode: 'day',
    palette: {
      bgBase: '#15202a',
      bgTop: '#3b556d',
      bgBottom: '#0b1218',
      accent: '#ffb45c',
      accentSoft: 'rgba(255, 180, 92, 0.14)',
      surface: 'rgba(255, 255, 255, 0.056)',
      surfaceStrong: 'rgba(255, 255, 255, 0.1)',
      line: 'rgba(255, 255, 255, 0.21)',
      textStrong: '#fffaf5',
      textMain: 'rgba(255, 250, 245, 0.99)',
      textSoft: 'rgba(255, 250, 245, 0.89)',
      textMuted: 'rgba(255, 250, 245, 0.74)',
      ambientPrimary: 'rgba(255, 180, 92, 0.03)',
      ambientSecondary: 'rgba(108, 144, 178, 0.024)',
    },
  },
  {
    hour: 14,
    mode: 'day',
    palette: {
      bgBase: '#161d26',
      bgTop: '#43566b',
      bgBottom: '#0b1016',
      accent: '#ffae54',
      accentSoft: 'rgba(255, 174, 84, 0.14)',
      surface: 'rgba(255, 255, 255, 0.056)',
      surfaceStrong: 'rgba(255, 255, 255, 0.1)',
      line: 'rgba(255, 255, 255, 0.21)',
      textStrong: '#fff9f3',
      textMain: 'rgba(255, 249, 243, 0.99)',
      textSoft: 'rgba(255, 249, 243, 0.885)',
      textMuted: 'rgba(255, 249, 243, 0.73)',
      ambientPrimary: 'rgba(255, 174, 84, 0.03)',
      ambientSecondary: 'rgba(96, 130, 164, 0.022)',
    },
  },
  {
    hour: 18,
    mode: 'day',
    palette: {
      bgBase: '#18151b',
      bgTop: '#523830',
      bgBottom: '#0b0b10',
      accent: '#ffa760',
      accentSoft: 'rgba(255, 167, 96, 0.14)',
      surface: 'rgba(255, 255, 255, 0.055)',
      surfaceStrong: 'rgba(255, 255, 255, 0.098)',
      line: 'rgba(255, 255, 255, 0.205)',
      textStrong: '#fff8f2',
      textMain: 'rgba(255, 248, 242, 0.99)',
      textSoft: 'rgba(255, 248, 242, 0.885)',
      textMuted: 'rgba(255, 248, 242, 0.72)',
      ambientPrimary: 'rgba(255, 167, 96, 0.032)',
      ambientSecondary: 'rgba(136, 92, 124, 0.022)',
    },
  },
  {
    hour: 21,
    mode: 'night',
    palette: {
      bgBase: '#0d1016',
      bgTop: '#1e2431',
      bgBottom: '#06080c',
      accent: '#ff9f4d',
      accentSoft: 'rgba(255, 159, 77, 0.14)',
      surface: 'rgba(255, 255, 255, 0.052)',
      surfaceStrong: 'rgba(255, 255, 255, 0.094)',
      line: 'rgba(255, 255, 255, 0.2)',
      textStrong: '#fffaf5',
      textMain: 'rgba(255, 250, 245, 0.99)',
      textSoft: 'rgba(255, 250, 245, 0.88)',
      textMuted: 'rgba(255, 250, 245, 0.72)',
      ambientPrimary: 'rgba(255, 159, 77, 0.03)',
      ambientSecondary: 'rgba(98, 118, 156, 0.02)',
    },
  },
  {
    hour: 24,
    mode: 'night',
    palette: {
      bgBase: '#090d12',
      bgTop: '#141b25',
      bgBottom: '#05070a',
      accent: '#ff9f4a',
      accentSoft: 'rgba(255, 159, 74, 0.14)',
      surface: 'rgba(255, 255, 255, 0.05)',
      surfaceStrong: 'rgba(255, 255, 255, 0.09)',
      line: 'rgba(255, 255, 255, 0.2)',
      textStrong: '#fffaf5',
      textMain: 'rgba(255, 250, 245, 0.99)',
      textSoft: 'rgba(255, 250, 245, 0.88)',
      textMuted: 'rgba(255, 250, 245, 0.72)',
      ambientPrimary: 'rgba(255, 169, 82, 0.03)',
      ambientSecondary: 'rgba(95, 118, 150, 0.02)',
    },
  },
] 

const PALETTE_STOPS: PaletteStop[] = [
  {
    hour: 0,
    mode: 'night',
    palette: {
      bgBase: '#0b0e14',
      bgTop: '#151923',
      bgBottom: '#08090d',
      accent: '#ff7c30',
      accentSoft: 'rgba(255, 124, 48, 0.18)',
      surface: 'rgba(255, 255, 255, 0.06)',
      surfaceStrong: 'rgba(255, 255, 255, 0.1)',
      line: 'rgba(255, 255, 255, 0.12)',
      textStrong: '#f5efe7',
      textMain: 'rgba(245, 239, 231, 0.88)',
      textSoft: 'rgba(245, 239, 231, 0.64)',
      textMuted: 'rgba(245, 239, 231, 0.36)',
      ambientPrimary: 'rgba(255, 124, 48, 0.24)',
      ambientSecondary: 'rgba(82, 122, 166, 0.18)',
    },
  },
  {
    hour: 5,
    mode: 'night',
    palette: {
      bgBase: '#c8c7c4',
      bgTop: '#ebe7de',
      bgBottom: '#a5a29d',
      accent: '#d96a18',
      accentSoft: 'rgba(255, 140, 70, 0.18)',
      surface: 'rgba(255, 255, 255, 0.3)',
      surfaceStrong: 'rgba(255, 255, 255, 0.42)',
      line: 'rgba(48, 42, 35, 0.16)',
      textStrong: '#1f1b18',
      textMain: 'rgba(31, 27, 24, 0.9)',
      textSoft: 'rgba(31, 27, 24, 0.68)',
      textMuted: 'rgba(31, 27, 24, 0.44)',
      ambientPrimary: 'rgba(217, 106, 24, 0.22)',
      ambientSecondary: 'rgba(255, 255, 255, 0.18)',
    },
  },
  {
    hour: 7,
    mode: 'day',
    palette: {
      bgBase: '#e4dfd6',
      bgTop: '#f7ecdc',
      bgBottom: '#c0b7aa',
      accent: '#e46e16',
      accentSoft: 'rgba(255, 122, 32, 0.18)',
      surface: 'rgba(255, 255, 255, 0.28)',
      surfaceStrong: 'rgba(255, 255, 255, 0.4)',
      line: 'rgba(64, 44, 27, 0.14)',
      textStrong: '#231a14',
      textMain: 'rgba(35, 26, 20, 0.9)',
      textSoft: 'rgba(35, 26, 20, 0.68)',
      textMuted: 'rgba(35, 26, 20, 0.42)',
      ambientPrimary: 'rgba(255, 122, 32, 0.24)',
      ambientSecondary: 'rgba(255, 245, 220, 0.22)',
    },
  },
  {
    hour: 10,
    mode: 'day',
    palette: {
      bgBase: '#f3ede4',
      bgTop: '#fff6ea',
      bgBottom: '#ead8c3',
      accent: '#ef6700',
      accentSoft: 'rgba(239, 103, 0, 0.16)',
      surface: 'rgba(255, 255, 255, 0.34)',
      surfaceStrong: 'rgba(255, 255, 255, 0.48)',
      line: 'rgba(60, 41, 27, 0.12)',
      textStrong: '#221912',
      textMain: 'rgba(34, 25, 18, 0.88)',
      textSoft: 'rgba(34, 25, 18, 0.64)',
      textMuted: 'rgba(34, 25, 18, 0.38)',
      ambientPrimary: 'rgba(239, 103, 0, 0.24)',
      ambientSecondary: 'rgba(255, 255, 255, 0.28)',
    },
  },
  {
    hour: 14,
    mode: 'day',
    palette: {
      bgBase: '#f2e1cb',
      bgTop: '#fff3dd',
      bgBottom: '#e1c19b',
      accent: '#e86100',
      accentSoft: 'rgba(232, 97, 0, 0.16)',
      surface: 'rgba(255, 250, 242, 0.34)',
      surfaceStrong: 'rgba(255, 250, 242, 0.46)',
      line: 'rgba(76, 48, 23, 0.12)',
      textStrong: '#23170f',
      textMain: 'rgba(35, 23, 15, 0.88)',
      textSoft: 'rgba(35, 23, 15, 0.64)',
      textMuted: 'rgba(35, 23, 15, 0.36)',
      ambientPrimary: 'rgba(232, 97, 0, 0.22)',
      ambientSecondary: 'rgba(255, 235, 199, 0.24)',
    },
  },
  {
    hour: 18,
    mode: 'day',
    palette: {
      bgBase: '#7a5646',
      bgTop: '#c98853',
      bgBottom: '#42313a',
      accent: '#ff8838',
      accentSoft: 'rgba(255, 136, 56, 0.18)',
      surface: 'rgba(255, 244, 230, 0.14)',
      surfaceStrong: 'rgba(255, 244, 230, 0.24)',
      line: 'rgba(255, 237, 220, 0.14)',
      textStrong: '#fff4e9',
      textMain: 'rgba(255, 244, 233, 0.9)',
      textSoft: 'rgba(255, 244, 233, 0.68)',
      textMuted: 'rgba(255, 244, 233, 0.4)',
      ambientPrimary: 'rgba(255, 136, 56, 0.26)',
      ambientSecondary: 'rgba(114, 70, 92, 0.24)',
    },
  },
  {
    hour: 21,
    mode: 'night',
    palette: {
      bgBase: '#171722',
      bgTop: '#2b2740',
      bgBottom: '#0d0d14',
      accent: '#ff8d42',
      accentSoft: 'rgba(255, 141, 66, 0.18)',
      surface: 'rgba(255, 255, 255, 0.08)',
      surfaceStrong: 'rgba(255, 255, 255, 0.14)',
      line: 'rgba(255, 255, 255, 0.12)',
      textStrong: '#fff4e8',
      textMain: 'rgba(255, 244, 232, 0.88)',
      textSoft: 'rgba(255, 244, 232, 0.64)',
      textMuted: 'rgba(255, 244, 232, 0.38)',
      ambientPrimary: 'rgba(255, 141, 66, 0.26)',
      ambientSecondary: 'rgba(95, 118, 185, 0.16)',
    },
  },
  {
    hour: 24,
    mode: 'night',
    palette: {
      bgBase: '#0b0e14',
      bgTop: '#151923',
      bgBottom: '#08090d',
      accent: '#ff7c30',
      accentSoft: 'rgba(255, 124, 48, 0.18)',
      surface: 'rgba(255, 255, 255, 0.06)',
      surfaceStrong: 'rgba(255, 255, 255, 0.1)',
      line: 'rgba(255, 255, 255, 0.12)',
      textStrong: '#f5efe7',
      textMain: 'rgba(245, 239, 231, 0.88)',
      textSoft: 'rgba(245, 239, 231, 0.64)',
      textMuted: 'rgba(245, 239, 231, 0.36)',
      ambientPrimary: 'rgba(255, 124, 48, 0.24)',
      ambientSecondary: 'rgba(82, 122, 166, 0.18)',
    },
  },
]

function clampHour(hour: number) {
  if (!Number.isFinite(hour)) return 0
  if (hour < 0) return 0
  if (hour > 24) return 24
  return hour
}

function parseColor(value: string) {
  const normalized = value.trim()

  if (normalized.startsWith('#')) {
    const hex = normalized.slice(1)
    if (hex.length === 6) {
      return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
        a: 1,
      }
    }

    if (hex.length === 8) {
      return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
        a: Number.parseInt(hex.slice(6, 8), 16) / 255,
      }
    }
  }

  const match = normalized.match(/rgba?\(([^)]+)\)/i)
  if (!match) {
    return { r: 0, g: 0, b: 0, a: 1 }
  }

  const parts = match[1].split(',').map((part) => part.trim())
  const [r = '0', g = '0', b = '0', a = '1'] = parts

  return {
    r: Number(r),
    g: Number(g),
    b: Number(b),
    a: Number(a),
  }
}

function mixChannel(from: number, to: number, ratio: number) {
  return from + (to - from) * ratio
}

function mixColor(from: string, to: string, ratio: number) {
  const start = parseColor(from)
  const end = parseColor(to)
  const red = Math.round(mixChannel(start.r, end.r, ratio))
  const green = Math.round(mixChannel(start.g, end.g, ratio))
  const blue = Math.round(mixChannel(start.b, end.b, ratio))
  const alpha = Number(mixChannel(start.a, end.a, ratio).toFixed(3))
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function createLowContrastPalette(base: KzThemePalette): KzThemePalette {
  return {
    bgBase: mixColor('#141922', base.bgBase, 0.08),
    bgTop: mixColor('#202a37', base.bgTop, 0.11),
    bgBottom: mixColor('#0b1017', base.bgBottom, 0.06),
    accent: mixColor('#ff9d48', base.accent, 0.1),
    accentSoft: 'rgba(255, 157, 72, 0.14)',
    surface: 'rgba(255, 255, 255, 0.065)',
    surfaceStrong: 'rgba(255, 255, 255, 0.11)',
    line: 'rgba(255, 255, 255, 0.17)',
    textStrong: '#fff7ef',
    textMain: 'rgba(255, 247, 239, 0.97)',
    textSoft: 'rgba(255, 247, 239, 0.84)',
    textMuted: 'rgba(255, 247, 239, 0.62)',
    ambientPrimary: mixColor('rgba(255, 157, 72, 0.05)', base.ambientPrimary, 0.08),
    ambientSecondary: mixColor('rgba(78, 102, 132, 0.04)', base.ambientSecondary, 0.06),
  }
}

function resolvePaletteStops(hour: number, paletteStops: PaletteStop[]) {
  const safeHour = clampHour(hour)
  const lastStop = paletteStops[paletteStops.length - 1]

  for (let index = 0; index < paletteStops.length - 1; index += 1) {
    const current = paletteStops[index]
    const next = paletteStops[index + 1]

    if (safeHour >= current.hour && safeHour <= next.hour) {
      return { current, next }
    }
  }

  return { current: lastStop, next: lastStop }
}

function interpolatePalette(hour: number, paletteStops: PaletteStop[]): KzThemePalette {
  const { current, next } = resolvePaletteStops(hour, paletteStops)
  const safeHour = clampHour(hour)
  const span = Math.max(1, next.hour - current.hour)
  const ratio = safeHour === current.hour ? 0 : (safeHour - current.hour) / span

  return {
    bgBase: mixColor(current.palette.bgBase, next.palette.bgBase, ratio),
    bgTop: mixColor(current.palette.bgTop, next.palette.bgTop, ratio),
    bgBottom: mixColor(current.palette.bgBottom, next.palette.bgBottom, ratio),
    accent: mixColor(current.palette.accent, next.palette.accent, ratio),
    accentSoft: mixColor(current.palette.accentSoft, next.palette.accentSoft, ratio),
    surface: mixColor(current.palette.surface, next.palette.surface, ratio),
    surfaceStrong: mixColor(current.palette.surfaceStrong, next.palette.surfaceStrong, ratio),
    line: mixColor(current.palette.line, next.palette.line, ratio),
    textStrong: mixColor(current.palette.textStrong, next.palette.textStrong, ratio),
    textMain: mixColor(current.palette.textMain, next.palette.textMain, ratio),
    textSoft: mixColor(current.palette.textSoft, next.palette.textSoft, ratio),
    textMuted: mixColor(current.palette.textMuted, next.palette.textMuted, ratio),
    ambientPrimary: mixColor(current.palette.ambientPrimary, next.palette.ambientPrimary, ratio),
    ambientSecondary: mixColor(current.palette.ambientSecondary, next.palette.ambientSecondary, ratio),
  }
}

export function getKzThemePalette(hour: number, mode: PanelColorMode = 'high'): KzThemePalette {
  if (mode === 'high') {
    return interpolatePalette(hour, HIGH_CONTRAST_PALETTE_STOPS)
  }

  return createLowContrastPalette(interpolatePalette(hour, PALETTE_STOPS))
}

export function getKzHour(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: KZ_TIME_ZONE,
  }).formatToParts(now)
  const hourPart = parts.find((part) => part.type === 'hour')?.value
  const minutePart = parts.find((part) => part.type === 'minute')?.value
  const secondPart = parts.find((part) => part.type === 'second')?.value

  return Number(hourPart ?? '0') + Number(minutePart ?? '0') / 60 + Number(secondPart ?? '0') / 3600
}

export function resolveKzHour(debugHour: number | null, now = new Date()) {
  return debugHour ?? getKzHour(now)
}

export function getKzThemeMode(hour: number) {
  return hour >= DAY_THEME_START_HOUR && hour < NIGHT_THEME_START_HOUR ? 'day' : 'night'
}

export function getKzDayPeriod(hour: number): KzDayPeriod {
  if (hour >= 5 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'day'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

export function getKzGreeting(hour: number) {
  if (hour >= 5 && hour < 12) return 'Доброе утро!'
  if (hour >= 12 && hour < 17) return 'Добрый день!'
  if (hour >= 17 && hour < 22) return 'Добрый вечер!'
  return 'Доброй ночи!'
}