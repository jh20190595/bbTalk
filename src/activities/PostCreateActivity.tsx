import { useState, useRef } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { useActivity } from '@stackflow/react'
import { useFlow } from '@/stackflow'
import { useCreatePost } from '@/hooks/usePosts'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import type { PollData } from '@/types/supabase'

type Params = { boardType: 'general' | 'team' }

const TOPICS = ['직관', '경기', '선수', '잡담'] as const
type Topic = (typeof TOPICS)[number]

// ─────────────────────────────────────────────
// 공통 버튼 스타일
// ─────────────────────────────────────────────
const btnReset: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', lineHeight: 1,
}

// ─────────────────────────────────────────────
// 투표 만들기 오버레이
// ─────────────────────────────────────────────
interface PollCreatorProps {
  initial: PollData | null
  onDone: (poll: PollData) => void
  onClose: () => void
}

function PollCreator({ initial, onDone, onClose }: PollCreatorProps) {
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
      style={{
        position: 'fixed', inset: 0, background: '#fff', zIndex: 160,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* 헤더 */}
      <header style={{
        display: 'flex', alignItems: 'center', padding: '0 8px', height: 52,
        borderBottom: '1px solid #e2e8f0', flexShrink: 0,
      }}>
        <button onClick={onClose} style={{ ...btnReset, fontSize: 18, color: '#555' }}>✕</button>
        <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 16 }}>투표</span>
        <button onClick={handleDone} style={{ ...btnReset, color: '#3182ce', fontWeight: 700, fontSize: 15 }}>완료</button>
      </header>

      {/* 항목 목록 */}
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
            {/* visibility:hidden 으로 공간 유지 → 모든 항목 너비 동일 */}
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

        {/* 복수 선택 토글 */}
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
              transition: 'left 0.2s',
              display: 'block',
            }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 투표 미리보기 박스
// ─────────────────────────────────────────────
interface PollBoxProps {
  poll: PollData
  onEdit: () => void
  onDelete: () => void
}

