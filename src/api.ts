import type { ApiEnvelope, Department, Product, Station } from './types'

const BASE_URL = '/api/anh'
const PUBLIC_APP_KEY = '9ADE86E5A083423EBE50C051F4DB9778'

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { signal })
  if (!response.ok) throw new Error(`El servicio respondió ${response.status}`)
  const payload = (await response.json()) as ApiEnvelope<T>
  if (payload.decCodigo !== 1 || payload.oResultado == null) {
    if (payload.decCodigo === -1) return [] as T
    throw new Error(payload.strMensaje || 'No se pudo cargar la información')
  }
  return payload.oResultado
}

export const getDepartments = (signal?: AbortSignal) =>
  request<Department[]>(`/departamentos/${PUBLIC_APP_KEY}`, signal)

export const getProducts = (signal?: AbortSignal) =>
  request<Product[]>(`/precios/${PUBLIC_APP_KEY}/1`, signal)

export const getStations = (department: number, product: number, signal?: AbortSignal) =>
  request<Station[]>(`/estaciones/${PUBLIC_APP_KEY}?departamento=${department}&producto=${product}`, signal)
