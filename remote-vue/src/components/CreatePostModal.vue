<template>
  <Transition name="overlay">
    <div class="overlay" @click.self="handleClose">
      <Transition name="modal">
        <div class="modal">

          <!-- ── Modal Header ── -->
          <header class="modal-header">
            <div class="modal-title">
              <span class="modal-icon">✦</span>
              <span>New Article</span>
              <span class="modal-badge">admin only</span>
            </div>

            <div class="header-actions">
              <!-- Draft indicator -->
              <Transition name="fade">
                <span v-if="justSaved" class="saved-chip">✓ Draft saved</span>
              </Transition>

              <button
                class="action-btn"
                :class="{ 'draft-active': hasDraft }"
                @click="saveDraft"
                title="Save draft (Ctrl+S)"
                type="button"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1h8l2 2v8H1V1z" stroke="currentColor" stroke-width="1.2"/>
                  <path d="M3 1v3h6V1M3 7h6" stroke="currentColor" stroke-width="1.2"/>
                </svg>
                Save Draft
              </button>

              <button class="close-btn" @click="handleClose" aria-label="Close">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </header>

          <!-- ── Draft restore banner ── -->
          <Transition name="banner">
            <div v-if="showDraftBanner" class="draft-banner">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="#e8a838" stroke-width="1.2"/>
                <path d="M6.5 4v3.5M6.5 9v.5" stroke="#e8a838" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              <span>You have an unsaved draft.</span>
              <button class="banner-btn restore" @click="restoreDraft">Restore draft</button>
              <button class="banner-btn discard" @click="discardDraft(); showDraftBanner = false">Discard</button>
            </div>
          </Transition>

          <!-- ── Top fields: title + meta ── -->
          <div class="top-fields">
            <div class="field field-title">
              <input
                v-model="title"
                class="title-input"
                :class="{ 'has-error': errors.title }"
                type="text"
                placeholder="Article title…"
                maxlength="120"
                @keydown.ctrl.s.prevent="saveDraft"
                @keydown.meta.s.prevent="saveDraft"
              />
              <div v-if="errors.title" class="field-error">{{ errors.title }}</div>
            </div>

            <div class="meta-row">
              <!-- Tag selector -->
              <div class="field field-tag">
                <label class="field-label">Tag</label>
                <div class="tag-select">
                  <button
                    v-for="t in availableTags"
                    :key="t.id"
                    type="button"
                    class="tag-opt"
                    :class="{ active: tag === t.id }"
                    :style="tag === t.id
                      ? { color: t.color, borderColor: t.color + '66', background: t.color + '14' }
                      : {}"
                    @click="tag = t.id"
                  >
                    <span class="tag-dot" :style="{ background: t.color }" />
                    {{ t.label }}
                  </button>
                </div>
                <div v-if="errors.tag" class="field-error">{{ errors.tag }}</div>
              </div>

              <!-- Source -->
              <div class="field field-source">
                <label class="field-label">Source / URL <span class="optional">optional</span></label>
                <input
                  v-model="source"
                  class="meta-input"
                  type="text"
                  placeholder="e.g. devpulse.internal, blog.company.com"
                />
              </div>

              <!-- Read time badge -->
              <div class="readtime-badge">
                <span class="rt-value">{{ readTime }}</span>
                <span class="rt-unit">min read</span>
              </div>
            </div>
          </div>

          <!-- ── Tab switcher ── -->
          <div class="tab-bar">
            <button
              class="tab"
              :class="{ active: activeTab === 'write' }"
              @click="activeTab = 'write'"
              type="button"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1 9l2-1 6-6-1-1-6 6-1 2zM8 2l1 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Write
            </button>
            <button
              class="tab"
              :class="{ active: activeTab === 'preview' }"
              @click="activeTab = 'preview'"
              type="button"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1 5.5C1 5.5 3 2 5.5 2S10 5.5 10 5.5 8 9 5.5 9 1 5.5 1 5.5z" stroke="currentColor" stroke-width="1.2"/>
                <circle cx="5.5" cy="5.5" r="1.5" stroke="currentColor" stroke-width="1.2"/>
              </svg>
              Preview
            </button>
            <div class="tab-spacer" />
            <span class="split-hint">Split view</span>
          </div>

          <!-- ── Editor / Preview area ── -->
          <div class="editor-area" :class="'tab-' + activeTab">
            <!-- Write pane -->
            <div class="pane pane-write">
              <PostEditor
                ref="editorRef"
                v-model="content"
                :word-count="wordCount"
                :char-count="charCount"
                :read-time="readTime"
                :error="errors.content"
                @format="(id) => insertFormat(editorRef?.textareaRef, id)"
              />
            </div>

            <!-- Preview pane -->
            <div class="pane pane-preview">
              <PostPreview
                :title="title"
                :content="content"
                :tag="tag"
                :source="source"
                :read-time="readTime"
                :word-count="wordCount"
                :author-name="user?.name"
                :author-initials="user?.initials ?? user?.avatar"
              />
            </div>
          </div>

          <!-- ── Footer ── -->
          <footer class="modal-footer">
            <div class="footer-left">
              <span class="footer-meta" v-if="wordCount > 0">
                {{ wordCount }} words · {{ readTime }} min read
              </span>
            </div>
            <div class="footer-actions">
              <button class="btn-cancel" @click="handleClose" type="button">Cancel</button>
              <button
                class="btn-publish"
                :class="{ loading: isPublishing, disabled: !isValid }"
                :disabled="!isValid || isPublishing"
                @click="handlePublish"
                type="button"
              >
                <span v-if="isPublishing" class="publish-spinner" />
                <span v-else>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Publish to Feed
                </span>
              </button>
            </div>
          </footer>

        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import PostEditor  from './PostEditor.vue'
