---
name: doc-to-app
description: Convierte un documento (PDF/texto) en una mini-app web interactiva lista para abrir en preview. Úsalo cuando quieras pasar de "contenido" a "producto usable".
---

# Doc-to-App (Documento a Mini-App)

Convierte un documento (PDF o texto) en una mini-app web interactiva lista para abrir en el navegador. Ideal para transformar guías, catálogos o itinerarios en productos usables.

## Cuándo usar este skill

- Cuando tengas información en un PDF, texto o notas y quieras transformarla en una mini web navegable.
- Cuando necesites buscador, filtros y secciones claras en un documento estático.
- Cuando quieras preparar contenido "listo para enseñar" o compartir de forma interactiva.

## Inputs necesarios (si faltan, pregunta)

| Input | Descripción |
|-------|-------------|
| Fuente | PDF o texto pegado |
| Tipo de app | Guía, catálogo, checklist, itinerario, etc. |
| Prioridad | "Más visual" o "Más práctica" |
| Idioma/Estilo | Claro, sencillo, sin jerga (predeterminado) |

---

## Reglas importantes

- **No devuelvas solo texto:** Debes crear archivos y una vista previa funcional.
- **No sobrescribas:** Cada ejecución crea una carpeta nueva con timestamp.
- **Mobile First:** La app debe funcionar perfectamente en dispositivos móviles.
- **Sin dependencias externas:** El `index.html` debe ser autoportante o usar CDNs estándar (no frameworks pesados).

---

## Estructura de salida

Crea siempre una carpeta nueva dentro del proyecto con el formato:
`miniapp_<tema>_YYYYMMDD_HHMM`

Archivos obligatorios:
1. `index.html`: La aplicación web interactiva.
2. `data.json`: Los datos estructurados extraídos del documento.
3. `README.txt`: Instrucciones de apertura (archivo://...) y contenido incluido.

---

## Funcionalidades mínimas de la app

- [ ] **Buscador:** Filtrado en tiempo real por texto.
- [ ] **Filtros:** Por categorías o etiquetas (etiqueta automática si no existen).
- [ ] **Navegación:** Índice lateral o superior para saltar entre secciones.
- [ ] **Responsive:** Diseño limpio y adaptable.
- [ ] **Acciones:** Botones de "copiar", "marcar como hecho" o "contraer/expandir" según el tipo de app.

---

## Workflow (Orden fijo)

1. **Extracción:** Leer el documento y extraer estructura (secciones, listas, tablas).
2. **Estructuración:** Convertir la información a un `data.json` jerárquico.
3. **Generación:** Crear el `index.html` que consuma `data.json` mediante JS nativo.
4. **Validación:** Verificar que el buscador y la navegación funcionen sin errores.
5. **Entrega:** Informar al usuario de la carpeta creada y la URL local.

---

## Output (Formato exacto)

Al terminar el proceso, devuelve siempre:

### Carpeta creada
`miniapp_<tema>_timestamp`

### Instrucciones de apertura
Abre este archivo en tu navegador:
`file:///<ruta_absoluta>/index.html`

### Resumen
- **Tipo de App:** ...
- **Secciones:** ...
- **Funcionalidades extra:** ...
