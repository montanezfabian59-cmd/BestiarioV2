# BestiarioV2

Jueguito de cartas de combate, vínculos y engaño.

## Arquitectura actual de batalla

- `index.html` carga primero `ai-core.js` y después `script.js`, de modo que la IA estratégica queda disponible para el flujo de batalla del navegador.
- `script.js` mantiene el flujo existente: selección de mazo, selección de personajes principales, reparto de manos, asignación de atributos del jugador, cálculo de combate, daño, eliminación, consumibles, recompensas y evolución.
- Las cartas se reparten desde `repartirCartas()`, que rellena `manoUsuario` y `manoRival` hasta siete cartas aplicando antes equipamiento, mutaciones, inmunidades y consumibles mediante `aplicarEquipamientoInicial()`.
- El valor final de combate sigue centralizado en `calcularPuntosBatallaConTarjeta()`. La IA no duplica esas reglas: recibe esa función como dependencia y la usa para construir su matriz de enfrentamientos.
- El daño continúa resolviéndose dentro de `ejecutarDuelo()` con `calcularYAsignarDaño()`, consumiendo primero consumibles activos y luego reduciendo atributos base.
- Las eliminaciones siguen ocurriendo al final de cada duelo, removiendo índices de `manoUsuario` y `manoRival` y reduciendo turnos de consumibles.

## IA estratégica del rival

La lógica aleatoria anterior fue reemplazada por `ai-core.js`, un motor modular que separa:

1. `analyzeGameState()` — percepción del estado visible, cartas restantes y estado estratégico: conservador, equilibrado, agresivo o desesperado.
2. `analyzeOwnHand()` — valoración de la mano propia con atributos efectivos, supervivencia, futuro, vulnerabilidades y sinergias.
3. `buildMatchupMatrix()` — matriz `carta IA × carta jugador × atributo`, reutilizando el cálculo real de combate.
4. `analyzeOpponent()` y `updateMemory()` — memoria de rondas, atributos usados, cartas vistas, márgenes, sacrificios e indicios de farol.
5. `predictOpponentMove()` — sistema de creencias probabilísticas sobre atributos del jugador, sin leer decisiones futuras.
6. `evaluateThreats()` — ranking de amenazas por poder efectivo, sinergias y recursos activos.
7. `evaluateMove()` — utilidad estratégica con victoria inmediata, eliminación de amenazas, supervivencia, valor futuro, reserva, sacrificio, información, engaño, psicología y coste de riesgo.
8. `chooseMove()` — selección con aleatoriedad controlada solo entre alternativas estratégicamente cercanas.
9. `decideBet()` — punto de extensión para apuestas/retos tipo Truco.

El modo de depuración se controla desde `AI_DEBUG` en `script.js` y el último análisis queda en `ultimoDebugIARival` para inspección durante desarrollo.
