---
name: planificacion-pro
description: Convierte una idea en un plan ejecutable por fases, con checklist, riesgos y entregables. Úsalo cuando haya que pasar de idea a acción sin improvisar.
---

# Planificación Pro

## Cuándo usar esta habilidad

- Cuando el usuario pida un plan paso a paso, una estrategia o una hoja de ruta
- Cuando haya que entregar algo (landing, vídeo, proyecto, lanzamiento) con tiempos
- Cuando el usuario tenga muchas tareas sueltas y quiera ordenarlas

## Inputs necesarios (si faltan, pregunta primero)

| Input | Descripción |
|-------|-------------|
| Resultado final | Qué significa "terminado" |
| Fecha límite o ritmo | Hoy, esta semana, sin prisa |
| Recursos disponibles | Herramientas, equipo, presupuesto, tiempo diario |
| Criterios de éxito | Qué debe cumplir para estar bien |

**Regla:** Si falta alguno de estos inputs, pregunta antes de planificar.

---

## Workflow

### 1) Definir el resultado final
- Resume el objetivo en **1 frase**
- Lista **3 criterios de éxito** medibles

### 2) Dividir en fases (máximo 4)

| Fase | Propósito |
|------|-----------|
| **Preparación** | Reunir recursos, decidir enfoque, resolver dependencias |
| **Producción / Ejecución** | Crear el entregable principal |
| **Revisión / QA** | Verificar calidad, corregir errores |
| **Publicación / Entrega** | Lanzar, entregar, comunicar |

### 3) Detallar cada fase
Para cada fase incluir:

| Elemento | Descripción |
|----------|-------------|
| Tareas en orden | Lista secuencial de acciones |
| Entregable claro | Qué sale de esa fase (documento, archivo, decisión) |
| Tiempo estimado | Duración aproximada por tarea |

### 4) Añadir riesgos y mitigación (3–5)
Formato:
> **Si pasa X** → hago Y

### 5) Cerrar con checklist final
Lista de verificación para validar que todo está completo antes de dar por terminado.

---

## Reglas de calidad

| Regla | Descripción |
|-------|-------------|
| Evitar planes infinitos | Prioriza lo que desbloquea lo siguiente |
| Dependencias | Si algo depende de otra cosa, indícalo ("esto depende de X") |
| Usuario principiante | Reduce pasos y da opciones simples |
| Usuario avanzado | Incluye optimizaciones y atajos |

---

## Output (formato exacto)

Devuelve siempre en este orden:

```
## Resultado final
[1 frase que define "terminado"]

### Criterios de éxito
1. ...
2. ...
3. ...

---

## Plan por fases

### Fase 1: Preparación
| Tarea | Tiempo | Entregable |
|-------|--------|------------|
| ... | ... | ... |

### Fase 2: Producción
| Tarea | Tiempo | Entregable |
|-------|--------|------------|
| ... | ... | ... |

### Fase 3: Revisión
| Tarea | Tiempo | Entregable |
|-------|--------|------------|
| ... | ... | ... |

### Fase 4: Entrega
| Tarea | Tiempo | Entregable |
|-------|--------|------------|
| ... | ... | ... |

---

## Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Si pasa X | Hago Y |
| Si pasa X | Hago Y |
...

---

## Checklist final

- [ ] ...
- [ ] ...
- [ ] ...
```

---

## Manejo de errores

- Si el plan es demasiado largo, pregunta qué se puede recortar o delegar
- Si hay dependencias bloqueantes, destácalas y propón alternativas
- Si el usuario cambia el alcance a mitad, regenera solo las fases afectadas
- Si hay ambigüedad en el resultado final, pregunta antes de asumir
