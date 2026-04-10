import { useState } from 'react'
import type { PollData } from '@/types/supabase'

const btnReset: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', lineHeight: 1,
}

interface PollCreatorProps {
  initial: PollData | null
  onDone: (poll: PollData) => void
  onClose: () => void
}

export function PollCreator({ initial, onDone, onClose }: PollCreatorProps) {
  const [options, setOptions] = useState<string[]>(initial?.options ?? ['', ''])
  const [multiple, setMultiple] = useState(initial?.multiple ?? false)

  function updateOption(i: number, val: string) {
    setOptions(prev => prev.map((o, idx) => (idx === i ? val : o)))
  }

  function addOption() {
    setOptions(prev => [...prev, ''])
  }

  function removeOption(i: number) {
    setOptions(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleDone() {
    const filled = options.filter(o => o.trim())
    if (filled.length < 2) {
      alert('항목을 2개 이상 입력해주세요.')
      return
    }
    onDone({ options: filled, multiple })
  }

  return (
    <div
      className="activity-slide-enter"
      style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 160, display: 'flex', flexDirection: 'column' }}
    >
      <header style={{
        display: 'flex', alignItems: 'center', padding: '0 8px', height: 52,
        borderBottom: '1px solid #e2e8f0', flexShrink: 0,
      }}>
        <button onClick={onClose} style={{ ...btnReset, fontSize: 18, color: '#555' }}>✕</button>
        <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 16 }}>투표</span>
        <button onClick={handleDone} style={{ ...btnReset, color: '#3182ce', fontWeight: 700, fontSize: 15 }}>완료</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={opt}
              onChange={e => updateOption(i, e.target.value)}
              placeholder={`항목 ${i + 1}`}
              style={{
                flex: 1, padding: '10px 12px',
                border: '1px solid #e2e8f0', borderRadius: 8,
                fontSize: 14, outline: 'none',
              }}
            />
            <button
              onClick={() => removeOption(i)}
              style={{
                ...btnReset, fontSize: 22, color: '#e53e3e', fontWeight: 700, flexShrink: 0,
                visibility: i >= 2 ? 'visible' : 'hidden',
              }}
            >
              −
            </button>
          </div>
        ))}

        <button
          onClick={addOption}
          style={{
            padding: '10px', border: '1px dashed #ccc', borderRadius: 8,
            background: 'none', cursor: 'pointer', fontSize: 14, color: '#555',
          }}
        >
          + 항목 추가
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 0', borderTop: '1px solid #eee', marginTop: 4,
        }}>
          <span style={{ fontSize: 14 }}>복수 선택 가능</span>
          <button
            onClick={() => setMultiple(v => !v)}
            style={{
              width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
              background: multiple ? '#3182ce' : '#ccc',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: multiple ? 23 : 3,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', display: 'block',
            }} />
          </button>
        </div>
      </div>
    </div>
  )
}

interface PollBoxProps {
  poll: PollData
  onEdit: () => void
  onDelete: () => void
}

export function PollBox({ poll, onEdit, onDelete }: PollBoxProps) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14 }}>
          <span>&#128202;</span>
          <span>투표</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onEdit} style={{ ...btnReset, fontSize: 16, color: '#555' }}>&#9998;</button>
          <button onClick={onDelete} style={{ ...btnReset, fontSize: 16, color: '#e53e3e' }}>&#128465;</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {poll.options.map((opt, i) => (
          <div
            key={i}
            style={{
              padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
              fontSize: 13, color: '#444', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{ color: '#bbb', fontSize: 12 }}>{poll.multiple ? '☐' : '○'}</span>
            {opt}
          </div>
        ))}
      </div>
      {poll.multiple && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>복수 선택 가능</div>
      )}
    </div>
  )
}
