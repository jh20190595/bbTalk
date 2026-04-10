export const KBO_TEAMS = [
  'KIA 타이거즈',
  '삼성 라이온즈',
  'LG 트윈스',
  '두산 베어스',
  'KT 위즈',
  'SSG 랜더스',
  '롯데 자이언츠',
  '한화 이글스',
  'NC 다이노스',
  '키움 히어로즈',
] as const

export type KboTeam = (typeof KBO_TEAMS)[number]

// 전체 팀명 → 달력 표시용 단축명
export const TEAM_SHORT: Record<string, string> = {
  'KIA 타이거즈': 'KIA',
  '삼성 라이온즈': '삼성',
  'LG 트윈스': 'LG',
  '두산 베어스': '두산',
  'KT 위즈': 'KT',
  'SSG 랜더스': 'SSG',
  '롯데 자이언츠': '롯데',
  '한화 이글스': '한화',
  'NC 다이노스': 'NC',
  '키움 히어로즈': '키움',
}

// 단축명 → 홈구장 키워드
export const HOME_STADIUM: Record<string, string> = {
  'KIA': '광주',
  '한화': '대전',
  'KT': '수원',
  '두산': '잠실',
  'LG': '잠실',
  '롯데': '사직',
  '삼성': '대구',
  '키움': '고척',
  'SSG': '문학',
  'NC': '창원',
}

export function isHomeStadium(stadium: string, teamShort: string): boolean {
  const keyword = HOME_STADIUM[teamShort]
  if (!keyword) return false
  return stadium.includes(keyword)
}
