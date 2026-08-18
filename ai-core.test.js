const assert = require('assert');
const AI = require('./ai-core.js');
const attrs = AI.ATTRIBUTES;
function card(id, values, extra = {}) { return Object.assign({ id, nombre: id, atributos: values }, extra); }
function ctx(ownCards, opponentCards, specialCards = [], memory = AI.createMemory()) {
  return { ownCards, opponentCards, specialCards, memory, getBaseValue: (_, v) => v || 0, calculateBattleValue: (p, o, a, b) => {
    let total = b || 0;
    (p.consumibles || []).forEach(c => { if (c.atributo === a && c.turnos > 0) total += c.valor; });
    if (specialCards.some(t => t.tipo === 'Inmunidad' && t.propietarioId === p.id)) return total;
    specialCards.forEach(t => {
      const ids = Array.isArray(t.vinculadosIds) ? t.vinculadosIds : [t.vinculadosIds].filter(Boolean);
      if (t.tipo === 'Odio' && t.propietarioId === p.id && o && ids.includes(o.id)) total += 60;
      if (t.tipo === 'Debilidad' && t.propietarioId === p.id && a === 'fuerza') total = 1;
    });
    return Math.max(0, Math.round(total));
  }};
}
const low = { fuerza: 10, inteligencia: 10, velocidad: 10, magia: 10, defensa: 10 };
const high = { fuerza: 95, inteligencia: 95, velocidad: 95, magia: 95, defensa: 95 };

let r = AI.decideAssignments(ctx([card('killer', high), card('ok', low), card('ok2', low), card('ok3', low), card('ok4', low)], [card('victim', low)]));
assert(Object.values(r.assignments).includes(0), 'elige una victoria segura');

r = AI.decideAssignments(ctx([card('bait', low), card('ace', high), card('c', low), card('d', low), card('e', low)], [card('boss', { fuerza: 120, inteligencia: 120, velocidad: 120, magia: 120, defensa: 120 })]));
assert(r.debug.alternatives.some(m => m.sacrifice), 'detecta sacrificios posibles');

r = AI.decideAssignments(ctx([card('ace', high), card('worker', { fuerza: 70, inteligencia: 70, velocidad: 70, magia: 70, defensa: 70 }), card('x', low), card('y', low), card('z', low)], [card('minor', low), card('futureBoss', { fuerza: 110, inteligencia: 110, velocidad: 110, magia: 110, defensa: 110 })]));
assert(r.debug.alternatives.some(m => m.components.reserveCost > 0), 'valora reservar carta poderosa');

assert(AI.evaluateThreats(AI.analyzeGameState(ctx([card('a', low)], [card('t', high)])), ctx([card('a', low)], [card('t', high)]))[0].level !== 'irrelevante', 'detecta amenaza');
let mem = AI.createMemory(); ['velocidad','velocidad','velocidad'].forEach(a => AI.updateMemory(mem, { playerAttribute: a, playerCard: 'p', margin: 1 }));
assert(AI.analyzeOpponent(mem).repeatedAttribute === 'velocidad', 'detecta repetición de atributos');
assert(AI.predictOpponentMove({ opponentCards: [] }, mem, AI.analyzeOpponent(mem), { prediction: 1, memory: 1 }).attributes.velocidad > 0.2, 'adapta creencias');

const picks = new Set(); for (let i=0;i<20;i++) picks.add(AI.chooseMove([{score:1,index:0},{score:0.98,index:1}], {randomness:0.2}).index);
assert(picks.size > 1, 'genera jugadas impredecibles entre opciones similares');

r = AI.decideAssignments(ctx([card('hater', low)], [card('enemy', high)], [{ tipo:'Odio', propietarioId:'hater', vinculadosIds:['enemy'], puntos:60 }]));
assert(r.matrix[0][0].fuerza.ownValue >= 70, 'usa relaciones existentes');

r = AI.decideAssignments(ctx([card('immune', low)], [card('o', low)], [{ tipo:'Inmunidad', propietarioId:'immune' }, { tipo:'Debilidad', propietarioId:'immune', vinculadosIds:['o'] }]));
assert(r.matrix[0][0].fuerza.ownValue === 10, 'respeta inmunidades');

r = AI.decideAssignments(ctx([card('cons', low, { consumibles:[{atributo:'magia', valor:50, turnos:1}] })], [card('o', low)]));
assert(r.matrix[0][0].magia.ownValue === 60, 'respeta consumibles');

r = AI.decideAssignments(ctx([card('tie', low)], [card('tie2', low)]));
assert(r.debug.alternatives.some(m => Math.abs(m.margin) === 0), 'valora empates');
assert(r.hand[0].survival > 0, 'valora supervivencia');
assert(r.hand[0].futureValue > 0, 'valora futuro');
assert(!('playerFutureChoice' in r.debug), 'no accede a información futura');
assert(AI.decideAssignments(ctx([card('a', high)], [card('b', low)]), { debug:false }).debug, 'funciona sin debug activado');
console.log('AI tests passed');
