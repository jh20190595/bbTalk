import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface TeamRank {
  rank: number;
  team: string;
  games: number;
  win: number;
  lose: number;
  draw: number;
  win_rate: string;
  game_behind: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractText(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const res = await fetch(
    "https://www.koreabaseball.com/Record/TeamRank/TeamRankDaily.aspx",
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9",
        "Referer": "https://www.koreabaseball.com/",
      },
    },
  );

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: "KBO 순위 페이지 호출 실패" }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const html = await res.text();
  const rankings: TeamRank[] = [];

  // 순위 테이블 행 파싱 — 첫 번째 <td>가 숫자(1~10)인 <tr>을 찾는다
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cells: string[] = [];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(extractText(cellMatch[1]));
    }

    // 첫 셀이 1~10의 순위 숫자이고, 최소 8개 컬럼이 있을 때만 처리
    // 이미 해당 순위가 파싱된 경우 중복 제거 (다른 테이블에서 같은 숫자가 매칭될 수 있음)
    const rank = parseInt(cells[0], 10);
    if (cells.length >= 8 && /^([1-9]|10)$/.test(cells[0]) && !rankings.some(r => r.rank === rank)) {
      rankings.push({
        rank,
        team: cells[1],
        games: parseInt(cells[2], 10) || 0,
        win: parseInt(cells[3], 10) || 0,
        lose: parseInt(cells[4], 10) || 0,
        draw: parseInt(cells[5], 10) || 0,
        win_rate: cells[6],
        game_behind: cells[7],
      });
    }
  }

  if (rankings.length === 0) {
    return new Response(
      JSON.stringify({ error: "순위 데이터를 파싱할 수 없습니다" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify(rankings), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
