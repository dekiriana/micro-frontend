/**
 * usePostEditor.js
 * Composable untuk semua state & logic create post modal.
 * Handles: form state, validation, draft (localStorage), read time, tab (write/preview).
 */
import { ref, computed, watch } from 'vue'
import { TAGS } from '../data/articles.js'

const DRAFT_KEY = 'devpulse_post_draft'
const WORDS_PER_MINUTE = 200

// ── helpers ──────────────────────────────────────────────────────────────
function calcReadTime(text) {
  if (!text?.trim()) return 0
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

function stripMarkdown(md) {
  return md
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .trim()
}

export function usePostEditor(onPublish) {
  // ── Form fields ─────────────────────────────────────────────────────────
  const title    = ref('')
  const content  = ref('')
  const tag      = ref('frontend')
  const source   = ref('')

  // ── UI state ─────────────────────────────────────────────────────────────
  const activeTab    = ref('write')   // 'write' | 'preview'
  const isDirty      = ref(false)
  const isPublishing = ref(false)
  const hasDraft     = ref(false)
  const justSaved    = ref(false)
  const errors       = ref({})

  // ── Derived ──────────────────────────────────────────────────────────────
  const readTime = computed(() => calcReadTime(content.value))

  const wordCount = computed(() => {
    const raw = stripMarkdown(content.value)
    if (!raw) return 0
    return raw.split(/\s+/).filter(Boolean).length
  })

  const charCount = computed(() => content.value.length)

  const isValid = computed(() =>
    title.value.trim().length >= 5 &&
    content.value.trim().length >= 30 &&
    tag.value
  )

  const tagInfo = computed(() =>
    TAGS.find(t => t.id === tag.value) ?? TAGS[1]
  )

  const availableTags = computed(() =>
    TAGS.filter(t => t.id !== 'all')
  )

  // ── Watch for dirty state ─────────────────────────────────────────────
  watch([title, content, tag, source], () => {
    isDirty.value = true
    errors.value  = {}
  })

  // ── Draft persistence ─────────────────────────────────────────────────
  function saveDraft() {
    try {
      const draft = {
        title:     title.value,
        content:   content.value,
        tag:       tag.value,
        source:    source.value,
        savedAt:   new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      hasDraft.value  = true
      justSaved.value = true
      setTimeout(() => { justSaved.value = false }, 2000)
    } catch (e) {
      console.warn('[usePostEditor] could not save draft', e)
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return false
      const draft = JSON.parse(raw)
      title.value   = draft.title   ?? ''
      content.value = draft.content ?? ''
      tag.value     = draft.tag     ?? 'frontend'
      source.value  = draft.source  ?? ''
      hasDraft.value = true
      isDirty.value  = false
      return true
    } catch {
      return false
    }
  }

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY)
    hasDraft.value = false
    reset()
  }

  function checkDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      hasDraft.value = !!raw
    } catch { hasDraft.value = false }
  }

  // ── Validation ────────────────────────────────────────────────────────
  function validate() {
    const errs = {}
    if (!title.value.trim())          errs.title   = 'Title is required'
    else if (title.value.trim().length < 5) errs.title = 'Title must be at least 5 characters'
    if (!content.value.trim())        errs.content = 'Content is required'
    else if (content.value.trim().length < 30) errs.content = 'Content must be at least 30 characters'
    if (!tag.value)                   errs.tag     = 'Select a tag'
    errors.value = errs
    return Object.keys(errs).length === 0
  }

  // ── Toolbar formatting ────────────────────────────────────────────────
  function insertFormat(textarea, syntax) {
    if (!textarea) return
    const start = textarea.selectionStart
    const end   = textarea.selectionEnd
    const sel   = textarea.value.slice(start, end)
    const current = content.value

    let inserted = ''
    let cursorOffset = 0

    switch (syntax) {
      case 'bold':
        inserted = `**${sel || 'bold text'}**`
        cursorOffset = sel ? inserted.length : 2
        break
      case 'italic':
        inserted = `*${sel || 'italic text'}*`
        cursorOffset = sel ? inserted.length : 1
        break
      case 'code':
        inserted = `\`${sel || 'code'}\``
        cursorOffset = sel ? inserted.length : 1
        break
      case 'codeblock':
        inserted = `\`\`\`\n${sel || 'code here'}\n\`\`\``
        cursorOffset = sel ? inserted.length : 4
        break
      case 'h2':
        inserted = `\n## ${sel || 'Heading'}\n`
        cursorOffset = inserted.length
        break
      case 'h3':
        inserted = `\n### ${sel || 'Sub-heading'}\n`
        cursorOffset = inserted.length
        break
      case 'bullet':
        inserted = `\n- ${sel || 'list item'}`
        cursorOffset = inserted.length
        break
      case 'quote':
        inserted = `\n> ${sel || 'blockquote'}\n`
        cursorOffset = inserted.length
        break
      case 'link':
        inserted = `[${sel || 'link text'}](url)`
        cursorOffset = sel ? inserted.length - 1 : inserted.length - 4
        break
      default:
        return
    }

    content.value = current.slice(0, start) + inserted + current.slice(end)

    // Restore cursor
    setTimeout(() => {
      textarea.focus()
      const newPos = start + cursorOffset
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  // ── Publish ───────────────────────────────────────────────────────────
  async function publish(authorInfo) {
    if (!validate()) return null

    isPublishing.value = true

    // Simulate network delay
    await new Promise(r => setTimeout(r, 900))

    const newArticle = {
      id:        Date.now(),
      title:     title.value.trim(),
      excerpt:   stripMarkdown(content.value).slice(0, 180) + '…',
      content:   content.value,
      tag:       tag.value,
      author:    authorInfo?.name  ?? 'Anonymous',
      authorInitials: authorInfo?.initials ?? 'AN',
      source:    source.value.trim() || 'devpulse.internal',
      readTime:  readTime.value,
      date:      'just now',
      featured:  false,
      bookmarked: false,
      views:     '0',
      trend:     null,
      isOwn:     true,
    }

    // Clean up draft after publish
    localStorage.removeItem(DRAFT_KEY)
    hasDraft.value = false

    isPublishing.value = false
    onPublish?.(newArticle)
    reset()

    return newArticle
  }

  // ── Reset ─────────────────────────────────────────────────────────────
  function reset() {
    title.value    = ''
    content.value  = ''
    tag.value      = 'frontend'
    source.value   = ''
    activeTab.value = 'write'
    isDirty.value  = false
    errors.value   = {}
  }

  return {
    // Fields
    title, content, tag, source,
    // UI state
    activeTab, isDirty, isPublishing,
    hasDraft, justSaved, errors,
    // Derived
    readTime, wordCount, charCount, isValid,
    tagInfo, availableTags,
    // Actions
    saveDraft, loadDraft, discardDraft, checkDraft,
    validate, insertFormat, publish, reset,
  }
}