import PostPreview from './PostPreview.vue'
import { usePostEditor } from '../composables/usePostEditor.js'

const props = defineProps({
  user: Object,
})
const emit = defineEmits(['close', 'published'])

const editorRef       = ref(null)
const showDraftBanner = ref(false)

const {
  title, content, tag, source,
  activeTab, isPublishing, justSaved, hasDraft, errors,
  readTime, wordCount, charCount, isValid,
  availableTags,
  saveDraft, loadDraft, discardDraft, checkDraft,
  insertFormat, publish,
} = usePostEditor((article) => emit('published', article))

// Check for existing draft on mount
onMounted(() => {
  checkDraft()
  if (hasDraft.value) showDraftBanner.value = true

  // Keyboard shortcuts
  window.addEventListener('keydown', handleGlobalKey)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKey)
})

function handleGlobalKey(e) {
  if (e.key === 'Escape') handleClose()
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    saveDraft()
  }
}

function restoreDraft() {
  loadDraft()
  showDraftBanner.value = false
}

async function handlePublish() {
  await publish(props.user)
}

function handleClose() {
  emit('close')
}
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Overlay ── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(6,8,9,0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

/* ── Modal ── */
.modal {
  width: 100%;
  max-width: 1080px;
  max-height: 90vh;
  background: #0d1117;
  border: 1px solid #1e2d3d;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(0,0,0,0.7);
}
.modal-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from   { opacity: 0; transform: translateY(20px) scale(0.97); }
.modal-leave-to     { opacity: 0; transform: translateY(8px); }

/* ── Header ── */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #1a2738;
  background: #080b0f;
  flex-shrink: 0;
}
.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #e6edf3;
}
.modal-icon { color: #39d0c8; font-size: 13px; }
.modal-badge {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  color: #e5393d;
  background: rgba(229,57,61,0.08);
  border: 1px solid rgba(229,57,61,0.25);
  padding: 2px 7px;
  border-radius: 3px;
  letter-spacing: 0.06em;
}

.header-actions { display: flex; align-items: center; gap: 8px; }

.saved-chip {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #37c97d;
  background: rgba(55,201,125,0.08);
  border: 1px solid rgba(55,201,125,0.25);
  padding: 3px 10px;
  border-radius: 4px;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #1e2d3d;
  border-radius: 6px;
  color: #4d5f72;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn:hover  { background: #111820; border-color: #243447; color: #8b98a8; }
.action-btn.draft-active { border-color: #e8a83844; color: #e8a838; }

.close-btn {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid #1e2d3d;
  border-radius: 6px;
  color: #4d5f72;
  cursor: pointer;
  transition: all 0.15s;
}
.close-btn:hover { background: #111820; border-color: #243447; color: #8b98a8; }

/* ── Draft banner ── */
.draft-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(232,168,56,0.06);
  border-bottom: 1px solid rgba(232,168,56,0.2);
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #e8a838;
  flex-shrink: 0;
}
.banner-enter-active, .banner-leave-active { transition: all 0.2s; max-height: 50px; overflow: hidden; }
.banner-enter-from, .banner-leave-to { opacity: 0; max-height: 0; }

.banner-btn {
  padding: 3px 10px;
  border-radius: 4px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.banner-btn.restore {
  background: rgba(232,168,56,0.12);
  border: 1px solid rgba(232,168,56,0.3);
  color: #e8a838;
}
.banner-btn.restore:hover { background: rgba(232,168,56,0.2); }
.banner-btn.discard {
  background: transparent;
  border: 1px solid #1e2d3d;
  color: #4d5f72;
}
.banner-btn.discard:hover { color: #8b98a8; }

/* ── Top fields ── */
.top-fields {
  padding: 16px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.field { display: flex; flex-direction: column; gap: 5px; }
.field-label {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #3d5166;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.optional { color: #1e2d3d; font-size: 9px; text-transform: none; letter-spacing: 0; }

.title-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid #1e2d3d;
  outline: none;
  color: #e6edf3;
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  font-weight: 700;
  padding: 6px 0;
  letter-spacing: -0.01em;
  transition: border-color 0.15s;
}
.title-input:focus { border-bottom-color: #39d0c8; }
.title-input::placeholder { color: #1e2d3d; }
.title-input.has-error { border-bottom-color: rgba(248,81,73,0.5); }

.meta-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}
.field-tag    { flex: 1; min-width: 280px; }
.field-source { flex: 1; min-width: 200px; }

.tag-select {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.tag-opt {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: transparent;
  border: 1px solid #1e2d3d;
  border-radius: 20px;
  color: #3d5166;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
}
.tag-opt:hover:not(.active) { background: #111820; border-color: #243447; color: #8b98a8; }
.tag-opt.active { font-weight: 500; }
.tag-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

.meta-input {
  width: 100%;
  padding: 6px 10px;
  background: #080b0f;
  border: 1px solid #1e2d3d;
  border-radius: 6px;
  color: #8b98a8;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  outline: none;
  transition: border-color 0.15s;
}
.meta-input:focus { border-color: #39d0c844; }
.meta-input::placeholder { color: #2d3d4e; }

.readtime-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  background: rgba(57,208,200,0.05);
  border: 1px solid rgba(57,208,200,0.15);
  border-radius: 8px;
  flex-shrink: 0;
  align-self: flex-end;
}
.rt-value {
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #39d0c8;
  line-height: 1;
}
.rt-unit {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  color: #3d5166;
  margin-top: 1px;
}

.field-error {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #f85149;
}

/* ── Tabs ── */
.tab-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 10px 20px 0;
  border-bottom: 1px solid #1a2738;
  flex-shrink: 0;
}
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  color: #3d5166;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: -1px;
}
.tab:hover:not(.active) { color: #8b98a8; background: #111820; }
.tab.active {
  background: #0d1117;
  border-color: #1a2738;
  border-bottom-color: #0d1117;
  color: #e6edf3;
}
.tab-spacer { flex: 1; }
.split-hint {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  color: #1e2d3d;
}

/* ── Editor area ── */
.editor-area {
  flex: 1;
  display: grid;
  min-height: 0;
  padding: 14px 20px;
  gap: 14px;
  overflow: hidden;
}
.editor-area.tab-write   { grid-template-columns: 1fr; }
.editor-area.tab-preview { grid-template-columns: 1fr; }

/* On larger screens: always split */
@media (min-width: 800px) {
  .editor-area { grid-template-columns: 1fr 1fr !important; }
  .tab-bar     { display: none; }
}

.pane { display: flex; flex-direction: column; min-height: 0; }

/* Tab-based visibility on mobile */
@media (max-width: 799px) {
  .tab-write .pane-write   { display: flex; }
  .tab-write .pane-preview { display: none; }
  .tab-preview .pane-write  { display: none; }
  .tab-preview .pane-preview { display: flex; }
}

/* ── Footer ── */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #1a2738;
  background: #080b0f;
  flex-shrink: 0;
}
/* .footer-left {} */
.footer-meta {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #2d3d4e;
}
.footer-actions { display: flex; align-items: center; gap: 8px; }

.btn-cancel {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #1e2d3d;
  border-radius: 7px;
  color: #4d5f72;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-cancel:hover { border-color: #243447; color: #8b98a8; }

.btn-publish {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 20px;
  background: #39d0c8;
  color: #060809;
  border: none;
  border-radius: 7px;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-publish:hover:not(.disabled):not(.loading) {
  background: #52dbd6;
  box-shadow: 0 4px 14px rgba(57,208,200,0.3);
}
.btn-publish.disabled { opacity: 0.35; cursor: not-allowed; }
.btn-publish.loading  { opacity: 0.7; cursor: wait; }

.publish-spinner {
  width: 12px; height: 12px;
  border: 2px solid rgba(6,8,9,0.3);
  border-top-color: #060809;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
</style>
