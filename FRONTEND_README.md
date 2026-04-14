# Frontend - Monitor IoT Agregado

Este es un frontend simplificado que muestra datos agregados por diferentes rangos de tiempo (1 minuto, 5 minutos, 10 minutos y 1 hora).

## Características

✅ **Selectores de Variables**: Elige qué variable monitorear (cantidad_productos, temperatura)  
✅ **Selectores de Rango de Tiempo**: Elige el intervalo de agregación (1min, 5min, 10min, 1hour)  
✅ **Gráfico de Líneas**: Visualiza promedio, mínimo y máximo en tiempo real  
✅ **Tabla Detallada**: Ve todos los datos agregados en forma tabular  
✅ **Responsive**: Funciona en dispositivos móviles y desktop  

## Vista Previa

```
┌─────────────────────────────────────────────────┐
│ 📊 Monitor IoT - Datos Agregados                │ ● Conectado
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Variable: [cantidad_productos ▼]                │
│ Rango:    [1 Hora ▼]           [Cargar Datos] │
└─────────────────────────────────────────────────┘

Dispositivo: 441095104B78F267112345678
Última Actualización: 17:35:42

┌─────────────────────────────────────────────────┐
│                 GRÁFICO LÍNEAS                  │
│                (Promedio, Min, Max)             │
└─────────────────────────────────────────────────┘

┌──────────────┬──────────┬──────────┬──────────┐
│  Timestamp   │ Promedio │ Mínimo   │ Máximo   │
├──────────────┼──────────┼──────────┼──────────┤
│ 17:35:00     │  250.42  │  240.00  │  260.00  │
│ 17:30:00     │  245.18  │  235.00  │  255.00  │
│ 17:25:00     │  248.92  │  238.00  │  258.00  │
└──────────────┴──────────┴──────────┴──────────┘
```

## Estructura

```
frontend/
├── index.html      # Estructura HTML principal
├── styles/
│   └── main.css    # Estilos CSS principales
├── js/
│   ├── repository/ # Acceso HTTP por dominio
│   ├── service/    # Lógica y validaciones
│   ├── view/       # Render DOM
│   └── controller/ # Eventos y coordinación
└── README.md       # Este archivo
```

## Cómo Usar

1. **Abre el navegador** en `http://localhost:3000`
2. **Selecciona una variable** del dropdown (cantidad_productos o temperatura)
3. **Elige un rango de tiempo**:
   - 1 Minuto: Datos agregados cada 1 minuto
   - 5 Minutos: Datos agregados cada 5 minutos
   - 10 Minutos: Datos agregados cada 10 minutos
   - 1 Hora: Datos agregados cada 1 hora
4. **Ve el gráfico y tabla** con los datos agregados

## Endpoints Utilizados

El frontend utiliza estos endpoints REST:

```bash
# Obtener últimas variables disponibles
GET /api/devices/:id/latest

# Obtener datos agregados por 1 minuto
GET /api/devices/:id/history/1min?limit=100

# Obtener datos agregados por 5 minutos
GET /api/devices/:id/history/5min?limit=100

# Obtener datos agregados por 10 minutos
GET /api/devices/:id/history/10min?limit=100

# Obtener datos agregados por 1 hora
GET /api/devices/:id/history/1hour?limit=24
```

## Datos Mostrados

Cada punto en el gráfico y fila en la tabla muestra:

| Campo | Descripción |
|-------|-------------|
| **Timestamp** | Hora del agregado (YYYY-MM-DD HH:MM:SS) |
| **Promedio** | Valor promedio en el intervalo |
| **Mínimo** | Valor mínimo en el intervalo |
| **Máximo** | Valor máximo en el intervalo |
| **Cantidad** | Cantidad de registros en el intervalo |

## Colores en el Gráfico

- 🔵 **Azul**: Línea de promedio (llena)
- 🟢 **Verde**: Línea de mínimo (punteada)
- 🔴 **Rojo**: Línea de máximo (punteada)

## Requisitos

- Backend disponible en Render (`https://iot-backend-z9gc.onrender.com`) o en local (`http://localhost:3000`)
- MySQL con tabla `sensor_history_1min`, `sensor_history_5min`, etc.
- Base de datos actualizada con datos del simulador o dispositivo real

## Desarrollo

Para modificar el frontend:

1. **Editar HTML**: `index.html` - Estructura y controles
2. **Editar Estilos**: `styles/main.css` - Colores, layout, responsive
3. **Editar Lógica**: `js/repository`, `js/service`, `js/view` y `js/controller` según la capa

## Solución de Problemas

### "No hay datos disponibles aún"
- Verifica que el simulador esté corriendo: `node simulate_hmi.js`
- Comprueba que el backend esté activo: `npm start`

### Variables no aparecen en el selector
- Espera a que el simulador envíe datos (tarda 3-5 segundos)
- Revisa la consola del navegador (F12) para errores

### Tabla sin datos
- Selecciona una variable diferentes
- Cambia el rango de tiempo
- Verifica que MySQL tenga datos: `SELECT COUNT(*) FROM sensor_history_1min;`

### Gráfico no se muestra
- Cierra el navegador y reabre
- Ejecuta: `CALL proc_aggregate_1min();` en MySQL para generar datos agregados
- Verifica que Chart.js esté cargado (consola del navegador)

## Notas

- Los datos se actualizan al seleccionar variable o rango
- El frontend no se recarga automáticamente - usa el botón "Cargar Datos" o cambia de selector
- Los timestamps están en zona horaria local (UTC-5 para Colombia/Perú)
- Máximo de registros mostrados por rango: 100 para 1min/5min/10min, 24 para 1 hora

## Próximas Mejoras

- [ ] Auto-refresh cada 30 segundos
- [ ] Exportar datos a CSV
- [ ] Comparación entre dos rangos de tiempo
- [ ] Múltiples variables simultaneas en el gráfico
- [ ] Filtros por rango de fechas personalizadas
- [ ] Notificaciones cuando datos superan umbrales

---

Ready Packers - Proyecto IoT 2026
