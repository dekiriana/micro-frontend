<template>
  <div class="preview-wrap">
    <!-- Empty state -->
    <div v-if="!title && !content" class="preview-empty">
      <div class="empty-icon">◌</div>
      <p>Preview will appear here as you write</p>
    </div>

    <!-- Article preview -->
    <article v-else class="preview-article">
      <!-- Meta row -->
      <div class="preview-meta">
        <span class="preview-tag" :style="tagStyle">{{ tagLabel }}</span>
        <span class="preview-readtime">{{ readTime }} min read</span>
        <span class="preview-date">just now</span>
      </div>

      <!-- Title -->
      <h1 class="preview-title">{{ title || 'Untitled article' }}</h1>

      <!-- Author -->
      <div class="preview-author">
        <span class="author-av" :style="avatarStyle">{{ authorInitials }}</span>
        <div class="author-info">
          <span class="author-name">{{ authorName }}</span>
          <span class="author-source">{{ source || 'devpulse.internal' }}</span>
        </div>
      </div>

      <!-- Content rendered -->
      <div class="preview-content" v-html="renderedContent" />

      <!-- Stats footer -->
      <div class="preview-stats">
        <span class="pstat">{{ wordCount }} words</span>
        <span class="pstat-sep">·</span>
        <span class="pstat">~{{ readTime }} min read</span>
        <span class="pstat-sep">·</span>
        <span class="pstat" style="color: #42b883">
          ● will appear in The Feed
        </span>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TAGS } from '../data/articles.js'

const props = defineProps({
  title:        String,
  content:      String,
  tag:          String,
  source:       String,
  readTime:     Number,
  wordCount:    Number,
  authorName:   String,
  authorInitials: String,
})

const tagInfo  = computed(() => TAGS.find(t => t.id === props.tag) ?? TAGS[1])
const tagLabel = computed(() => tagInfo.value.label)
const tagStyle = computed(() => ({
  color:       tagInfo.value.color,
  borderColor: tagInfo.value.color + '44',
  background:  tagInfo.value.color + '12',
}))

const avatarStyle = computed(() => {
  const colors = ['#39d0c8', '#58a6ff', '#3fb950', '#bc8cff', '#ffa657']
  const s = props.authorInitials ?? 'A'
  const idx = (s.charCodeAt(0) + (s.charCodeAt(1) || 0)) % colors.length
  const c = colors[idx]
  return { background: `${c}22`, border: `1px solid ${c}44`, color: c }
})

// ── Lightweight Markdown → HTML renderer ─────────────────────────────────
const renderedContent = computed(() => {
  const raw = props.content ?? ''
  if (!raw.trim()) return ''

  let html = raw
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

    // Code blocks (must come before inline)
    .replace(/```([^`]*?)```/gs, (_, c) =>
      `<pre class="p-codeblock"><code>${c.trim()}</code></pre>`)

    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="p-h3">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 class="p-h2">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 class="p-h1">$1</h1>')

    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="p-quote">$1</blockquote>')

    // Inline code
    .replace(/`([^`]+)`/g, '<code class="p-code">$1</code>')

    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="p-link" target="_blank" rel="noopener">$1</a>')

    // Bullet lists
    .replace(/((?:^- .+\n?)+)/gm, (match) => {
      const items = match.trim().split('\n')
        .map(l => `<li>${l.replace(/^- /, '')}</li>`)
        .join('')
      return `<ul class="p-list">${items}</ul>`
    })

    // Paragraphs — wrap double-newline separated blocks
    .replace(/\n{2,}/g, '\n\n')

  // Wrap consecutive non-tag lines in <p>
  const lines = html.split('\n')
  const result = []
  let para = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (para.length) { result.push(`<p class="p-para">${para.join(' ')}</p>`); para = [] }
    } else if (/^<(h[1-6]|ul|ol|blockquote|pre)/.test(trimmed)) {
      if (para.length) { result.push(`<p class="p-para">${para.join(' ')}</p>`); para = [] }
      result.push(trimmed)
    } else {
      para.push(trimmed)
    }
  }
  if (para.length) result.push(`<p class="p-para">${para.join(' ')}</p>`)

  return result.join('\n')
})
</script>

<style scoped>
.preview-wrap {
  flex: 1;
  overflow-y: auto;
  background: #0d1117;
  border: 1px solid #1e2d3d;
  border-radius: 8px;
}

/* ── Empty ── */
.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 280px;
  gap: 12px;
  color: #2d3d4e;
}
.empty-icon { font-size: 28px; }
.preview-empty p {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
}

/* ── Article ── */
.preview-article {
  padding: 28px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.preview-tag {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 3px;
  border: 1px solid;
  letter-spacing: 0.04em;
}
.preview-readtime,
.preview-date {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #3d5166;
}

.preview-title {
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-weight: 600;
  color: #e6edf3;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.preview-author {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid #1a2738;
}
.author-av {
  width: 32px; height: 32px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.author-info { display: flex; flex-direction: column; gap: 1px; }
.author-name   { font-size: 12px; color: #8b98a8; font-weight: 500; }
.author-source { font-family: 'DM Mono', monospace; font-size: 10px; color: #3d5166; }

/* ── Rendered content ── */
.preview-content {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  line-height: 1.8;
  color: #8b98a8;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Injected HTML styles via :deep */
.preview-content :deep(.p-para) {
  color: #8b98a8;
  line-height: 1.8;
  margin: 0 0 8px;
}
.preview-content :deep(.p-h1),
.preview-content :deep(.p-h2) {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  color: #e6edf3;
  margin: 20px 0 8px;
  letter-spacing: -0.01em;
}
.preview-content :deep(.p-h1) { font-size: 20px; }
.preview-content :deep(.p-h2) { font-size: 17px; }
.preview-content :deep(.p-h3) {
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #e6edf3;
  margin: 16px 0 6px;
}
.preview-content :deep(.p-code) {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  background: #161f2a;
  color: #39d0c8;
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid #1e2d3d;
}
.preview-content :deep(.p-codeblock) {
  background: #0a0e12;
  border: 1px solid #1e2d3d;
  border-radius: 6px;
  padding: 14px 16px;
  margin: 8px 0;
  overflow-x: auto;
}
.preview-content :deep(.p-codeblock code) {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #42b883;
  white-space: pre;
}
.preview-content :deep(.p-quote) {
  border-left: 3px solid #39d0c8;
  padding: 8px 16px;
  margin: 8px 0;
  color: #4d5f72;
  font-style: italic;
  background: rgba(57,208,200,0.04);
  border-radius: 0 4px 4px 0;
}
.preview-content :deep(.p-list) {
  padding-left: 20px;
  margin: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  list-style: none;
}
.preview-content :deep(.p-list li::before) {
  content: '▸ ';
  color: #39d0c8;
  margin-right: 4px;
}
.preview-content :deep(.p-link) {
  color: #39d0c8;
  text-decoration: underline;
  text-decoration-color: #39d0c844;
  transition: text-decoration-color 0.15s;
}
.preview-content :deep(.p-link:hover) {
  text-decoration-color: #39d0c8;
}

/* ── Stats footer ── */
.preview-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #1a2738;
  margin-top: 8px;
}
.pstat { font-family: 'DM Mono', monospace; font-size: 10px; color: #2d3d4e; }
.pstat-sep { color: #1a2738; }
</style>
