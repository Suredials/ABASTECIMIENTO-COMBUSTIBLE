import { useCallback, useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { AlertCircle, BadgeDollarSign, ChevronDown, Clock3, Crosshair, Fuel, Info, ListFilter, LocateFixed, Map as MapIcon, MapPin, Moon, Navigation, RefreshCw, Search, Sun, X } from 'lucide-react'
import { getDepartments, getProducts, getStations } from './api'
import type { Department, Product, Station } from './types'

const BOLIVIA_CENTER: [number, number] = [-16.7, -64.7]
const BOLIVIA_BOUNDS: [[number, number], [number, number]] = [[-23.4, -70.2], [-9.2, -56.8]]
const DEPARTMENT_CENTERS: Record<number, [number, number]> = {
  1: [-19.0333, -65.2627], 2: [-16.5, -68.15], 3: [-17.3895, -66.1568],
  4: [-17.9833, -67.15], 5: [-19.5836, -65.7531], 6: [-21.5355, -64.7296],
  7: [-17.7833, -63.1821], 8: [-14.8333, -64.9], 9: [-11.0267, -68.7692],
}
const STATION_PRODUCTS: Product[] = [
  { id: 1, producto: 'Gasolina', periodo: '', nacional: 0, internacional: 0 },
  { id: 2, producto: 'Gasolina Premium', periodo: '', nacional: 0, internacional: 0 },
]
type CityOption = { id: string; departmentId: number; name: string; lat: number; lng: number; radiusKm: number }
const CITIES: CityOption[] = [
  { id:'sucre',departmentId:1,name:'Sucre',lat:-19.0333,lng:-65.2627,radiusKm:24 },
  { id:'monteagudo',departmentId:1,name:'Monteagudo',lat:-19.7999,lng:-63.9546,radiusKm:18 },
  { id:'camargo',departmentId:1,name:'Camargo',lat:-20.6406,lng:-65.2089,radiusKm:16 },
  { id:'la-paz',departmentId:2,name:'La Paz',lat:-16.4955,lng:-68.1336,radiusKm:22 },
  { id:'el-alto',departmentId:2,name:'El Alto',lat:-16.5047,lng:-68.1633,radiusKm:18 },
  { id:'viacha',departmentId:2,name:'Viacha',lat:-16.6536,lng:-68.3035,radiusKm:15 },
  { id:'cochabamba',departmentId:3,name:'Cochabamba',lat:-17.3895,lng:-66.1568,radiusKm:24 },
  { id:'sacaba',departmentId:3,name:'Sacaba',lat:-17.3974,lng:-66.0383,radiusKm:15 },
  { id:'quillacollo',departmentId:3,name:'Quillacollo',lat:-17.3923,lng:-66.2784,radiusKm:16 },
  { id:'oruro',departmentId:4,name:'Oruro',lat:-17.9833,lng:-67.15,radiusKm:22 },
  { id:'challapata',departmentId:4,name:'Challapata',lat:-18.9021,lng:-66.7705,radiusKm:15 },
  { id:'potosi',departmentId:5,name:'Potosí',lat:-19.5836,lng:-65.7531,radiusKm:22 },
  { id:'uyuni',departmentId:5,name:'Uyuni',lat:-20.4637,lng:-66.8250,radiusKm:18 },
  { id:'villazon',departmentId:5,name:'Villazón',lat:-22.0866,lng:-65.5942,radiusKm:15 },
  { id:'tarija',departmentId:6,name:'Tarija',lat:-21.5355,lng:-64.7296,radiusKm:24 },
  { id:'yacuiba',departmentId:6,name:'Yacuiba',lat:-22.0133,lng:-63.6772,radiusKm:18 },
  { id:'bermejo',departmentId:6,name:'Bermejo',lat:-22.7322,lng:-64.3373,radiusKm:15 },
  { id:'santa-cruz',departmentId:7,name:'Santa Cruz de la Sierra',lat:-17.7833,lng:-63.1821,radiusKm:28 },
  { id:'montero',departmentId:7,name:'Montero',lat:-17.3423,lng:-63.2558,radiusKm:18 },
  { id:'warnes',departmentId:7,name:'Warnes',lat:-17.5163,lng:-63.1678,radiusKm:15 },
  { id:'camiri',departmentId:7,name:'Camiri',lat:-20.0385,lng:-63.5183,radiusKm:17 },
  { id:'trinidad',departmentId:8,name:'Trinidad',lat:-14.8333,lng:-64.9,radiusKm:22 },
  { id:'riberalta',departmentId:8,name:'Riberalta',lat:-11.0065,lng:-66.0631,radiusKm:18 },
  { id:'guayaramerin',departmentId:8,name:'Guayaramerín',lat:-10.8258,lng:-65.3581,radiusKm:16 },
  { id:'cobija',departmentId:9,name:'Cobija',lat:-11.0267,lng:-68.7692,radiusKm:20 },
]

const statusLabel: Record<string, string> = { alto: 'Saldo alto', medio: 'Saldo medio', bajo: 'Saldo bajo' }
function markerIcon(status: string, selected: boolean) {
  return L.divIcon({
    className: 'station-marker-shell',
    html: `<div class="station-marker ${status} ${selected ? 'selected' : ''}"><span></span></div>`,
    iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -14],
  })
}

