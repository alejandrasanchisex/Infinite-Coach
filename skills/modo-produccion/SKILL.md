---
name: modo-produccion
description: Revisa una app/landing, detecta problemas típicos, propone mejoras y aplica correcciones con un checklist fijo para dejarlo listo para enseñar o publicar.
---

# Modo Producción (QA + Fix)

## Cuándo usar esta habilidad

- Cuando ya tienes algo generado (landing/app) y quieres dejarlo "presentable"
- Cuando algo funciona "a medias" (móvil raro, imágenes rotas, botones sin acción, espaciados feos)
- Antes de enseñarlo a un cliente, grabarlo o publicarlo

## Inputs necesarios (si faltan, pregunta)

| Input | Descripción |
|-------|-------------|
| Archivo principal | Ruta del archivo (ej: `index.html`) o carpeta del proyecto |
| Objetivo de revisión | "lista para enseñar" o "lista para publicar" |
| Restricciones | No cambiar branding / no cambiar copy / no tocar estructura, etc. |

---

## Checklist de calidad (orden fijo)

### A) Funciona y se ve

- [ ] Abre la preview / localhost sin errores
- [ ] Imágenes cargan y no hay rutas rotas
- [ ] Tipografías y estilos se aplican correctamente

### B) Responsive (móvil primero)

- [ ] Se ve bien en móvil (no se corta, no hay scroll horizontal)
- [ ] Botones y textos tienen tamaños legibles
- [ ] Secciones con espaciado coherente

### C) Copy y UX básica

- [ ] Titular claro y coherente con la propuesta
- [ ] CTAs consistentes (mismo verbo, misma intención)
- [ ] No hay texto "placeholder" tipo lorem ipsum

### D) Accesibilidad mínima

- [ ] Contraste razonable en textos
- [ ] Imágenes con alt
- [ ] Estructura de headings (h1, h2) lógica

---

## Workflow

### 1) Diagnóstico rápido
Lista de problemas en 5–10 bullets, priorizados por impacto.

### 2) Plan de arreglos
"Qué cambio y por qué" — máximo 8 cambios.

### 3) Aplicar cambios
Modifica los archivos necesarios (código, assets, copy).

### 4) Validación
Vuelve a abrir preview y confirma que la checklist pasa.

### 5) Resumen final
Cambios hechos + qué queda opcional para mejorar.

---

## Reglas

| Regla | Descripción |
|-------|-------------|
| Respetar marca | No cambies el estilo de marca si existe un skill de marca activo |
| Mínimo viable | No rehagas todo: corrige lo mínimo para ganar calidad rápido |
| Claridad > Estética | Si hay conflicto entre "bonito" y "claro", prioriza claridad |

---

## Output (formato exacto)

Devuelve siempre en este orden:

```
## Diagnóstico (priorizado)

1. 🔴 [Crítico] ...
2. 🟡 [Medio] ...
3. 🟢 [Menor] ...
...

---

## Cambios aplicados

| # | Archivo | Cambio | Motivo |
|---|---------|--------|--------|
| 1 | ... | ... | ... |
| 2 | ... | ... | ... |
...

---

## Resultado

**Estado:** ✅ OK para enseñar / ✅ OK para publicar

**Notas:**
- ...
- ...

**Mejoras opcionales (no bloqueantes):**
- ...
```

---

## Manejo de errores

- Si no puedo abrir la preview, pido al usuario que confirme la ruta o levante el servidor
- Si hay demasiados problemas (>15), priorizo los 8 más críticos y documento el resto como "pendientes"
- Si una corrección rompe otra cosa, revierto y busco alternativa
