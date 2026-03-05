<template>
  <Transition name="panel">
    <div v-if="show" class="bookmark-panel">
      <div class="panel-header">
        <div class="panel-title">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1.5 1.5h10v10l-5-3-5 3V1.5z" fill="#ffa657" stroke="#ffa657" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
          <span>Bookmarks</span>
          <span class="panel-count">{{ bookmarked.length }}</span>
        </div>
        <button class="panel-close" @click="$emit('close')">✕</button>
      </div>

      <div v-if="bookmarked.length === 0" class="panel-empty">
        <p>No bookmarks yet.</p>
        <p class="panel-hint">Click the bookmark icon on any article.</p>
      </div>

      <div v-else class="panel-list">
        <div
          v-for="article in bookmarked"
          :key="article.id"
          class="panel-item"
        >
          <div class="panel-item-tag" :style="{ color: tagColor(article.tag), background: tagColor(article.tag) + '14' }">
            {{ tagLabel(article.tag) }}
          </div>
          <p class="panel-item-title">{{ article.title }}</p>
          <div class="panel-item-meta">
            <span>{{ article.author }}</span>
            <span class="sep">·</span>
            <span>{{ article.readTime }} min</span>
            <button class="panel-remove" @click="$emit('remove', article.id)" title="Remove bookmark">✕</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { TAGS } from '../data/articles.js'

defineProps({
  show:       Boolean,
  bookmarked: Array,
})
defineEmits(['close', 'remove'])

function tagColor(tagId) {
  return TAGS.find(t => t.id === tagId)?.color ?? '#8b98a8'
}
function tagLabel(tagId) {
  return TAGS.find(t => t.id === tagId)?.label ?? tagId
}
</script>

<style scoped>
.bookmark-panel {
  position: fixed;
  top: 56px;
  right: 0;
  width: 300px;
  height: calc(100vh - 56px);
  background: #111820;
  border-left: 1px solid #1e2d3d;
  display: flex;
  flex-direction: column;
  z-index: 50;
  overflow: hidden;
}

.panel-enter-active,
.panel-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.panel-enter-from,
.panel-leave-to {
  transform: translateX(100%);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #1e2d3d;
  flex-shrink: 0;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #e6edf3;
}
.panel-count {
  background: #ffa65722;
  border: 1px solid #ffa65744;
  color: #ffa657;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
}
.panel-close {
  background: none;
  border: none;
  color: #4d5f72;
  cursor: pointer;
  font-size: 12px;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s;
}
.panel-close:hover { color: #8b98a8; }

.panel-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #4d5f72;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  text-align: center;
  padding: 20px;
}
.panel-hint { font-size: 11px; color: #2d3d4e; }

.panel-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-item {
  background: #161f2a;
  border: 1px solid #1e2d3d;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.15s;
}
.panel-item:hover { border-color: #243447; }

.panel-item-tag {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
  align-self: flex-start;
}
.panel-item-title {
  font-family: 'Syne', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #e6edf3;
  line-height: 1.4;
  display: -webkit-box;
  --line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.panel-item-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #4d5f72;
}
.sep { color: #1e2d3d; }
.panel-remove {
  background: none;
  border: none;
  color: #2d3d4e;
  font-size: 10px;
  cursor: pointer;
  padding: 0 2px;
  margin-left: auto;
  transition: color 0.15s;
}
.panel-remove:hover { color: #f85149; }
</style>