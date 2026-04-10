import { useState } from 'react'
import type { PollData } from '@/types/supabase'

export function PollView({ poll }: { poll: PollData }) {
  const [selected, setSelected] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setSelected(prev => {
      const next = new Set(prev)
      if (poll.multiple) {
        if (next.has(i)) next.delete(i); else next.add(i)
      } else {
        next.clear()
        if (!prev.has(i)) next.add(i)
      }
      return next
    })
  }

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
        <span>&#128202;</span>
        <span>투표</span>
        {poll.multiple && <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>복수 선택 가능</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {poll.options.map((opt, i) => {
          const on = selected.has(i)
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              style={{
                padding: '10px 12px', border: '1px solid',
                borderColor: on ? '#3182ce' : '#e2e8f0',
                borderRadius: 8,
                background: on ? '#ebf8ff' : 'none',
                cursor: 'pointer', textAlign: 'left', fontSize: 14,
                color: on ? '#3182ce' : '#444',
                fontWeight: on ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 13 }}>{poll.multiple ? (on ? '☑' : '☐') : (on ? '●' : '○')}</span>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
