'use client'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabase'

const BREVET_DATE = new Date('2026-06-29T08:00:00')

// ─── Badge System ───
const BADGES = [
  { id: 'diamond', name: 'Diamant', emoji: '💎', min: 20, color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'gold', name: 'Or', emoji: '🥇', min: 15, color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'silver', name: 'Argent', emoji: '🥈', min: 10, color: '#64748B', bg: '#F1F5F9' },
  { id: 'bronze', name: 'Bronze', emoji: '🥉', min: 3, color: '#C2410C', bg: '#FFF7ED' },
]
function getBadge(count) { return BADGES.find(b => count >= b.min) || null }
function getNextBadge(count) { return [...BADGES].reverse().find(b => count < b.min) || null }

// ─── Fun Facts ───
const FUN_FACTS = [
  "Le nombre π a été calculé à plus de 100 000 milliards de décimales !",
  "Le mot « calcul » vient du latin « calculus » qui signifie... petit caillou.",
  "Un googol, c'est 10 puissance 100. C'est de là que vient le nom Google !",
  "Le symbole = a été inventé en 1557 par Robert Recorde.",
  "Il existe des nombres premiers jumeaux : 11 et 13, 17 et 19, 29 et 31...",
  "Le triangle de Pascal cache la suite de Fibonacci !",
  "Pythagore pensait que les nombres gouvernaient l'univers.",
  "Le zéro a été inventé en Inde au 7e siècle.",
  "En anglais, le théorème de Thalès s'appelle « Basic Proportionality Theorem ».",
  "La probabilité d'avoir le même anniversaire dans un groupe de 23 personnes est supérieure à 50% !",
  "Le nombre d'or (1,618...) se retrouve dans la nature : coquillages, tournesols, galaxies...",
  "Al-Khwarizmi, un savant musulman du 9e siècle, est le père de l'algèbre. Le mot « algorithme » vient de son nom !",
  "111 111 111 × 111 111 111 = 12 345 678 987 654 321. Magique !",
  "La somme des angles d'un triangle fait toujours 180°, peu importe le triangle.",
  "Le chiffre 7 est considéré comme le nombre préféré au monde dans toutes les cultures.",
]

// ─── Icons ───
const IC = {
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  book: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  target: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  play: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  checkCircle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  lock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  chev: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  chevDown: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  pdf: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  star: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  starFill: <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  dash: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  game: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/></svg>,
  menu: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  arrowLeft: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  arrowRight: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
}

// ─── Helpers ───
function ProgressBar({ value, max, height = 8 }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (<div style={{ background: 'var(--border)', borderRadius: 20, height, overflow: 'hidden', width: '100%' }}>
    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-dark))', borderRadius: 20, transition: 'width 0.5s ease' }} />
  </div>)
}

function Countdown() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t) }, [])
  const diff = BREVET_DATE - now
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  return <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{days} jours</span>
}

function Modal({ title, children, onClose }) {
  return (<div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header"><h2 className="modal-title">{title}</h2><div onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-sec)' }}>{IC.close}</div></div>
      {children}
    </div>
  </div>)
}

function Toast({ message }) { return <div className="toast">{IC.check} {message}</div> }

// ═══════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════
function LoginPage({ onLogin }) {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)
  const go = async (e) => { e.preventDefault(); setErr(''); setLoading(true); await onLogin(u.trim(), p.trim(), setErr); setLoading(false) }
  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 20 }}>B</div>
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>Brevet <span style={{ color: 'var(--accent)' }}>Booster</span></span>
        </div>
        <p style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 32 }}>Connecte-toi pour accéder à ta formation</p>
        {err && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, marginBottom: 16 }}>{err}</div>}
        <form onSubmit={go}>
          <div className="form-group"><label className="form-label">Identifiant</label><input className="form-input" value={u} onChange={e => setU(e.target.value)} placeholder="Ton identifiant" /></div>
          <div className="form-group"><label className="form-label">Mot de passe</label><input className="form-input" type="password" value={p} onChange={e => setP(e.target.value)} placeholder="Ton mot de passe" /></div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 700, borderRadius: 12 }} disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// COURSE SIDEBAR (Schoolmaker style)