function PollBox({ poll, onEdit, onDelete }: PollBoxProps) {
  return (
    <div style={{
      border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, marginTop: 8,
    }}>
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
              fontSize: 13, color: '#444',
              display: 'flex', alignItems: 'center', gap: 8,
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

// ─────────────────────────────────────────────
// 메인 Activity
// ─────────────────────────────────────────────
const PostCreateActivity: ActivityComponentType<Params> = ({ params }) => {
  const { pop } = useFlow()
  const activity = useActivity()
  const user = useAuthStore((s) => s.user)
  const { mutate: createPost, isPending } = useCreatePost()

  const team = params.boardType === 'team' ? (user?.favorite_team ?? '') : '전체'

  const [topic, setTopic] = useState<Topic | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [poll, setPoll] = useState<PollData | null>(null)
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const slideClass =
    activity.transitionState === 'enter-active' ? 'activity-slide-enter' :
    activity.transitionState === 'exit-active'  ? 'activity-slide-exit'  : ''

  const isDirty = title.trim().length > 0 || content.trim().length > 0 || poll !== null || photos.length > 0

  function handleBack() {
    if (isDirty) {
      if (confirm('저장하지 않고 나가시겠습니까?')) pop()
    } else {
      pop()
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setPhotos(prev => [...prev, ...files].slice(0, 2))
    e.target.value = ''
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!user || !title.trim() || !content.trim()) return

    let photoUrls: string[] = []
    if (photos.length > 0) {
      setIsUploading(true)
      try {
        photoUrls = await Promise.all(photos.map(async (file) => {
          const ext = file.name.split('.').pop() ?? 'jpg'
          const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
          const { error } = await supabase.storage.from('post-images').upload(path, file)
          if (error) throw error
          const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path)
          return publicUrl
        }))
      } catch {
        alert('사진 업로드에 실패했습니다.')
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    createPost(
      {
        user_id: user.id, team, topic: topic ?? undefined,
        title: title.trim(), content: content.trim(),
        poll, photos: photoUrls.length > 0 ? photoUrls : null,
      },
      { onSuccess: () => pop() },
    )
  }

  const boardLabel = params.boardType === 'team' ? user?.favorite_team : '전체 게시판'

  return (
    <>
      <div
        className={slideClass}
        style={{
          position: 'fixed', inset: 0, background: '#fff', zIndex: 110,
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* 헤더 */}
        <header style={{
          display: 'flex', alignItems: 'center', padding: '0 8px', height: 52,
          borderBottom: '1px solid #e2e8f0', flexShrink: 0,
        }}>
          <button onClick={handleBack} style={{ ...btnReset, fontSize: 22, color: '#333' }}>&#8249;</button>
          <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 16, pointerEvents: 'none' }}>
            {boardLabel}
          </span>
          <button
            onClick={() => void handleSubmit()}
            disabled={isPending || isUploading || !title.trim() || !content.trim()}
            style={{
              ...btnReset,
              color: title.trim() && content.trim() ? '#3182ce' : '#aaa',
              fontWeight: 700, fontSize: 15,
            }}
          >
            {isUploading ? '업로드 중' : isPending ? '등록 중' : '완료'}
          </button>
        </header>

        {/* 스크롤 영역 */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* 주제 선택 */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
            {TOPICS.map(t => (
              <button
                key={t}
                onClick={() => setTopic(prev => (prev === t ? null : t))}
                style={{
                  padding: '5px 14px', borderRadius: 16, border: '1px solid',
                  fontSize: 13, cursor: 'pointer', background: 'none',
                  borderColor: topic === t ? '#3182ce' : '#e2e8f0',
                  color: topic === t ? '#3182ce' : '#888',
                  fontWeight: topic === t ? 700 : 400,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* 제목 */}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            style={{
              display: 'block', width: '100%', padding: '14px 16px',
              border: 'none', borderBottom: '1px solid #f5f5f5',
              fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box',
            }}
          />

          {/* 내용 */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={12}
            style={{
              display: 'block', width: '100%', padding: '14px 16px',
              border: 'none', resize: 'none', fontSize: 15,
              outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
            }}
          />

          {/* 투표 박스 */}
          {poll && (
            <div style={{ padding: '0 16px' }}>
              <PollBox
                poll={poll}
                onEdit={() => setShowPollCreator(true)}
                onDelete={() => setPoll(null)}
              />
            </div>
          )}

          {/* 사진 미리보기 */}
          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: 8, padding: '8px 16px' }}>
              {photos.map((file, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`사진 ${i + 1}`}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#333', color: '#fff', border: 'none',
                      cursor: 'pointer', fontSize: 11, lineHeight: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 툴바 */}
        <div style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '8px 12px', borderTop: '1px solid #e2e8f0',
          background: '#fff',
        }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
          <button
            onClick={() => photos.length < 2 && fileInputRef.current?.click()}
            style={{
              ...btnReset, fontSize: 22,
              color: photos.length >= 2 ? '#ccc' : '#555',
              cursor: photos.length >= 2 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 2,
            }}
            title={photos.length >= 2 ? '사진은 최대 2장까지 가능합니다' : '사진 추가'}
          >
            &#128247;
            <span style={{ fontSize: 11, color: photos.length >= 2 ? '#ccc' : '#888' }}>
              {photos.length}/2
            </span>
          </button>
          <button
            onClick={() => !poll && setShowPollCreator(true)}
            style={{
              ...btnReset, fontSize: 22,
              color: poll ? '#ccc' : '#555',
              cursor: poll ? 'default' : 'pointer',
            }}
            title={poll ? '투표는 1개만 가능합니다' : '투표 추가'}
          >
            &#128202;
          </button>
        </div>
      </div>

      {/* 투표 만들기 오버레이 */}
      {showPollCreator && (
        <PollCreator
          initial={poll}
          onDone={data => { setPoll(data); setShowPollCreator(false) }}
          onClose={() => setShowPollCreator(false)}
        />
      )}
    </>
  )
}

export default PostCreateActivity
