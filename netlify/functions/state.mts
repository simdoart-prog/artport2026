import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

// 예술무역항 2026 — 판매 현황 공용 저장소
// GET  /api/state        → 현재 판매 현황(JSON) 반환
// POST /api/state {patch} → 부분 갱신(작품/구매자/발행일/수집 병합 저장)

const KEY = "state";

function empty() {
  return { works: {}, buyers: {}, issue: {}, collected: {}, updatedAt: 0 };
}

export default async (req: Request) => {
  const store = getStore({ name: "atp26-sales", consistency: "strong" });

  if (req.method === "POST") {
    let patch: any = {};
    try { patch = await req.json(); } catch { patch = {}; }
    const cur = (await store.get(KEY, { type: "json" })) || empty();
    cur.works = { ...(cur.works || {}), ...(patch.works || {}) };
    cur.buyers = { ...(cur.buyers || {}), ...(patch.buyers || {}) };
    cur.issue = { ...(cur.issue || {}), ...(patch.issue || {}) };
    cur.collected = { ...(cur.collected || {}), ...(patch.collected || {}) };
    cur.updatedAt = Date.now();
    await store.setJSON(KEY, cur);
    return Response.json({ ok: true, updatedAt: cur.updatedAt });
  }

  const data = (await store.get(KEY, { type: "json" })) || empty();
  return Response.json(data);
};

export const config: Config = { path: "/api/state" };