// ═══════════════════════════════════════
function CourseSidebar({ parts, lessons, completedLessons, currentLesson, onSelectLesson, onNavigate, currentPage, onLogout, mobileOpen, setMobileOpen }) {
  const [openParts, setOpenParts] = useState({})

  const togglePart = (partId) => setOpenParts(prev => ({ ...prev, [partId]: !prev[partId] }))

  const totalLessons = lessons.length
  const doneLessons = completedLessons.length
  const pct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0

  const badge = getBadge(doneLessons)

  return (
    <div className={`course-sidebar ${mobileOpen ? 'open' : ''}`}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 14 }}>B</div>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Brevet <span style={{ color: 'var(--accent)' }}>Booster</span></span>
          </div>
          <div className="mobile-close" onClick={() => setMobileOpen(false)} style={{ cursor: 'pointer', color: 'var(--text-sec)', display: 'none' }}>{IC.close}</div>
        </div>
        {/* Global progress */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sec)' }}>Progression</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace' }}>{pct}%</span>
          </div>
          <ProgressBar value={doneLessons} max={totalLessons} height={6} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-sec)' }}>{doneLessons}/{totalLessons} leçons</span>
            {badge && <span style={{ fontSize: 11 }}>{badge.emoji} {badge.name}</span>}
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'course', icon: IC.book, label: 'Formation' },
          { id: 'dashboard', icon: IC.home, label: 'Accueil' },
          { id: 'games', icon: IC.game, label: 'Jeux' },
          { id: 'prep', icon: IC.target, label: 'Prépa' },
        ].map(tab => (
          <div key={tab.id} onClick={() => { onNavigate(tab.id); setMobileOpen(false) }}
            style={{ flex: 1, padding: '12px 4px', textAlign: 'center', cursor: 'pointer', borderBottom: currentPage === tab.id ? '2px solid var(--accent)' : '2px solid transparent', color: currentPage === tab.id ? 'var(--accent)' : 'var(--text-sec)', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              {tab.icon}
              <span style={{ fontSize: 10, fontWeight: 600 }}>{tab.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Course tree (only shown when on course page) */}
      {currentPage === 'course' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {parts.map(part => {
            const isOpen = openParts[part.id] !== false
            const partChapters = (part.chapters || [])
            const partLessons = partChapters.flatMap(ch => (ch.lessons || []))
            const partDone = partLessons.filter(l => completedLessons.includes(l.id)).length
            return (
              <div key={part.id}>
                {/* Part header */}
                <div onClick={() => togglePart(part.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', cursor: 'pointer', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{part.emoji || '📘'}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{part.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-sec)' }}>{partDone}/{partLessons.length} leçons</div>
                    </div>
                  </div>
                  <div style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-sec)' }}>{IC.chevDown}</div>
                </div>
                {/* Chapters + Lessons */}
                {isOpen && partChapters.map(ch => {
                  const chLessons = ch.lessons || []
                  const chDone = chLessons.filter(l => completedLessons.includes(l.id)).length
                  const allDone = chLessons.length > 0 && chDone === chLessons.length
                  return (
                    <div key={ch.id}>
                      {/* Chapter header */}
                      <div style={{ padding: '8px 20px 4px 36px', fontSize: 12, fontWeight: 700, color: allDone ? 'var(--success)' : 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {allDone && <span style={{ color: 'var(--success)' }}>{IC.checkCircle}</span>}
                        {ch.title}
                      </div>
                      {/* Lessons */}
                      {chLessons.map((lesson, li) => {
                        const isDone = completedLessons.includes(lesson.id)
                        const isActive = currentLesson?.id === lesson.id
                        return (
                          <div key={lesson.id} onClick={() => { onSelectLesson(lesson); setMobileOpen(false) }}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px 10px 44px', cursor: 'pointer', background: isActive ? 'var(--accent-bg)' : 'transparent', borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent', transition: 'all 0.15s' }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', border: isDone ? 'none' : '2px solid var(--border)', background: isDone ? 'var(--success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {isDone && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--accent)' : isDone ? 'var(--text-sec)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.title}</div>
                              {lesson.duration_minutes > 0 && <div style={{ fontSize: 11, color: 'var(--text-sec)' }}>{lesson.duration_minutes} min</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* Logout */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sec)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', padding: '8px 0' }}>
          {IC.logout} Déconnexion
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// LESSON VIEWER (main content area)
// ═══════════════════════════════════════
function LessonViewer({ lesson, chapter, isCompleted, onToggleComplete, onNext, onPrev, hasPrev, hasNext }) {
  if (!lesson) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>📚</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Bienvenue dans ta formation</h2>
      <p style={{ color: 'var(--text-sec)', fontSize: 14, maxWidth: 400 }}>Sélectionne une leçon dans le menu à gauche pour commencer à réviser.</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 12 }}>
        {chapter?.title} <span style={{ margin: '0 6px' }}>›</span> <span style={{ color: 'var(--text)' }}>{lesson.title}</span>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6, color: 'var(--text)' }}>{lesson.title}</h1>
      {lesson.description && <p style={{ fontSize: 14, color: 'var(--text-sec)', marginBottom: 20, lineHeight: 1.6 }}>{lesson.description}</p>}

      {/* Video player */}
      {lesson.video_url && lesson.video_url !== '' ? (
        <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 24, background: '#000', position: 'relative', paddingBottom: '56.25%' }}>
          <iframe src={lesson.video_url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
        </div>
      ) : (
        <div style={{ borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--border)', padding: '60px 20px', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎥</div>
          <p style={{ color: 'var(--text-sec)', fontSize: 14 }}>Vidéo bientôt disponible</p>
        </div>
      )}

      {/* Resources (PDFs from the chapter) */}
      {chapter && (chapter.pdf_url || chapter.detailed_pdf_url || chapter.exercises_pdf_url || chapter.eval_pdf_url) && (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Ressources du chapitre</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {chapter.pdf_url && chapter.pdf_url !== '' && <a href={chapter.pdf_url} target="_blank" rel="noreferrer" className="badge badge-success row gap-sm" style={{ textDecoration: 'none', cursor: 'pointer', padding: '8px 14px' }}>{IC.pdf} Cours simplifié</a>}
            {chapter.detailed_pdf_url && chapter.detailed_pdf_url !== '' && <a href={chapter.detailed_pdf_url} target="_blank" rel="noreferrer" className="badge badge-video row gap-sm" style={{ textDecoration: 'none', cursor: 'pointer', padding: '8px 14px' }}>{IC.pdf} Cours développé</a>}
            {chapter.exercises_pdf_url && chapter.exercises_pdf_url !== '' && <a href={chapter.exercises_pdf_url} target="_blank" rel="noreferrer" className="badge badge-pdf row gap-sm" style={{ textDecoration: 'none', cursor: 'pointer', padding: '8px 14px' }}>{IC.pdf} Exercices</a>}
            {chapter.eval_pdf_url && chapter.eval_pdf_url !== '' && <a href={chapter.eval_pdf_url} target="_blank" rel="noreferrer" className="badge row gap-sm" style={{ textDecoration: 'none', cursor: 'pointer', padding: '8px 14px', background: '#FEF3C7', color: '#92400E' }}>{IC.pdf} Auto-éval</a>}
          </div>
        </div>
      )}

      {/* Complete button + navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={onToggleComplete} className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`} style={{ width: '100%', padding: 16, fontSize: 15, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {isCompleted ? <>{IC.checkCircle} Terminé ✓</> : <>Marquer comme terminé</>}
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onPrev} disabled={!hasPrev} className="btn btn-secondary" style={{ flex: 1, padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: hasPrev ? 1 : 0.4 }}>
            {IC.arrowLeft} Précédent
          </button>
          <button onClick={onNext} disabled={!hasNext} className="btn btn-primary" style={{ flex: 1, padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: hasNext ? 1 : 0.4 }}>
            Suivant {IC.arrowRight}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// DASHBOARD (Welcome page)
// ═══════════════════════════════════════
function DashboardPage({ completedLessons, totalLessons, streak, onNavigate }) {
  const pct = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0
  const badge = getBadge(completedLessons.length)
  const next = getNextBadge(completedLessons.length)
  const [funFact] = useState(() => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)])

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>Bienvenue sur Brevet Booster</h1>
      <p style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 24 }}>Brevet de maths le 29 juin 2026 — dans <Countdown /></p>

      {/* Fun fact */}
      <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>🧠</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Le savais-tu ?</div>
          <div style={{ fontSize: 13, color: '#3730A3', lineHeight: 1.5 }}>{funFact}</div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ padding: 22, textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent)', lineHeight: 1 }}>{pct}%</div>
          <div style={{ margin: '10px 0' }}><ProgressBar value={completedLessons.length} max={totalLessons} height={8} /></div>
          <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>{completedLessons.length}/{totalLessons} leçons</div>
        </div>
        <div className="card" style={{ padding: 22, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>🔥</div>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: '#F59E0B' }}>{streak.current_streak || 0}</div>
          <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>jour{(streak.current_streak || 0) > 1 ? 's' : ''} de suite</div>
          {(streak.best_streak || 0) > 0 && <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>Record : {streak.best_streak} 🏆</div>}
        </div>
      </div>

      {/* Badge */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>{badge ? badge.emoji : '🏅'}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: badge ? badge.color : 'var(--text-sec)' }}>{badge ? badge.name : 'Pas encore de badge'}</div>
              {next && <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>Prochain : {next.emoji} {next.name} → encore {next.min - completedLessons.length} leçon{next.min - completedLessons.length > 1 ? 's' : ''}</div>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-around', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          {[...BADGES].reverse().map(b => (
            <div key={b.id} style={{ textAlign: 'center', opacity: completedLessons.length >= b.min ? 1 : 0.3 }}>
              <div style={{ fontSize: 22 }}>{b.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: completedLessons.length >= b.min ? b.color : 'var(--text-sec)' }}>{b.min}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick action */}
      <button onClick={() => onNavigate('course')} className="btn btn-primary" style={{ width: '100%', padding: 16, fontSize: 16, borderRadius: 14 }}>
        📚 Continuer la formation
      </button>
    </div>
  )
}

// ═══════════════════════════════════════
// GAMES PAGE (kept from V1)
// ═══════════════════════════════════════
function GameTimer({ timeLeft, total }) {
  const pct = total > 0 ? (timeLeft / total) * 100 : 0
  const color = timeLeft > 20 ? 'var(--success)' : timeLeft > 10 ? 'var(--orange)' : 'var(--danger)'
  return (<div style={{ width: '100%', background: 'var(--border)', borderRadius: 20, height: 12, overflow: 'hidden' }}>
    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 20, transition: 'width 1s linear' }} />
  </div>)
}

function MathGame({ userId, type, title, emoji, generateQuestion, onBack }) {
  const [state, setState] = useState('ready')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [question, setQuestion] = useState(null)
  const [input, setInput] = useState('')
  const [record, setRecord] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    (async () => { try { const { data } = await supabase.from('game_records').select('best_score').eq('user_id', userId).eq('game_type', type).single(); if (data) setRecord(data.best_score) } catch {} })()
  }, [userId, type])

  const newQ = useCallback(() => { setQuestion(generateQuestion()); setInput(''); setFeedback(null); setTimeout(() => inputRef.current?.focus(), 50) }, [generateQuestion])

  const start = () => { setState('playing'); setScore(0); setTimeLeft(60); newQ() }

  useEffect(() => {
    if (state !== 'playing' || timeLeft <= 0) {
      if (state === 'playing' && timeLeft <= 0) {
        setState('done');
        (async () => { try { const { data } = await supabase.from('game_records').select('best_score').eq('user_id', userId).eq('game_type', type).single(); if (data) { if (score > data.best_score) await supabase.from('game_records').update({ best_score: score }).eq('user_id', userId).eq('game_type', type) } else { await supabase.from('game_records').insert({ user_id: userId, game_type: type, best_score: score }) }; if (score > record) setRecord(score) } catch {} })()
      }
      return
    }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, state, score, userId, type, record])

  const check = () => {
    if (!input || !question) return
    if (parseInt(input, 10) === question.answer) { setScore(p => p + 1); setFeedback('correct'); setTimeout(() => newQ(), 250) }
    else { setFeedback('wrong'); setTimeout(() => setFeedback(null), 400); setInput('') }
  }

  if (state === 'ready') return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 50, marginBottom: 12 }}>{emoji}</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{title}</h2>
      <p style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 16 }}>60 secondes pour un max de bonnes réponses !</p>
      {record > 0 && <p style={{ color: 'var(--orange)', fontWeight: 700, marginBottom: 16 }}>🏆 Record : {record}</p>}
      <button className="btn btn-primary" onClick={start} style={{ padding: '14px 40px', fontSize: 15 }}>C&apos;est parti !</button>
      <div style={{ marginTop: 12 }}><button className="btn btn-secondary btn-sm" onClick={onBack}>Retour</button></div>
    </div>
  )
  if (state === 'done') return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 50, marginBottom: 12 }}>{score > record ? '🎉' : '⏱️'}</div>
      <div style={{ fontSize: 42, fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent)' }}>{score}</div>
      <p style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 4 }}>bonnes réponses</p>
      {score > record && <p style={{ color: 'var(--success)', fontWeight: 700, marginBottom: 12 }}>Nouveau record !</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
        <button className="btn btn-primary" onClick={start}>Rejouer</button>
        <button className="btn btn-secondary" onClick={onBack}>Retour</button>
      </div>
    </div>
  )
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-sec)' }}>Score : <span style={{ color: 'var(--accent)', fontSize: 18, fontWeight: 800 }}>{score}</span></span>
        <span style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace', color: timeLeft <= 10 ? 'var(--danger)' : 'var(--text)' }}>{timeLeft}s</span>
      </div>
      <GameTimer timeLeft={timeLeft} total={60} />
      <div style={{ textAlign: 'center', padding: '36px 0' }}>
        <div style={{ fontSize: 42, fontWeight: 900, fontFamily: 'monospace', marginBottom: 20 }}>{question?.display} = ?</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <input ref={inputRef} type="number" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} autoFocus
            style={{ width: 120, padding: '12px 16px', fontSize: 22, fontWeight: 800, textAlign: 'center', borderRadius: 12, border: `3px solid ${feedback === 'correct' ? 'var(--success)' : feedback === 'wrong' ? 'var(--danger)' : 'var(--border)'}`, background: feedback === 'correct' ? 'var(--success-bg)' : feedback === 'wrong' ? 'var(--danger-bg)' : 'white', outline: 'none', fontFamily: 'monospace' }} />
          <button className="btn btn-primary" onClick={check} style={{ padding: '12px 20px' }}>OK</button>
        </div>
      </div>
    </div>
  )
}

