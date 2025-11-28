"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePendingPredictions = updatePendingPredictions;
const prismaClient_1 = __importDefault(require("../prisma/prismaClient"));
const sportsApi_1 = require("./sportsApi");
function isFinished(short) {
    const s = (short || "").toUpperCase();
    return s === "FT" || s === "AET" || s === "PEN";
}
function evaluate(type, pred, gh, ga) {
    if (gh == null || ga == null)
        return false;
    const t = (type || "").toLowerCase();
    const p = (pred || "").toLowerCase().trim();
    const pn = p.replace(/\s+/g, "");
    if (t.includes("correct") || /^[0-9]+[-:][0-9]+$/.test(p)) {
        const m = p.match(/^(\d+)[-:](\d+)$/);
        if (!m)
            return false;
        return gh === Number(m[1]) && ga === Number(m[2]);
    }
    if (p === "home" || p === "home win" || p === "1" || p === "h")
        return gh > ga;
    if (p === "away" || p === "away win" || p === "2" || p === "a")
        return ga > gh;
    if (p === "draw" || p === "x")
        return gh === ga;
    if (t.includes("double") || pn === "1x" || pn === "x2" || pn === "12") {
        if (pn === "1x")
            return gh >= ga;
        if (pn === "x2")
            return ga >= gh;
        if (pn === "12")
            return gh !== ga;
    }
    if (t.includes("btts") || t.includes("both teams to score") || pn.startsWith("btts") || pn === "gg" || pn === "ng" || p === "yes" || p === "no") {
        const yes = pn === "gg" || pn === "bttsyes" || p === "yes" || t.includes("btts yes");
        const no = pn === "ng" || pn === "bttsno" || p === "no" || t.includes("btts no");
        if (yes)
            return gh > 0 && ga > 0;
        if (no)
            return gh === 0 || ga === 0;
    }
    if (t.includes("over") || t.includes("under") || /^o\d+(?:\.\d+)?$/.test(pn) || /^u\d+(?:\.\d+)?$/.test(pn) || /(over|under)\s*\d+(?:\.\d+)?/.test(p)) {
        let kind = null;
        let value = null;
        const m1 = p.match(/\b(over|under)\s*(\d+(?:\.\d+)?)\b/);
        if (m1) {
            kind = m1[1];
            value = parseFloat(m1[2]);
        }
        else {
            const m2 = pn.match(/^(o|u)(\d+(?:\.\d+)?)$/);
            if (m2) {
                kind = m2[1] === "o" ? "over" : "under";
                value = parseFloat(m2[2]);
            }
        }
        if (kind && value != null) {
            const total = gh + ga;
            if (kind === "over")
                return total > value;
            if (kind === "under")
                return total < value;
        }
    }
    return false;
}
async function updatePendingPredictions() {
    const pending = await prismaClient_1.default.prediction.findMany({ where: { status: "pending" } });
    let updated = 0, won = 0, lost = 0, skipped = 0, matchesFound = 0;
    const matchIds = [];
    for (const p of pending) {
        const fixture = await (0, sportsApi_1.findFixtureByTeamsAndDate)(p.homeTeam, p.awayTeam, p.date);
        if (!fixture || !fixture.id) {
            skipped++;
            continue;
        }
        matchIds.push({ predictionId: p.id, matchId: fixture.id });
        const finished = isFinished(fixture.statusShort);
        if (!finished) {
            matchesFound++;
            continue;
        }
        const status = evaluate(p.predictionType, p.prediction, fixture.goalsHome, fixture.goalsAway) ? "won" : "lost";
        await prismaClient_1.default.prediction.update({ where: { id: p.id }, data: { status } });
        updated++;
        if (status === "won")
            won++;
        else
            lost++;
    }
    return { updated, won, lost, skipped, matchesFound, matchIds };
}
