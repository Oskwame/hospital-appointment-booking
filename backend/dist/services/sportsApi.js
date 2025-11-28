"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFixtureByTeamsAndDate = findFixtureByTeamsAndDate;
exports.getFixtureById = getFixtureById;
const BASE_URL = `https://${(process.env.SPORTS_API_HOST || "v3.football.api-sports.io").replace(/^https?:\/\//, "")}`;
async function apiGet(path, params) {
    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
        for (const [k, v] of Object.entries(params))
            url.searchParams.append(k, v);
    }
    const res = await fetch(url.toString(), {
        headers: {
            "x-apisports-key": process.env.SPORTS_API_KEY,
            accept: "application/json",
        },
    });
    if (!res.ok)
        throw new Error(`sports api ${res.status}`);
    const json = await res.json();
    return json;
}
function normalize(s) {
    return s.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");
}
async function findFixtureByTeamsAndDate(homeTeam, awayTeam, date) {
    const resp = await apiGet("/fixtures", { date });
    const fixtures = resp.response || resp.fixtures || [];
    const match = fixtures.find((f) => {
        const h = f?.teams?.home?.name || f?.home?.name || "";
        const a = f?.teams?.away?.name || f?.away?.name || "";
        return normalize(h) === normalize(homeTeam) && normalize(a) === normalize(awayTeam);
    });
    if (!match)
        return null;
    const id = match?.fixture?.id ?? match?.id;
    const statusShort = match?.fixture?.status?.short ?? match?.status?.short ?? "";
    const goalsHome = match?.goals?.home ?? match?.score?.fulltime?.home ?? null;
    const goalsAway = match?.goals?.away ?? match?.score?.fulltime?.away ?? null;
    const homeName = match?.teams?.home?.name ?? "";
    const awayName = match?.teams?.away?.name ?? "";
    return { id, statusShort, goalsHome, goalsAway, homeName, awayName };
}
async function getFixtureById(fixtureId) {
    const resp = await apiGet("/fixtures", { id: String(fixtureId) });
    const f = (resp.response || [])[0];
    if (!f)
        return null;
    const id = f?.fixture?.id ?? f?.id;
    const statusShort = f?.fixture?.status?.short ?? f?.status?.short ?? "";
    const goalsHome = f?.goals?.home ?? f?.score?.fulltime?.home ?? null;
    const goalsAway = f?.goals?.away ?? f?.score?.fulltime?.away ?? null;
    const homeName = f?.teams?.home?.name ?? "";
    const awayName = f?.teams?.away?.name ?? "";
    return { id, statusShort, goalsHome, goalsAway, homeName, awayName };
}
