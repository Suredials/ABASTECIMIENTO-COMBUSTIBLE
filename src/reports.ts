import type { QueueLevel, QueueReport } from './types'

const KEY = 'combustible-bolivia:queue-reports'
const MAX_AGE = 30 * 60 * 1000

export function loadReports(): QueueReport[] {
  try {
    const reports = JSON.parse(localStorage.getItem(KEY) || '[]') as QueueReport[]
    return reports.filter((report) => Date.now() - new Date(report.createdAt).getTime() < MAX_AGE)
  } catch { return [] }
}

export function saveReport(stationId: number, level: QueueLevel): QueueReport[] {
  const current = loadReports().filter((report) => report.stationId !== stationId)
  const next = [...current, { stationId, level, createdAt: new Date().toISOString() }]
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}
