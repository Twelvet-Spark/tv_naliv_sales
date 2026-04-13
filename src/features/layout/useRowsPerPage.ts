import { useEffect, useState } from 'react'

const MIN_AVAILABLE_HEIGHT = 360
const RESERVED_VERTICAL_SPACE = 150
const DETAIL_ROW_HEIGHT = 74
const MIN_ROWS_PER_PAGE = 5
const MAX_ROWS_PER_PAGE = 7

export function useRowsPerPage() {
  const [rows, setRows] = useState(7)

  useEffect(() => {
    const compute = () => {
      if (typeof window === 'undefined') return
      const height = window.innerHeight
      const available = Math.max(MIN_AVAILABLE_HEIGHT, height - RESERVED_VERTICAL_SPACE)
      const fittedRows = Math.floor(available / DETAIL_ROW_HEIGHT)
      setRows(Math.max(MIN_ROWS_PER_PAGE, Math.min(MAX_ROWS_PER_PAGE, fittedRows)))
    }

    compute()
    window.addEventListener('resize', compute)

    return () => window.removeEventListener('resize', compute)
  }, [])

  return rows
}
