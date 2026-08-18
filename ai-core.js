(function (root) {
    'use strict';

    const ATTRIBUTES = ["fuerza", "inteligencia", "velocidad", "magia", "defensa"];
    const AI_DEBUG = false;

    const AI_CONFIG = {
        difficulty: "maestro",
        personality: "BOT_MAESTRO",
        memoryLimit: 40,
        beamWidth: 45,
        weights: {
            immediateWin: 3.4,
            enemyElimination: 4.8,
            ownSurvival: 3.6,
            futurePosition: 2.7,
            synergy: 1.35,
            information: 0.85,
            deception: 0.75,
            psychological: 0.65,
            threatPressure: 2.2,
            reservePenalty: 1.5,
            sacrificeValue: 1.25,
            riskCost: 2.4,
            resourceCost: 1.8,
            tieValue: 0.45
        },
        personalities: {
            BOT_EQUILIBRADO: { aggression: 0.55, riskTolerance: 0.45, deception: 0.35, futurePlanning: 0.65, adaptation: 0.65, randomness: 0.08 },
            BOT_AGRESIVO: { aggression: 0.82, riskTolerance: 0.68, deception: 0.32, futurePlanning: 0.52, adaptation: 0.58, randomness: 0.09 },
            BOT_CONSERVADOR: { aggression: 0.32, riskTolerance: 0.25, deception: 0.22, futurePlanning: 0.76, adaptation: 0.60, randomness: 0.05 },
            BOT_ENGAÑADOR: { aggression: 0.56, riskTolerance: 0.55, deception: 0.86, futurePlanning: 0.66, adaptation: 0.78, randomness: 0.12 },
            BOT_IMPREDECIBLE: { aggression: 0.62, riskTolerance: 0.62, deception: 0.72, futurePlanning: 0.55, adaptation: 0.70, randomness: 0.18 },
            BOT_MAESTRO: { aggression: 0.68, riskTolerance: 0.58, deception: 0.72, futurePlanning: 0.82, adaptation: 0.88, randomness: 0.10 }
        },
        difficulties: {
            facil: { memory: 0.25, prediction: 0.25, adaptation: 0.20, planning: 0.25, deception: 0.15, randomness: 0.22 },
            normal: { memory: 0.55, prediction: 0.48, adaptation: 0.45, planning: 0.45, deception: 0.30, randomness: 0.12 },
            dificil: { memory: 0.82, prediction: 0.72, adaptation: 0.72, planning: 0.72, deception: 0.55, randomness: 0.08 },
            maestro: { memory: 1, prediction: 1, adaptation: 1, planning: 1, deception: 1, randomness: 0.06 }
        }
    };

    function createMemory() {
        return { rounds: [], attributeUsage: {}, cardUsage: {}, playerPatterns: {}, bluffSignals: [], sacrifices: [], importantInteractions: [], confidence: {}, beliefs: {} };
    }

    function stat(card, attr) { return (card && card.atributos && Number(card.atributos[attr])) || 0; }
    function cardId(card, fallback) { return (card && (card.id || card.nombre)) || String(fallback); }
    function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
    function avg(values) { return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; }
    function hasImmunity(card, cards) { return (cards || []).some(t => t.tipo === "Inmunidad" && t.propietarioId === cardId(card)); }
    function linkedIds(t) { return Array.isArray(t && t.vinculadosIds) ? t.vinculadosIds : (t && t.vinculadosIds ? [t.vinculadosIds] : []); }

    function getProfile(config) {
        const merged = Object.assign({}, AI_CONFIG, config || {});
        return Object.assign({}, merged.personalities[merged.personality] || merged.personalities.BOT_MAESTRO, merged.difficulties[merged.difficulty] || merged.difficulties.maestro);
    }

    function effectiveValue(card, opponent, attr, ctx) {
        const base = ctx.getBaseValue ? ctx.getBaseValue(attr, stat(card, attr)) : stat(card, attr);
        return ctx.calculateBattleValue ? ctx.calculateBattleValue(card, opponent, attr, base) : base;
    }

    function analyzeGameState(ctx) {
        const ownCards = (ctx.ownCards || []).filter(Boolean);
        const opponentCards = (ctx.opponentCards || []).filter(Boolean);
        const ownRemaining = ownCards.length + ((ctx.ownDeckRemaining || []).length || 0);
        const opponentRemaining = opponentCards.length + ((ctx.opponentDeckRemaining || []).length || 0);
        const delta = ownRemaining - opponentRemaining;
        let strategyState = "EQUILIBRADO";
        if (delta >= 3) strategyState = "CONSERVADOR";
        else if (delta <= -3 || ownRemaining <= 2) strategyState = "DESESPERADO";
        else if (delta < 0) strategyState = "AGRESIVO";
        return { ownCards, opponentCards, ownRemaining, opponentRemaining, delta, strategyState, cards: ctx.cards || [] };
    }

    function evaluateSynergies(card, visibleCards, allSpecialCards) {
        let value = 0;
        const relations = [];
        (allSpecialCards || []).forEach(t => {
            if (t.propietarioId !== cardId(card) && !linkedIds(t).includes(cardId(card))) return;
            const ids = linkedIds(t);
            const present = visibleCards.filter(c => ids.includes(cardId(c)) || cardId(c) === t.propietarioId).length;
            const points = Math.abs(parseInt(t.puntosVinculo || t.puntos || (t.efectos && t.efectos[0] && t.efectos[0].modificacion) || 0, 10));
            if (["Aliado", "Grupo", "Pareja", "Amor"].includes(t.tipo)) value += present * (points || 12);
            if (["Rival", "Odio"].includes(t.tipo)) value += present * (points || 18);
            if (["Miedo", "Debilidad"].includes(t.tipo)) value -= present * 18;
            relations.push({ tipo: t.tipo, ids, present, points });
        });
        return { value, relations };
    }

    function buildMatchupMatrix(state, ctx) {
        const matrix = {};
        state.ownCards.forEach((own, i) => {
            matrix[i] = {};
            state.opponentCards.forEach((opp, j) => {
                matrix[i][j] = {};
                ATTRIBUTES.forEach(attr => {
                    const ownValue = effectiveValue(own, opp, attr, ctx);
                    const opponentValue = effectiveValue(opp, own, attr, ctx);
                    matrix[i][j][attr] = { ownValue, opponentValue, margin: ownValue - opponentValue, result: ownValue > opponentValue ? "win" : ownValue < opponentValue ? "loss" : "tie" };
                });
            });
        });
        return matrix;
    }

    function analyzeOwnHand(state, matrix, ctx) {
        return state.ownCards.map((card, i) => {
            const all = [];
            Object.values(matrix[i] || {}).forEach(byAttr => ATTRIBUTES.forEach(a => all.push(byAttr[a].ownValue)));
            const synergy = evaluateSynergies(card, state.ownCards.concat(state.opponentCards), ctx.specialCards || []);
            const survival = avg(ATTRIBUTES.map(a => effectiveValue(card, null, a, ctx)));
            return { index: i, card, effective: Object.fromEntries(ATTRIBUTES.map(a => [a, effectiveValue(card, null, a, ctx)])), survival, strategicValue: avg(all) + synergy.value * 0.3, futureValue: survival + synergy.value * 0.45, synergy, vulnerabilities: ATTRIBUTES.filter(a => effectiveValue(card, null, a, ctx) < survival * 0.65) };
        });
    }

    function analyzeOpponent(memory) {
        const rounds = memory.rounds || [];
        const recent = rounds.slice(-8);
        const counts = Object.assign({}, memory.attributeUsage);
        const total = Math.max(1, Object.values(counts).reduce((a, b) => a + b, 0));
        const lastAttr = recent.length ? recent[recent.length - 1].playerAttribute : null;
        const repeats = recent.filter(r => r.playerAttribute === lastAttr).length;
        return { counts, total, repeatedAttribute: repeats >= 3 ? lastAttr : null, aggression: avg(recent.map(r => r.margin > 0 ? 1 : 0)), variation: new Set(recent.map(r => r.playerAttribute)).size / ATTRIBUTES.length };
    }

    function predictOpponentMove(state, memory, opponentModel, profile) {
        const raw = {};
        ATTRIBUTES.forEach(attr => { raw[attr] = 1 + (opponentModel.counts[attr] || 0) * profile.prediction; });
        if (opponentModel.repeatedAttribute) raw[opponentModel.repeatedAttribute] *= 1.25;
        const total = Object.values(raw).reduce((a, b) => a + b, 0);
        const beliefs = Object.fromEntries(ATTRIBUTES.map(a => [a, raw[a] / total]));
        memory.beliefs.attributes = beliefs;
        memory.confidence.prediction = clamp((opponentModel.total / 10) * profile.memory, 0.15, 0.86);
        return { attributes: beliefs, confidence: memory.confidence.prediction };
    }

    function evaluateThreats(state, ctx) {
        return state.opponentCards.map((card, index) => {
            const power = avg(ATTRIBUTES.map(a => effectiveValue(card, null, a, ctx)));
            const synergy = evaluateSynergies(card, state.ownCards.concat(state.opponentCards), ctx.specialCards || []).value;
            const consumible = (card.consumibles || []).filter(c => c.turnos > 0).reduce((s, c) => s + Math.max(0, c.valor || 0), 0);
            const score = power + synergy * 0.45 + consumible * 0.5;
            const level = score > 115 ? "crítica" : score > 85 ? "alta" : score > 55 ? "media" : score > 25 ? "baja" : "irrelevante";
            return { index, card, score, level };
        }).sort((a, b) => b.score - a.score);
    }

    function evaluateMove(move, state, hand, matrix, threats, prediction, profile, config) {
        const w = (config && config.weights) || AI_CONFIG.weights;
        const cardInfo = hand[move.index];
        const threat = threats.find(t => t.index === move.targetIndex) || threats[0] || { score: 0 };
        const matchup = matrix[move.index] && matrix[move.index][move.targetIndex] && matrix[move.index][move.targetIndex][move.attribute];
        const pAttr = prediction.attributes[move.attribute] || 0.2;
        const margin = matchup ? matchup.margin : effectiveValue(cardInfo.card, null, move.attribute, state) - avg(state.opponentCards.map(c => effectiveValue(c, cardInfo.card, move.attribute, state)));
        const winProb = clamp(0.5 + margin / 120, 0.03, 0.97) * (0.75 + pAttr);
        const lossProb = 1 - clamp(winProb, 0.01, 0.99);
        const reserveCost = cardInfo.futureValue > avg(hand.map(h => h.futureValue)) * 1.18 && state.opponentCards.length > 1 ? cardInfo.futureValue / 60 : 0;
        const sacrifice = margin < 0 && threat.score > cardInfo.futureValue * 1.25;
        const risk = clamp((lossProb * (1 - profile.riskTolerance)) + (Math.abs(margin) < 8 ? 0.25 : 0), 0, 1);
        const information = (1 - prediction.confidence) * (0.5 + pAttr) + (state.strategyState === "EQUILIBRADO" ? 0.4 : 0);
        const deception = profile.deception * (pAttr < 0.18 ? 0.7 : 0.2) + (sacrifice ? 0.35 : 0);
        const future = (cardInfo.futureValue / 45) * profile.planning - reserveCost;
        const score = (winProb * w.immediateWin) + (threat.score / 35 * w.enemyElimination * winProb) + (cardInfo.survival / 55 * w.ownSurvival * (1 - lossProb)) + (future * w.futurePosition) + (cardInfo.synergy.value / 50 * w.synergy) + (information * w.information) + (deception * w.deception) + (profile.adaptation * pAttr * w.psychological) + (threat.score / 80 * w.threatPressure * profile.aggression) + (sacrifice ? w.sacrificeValue : 0) + (Math.abs(margin) < 3 ? w.tieValue : 0) - (risk * w.riskCost) - (reserveCost * w.resourceCost);
        return Object.assign({}, move, { score, winProb, lossProb, risk, margin, threat, sacrifice, components: { information, deception, future, reserveCost } });
    }

    function chooseMove(evaluated, profile) {
        const sorted = evaluated.slice().sort((a, b) => b.score - a.score);
        const best = sorted[0];
        const pool = sorted.filter(m => best.score - m.score <= Math.max(0.35, Math.abs(best.score) * (profile.randomness || 0.06))).slice(0, 4);
        const weighted = pool.map(m => ({ m, w: Math.max(0.01, Math.exp((m.score - best.score) / 1.5)) }));
        let pick = Math.random() * weighted.reduce((s, x) => s + x.w, 0);
        for (const item of weighted) { pick -= item.w; if (pick <= 0) return item.m; }
        return best;
    }

    function decideAssignments(ctx, config) {
        const memory = ctx.memory || createMemory();
        const merged = Object.assign({}, AI_CONFIG, config || {});
        const profile = getProfile(merged);
        const state = analyzeGameState(ctx);
        const matrix = buildMatchupMatrix(state, ctx);
        const hand = analyzeOwnHand(state, matrix, ctx);
        const model = analyzeOpponent(memory);
        const prediction = predictOpponentMove(state, memory, model, profile);
        const threats = evaluateThreats(state, ctx);
        let candidates = [];
        ATTRIBUTES.forEach(attribute => state.ownCards.forEach((_, index) => state.opponentCards.forEach((__, targetIndex) => candidates.push({ attribute, index, targetIndex }))));
        let remaining = candidates.map(c => evaluateMove(c, state, hand, matrix, threats, prediction, profile, merged)).sort((a, b) => b.score - a.score).slice(0, merged.beamWidth || 45);
        const assignments = Object.assign({}, ctx.forcedAssignments || {});
        const used = new Set(Object.values(assignments));
        ATTRIBUTES.forEach(attribute => {
            if (assignments[attribute] !== undefined) return;
            const legal = remaining.filter(m => m.attribute === attribute && (state.ownCards.length < 5 || !used.has(m.index)));
            const chosen = chooseMove(legal.length ? legal : remaining.filter(m => m.attribute === attribute), profile);
            if (chosen) { assignments[attribute] = chosen.index; used.add(chosen.index); }
        });
        const alternatives = remaining.slice(0, 10);
        const chosenMoves = ATTRIBUTES.map(a => alternatives.find(m => m.attribute === a && m.index === assignments[a])).filter(Boolean);
        const debug = { chosenMove: assignments, score: avg(chosenMoves.map(m => m.score)), alternatives, estimatedWinProbability: avg(chosenMoves.map(m => m.winProb)), estimatedLossProbability: avg(chosenMoves.map(m => m.lossProb)), risk: avg(chosenMoves.map(m => m.risk)), strategyState: state.strategyState, predictedOpponentMove: prediction, opponentBeliefs: memory.beliefs, detectedPatterns: model, bluffProbability: clamp(profile.deception * (1 - prediction.confidence), 0, 1), targetCard: threats[0] && threats[0].card, reason: "Selección por utilidad estratégica: victoria esperada, amenazas, reserva, sacrificio, información, engaño y riesgo." };
        memory.lastDecisionDebug = debug;
        return { assignments, debug, memory, matrix, hand, threats, prediction };
    }

    function updateMemory(memory, roundInfo) {
        const m = memory || createMemory();
        m.rounds.push(roundInfo);
        if (m.rounds.length > AI_CONFIG.memoryLimit) m.rounds.shift();
        if (roundInfo.playerAttribute) m.attributeUsage[roundInfo.playerAttribute] = (m.attributeUsage[roundInfo.playerAttribute] || 0) + 1;
        if (roundInfo.playerCard) m.cardUsage[roundInfo.playerCard] = (m.cardUsage[roundInfo.playerCard] || 0) + 1;
        if (roundInfo.margin < -15) m.sacrifices.push(roundInfo);
        if (Math.abs(roundInfo.margin || 0) <= 8) m.bluffSignals.push({ round: roundInfo.round, hypothesis: ["sacrificio", "farol", "preparación", "error", "falta de recursos"] });
        return m;
    }

    function decideBet(ctx, config) {
        const profile = getProfile(config);
        const advantage = (ctx.estimatedAdvantage || 0) + (ctx.confidence || 0) * 20;
        if (advantage > 45 && profile.aggression > 0.5) return "subir";
        if (advantage > 15) return "apostar";
        if (advantage < -35 && profile.deception < 0.6) return "retirarse";
        if (advantage < -10 && profile.deception > 0.7) return "farolear";
        return "aceptar";
    }

    root.BestiarioAI = { AI_CONFIG, AI_DEBUG, ATTRIBUTES, createMemory, analyzeGameState, analyzeOwnHand, analyzeOpponent, buildMatchupMatrix, updateOpponentModel: updateMemory, predictOpponentMove, evaluateThreats, evaluateSynergies, evaluateMove, chooseMove, decideAssignments, updateMemory, decideBet };
    if (typeof module !== 'undefined') module.exports = root.BestiarioAI;
})(typeof window !== 'undefined' ? window : globalThis);
