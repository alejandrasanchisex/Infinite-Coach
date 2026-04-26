---
name: brainstorming-pro
description: Genera ideas de calidad con estructura, filtros y selección final. Úsalo cuando necesites opciones creativas con criterio y una recomendación clara.
---

# Brainstorming Pro

## Cuándo usar esta habilidad

- Cuando el usuario pida ideas, variantes, conceptos, hooks, nombres, formatos o enfoques
- Cuando haya bloqueo creativo o demasiadas opciones y haga falta ordenar
- Cuando el usuario necesite ideas "buenas para ejecutar", no solo ocurrencias

## Inputs necesarios (si faltan, pregunta primero)

| Input | Descripción |
|-------|-------------|
| Objetivo exacto | Qué se quiere conseguir |
| Público / contexto | Para quién es y dónde se usa |
| Restricciones | Tiempo, presupuesto, tono, formato, herramientas |
| Ejemplos | Lo que SÍ y lo que NO (si el usuario tiene preferencias) |

**Regla:** Si falta alguno de estos inputs, pregunta antes de generar.

---

## Workflow

### 1) Aclarar el encargo
Haz 3–5 preguntas rápidas **solo si faltan datos críticos**.

### 2) Generar ideas en 4 tandas

| Tanda | Cantidad | Enfoque |
|-------|----------|---------|
| **A) Ideas rápidas** | 10 | Claras y ejecutables |
| **B) Ideas diferentes** | 5 | Ángulos no obvios |
| **C) Ideas low effort** | 5 | Rápidas de producir |
| **D) Ideas high impact** | 3 | Más ambiciosas, más potentes |

### 3) Filtrar y puntuar
Evalúa cada idea del 1 al 5 en:

| Criterio | Qué mide |
|----------|----------|
| Impacto | ¿Cuánto mueve la aguja? |
| Claridad | ¿Se entiende a la primera? |
| Novedad | ¿Es diferente a lo típico? |
| Esfuerzo | ¿Cuánto cuesta hacerlo? (5 = poco esfuerzo) |
| Viabilidad | ¿Se puede ejecutar con los recursos disponibles? |

### 4) Devolver TOP 5 final
Para cada idea del top:
- **Idea** (1 línea)
- **Por qué funciona** (2 líneas)
- **Primer paso** (1 línea)

---

## Reglas de calidad

| Regla | Descripción |
|-------|-------------|
| Nada genérico | Evita ideas tipo "mejorar tu productividad". Concreta siempre |
| Hooks/títulos | Si piden hooks, que sean cortos y con tensión/curiosidad |
| Formatos | Si piden formatos, incluye: estructura + ejemplo de primer minuto |
| Incertidumbre | Si una idea depende de algo incierto, dilo y ofrece alternativa |

---

## Output (formato exacto)

Devuelve siempre en este orden:

```
## Preguntas rápidas
(solo si faltan datos)

## Ideas

### A) Ideas rápidas (10)
1. ...
2. ...
...

### B) Ideas diferentes (5)
1. ...
...

### C) Ideas low effort (5)
1. ...
...

### D) Ideas high impact (3)
1. ...
...

## TOP 5 recomendado

| # | Idea | Puntuación | Por qué funciona | Primer paso |
|---|------|------------|------------------|-------------|
| 1 | ... | I:5 C:4 N:5 E:3 V:4 | ... | ... |
| 2 | ... | ... | ... | ... |
...
```

---

## Manejo de errores

- Si el usuario no está satisfecho con las ideas, pregunta qué falla (¿muy genéricas? ¿muy complejas? ¿tono incorrecto?)
- Ajusta los filtros y regenera solo las tandas necesarias
- Si hay ambigüedad en el objetivo, pregunta antes de asumir
