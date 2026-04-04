import { useEffect, useRef, useState } from 'react'

const RECENT_KEY = 'bbtalk_recent_searches'
const MAX_RECENT = 20

export function loadRecents(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveRecents(list: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(list))
}

// ────────────────────────────────────────────────────────────
// 전체삭제 확인 모달
// ────────────────────────────────────────────────────────────
function ClearConfirmModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 14, padding: '24px 20px',
          width: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111', textAlign: 'center' }}>
          최근 검색어를 모두 삭제할까요?
        </p>
        <p style={{ margin: 0, fontSize: 13, color: '#888', textAlign: 'center' }}>
          삭제된 검색어는 복구할 수 없습니다.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 8,
              border: '1px solid #ddd', background: '#f7f7f7',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#333',
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 8,
              border: 'none', background: '#e53e3e',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff',
            }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 검색 오버레이
// ────────────────────────────────────────────────────────────
interface SearchOverlayProps {
  onClose: () => void
  onSearch: (query: string) => void
}

export function SearchOverlay({ onClose, onSearch }: SearchOverlayProps) {
  const [input, setInput] = useState('')
  const [recents, setRecents] = useState<string[]>(loadRecents)
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function submit(query: string) {
    const q = query.trim()
    if (!q) return
    const next = [q, ...recents.filter(r => r !== q)].slice(0, MAX_RECENT)
    setRecents(next)
    saveRecents(next)
    onSearch(q)
    onClose()
  }

  function removeRecent(item: string) {
    const next = recents.filter(r => r !== item)
    setRecents(next)
    saveRecents(next)
  }

  function clearAll() {
    setRecents([])
    saveRecents([])
    setClearModalOpen(false)
  }

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          animation: 'search-slide-in 280ms ease forwards',
        }}
      >
        {/* 상단 검색바 */}
        <div style={{
          height: 52, display: 'flex', alignItems: 'center',
          padding: '0 12px', gap: 8, borderBottom: '1px solid #eee',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 6px', display: 'flex', alignItems: 'center', color: '#333',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 4 6 10 13 16" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder="검색어를 입력하세요"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(input) }}
            style={{
              flex: 1, padding: '8px 12px', fontSize: 14,
              borderRadius: 8, border: '1px solid #ddd', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {input.length > 0 && (
            <button
              onClick={() => submit(input)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: '#3182ce', padding: '4px 2px',
                flexShrink: 0,
              }}
            >
              검색
            </button>
          )}
        </div>

        {/* 최근 검색 */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px 8px',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>최근 검색</span>
            {recents.length > 0 && (
              <button
                onClick={() => setClearModalOpen(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: '#888', padding: 0,
                }}
              >
                전체삭제
              </button>
            )}
          </div>

          {recents.length === 0 ? (
            <p style={{ padding: '12px 16px', fontSize: 13, color: '#aaa', margin: 0 }}>
              최근 검색어가 없습니다.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {recents.map(item => (
                <li
                  key={item}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '11px 16px', borderBottom: '1px solid #f5f5f5',
                  }}
                >
                  <button
                    onClick={() => submit(item)}
                    style={{
                      flex: 1, background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left',
                      fontSize: 14, color: '#222', padding: 0,
                    }}
                  >
                    {item}
                  </button>
                  <button
                    onClick={() => removeRecent(item)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '2px 4px', color: '#bbb', fontSize: 16, lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {clearModalOpen && (
        <ClearConfirmModal
          onCancel={() => setClearModalOpen(false)}
          onConfirm={clearAll}
        />
      )}
    </>
  )
}