function GamesPage({ userId }) {
  const [active, setActive] = useState(null)
  const [records, setRecords] = useState({})
  useEffect(() => { (async () => { try { const { data } = await supabase.from('game_records').select('game_type, best_score').eq('user_id', userId); const m = {}; (data || []).forEach(r => m[r.game_type] = r.best_score); setRecords(m) } catch {} })() }, [userId, active])

  const multiGen = useCallback(() => { const a = Math.floor(Math.random() * 10) + 2, b = Math.floor(Math.random() * 10) + 2; return { display: `${a} × ${b}`, answer: a * b } }, [])
  const calcGen = useCallback(() => { const ops = ['+', '-', '×']; const op = ops[Math.floor(Math.random() * 3)]; let a, b; if (op === '×') { a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2 } else { a = Math.floor(Math.random() * 50) + 10; b = Math.floor(Math.random() * 50) + 10 }; if (op === '-' && a < b) { const t = a; a = b; b = t }; return { display: `${a} ${op} ${b}`, answer: op === '+' ? a + b : op === '-' ? a - b : a * b } }, [])

  if (active === 'multi') return <div className="card" style={{ padding: 0, overflow: 'hidden' }}><MathGame userId={userId} type="multiplication" title="Tables de multiplication" emoji="✖️" generateQuestion={multiGen} onBack={() => setActive(null)} /></div>
  if (active === 'calc') return <div className="card" style={{ padding: 0, overflow: 'hidden' }}><MathGame userId={userId} type="calcul_mental" title="Calcul mental" emoji="🧮" generateQuestion={calcGen} onBack={() => setActive(null)} /></div>

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Jeux</h1>
      <p style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 24 }}>Entraîne-toi en t&apos;amusant et bats tes records !</p>
      {[{ id: 'multi', emoji: '✖️', title: 'Tables de multiplication', desc: '60s de multiplications', color: '#7C3AED', bg: '#EDE9FE', rec: records.multiplication },
        { id: 'calc', emoji: '🧮', title: 'Calcul mental', desc: 'Additions, soustractions, multiplications', color: '#2563EB', bg: '#DBEAFE', rec: records.calcul_mental }
      ].map(g => (
        <div key={g.id} className="card" onClick={() => setActive(g.id)} style={{ padding: 22, cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{g.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{g.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>{g.desc}</div>
          </div>
          {g.rec > 0 && <div style={{ padding: '4px 12px', borderRadius: 16, background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 700 }}>🏆 {g.rec}</div>}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════
// PREP PAGE (Simulator + modules)
// ═══════════════════════════════════════
function PrepPage() {
  // Simplified prep page with simulator
  const [cc, setCc] = useState(''); const [francais, setFrancais] = useState(''); const [maths, setMaths] = useState(''); const [hg, setHg] = useState(''); const [emc, setEmc] = useState(''); const [sciences, setSciences] = useState(''); const [oral, setOral] = useState('')
  const parse = v => { const n = parseFloat(v); return isNaN(n) ? null : Math.min(20, Math.max(0, n)) }
  const result = useMemo(() => {
    const ccVal = parse(cc); if (ccVal === null) return null
    const notes = [{val:parse(francais),coef:2},{val:parse(maths),coef:2},{val:parse(hg),coef:1.5},{val:parse(emc),coef:0.5},{val:parse(sciences),coef:2},{val:parse(oral),coef:2}]
    const filled = notes.filter(n => n.val !== null); if (filled.length === 0) return { moyenne: ccVal * 0.4, partial: true }
    const ep = filled.reduce((a, n) => a + n.val * n.coef, 0) / filled.reduce((a, n) => a + n.coef, 0)
    const moy = ccVal * 0.4 + ep * 0.6
    let mention = moy >= 18 ? 'Très bien avec félicitations 🎉' : moy >= 16 ? 'Très bien' : moy >= 14 ? 'Bien' : moy >= 12 ? 'Assez bien' : moy >= 10 ? 'Admis' : 'Non admis'
    return { moyenne: Math.round(moy * 100) / 100, mention, partial: filled.length < 6 }
  }, [cc, francais, maths, hg, emc, sciences, oral])
  const is = { width: '100%', padding: '10px 12px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15, fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'monospace', background: 'var(--bg)' }
  const ls = { fontSize: 11, fontWeight: 700, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'block' }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Préparation Brevet</h1>
      <p style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 24 }}>Simulateur de note officiel du brevet 2026</p>
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>① Contrôle continu (40%)</h3>
        <div style={{ marginBottom: 16 }}><label style={ls}>Moyenne générale /20</label><input type="number" step="0.1" min="0" max="20" placeholder="12.5" value={cc} onChange={e => setCc(e.target.value)} style={is} /></div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>② Épreuves finales (60%)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[['Français (×2)', francais, setFrancais], ['Maths (×2)', maths, setMaths], ['HG (×1.5)', hg, setHg], ['EMC (×0.5)', emc, setEmc], ['Sciences (×2)', sciences, setSciences], ['Oral (×2)', oral, setOral]].map(([l, v, s]) => (
            <div key={l}><label style={ls}>{l}</label><input type="number" step="0.5" min="0" max="20" placeholder="/20" value={v} onChange={e => s(e.target.value)} style={is} /></div>
          ))}
        </div>
        {result && (
          <div style={{ marginTop: 20, textAlign: 'center', padding: 20, background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)' }}>
            {result.partial && <p style={{ fontSize: 11, color: 'var(--text-sec)', marginBottom: 6 }}>⚠️ Estimation partielle</p>}
            <div style={{ fontSize: 42, fontWeight: 900, fontFamily: 'monospace', color: result.moyenne >= 10 ? 'var(--accent)' : 'var(--danger)' }}>{result.moyenne.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 10 }}>/20</div>
            <div style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 20, fontSize: 14, fontWeight: 800, color: 'white', background: result.moyenne >= 16 ? '#F59E0B' : result.moyenne >= 14 ? 'var(--accent)' : result.moyenne >= 10 ? 'var(--success)' : 'var(--danger)' }}>{result.mention}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// ADMIN PAGES
// ═══════════════════════════════════════
function AdminDashboard({ students, parts, lessons }) {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Administration</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Élèves</div><div className="stat-value" style={{ color: 'var(--accent)' }}>{students.filter(s => s.active).length}</div></div>
        <div className="stat-card"><div className="stat-label">Chapitres</div><div className="stat-value" style={{ color: 'var(--success)' }}>{parts.reduce((a, p) => a + (p.chapters?.length || 0), 0)}</div></div>
        <div className="stat-card"><div className="stat-label">Leçons</div><div className="stat-value" style={{ color: 'var(--orange)' }}>{lessons.length}</div></div>
      </div>
      <div className="card">
        <div className="card-header">Élèves</div>
        {students.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</span>
            <span className={`badge ${s.active ? 'badge-success' : 'badge-danger'}`}>{s.active ? 'Actif' : 'Inactif'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminStudents({ students, reload, showToast }) {
  const [modal, setModal] = useState(false)
  const [f, setF] = useState({ first_name: '', last_name: '', username: '', password: '' })
  const add = async () => { if (!f.first_name || !f.username || !f.password) return; await supabase.from('users').insert({ ...f, role: 'student', active: true }); setModal(false); setF({ first_name: '', last_name: '', username: '', password: '' }); showToast('Élève ajouté !'); reload() }
  const toggle = async (id, active) => { await supabase.from('users').update({ active: !active }).eq('id', id); reload() }
  const del = async (id) => { await supabase.from('users').delete().eq('id', id); showToast('Supprimé'); reload() }
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Gestion des élèves</h1>
      <div className="card">
        <div className="card-header"><span>{students.length} élève{students.length > 1 ? 's' : ''}</span><button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>{IC.plus} Ajouter</button></div>
        {students.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
            <div><span style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</span><span style={{ marginLeft: 10, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-sec)' }}>{s.username} / {s.password}</span></div>
            <div className="row gap-sm">
              <span className={`badge ${s.active ? 'badge-success' : 'badge-danger'}`} style={{ cursor: 'pointer' }} onClick={() => toggle(s.id, s.active)}>{s.active ? 'Actif' : 'Inactif'}</span>
              <button onClick={() => del(s.id)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-sec)' }}>{IC.trash}</button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <Modal title="Nouvel élève" onClose={() => setModal(false)}>
          {[['Prénom', 'first_name', 'Yasmine'], ['Nom', 'last_name', 'B.'], ['Identifiant', 'username', 'yasmine.b'], ['Mot de passe', 'password', 'brevet2026']].map(([l, k, ph]) => (
            <div className="form-group" key={k}><label className="form-label">{l}</label><input className="form-input" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={`Ex: ${ph}`} /></div>
          ))}
          <div className="modal-actions"><button className="btn btn-secondary btn-sm" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary btn-sm" onClick={add}>Créer</button></div>
        </Modal>
      )}
    </div>
  )
}

function AdminLessons({ parts, reload, showToast }) {
  const [addModal, setAddModal] = useState(null)
  const [title, setTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [desc, setDesc] = useState('')
  const [dur, setDur] = useState('')

  const addLesson = async (chapterId) => {
    if (!title) return
    const { data: existing } = await supabase.from('lessons').select('sort_order').eq('chapter_id', chapterId).order('sort_order', { ascending: false }).limit(1)
    const order = (existing && existing[0]) ? existing[0].sort_order + 1 : 1
    await supabase.from('lessons').insert({ chapter_id: chapterId, title, video_url: videoUrl, description: desc, sort_order: order, duration_minutes: parseInt(dur) || 0 })
    setTitle(''); setVideoUrl(''); setDesc(''); setDur(''); setAddModal(null); showToast('Leçon ajoutée !'); reload()
  }
  const delLesson = async (id) => { await supabase.from('lessons').delete().eq('id', id); showToast('Supprimée'); reload() }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Gestion des leçons</h1>
      {parts.map(part => (
        <div key={part.id} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>{part.emoji} {part.title}</div>
          {(part.chapters || []).map(ch => (
            <div key={ch.id} className="card" style={{ marginBottom: 10 }}>
              <div className="card-header" style={{ background: 'var(--bg)' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{ch.title}</span>
                <button className="btn btn-primary btn-sm" onClick={() => setAddModal(ch.id)}>{IC.plus} Leçon</button>
              </div>
              {(ch.lessons || []).map((l, i) => (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div className="row gap-sm">
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--accent-bg)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, fontFamily: 'monospace' }}>{i + 1}</span>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{l.title}</span>
                      {l.video_url && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--success)' }}>🎥</span>}
                    </div>
                  </div>
                  <button onClick={() => delLesson(l.id)} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-sec)' }}>{IC.trash}</button>
                </div>
              ))}
              {(!ch.lessons || ch.lessons.length === 0) && <div style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-sec)', textAlign: 'center' }}>Aucune leçon — cliquez + pour en ajouter</div>}
            </div>
          ))}
        </div>
      ))}
      {addModal && (
        <Modal title="Nouvelle leçon" onClose={() => setAddModal(null)}>
          <div className="form-group"><label className="form-label">Titre</label><input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Introduction aux fractions" autoFocus /></div>
          <div className="form-group"><label className="form-label">URL vidéo Loom</label><input className="form-input" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.loom.com/embed/..." /></div>
          <div className="form-group"><label className="form-label">Description (optionnel)</label><input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ce qu'on va voir dans cette leçon" /></div>
          <div className="form-group"><label className="form-label">Durée (minutes)</label><input className="form-input" type="number" value={dur} onChange={e => setDur(e.target.value)} placeholder="15" /></div>
          <div className="modal-actions"><button className="btn btn-secondary btn-sm" onClick={() => setAddModal(null)}>Annuler</button><button className="btn btn-primary btn-sm" onClick={() => addLesson(addModal)}>Ajouter</button></div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function Home() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('course')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const [students, setStudents] = useState([])
  const [parts, setParts] = useState([])
  const [lessons, setLessons] = useState([])
  const [completedLessons, setCompletedLessons] = useState([])
  const [streak, setStreak] = useState({})
  const [currentLesson, setCurrentLesson] = useState(null)

  const showToast = useCallback(m => { setToast(m); setTimeout(() => setToast(null), 2500) }, [])

  // Flat list of all lessons in order
  const allLessonsFlat = useMemo(() => {
    return parts.flatMap(p => (p.chapters || []).flatMap(ch => (ch.lessons || [])))
  }, [parts])

  const loadData = useCallback(async () => {
    const [studentsRes, partsRes, chaptersRes, lessonsRes] = await Promise.all([
      supabase.from('users').select('*').eq('role', 'student').order('created_at'),
      supabase.from('parts').select('*').order('sort_order'),
      supabase.from('chapters').select('*').order('sort_order'),
      supabase.from('lessons').select('*').order('sort_order'),
    ])
    setStudents(studentsRes.data || [])
    const allChapters = chaptersRes.data || []
    const allLessons = lessonsRes.data || []
    setLessons(allLessons)
    const chaptersWithLessons = allChapters.map(c => ({ ...c, lessons: allLessons.filter(l => l.chapter_id === c.id) }))
    const partsWithAll = (partsRes.data || []).map(p => ({ ...p, chapters: chaptersWithLessons.filter(c => c.part_id === p.id) }))
    setParts(partsWithAll)
    setLoading(false)
  }, [])

  const loadStudentData = useCallback(async (userId) => {
    const { data } = await supabase.from('lesson_progress').select('lesson_id').eq('user_id', userId).eq('completed', true)
    setCompletedLessons((data || []).map(r => r.lesson_id))
  }, [])

  const updateStreak = useCallback(async (userId) => {
    const today = new Date().toISOString().split('T')[0]
    try {
      const { data: existing } = await supabase.from('student_streaks').select('*').eq('user_id', userId).single()
      if (existing) {
        if (existing.last_login === today) { setStreak(existing); return }
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        let ns = existing.last_login === yesterday ? existing.current_streak + 1 : 1
        const bs = Math.max(ns, existing.best_streak || 0)
        await supabase.from('student_streaks').update({ current_streak: ns, last_login: today, best_streak: bs }).eq('user_id', userId)
        setStreak({ current_streak: ns, last_login: today, best_streak: bs })
      } else {
        await supabase.from('student_streaks').insert({ user_id: userId, current_streak: 1, last_login: today, best_streak: 1 })
        setStreak({ current_streak: 1, last_login: today, best_streak: 1 })
      }
    } catch { setStreak({ current_streak: 0 }) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const login = async (username, password, setErr) => {
    const { data, error } = await supabase.from('users').select('*').eq('username', username).eq('password', password).single()
    if (error || !data) { setErr('Identifiant ou mot de passe incorrect'); return }
    if (!data.active && data.role !== 'admin') { setErr('Ton compte est désactivé'); return }
    setUser(data)
    if (data.role === 'admin') { setPage('admin-dash') }
    else { setPage('dashboard'); await loadStudentData(data.id); await updateStreak(data.id) }
  }

  const toggleLessonComplete = async (lessonId) => {
    if (!user) return
    if (completedLessons.includes(lessonId)) {
      await supabase.from('lesson_progress').delete().eq('user_id', user.id).eq('lesson_id', lessonId)
      setCompletedLessons(prev => prev.filter(id => id !== lessonId))
    } else {
      await supabase.from('lesson_progress').upsert({ user_id: user.id, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() })
      setCompletedLessons(prev => [...prev, lessonId])
    }
  }

  const selectLesson = (lesson) => { setCurrentLesson(lesson); setPage('course') }

  const currentIndex = allLessonsFlat.findIndex(l => l.id === currentLesson?.id)
  const goNext = () => { if (currentIndex < allLessonsFlat.length - 1) setCurrentLesson(allLessonsFlat[currentIndex + 1]) }
  const goPrev = () => { if (currentIndex > 0) setCurrentLesson(allLessonsFlat[currentIndex - 1]) }

  // Find the chapter for current lesson
  const currentChapter = useMemo(() => {
    if (!currentLesson) return null
    for (const p of parts) for (const ch of (p.chapters || [])) if ((ch.lessons || []).some(l => l.id === currentLesson.id)) return ch
    return null
  }, [currentLesson, parts])

  const logout = () => { setUser(null); setPage('dashboard'); setCompletedLessons([]); setStreak({}); setCurrentLesson(null) }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--text-sec)' }}>Chargement...</div>
  if (!user) return <LoginPage onLogin={login} />

  const isAdmin = user.role === 'admin'

  if (isAdmin) {
    const adminPage = page.startsWith('admin-') ? page : 'admin-dash'
    return (
      <div className="app-layout">
        <div className="sidebar">
          <div className="sidebar-brand"><div className="sidebar-logo">B</div><span className="sidebar-title">Brevet <span>Booster</span></span></div>
          <div className="sidebar-role admin">Administration</div>
          <nav className="sidebar-nav">
            {[{ id: 'admin-dash', label: 'Dashboard', icon: IC.dash }, { id: 'admin-students', label: 'Élèves', icon: IC.users }, { id: 'admin-lessons', label: 'Leçons', icon: IC.book }, { id: 'admin-progress', label: 'Progression', icon: IC.chart }].map(it => (
              <div key={it.id} className={`sidebar-item ${adminPage === it.id ? 'active' : ''}`} onClick={() => setPage(it.id)}>{it.icon}<span>{it.label}</span></div>
            ))}
          </nav>
          <div className="sidebar-bottom"><button className="sidebar-logout" onClick={logout}>{IC.logout}<span>Déconnexion</span></button></div>
        </div>
        <div className="main-content">
          {adminPage === 'admin-dash' && <AdminDashboard students={students} parts={parts} lessons={lessons} />}
          {adminPage === 'admin-students' && <AdminStudents students={students} reload={loadData} showToast={showToast} />}
          {adminPage === 'admin-lessons' && <AdminLessons parts={parts} reload={loadData} showToast={showToast} />}
        </div>
        {toast && <Toast message={toast} />}
      </div>
    )
  }

  // Student layout: Schoolmaker style
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile header */}
      <div className="mobile-header" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => setMobileOpen(true)} style={{ cursor: 'pointer' }}>{IC.menu}</div>
        <span style={{ fontSize: 15, fontWeight: 800 }}>Brevet <span style={{ color: 'var(--accent)' }}>Booster</span></span>
        <div style={{ width: 22 }} />
      </div>

      <CourseSidebar parts={parts} lessons={allLessonsFlat} completedLessons={completedLessons} currentLesson={currentLesson} onSelectLesson={selectLesson} onNavigate={setPage} currentPage={page} onLogout={logout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Overlay for mobile sidebar */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 89 }} />}

      <div className="course-main" style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', minHeight: '100vh' }}>
        {page === 'course' && <LessonViewer lesson={currentLesson} chapter={currentChapter} isCompleted={currentLesson ? completedLessons.includes(currentLesson.id) : false} onToggleComplete={() => currentLesson && toggleLessonComplete(currentLesson.id)} onNext={goNext} onPrev={goPrev} hasPrev={currentIndex > 0} hasNext={currentIndex < allLessonsFlat.length - 1} />}
        {page === 'dashboard' && <DashboardPage completedLessons={completedLessons} totalLessons={allLessonsFlat.length} streak={streak} onNavigate={setPage} />}
        {page === 'games' && <GamesPage userId={user.id} />}
        {page === 'prep' && <PrepPage />}
      </div>

      {toast && <Toast message={toast} />}

      <style jsx global>{`
        .course-sidebar { width: 320px; background: var(--card); border-right: 1px solid var(--border); display: flex; flex-direction: column; height: 100vh; position: sticky; top: 0; overflow: hidden; z-index: 90; }
        .course-main { margin-left: 0; }
        @media (max-width: 768px) {
          .course-sidebar { position: fixed; left: -320px; top: 0; bottom: 0; transition: left 0.3s ease; box-shadow: none; }
          .course-sidebar.open { left: 0; box-shadow: 4px 0 20px rgba(0,0,0,0.15); }
          .mobile-header { display: flex !important; }
          .mobile-close { display: block !important; }
          .course-main { padding: 80px 16px 32px !important; }
        }
      `}</style>
    </div>
  )
}
