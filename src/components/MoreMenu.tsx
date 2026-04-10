import { useState, useRef, useEffect } from 'react'

interface MoreMenuProps {
  onReport: () => void
  onBlock: () => void
}

export function MoreMenu({ onReport, onBlock }: MoreMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', fontSize: 18, lineHeight: 1 }}
      >
        &#8942;
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', zIndex: 50,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 100, overflow: 'hidden',
        }}>
          <button
            onClick={() => { onReport(); setOpen(false) }}
            style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14 }}
          >
            신고
          </button>
          <button
            onClick={() => { onBlock(); setOpen(false) }}
            style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, color: '#e53e3e' }}
          >
            차단
          </button>
        </div>
      )}
    </div>
  )
}
