# Abastecimiento de combustible

Mapa web para consultar la disponibilidad de combustible en estaciones de servicio de Bolivia con información pública de la ANH.

Permite filtrar por departamento, ciudad y tipo de combustible, ordenar las estaciones según disponibilidad y cercanía, y actualizar los datos automáticamente cada 15 minutos.

## Desarrollo

```bash
npm install
npm run dev
```

## Producción

```bash
npm run build
```

El proyecto está preparado para desplegarse en Vercel. Las solicitudes a ANH pasan por el proxy configurado en `vercel.json`.
