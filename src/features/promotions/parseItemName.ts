type ParsedPromotionItemName = {
  displayName: string
  specs: string[]
  volumeMl: number | null
}

type Matcher = {
  label: string
  regex: RegExp
  order: number
}

function buildBoundaryRegex(pattern: string) {
  return new RegExp(`(^|[^a-zA-Zа-яА-ЯёЁ0-9])(${pattern})(?=$|[^a-zA-Zа-яА-ЯёЁ0-9])`, 'gi')
}

const VOLUME_REGEX = /(^|[^a-zA-Zа-яА-ЯёЁ0-9])(\d+[,.]?\d*)\s*(л|л\.|литр(?:а|ов)?|l|мл)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9])/gi
const ABV_REGEX = /(^|[^a-zA-Zа-яА-ЯёЁ0-9])(\d+[,.]?\d*)\s*%(?=$|[^a-zA-Zа-яА-ЯёЁ0-9])/gi

const BEER_SPEC_MATCHERS: Matcher[] = [
  { label: 'светлое', regex: buildBoundaryRegex('светл[а-яА-ЯёЁ]*'), order: 20 },
  { label: 'тёмное', regex: buildBoundaryRegex('т(?:е|ё)мн[а-яА-ЯёЁ]*'), order: 21 },
  { label: 'полутёмное', regex: buildBoundaryRegex('полут(?:е|ё)мн[а-яА-ЯёЁ]*'), order: 22 },
  { label: 'нефильтрованное', regex: buildBoundaryRegex('нефил(?:ьтр)?[а-яА-ЯёЁ]*|нефильтрован[а-яА-ЯёЁ]*'), order: 30 },
  { label: 'фильтрованное', regex: buildBoundaryRegex('фильтр(?:ован)?[а-яА-ЯёЁ]*'), order: 31 },
  { label: 'непастеризованное', regex: buildBoundaryRegex('непаст(?:еризован)?[а-яА-ЯёЁ]*'), order: 32 },
  { label: 'пастеризованное', regex: buildBoundaryRegex('паст(?:еризован)?[а-яА-ЯёЁ]*'), order: 33 },
  { label: 'безалкогольное', regex: buildBoundaryRegex('безалк[а-яА-ЯёЁ]*|безалкогольн[а-яА-ЯёЁ]*'), order: 34 },
  { label: 'пшеничное', regex: buildBoundaryRegex('пшен[а-яА-ЯёЁ]*'), order: 40 },
  { label: 'живое', regex: buildBoundaryRegex('жив(?:ое|ой|ая)'),'order': 41 },
  { label: 'крепкое', regex: buildBoundaryRegex('крепк(?:ое|ий|ая)'), order: 42 },
  { label: 'мягкое', regex: buildBoundaryRegex('мягк(?:ое|ий|ая)'), order: 43 },
  { label: 'лагер', regex: buildBoundaryRegex('лагер'), order: 50 },
  { label: 'эль', regex: buildBoundaryRegex('эль'), order: 51 },
  { label: 'пилснер', regex: buildBoundaryRegex('пилснер|pilsner'), order: 52 },
  { label: 'IPA', regex: buildBoundaryRegex('ipa'), order: 53 },
  { label: 'APA', regex: buildBoundaryRegex('apa'), order: 54 },
  { label: 'стаут', regex: buildBoundaryRegex('стаут|stout'), order: 55 },
  { label: 'портер', regex: buildBoundaryRegex('портер|porter'), order: 56 },
  { label: 'сидр', regex: buildBoundaryRegex('сидр|cider'), order: 57 },
  { label: 'витбир', regex: buildBoundaryRegex('витбир|witbier'), order: 58 },
  { label: 'weiss', regex: buildBoundaryRegex('weiss|weizen'), order: 59 },
  { label: 'банка', regex: buildBoundaryRegex('банка|ж/б'), order: 70 },
  { label: 'бутылка', regex: buildBoundaryRegex('бутылка|бут[.]?|ст/б'), order: 71 },
]

