import { TEAM_COLOR, TEAM_SHORT } from '@/constants/teams'

interface TeamUniformProps {
  team: string   // 전체 팀명 또는 단축명
  size?: number  // 너비 px (기본 32)
}

// 유니폼(저지) SVG 아이콘. viewBox 0 0 40 44 기준
const JERSEY_PATH = 'M 14,2 L 5,7 L 0,15 L 10,17 L 10,42 L 30,42 L 30,17 L 40,15 L 35,7 L 26,2 L 20,13 Z'

export function TeamUniform({ team, size = 32 }: TeamUniformProps) {
  const short = TEAM_SHORT[team] ?? team
  const { bg, text } = TEAM_COLOR[short] ?? { bg: '#999', text: '#fff' }
  const height = Math.round(size * 44 / 40)
  const fontSize = Math.max(6, Math.round(11 * size / 32))
  const showLabel = size >= 20

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={short}
      style={{ flexShrink: 0 }}
    >
      <path d={JERSEY_PATH} fill={bg} />
      {showLabel && (
        <text
          x="20"
          y="31"
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="800"
          fill={text}
          fontFamily="sans-serif"
          dominantBaseline="middle"
        >
          {short}
        </text>
      )}
    </svg>
  )
}