function FlyTo({ station, position }: { station?: Station; position?: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (station) map.flyTo([station.lat, station.lng], 16, { duration: 0.8 })
  }, [station, map])
  useEffect(() => {
    if (position) map.flyTo(position, 14, { duration: 0.8 })
  }, [position, map])
  return null
}

function MapViewport({ department, city }: { department?: Department; city?: CityOption }) {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    observer.observe(container)
    const firstPaint = window.setTimeout(() => map.invalidateSize({ pan: false }), 100)
    return () => { observer.disconnect(); window.clearTimeout(firstPaint) }
  }, [map])
  useEffect(() => {
    if (department) {
      map.stop()
      map.setView(DEPARTMENT_CENTERS[department.id] || [department.lat, department.lng], 12, { animate: false })
    }
  }, [department, map])
  useEffect(() => {
    if (city) { map.stop(); map.setView([city.lat, city.lng], 13, { animate:false }) }
  }, [city, map])
  return null
}

function DepartmentPicker({ departments, value, onChange }: { departments: Department[]; value: number | ''; onChange: (id: number) => void }) {
  const [open, setOpen] = useState(false)
  const active = departments.find((item) => item.id === value)
  return <div className="department-picker">
    <button type="button" className={`department-trigger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
      <MapPin size={18}/><span>{active?.nombre || 'Elige un departamento'}</span><ChevronDown size={16}/>
    </button>
    {open && <><button className="picker-dismiss" aria-label="Cerrar selector" onClick={() => setOpen(false)}/><div className="department-menu">
      <strong>Selecciona un departamento</strong>
      <div>{departments.map((item) => <button type="button" key={item.id} className={item.id === value ? 'active' : ''} onClick={() => { onChange(item.id); setOpen(false) }}><span>{item.nombre}</span><small>{item.total_eess} estaciones</small></button>)}</div>
    </div></>}
  </div>
}

function distanceKm(a: [number, number], b: [number, number]) {
  const r = 6371
  const dLat = (b[0] - a[0]) * Math.PI / 180
  const dLng = (b[1] - a[1]) * Math.PI / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return 2 * r * Math.asin(Math.sqrt(x))
}

function relativeTime(value: string | null) {
  if (!value) return 'Sin dato reciente'
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000))
  if (minutes < 2) return 'hace instantes'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  return hours < 24 ? `hace ${hours} h` : `hace ${Math.round(hours / 24)} días`
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('anh-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [products] = useState<Product[]>(STATION_PRODUCTS)
  const [officialPrices, setOfficialPrices] = useState<Product[]>([])
  const [departmentId, setDepartmentId] = useState<number | ''>('')
  const [cityId, setCityId] = useState('')
  const [productId, setProductId] = useState(1)
  const [stations, setStations] = useState<Station[]>([])
  const [selectedId, setSelectedId] = useState<number>()
  const [focusStation, setFocusStation] = useState<Station>()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date>()
  const [position, setPosition] = useState<[number, number]>()
  const [locating, setLocating] = useState(false)
  const [view, setView] = useState<'map' | 'list'>('map')
  const [showPrices, setShowPrices] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('anh-theme', theme)
  }, [theme])

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const retry = async <T,>(operation: () => Promise<T>) => {
      try { return await operation() }
      catch { await new Promise((resolve) => window.setTimeout(resolve, 1200)); return operation() }
    }
    retry(() => getDepartments(controller.signal))
      .then((data) => { if (active) { setDepartments(data); setError('') } })
      .catch(() => { if (active) setError('ANH no está respondiendo en este momento. Puedes reintentar en unos segundos.') })
    retry(() => getProducts(controller.signal)).then((data) => { if (active) setOfficialPrices(data) }).catch(() => undefined)
    return () => { active = false; controller.abort() }
  }, [])

  const loadStations = useCallback(async (quiet = false) => {
    if (departmentId === '') { setStations([]); setLoading(false); return }
    if (!quiet) setLoading(true)
    try {
      const data = await getStations(departmentId, productId)
      setStations(data)
      setLastUpdated(new Date())
      setError('')
    } catch {
      setError('No pudimos actualizar las estaciones. Intentaremos nuevamente.')
    } finally { setLoading(false) }
  }, [departmentId, productId])

  useEffect(() => {
    setSelectedId(undefined)
    setFocusStation(undefined)
    if (departmentId === '') { setStations([]); setLoading(false); return }
    loadStations()
    const polling = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadStations(true)
    }, 15 * 60_000)
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') loadStations(true)
    }
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      window.clearInterval(polling)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [departmentId, productId, loadStations])

  const visibleStations = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es')
    const activeCity = CITIES.find((city) => city.id === cityId)
    const inCity = activeCity ? stations.filter((station) => distanceKm([activeCity.lat, activeCity.lng], [station.lat, station.lng]) <= activeCity.radiusKm) : stations
    const filtered = term ? inCity.filter((station) => `${station.nombre} ${station.direccion} ${station.zona}`.toLocaleLowerCase('es').includes(term)) : inCity
    const stockScore = (station: Station) => ({ alto: 0, medio: 1, bajo: 2 }[station.saldo_estado] ?? 3)
    const saleTime = (station: Station) => station.fecha_ultima_venta ? new Date(station.fecha_ultima_venta).getTime() : 0
    if (position) return [...filtered].sort((a, b) => {
      const scoreA = distanceKm(position, [a.lat, a.lng]) + stockScore(a) * 2.5
      const scoreB = distanceKm(position, [b.lat, b.lng]) + stockScore(b) * 2.5
      return scoreA - scoreB || Number(b.con_venta) - Number(a.con_venta) || saleTime(b) - saleTime(a)
    })
    return [...filtered].sort((a, b) => stockScore(a) - stockScore(b) || Number(b.con_venta) - Number(a.con_venta) || saleTime(b) - saleTime(a))
  }, [stations, search, position, cityId])

  const activeDepartment = departments.find((item) => item.id === departmentId)
  const activeCity = CITIES.find((item) => item.id === cityId)
  const departmentCities = departmentId === '' ? [] : CITIES.filter((item) => item.departmentId === departmentId)
  const activeProduct = products.find((item) => item.id === productId)
  const nextUpdate = lastUpdated ? new Date(lastUpdated.getTime() + 15 * 60_000) : undefined
  const shortTime = (date: Date) => date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })

  function locate() {
    if (!navigator.geolocation) return setError('Este navegador no ofrece ubicación.')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const insideBolivia = coords.latitude >= -23.2 && coords.latitude <= -9.5 && coords.longitude >= -69.8 && coords.longitude <= -57.3
        if (!insideBolivia || coords.accuracy > 5000) {
          setError('La ubicación recibida es aproximada o está fuera de Bolivia. No moveremos el mapa; elige un departamento.')
          setLocating(false)
          return
        }
        setPosition([coords.latitude, coords.longitude])
        if (departments.length) {
          const nearest = [...departments].sort((a, b) => distanceKm([coords.latitude, coords.longitude], DEPARTMENT_CENTERS[a.id]) - distanceKm([coords.latitude, coords.longitude], DEPARTMENT_CENTERS[b.id]))[0]
          if (nearest) setDepartmentId(nearest.id)
        }
        setError('')
        setLocating(false)
      },
      () => { setError('No pudimos obtener tu ubicación. Puedes seguir usando el mapa.'); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="live-pill"><span /> Información en vivo</div>
        <div className="update-indicator"><Clock3 size={15}/>{lastUpdated && nextUpdate ? <><span>Última <strong>{shortTime(lastUpdated)}</strong></span><i/><span>Próxima <strong>{shortTime(nextUpdate)}</strong></span></> : <span>Actualización cada 15 min</span>}</div>
        <div className="header-actions"><button className="theme-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'} title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}>{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</button><button className="prices-button" onClick={() => setShowPrices(true)}><BadgeDollarSign size={18}/>Precios oficiales</button><button className="location-button" onClick={locate} disabled={locating}><LocateFixed size={18} />{locating ? 'Ubicando…' : position ? 'Ubicación activa' : 'Usar mi ubicación'}</button></div>
      </header>

      <main className="content">
        <section className="controls-card">
          <label><span>Departamento</span><DepartmentPicker departments={departments} value={departmentId} onChange={(id) => { setPosition(undefined); setCityId(''); setDepartmentId(id) }}/></label>
          <label><span>Ciudad o municipio</span><div className="select-wrap"><MapPin size={18}/><select value={cityId} disabled={departmentId === ''} onChange={(e) => setCityId(e.target.value)}><option value="">Todo el departamento</option>{departmentCities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select><ChevronDown size={16}/></div></label>
          <label><span>Combustible</span><div className="select-wrap"><Fuel size={18}/><select value={productId} onChange={(e) => setProductId(Number(e.target.value))}>{products.map((item) => <option key={item.id} value={item.id}>{item.producto}</option>)}</select><ChevronDown size={16}/></div></label>
          <label className="search-field"><span>Buscar estación o zona</span><div><Search size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre, avenida, barrio…"/>{search && <button onClick={() => setSearch('')}><X size={15}/></button>}</div></label>
          <button className="refresh-button" aria-label="Actualizar" onClick={() => loadStations()}><RefreshCw size={19} className={loading ? 'spinning' : ''}/></button>
        </section>

        {error && <div className="error-banner"><AlertCircle size={18}/>{error}</div>}

        <section className="workspace">
          <aside className={`station-panel ${view === 'list' ? 'mobile-active' : ''}`}>
            <div className="panel-heading"><div><span>{activeCity?.name || activeDepartment?.nombre || 'Selecciona un departamento'} · {activeProduct?.producto || 'Combustible'}</span><h2>{visibleStations.length} estaciones</h2></div><small>{lastUpdated && departmentId !== '' ? `Actualizado ${relativeTime(lastUpdated.toISOString())}` : departmentId === '' ? 'Esperando selección' : 'Actualizando…'}</small></div>
            <div className="legend"><span><i className="dot alto"/>Alto</span><span><i className="dot medio"/>Medio</span><span><i className="dot bajo"/>Bajo</span></div>
            <div className="station-list">
              {departmentId === '' ? <div className="empty-state"><MapPin size={28}/><h3>Elige un departamento</h3><p>Te mostraremos sus estaciones en el mapa.</p></div> : loading && !stations.length ? <LoadingCards /> : visibleStations.length ? visibleStations.map((station) => {
                const km = position ? distanceKm(position, [station.lat, station.lng]) : undefined
                return <article key={station.id} role="button" tabIndex={0} aria-selected={selectedId === station.id} className={`station-card ${selectedId === station.id ? 'active' : ''}`} onClick={() => { setSelectedId(station.id); setFocusStation(station); setView('map') }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(station.id); setFocusStation(station); setView('map') } }}>
                  <div className="card-top"><span className={`status ${station.saldo_estado}`}><i/>{statusLabel[station.saldo_estado] || station.saldo_estado}</span>{km !== undefined && <span className="distance"><Navigation size={13}/>{km.toFixed(1)} km</span>}</div>
                  <h3>{station.nombre}</h3><p><MapPin size={14}/>{station.direccion || 'Dirección no disponible'}</p>
                  <div className="card-meta"><span className={station.con_venta ? 'positive' : ''}><Fuel size={15}/>{station.con_venta ? `Con venta · ${relativeTime(station.fecha_ultima_venta)}` : `Última venta ${relativeTime(station.fecha_ultima_venta)}`}</span>{station.despacho_en_curso && <span className="dispatch" title="Hay un abastecimiento registrado; no garantiza venta inmediata."><RefreshCw size={14}/>Reposición en curso</span>}</div>
                </article>
              }) : <div className="empty-state"><Search size={28}/><h3>Sin resultados</h3><p>Prueba con otro nombre o cambia los filtros.</p></div>}
            </div>
          </aside>

          <div className={`map-panel ${view === 'map' ? 'mobile-active' : ''}`}>
            <MapContainer center={BOLIVIA_CENTER} zoom={6} minZoom={5} maxBounds={BOLIVIA_BOUNDS} maxBoundsViscosity={1} worldCopyJump={false} className="map">
              <TileLayer key={theme} noWrap keepBuffer={4} updateWhenIdle={false} subdomains="abcd" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' url={theme === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'} />
              <MapViewport department={activeDepartment} city={activeCity}/>
              <FlyTo station={focusStation} position={position}/>
              {position && <CircleMarker center={position} radius={8} pathOptions={{ color: '#fff', weight: 4, fillColor: '#147d73', fillOpacity: 1 }} />}
              {visibleStations.map((station) => {
                return <Marker key={station.id} position={[station.lat, station.lng]} icon={markerIcon(station.saldo_estado, false)} eventHandlers={{ click: () => { setSelectedId(station.id); setFocusStation(undefined) } }}>
                  <Popup minWidth={245} maxWidth={290}>
                    <div className="map-popup">
                      <span className={`status ${station.saldo_estado}`}><i/>{statusLabel[station.saldo_estado] || station.saldo_estado}</span>
                      <h3>{station.nombre}</h3>
                      <p><MapPin size={13}/>{station.direccion || 'Dirección no disponible'}</p>
                      <div className="popup-facts">
                        <span className={station.con_venta ? 'positive' : ''}><Fuel size={14}/>{station.con_venta ? `Con venta · ${relativeTime(station.fecha_ultima_venta)}` : `Última venta ${relativeTime(station.fecha_ultima_venta)}`}</span>
                        {station.despacho_en_curso && <span className="dispatch"><RefreshCw size={13}/>Reposición en curso; puede tardar en habilitarse</span>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              })}
            </MapContainer>
            <button className="map-locate" onClick={locate} aria-label="Centrar en mi ubicación"><Crosshair size={20}/></button>
            <div className="map-note"><span className="pulse"/>Datos referenciales de ANH</div>
          </div>
        </section>
      </main>

      <nav className="mobile-tabs"><button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}><MapIcon size={19}/>Mapa</button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><ListFilter size={19}/>Lista ({visibleStations.length})</button></nav>

      {showPrices && <div className="modal-backdrop" onMouseDown={() => setShowPrices(false)}><section className="prices-modal" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setShowPrices(false)}><X/></button><div className="modal-icon"><BadgeDollarSign size={22}/></div><p className="eyebrow">Información oficial ANH</p><h2>Precios de combustibles</h2><p className="prices-period">{officialPrices[0]?.periodo?.replace(/\s+/g,' ').trim() || 'Periodo vigente'}</p><div className="price-table"><div className="price-head"><span>Producto</span><span>Nacional</span><span>Internacional</span></div>{officialPrices.map((product) => <div className="price-row" key={product.id}><strong>{product.producto}</strong><span>Bs {product.nacional.toFixed(2)}</span><span>{product.internacional ? `Bs ${product.internacional.toFixed(2)}` : '—'}</span></div>)}</div><p className="price-note"><Info size={15}/>Estos son precios de referencia. La API solo publica disponibilidad por estación para Gasolina y Gasolina Premium.</p></section></div>}
    </div>
  )
}

function LoadingCards() { return <>{[1,2,3].map((item) => <div className="station-card skeleton" key={item}><i/><i/><i/></div>)}</> }
