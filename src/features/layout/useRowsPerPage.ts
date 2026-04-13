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
      const scaleFactor = Math.max(0.7, uiScalePercent / 100)
      const height = window.innerHeight
      const reserved = RESERVED_VERTICAL_SPACE * scaleFactor + safeAreaPx * 2
      const available = Math.max(MIN_AVAILABLE_HEIGHT, height - reserved)
      const rowHeight = DETAIL_ROW_HEIGHT * scaleFactor
      const fittedRows = Math.floor(available / rowHeight)
      setRows(Math.max(MIN_ROWS_PER_PAGE, Math.min(MAX_ROWS_PER_PAGE, fittedRows)))
    }

    compute()
    window.addEventListener('resize', compute)

    return () => window.removeEventListener('resize', compute)
  }, [safeAreaPx, uiScalePercent])

  return rows
}
