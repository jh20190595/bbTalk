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
