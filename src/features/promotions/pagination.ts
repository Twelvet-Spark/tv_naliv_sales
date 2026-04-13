export function buildToppedUpPages<T>(items: T[], pageCapacity: number): T[][] {
  const capacity = Math.max(1, pageCapacity)

  if (items.length === 0) {
    return []
  }

  const fullPageCount = Math.floor(items.length / capacity)
  const remainder = items.length % capacity
  const pages: T[][] = []

  for (let index = 0; index < fullPageCount; index += 1) {
    const start = index * capacity
    pages.push(items.slice(start, start + capacity))
  }

  if (remainder === 0) {
    return pages
  }

  if (pages.length === 0) {
    pages.push(items.slice(0, capacity))
    return pages
  }

  const retainedCount = capacity - remainder
  const previousPage = pages[pages.length - 1] ?? []
  const retainedItems = previousPage.slice(0, retainedCount)
  const incomingItems = items.slice(fullPageCount * capacity)

  pages.push([...retainedItems, ...incomingItems])
  return pages
}