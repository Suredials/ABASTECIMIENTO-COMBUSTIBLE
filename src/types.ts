export type ApiEnvelope<T> = {
  decCodigo: number
  strMensaje: string
  oResultado: T
  server_time?: string
}

export type Department = { id: number; nombre: string; lat: number; lng: number; total_eess: number }
export type Product = { id: number; producto: string; periodo: string; nacional: number; internacional: number }
export type StockState = 'alto' | 'medio' | 'bajo' | string
export type Station = {
  id: number
  nombre: string
  direccion: string
  zona: string
  departamento_id: number
  lat: number
  lng: number
  saldo_estado: StockState
  despacho_en_curso: boolean
  fecha_hora_despacho: string | null
  con_venta: boolean
  fecha_ultima_venta: string | null
  updated_at: string
}

export type QueueLevel = 'none' | 'short' | 'medium' | 'long'
export type QueueReport = { stationId: number; level: QueueLevel; createdAt: string }
