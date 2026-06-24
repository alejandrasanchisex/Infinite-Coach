---
name: crear-cliente-demo-alejandra
description: Crea o restaura el cliente de pruebas/DEMO "Alejandra Sanchis" con todo su historial de evolución de peso, dieta de recomposición, rutina de fuerza con ejercicios del sistema, registros de hábitos y 1 revisión pendiente.
---

Este skill permite crear o restaurar desde cero el cliente DEMO "Alejandra Sanchis" en la base de datos de Supabase para un entrenador específico (como Lucy Tundidor o ASTeam).

### Uso
Cuando el usuario te pida crear el cliente DEMO Alejandra Sanchis (por ejemplo, "crea el cliente de pruebas Alejandra" o "restaura a Alejandra Sanchis"), debes ejecutar el siguiente script usando Node.js:

```bash
node .agents/skills/crear-cliente-demo-alejandra/scripts/seed_alejandra.js [TRAINER_ID]
```

Si el usuario no especifica el `TRAINER_ID`, el script por defecto actualizará los perfiles de **Lucy Tundidor** (`t-udve3b1u3`) y **ASTeam** (`t-w0iybl7qb`).

El script realiza de forma automatizada las siguientes acciones:
1. **Limpieza previa**: Elimina cualquier rastro antiguo de Alejandra Sanchis (dietas, rutinas, logs de entrenamiento, hábitos, feedbacks y clientes) para evitar duplicados.
2. **Creación del Cliente**: Crea el perfil de Alejandra con su código de acceso, correo, teléfono y datos técnicos corporales.
3. **Plan Nutricional**: Crea y asigna una dieta de recomposición con 4 comidas y macros balanceados, marcada con `isTemplate: false`.
4. **Rutina de Fuerza**: Crea y asigna una rutina de fuerza de 3 días a la semana enlazada a la biblioteca de ejercicios del sistema.
5. **Historial de Evolución**: Crea 5 semanas de historial de peso y perímetros corporales.
6. **Entrenamientos Completados**: Registra 12 entrenamientos semanales completos (3 por semana durante 4 semanas) con progresión de cargas para alimentar el Salón de la Fama y las gráficas.
7. **Revisión Pendiente**: Genera 4 revisiones resueltas y **1 revisión pendiente** (Semana 5) con las respuestas del formulario del cliente listas para ser contestadas por el entrenador.
