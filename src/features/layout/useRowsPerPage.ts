import { useEffect, useState } from 'react'

const MIN_AVAILABLE_HEIGHT = 360
const RESERVED_VERTICAL_SPACE = 150
const DETAIL_ROW_HEIGHT = 74
const MIN_ROWS_PER_PAGE = 5
const MAX_ROWS_PER_PAGE = 7

export function useRowsPerPage(uiScalePercent = 100, safeAreaPx = 0) {
  const [rows, setRows] = useState(7)

  useEffect(() => {
    const compute = () => {
      if (typeof window === 'undefined') return
      const scaleFactor = Math.max(0.5, uiScalePercent / 100)
      const width = window.innerWidth
      const height = window.innerHeight
      const isLowResTv = width <= 1024 && height <= 600
      const minRows = isLowResTv ? 4 : MIN_ROWS_PER_PAGE
      const maxRows = isLowResTv ? 4 : MAX_ROWS_PER_PAGE
      const reserved = RESERVED_VERTICAL_SPACE * scaleFactor + safeAreaPx * 2
      const available = Math.max(MIN_AVAILABLE_HEIGHT, height - reserved)
      const rowHeight = (isLowResTv ? 86 : DETAIL_ROW_HEIGHT) * scaleFactor
      const fittedRows = Math.floor(available / rowHeight)
      setRows(Math.max(minRows, Math.min(maxRows, fittedRows)))
    }

    compute()
    window.addEventListener('resize', compute)

    return () => window.removeEventListener('resize', compute)
  }, [safeAreaPx, uiScalePercent])

  return rows
}
