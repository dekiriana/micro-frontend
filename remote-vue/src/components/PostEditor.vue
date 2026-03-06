<template>
  <div class="editor-wrap">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-group">
        <button
          v-for="btn in toolbarBtns"
          :key="btn.id"
          class="tool-btn"
          :title="btn.title"
          @click="$emit('format', btn.id)"
          type="button"
        >
          <span v-html="btn.icon" />
        </button>
      </div>
      <div class="toolbar-divider" />
      <div class="toolbar-group">
        <button class="tool-btn" title="Blockquote" @click="$emit('format', 'quote')" type="button">❝</button>
        <button class="tool-btn" title="Link" @click="$emit('format', 'link')" type="button">⎋</button>
        <button class="tool-btn" title="Code block" @click="$emit('format', 'codeblock')" type="button">⬜</button>
      </div>
      <div class="toolbar-right">
        <span class="md-hint">Markdown supported</span>
      </div>
    </div>

    <!-- Textarea -->
    <div class="editor-body">
      <textarea
        ref="textareaRef"
        class="editor-textarea"
        :class="{ 'has-error': error }"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @keydown="handleKeydown"
        placeholder="Write your article here...

## Start with a heading

Share your knowledge, insights, or discoveries with the team.
Markdown is supported — **bold**, *italic*, `code`, and more."
        spellcheck="true"
        autocorrect="off"
      />
      <div v-if="error" class="field-error">{{ error }}</div>
    </div>

    <!-- Footer stats -->
    <div class="editor-footer">
      <span class="stat">{{ wordCount }} words</span>
      <span class="stat-sep">·</span>
      <span class="stat">{{ charCount }} chars</span>
      <span class="stat-sep">·</span>
      <span class="stat read-time">
        ~{{ readTime }} min read
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: String,
  wordCount:  Number,
  charCount:  Number,
  readTime:   Number,
  error:      String,
})
const emit = defineEmits(['update:modelValue', 'format'])

const textareaRef = ref(null)

defineExpose({ textareaRef })

const toolbarBtns = [
  { id: 'h2',     title: 'Heading 2',  icon: '<b>H2</b>' },
  { id: 'h3',     title: 'Heading 3',  icon: '<b>H3</b>' },
  { id: 'bold',   title: 'Bold',       icon: '<b>B</b>'  },
  { id: 'italic', title: 'Italic',     icon: '<i>I</i>'  },
  { id: 'code',   title: 'Inline code',icon: '<code>`</code>' },
  { id: 'bullet', title: 'Bullet list',icon: '≡'         },
]

function handleKeydown(e) {
  // Tab → insert 2 spaces
  if (e.key === 'Tab') {
    e.preventDefault()
    const ta  = e.target
    const s   = ta.selectionStart
    const val = ta.value
    const newVal = val.slice(0, s) + '  ' + val.slice(ta.selectionEnd)
    emit('update:modelValue', newVal)
    setTimeout(() => { ta.setSelectionRange(s + 2, s + 2) }, 0)
  }
}
</script>

<style scoped>
.editor-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: #080b0f;
  border: 1px solid #1e2d3d;
  border-radius: 8px;
  overflow: hidden;
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #0d1117;
  border-bottom: 1px solid #1a2738;
  flex-shrink: 0;
}
.toolbar-group { display: flex; gap: 2px; }
.toolbar-divider {
  width: 1px;
  height: 18px;
  background: #1e2d3d;
  margin: 0 4px;
}
.toolbar-right { margin-left: auto; }
.md-hint {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  color: #2d3d4e;
  letter-spacing: 0.04em;
}

.tool-btn {
  width: 28px; height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 5px;
  color: #4d5f72;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.12s;
  flex-shrink: 0;
}
.tool-btn:hover {
  background: #161f2a;
  border-color: #1e2d3d;
  color: #8b98a8;
}
.tool-btn b, .tool-btn i, .tool-btn code {
  font-size: 11px;
  font-style: inherit;
  font-weight: inherit;
  pointer-events: none;
}

/* ── Textarea ── */
.editor-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
}
.editor-textarea {
  flex: 1;
  width: 100%;
  min-height: 280px;
  padding: 20px;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  line-height: 1.75;
  color: #e6edf3;
  caret-color: #39d0c8;
}
.editor-textarea::placeholder {
  color: #1e2d3d;
  line-height: 1.8;
}
.editor-textarea.has-error {
  border-bottom: 2px solid rgba(248,81,73,0.4);
}

.field-error {
  padding: 6px 20px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #f85149;
  background: rgba(248,81,73,0.05);
  border-top: 1px solid rgba(248,81,73,0.15);
}

/* ── Footer ── */
.editor-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 20px;
  border-top: 1px solid #1a2738;
  flex-shrink: 0;
}
.stat {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #2d3d4e;
}
.stat-sep { color: #1a2738; font-size: 10px; }
.read-time { color: #39d0c8; }
</style>
