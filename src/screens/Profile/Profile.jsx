import { useState, useRef } from 'react'
import { getBadge, getNextBadge } from '../../constants/badges.js'
import { typePillStyle } from '../../lib/utils.js'
import { upsertProfile } from '../../lib/supabase.js'
import { IcoLogout, IcoEdit } from '../../components/Icons.jsx'

export default function Profile({ user, onLogout, onDetail, showToast, updateNameLocal, updateAvatarLocal, onInvite }) {
  const [editMode, setEditMode]   = useState(false)
  const [nameInput, setNameInput] = useState(user?.name || '')
  const [saving, setSaving]       = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const fileRef = useRef(null)

  const badge     = getBadge(user?.score || 0)
  const nextBadge = getNextBadge(user?.score || 0)
  const watched   = user?.watched   || []
  const watchlist = user?.watchlist || []

  const pct = nextBadge
    ? Math.min(100, Math.round(((user?.score || 0) - badge.min) / (nextBadge.min - badge.min) * 100))
    : 100

  async function saveName() {
    const name = nameInput.trim()
    if (!name || name === user.name) { setEditMode(false); return }
    setSaving(true)
    try {
      await upsertProfile({ id: user.id, name })
      updateNameLocal(name)
      setEditMode(false)
      showToast('Nombre actualizado ✓')
    } catch {
      showToast('Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      updateAvatarLocal?.(ev.target.result)
      showToast('Foto actualizada ✓')
    }
    reader.readAsDataURL(file)
  }

  const listToShow = activeTab === 0 ? watched : watchlist

  return (
    <div className="prof-page">
      {/* Header */}
      <div className="prof-hd">
        {/* Avatar with photo upload */}
        <div className="prof-av" onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
          {user?.avatar
            ? <img src={user.avatar} alt="" />
            : <span>{user?.name?.[0]?.toUpperCase() || '?'}</span>
          }
          <div className="prof-av-overlay">📷</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
        </div>

        <div className="prof-info">
          <div className="prof-name-row">
            <h1 className="prof-name">{user?.name || 'Usuario'}</h1>
            <button
              className="prof-edit-btn"
              onClick={() => { setNameInput(user?.name || ''); setEditMode(true) }}
              aria-label="Editar nombre"
            >
              <IcoEdit />
            </button>
          </div>
          {user?.handle && <div className="prof-handle">@{user.handle}</div>}
        </div>

        <button className="prof-logout-btn" onClick={onLogout} aria-label="Cerrar sesión">
          <IcoLogout />
        </button>
      </div>

      {/* Edit name — shown below header when active */}
      {editMode && (
        <div className="prof-edit-panel">
          <input
            className="prof-name-input"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditMode(false) }}
            autoFocus
            placeholder="Tu nombre"
          />
          <div className="prof-edit-btns">
            <button className="prof-edit-cancel" onClick={() => setEditMode(false)}>Cancelar</button>
            <button className="btn btn-primary prof-save-btn" onClick={saveName} disabled={saving}>
              {saving ? '…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* Badge & score */}
      <div className="prof-badge-card">
        <div className="prof-badge-left">
          <div className="prof-badge-emoji">{badge.emoji}</div>
          <div>
            <div className="prof-badge-label">{badge.label}</div>
            <div className="prof-badge-pts">{user?.score || 0} puntos</div>
          </div>
        </div>
        {nextBadge && (
          <div className="prof-badge-progress">
            <div className="prof-badge-next">Siguiente: {nextBadge.emoji} {nextBadge.label}</div>
            <div className="prof-prog-bar">
              <div className="prof-prog-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="prof-prog-label">{pct}%</div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="prof-stats">
        <div className="prof-stat">
          <div className="prof-stat-n">{watched.length}</div>
          <div className="prof-stat-l">Vistas</div>
        </div>
        <div className="prof-stat">
          <div className="prof-stat-n">{watchlist.length}</div>
          <div className="prof-stat-l">Lista</div>
        </div>
        <div className="prof-stat">
          <div className="prof-stat-n">{user?.reviews?.length || 0}</div>
          <div className="prof-stat-l">Reseñas</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="prof-tabs">
        <button className={`prof-tab ${activeTab === 0 ? 'on' : ''}`} onClick={() => setActiveTab(0)}>
          Vistas ({watched.length})
        </button>
        <button className={`prof-tab ${activeTab === 1 ? 'on' : ''}`} onClick={() => setActiveTab(1)}>
          Mi lista ({watchlist.length})
        </button>
      </div>

      {/* Film grid */}
      <div className="prof-grid-wrap">
        {listToShow.length === 0 ? (
          <div className="prof-empty">
            <div className="prof-empty-icon">{activeTab === 0 ? '🎬' : '🔖'}</div>
            <div className="prof-empty-title">
              {activeTab === 0 ? 'Aún no has marcado películas' : 'Tu lista está vacía'}
            </div>
          </div>
        ) : (
          <div className="prof-grid">
            {listToShow.map((f, i) => {
              const pill = typePillStyle(f)
              return (
                <div
                  key={f.id || i}
                  className="prof-film-card"
                  onClick={() => onDetail(f, 'profile')}
                >
                  {f.poster
                    ? <img className="prof-poster" src={f.poster} alt={f.title} loading="lazy" />
                    : <div className="prof-poster-empty">🎬</div>
                  }
                  <div
                    className="prof-type-pill"
                    style={{ color: pill.color, background: pill.bg }}
                  >
                    {f.type || 'Película'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Invite section */}
      {user?.invite_code && (
        <div className="prof-invite">
          <div className="prof-invite-title">Invita a un amigo</div>
          <div className="prof-invite-sub">Ambos ganáis 50 puntos cuando se registre</div>
          <div className="prof-invite-code-row">
            <div className="prof-invite-code">{user.invite_code}</div>
            <button
              className="prof-invite-copy"
              onClick={() => {
                navigator.clipboard?.writeText(`https://zineclub.io?ref=${user.invite_code}`)
                showToast('Enlace copiado ✓')
              }}
            >
              Copiar enlace
            </button>
          </div>
          {onInvite && (
            <button className="prof-invite-share" onClick={onInvite}>
              ↗ Compartir invitación
            </button>
          )}
        </div>
      )}
    </div>
  )
}
