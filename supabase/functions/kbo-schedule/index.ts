import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface Game {
  date: string;
  home_team: string;
  away_team: string;
  stadium: string;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "done";
}

const HOME_STADIUM: Record<string, string> = {
  KIA: "광주",
  LG: "잠실",
  키움: "고척",
  SSG: "문학",
  두산: "잠실",
  롯데: "사직",
  NC: "창원",
  KT: "수원",
  삼성: "대구",
  한화: "대전",
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function parseGames(text: string, date: string): Game[] {
  const games: Game[] = [];

  // Done games: <li>TEAM1 <b>S1 : S2</b> TEAM2 <img...
  const doneRegex = /<li>(.+?)\s+<b>(\d+)\s*:\s*(\d+)<\/b>\s+(.+?)\s+<img/g;
  let match;
  while ((match = doneRegex.exec(text)) !== null) {
    const home_team = match[1].trim();
    games.push({
      date,
      home_team,
      away_team: match[4].trim(),
      stadium: HOME_STADIUM[home_team] ?? "",
      home_score: parseInt(match[2], 10),
      away_score: parseInt(match[3], 10),
      status: "done",
    });
  }

  // Scheduled games: <li>TEAM1 : TEAM2 [STADIUM]</li>
  const scheduledRegex = /<li>([^<[\]]+?)\s*:\s*([^<[\]]+?)\s*\[([^\]]+?)\]<\/li>/g;
  while ((match = scheduledRegex.exec(text)) !== null) {
    games.push({
      date,
      home_team: match[1].trim(),
      away_team: match[2].trim(),
      stadium: match[3].trim(),
      home_score: null,
      away_score: null,
      status: "scheduled",
    });
  }

  return games;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const year = url.searchParams.get("year");
  const month = url.searchParams.get("month");

  if (!year || !month) {
    return new Response(
      JSON.stringify({ error: "year, month 파라미터가 필요합니다." }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const gameMonth = month.padStart(2, "0");

  const body = new URLSearchParams({
    leId: "1",
    srIdList: "0,9,6",
    seasonId: year,
    gameMonth,
    teamId: "",
  });

  const kboRes = await fetch(
    "https://www.koreabaseball.com/ws/Schedule.asmx/GetMonthSchedule",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    },
  );

  if (!kboRes.ok) {
    return new Response(
      JSON.stringify({ error: "KBO API 호출 실패" }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const data = await kboRes.json();
  const rows: Array<{ row: Array<{ Text: string; Class: string | null }> }> =
    data.rows ?? [];

  const games: Game[] = [];

  for (const { row } of rows) {
    for (const cell of row) {
      const dayMatch = cell.Text.match(/<li class="dayNum">(\d+)<\/li>/);
      if (!dayMatch) continue;

      const day = dayMatch[1].padStart(2, "0");
      const date = `${year}${gameMonth}${day}`;

      games.push(...parseGames(cell.Text, date));
    }
  }

  return new Response(JSON.stringify(games), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