const SPEC_PRIORITY: Record<string, number> = {
  'светлое': 20,
  'тёмное': 21,
  'полутёмное': 22,
  'нефильтрованное': 30,
  'фильтрованное': 31,
  'непастеризованное': 32,
  'пастеризованное': 33,
  'безалкогольное': 34,
  'пшеничное': 40,
  'живое': 41,
  'крепкое': 42,
  'мягкое': 43,
  'лагер': 50,
  'эль': 51,
  'пилснер': 52,
  'IPA': 53,
  'APA': 54,
  'стаут': 55,
  'портер': 56,
  'сидр': 57,
  'витбир': 58,
  'weiss': 59,
  'банка': 70,
  'бутылка': 71,
}

function normalizeCanonicalTag(value: string) {
  if (value === 'IPA' || value === 'APA') return value
  return value.toLowerCase()
}

function parseVolumeToMl(rawValue: string, rawUnit: string) {
  const value = Number(rawValue.replace(',', '.'))
  if (!Number.isFinite(value) || value <= 0) return null

  const unit = rawUnit.toLowerCase()
  if (unit === 'мл') return Math.round(value)
  return Math.round(value * 1000)
}

function cleanSpacing(value: string) {
  return value
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.)])/g, '$1')
    .replace(/[(]\s+/g, '(')
    .replace(/[,.\s]+$/, '')
    .trim()
}

function parseAbvTag(rawValue: string) {
  const normalized = rawValue.replace(',', '.').trim()
  return `${normalized}%`
}

export function parsePromotionItemName(full: string): ParsedPromotionItemName {
  const matches: Array<{ index: number; label: string; order: number }> = []
  let cleaned = full
  let volumeMl: number | null = null

  for (const match of full.matchAll(VOLUME_REGEX)) {
    const rawValue = match[2]
    const rawUnit = match[3]
    const parsedVolume = parseVolumeToMl(rawValue, rawUnit)
    if (parsedVolume !== null && volumeMl === null) {
      volumeMl = parsedVolume
    }
  }

  cleaned = cleaned.replace(VOLUME_REGEX, '$1 ')

  for (const match of full.matchAll(ABV_REGEX)) {
    const rawValue = match[2]
    const index = (match.index ?? full.indexOf(match[0])) + String(match[1] ?? '').length
    matches.push({
      index,
      label: parseAbvTag(rawValue),
      order: 0,
    })
  }

  cleaned = cleaned.replace(ABV_REGEX, '$1 ')

  for (const matcher of BEER_SPEC_MATCHERS) {
    for (const match of full.matchAll(matcher.regex)) {
      const index = (match.index ?? full.indexOf(match[0])) + String(match[1] ?? '').length
      matches.push({ index, label: matcher.label, order: matcher.order })
    }

    cleaned = cleaned.replace(matcher.regex, '$1 ')
  }

  const uniqueSpecs: string[] = []
  const seen = new Set<string>()

  for (const match of matches.sort((left, right) => {
    if (left.order !== right.order) return left.order - right.order
    if (/%/.test(left.label) && !/%/.test(right.label)) return -1
    if (!/%/.test(left.label) && /%/.test(right.label)) return 1
    return left.index - right.index
  })) {
    if (seen.has(match.label)) continue
    seen.add(match.label)
    uniqueSpecs.push(normalizeCanonicalTag(match.label))
  }

  uniqueSpecs.sort((left, right) => {
    const leftOrder = /%/.test(left) ? 0 : SPEC_PRIORITY[left] ?? 999
    const rightOrder = /%/.test(right) ? 0 : SPEC_PRIORITY[right] ?? 999
    return leftOrder - rightOrder
  })

  const displayName = cleanSpacing(cleaned) || cleanSpacing(full)

  return {
    displayName,
    specs: uniqueSpecs,
    volumeMl,
  }
}