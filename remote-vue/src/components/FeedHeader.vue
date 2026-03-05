<template>
  <header class="feed-header">
    <!-- Title row -->
    <div class="title-row">
      <div class="title-block">
        <div class="remote-badge">
          <span class="badge-dot"></span>
          <span>Vue 3</span>
          <span class="badge-sep">·</span>
          <span>remote_feed</span>
          <span class="badge-sep">·</span>
          <span class="badge-port">:4202</span>
        </div>
        <h1 class="page-title">The Feed</h1>
        <p class="page-sub">{{ filteredCount }} articles · updated just now</p>
      </div>
      <div class="header-actions">
        <button
          :class="['action-btn', showBookmarks ? 'active' : '']"
          @click="$emit('toggle-bookmarks')"
          :title="`Bookmarks (${bookmarkCount})`"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 1h10v12l-5-3-5 3V1z"
              :fill="showBookmarks ? 'currentColor' : 'none'"
              stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
          </svg>
          <span>{{ bookmarkCount }}</span>
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="search-row">
      <div :class="['search-wrap', searchFocused ? 'focused' : '']">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" class="search-icon">
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" stroke-width="1.3"/>
          <path d="M9 9L12 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchModel"
          class="search-input"
          type="text"
          placeholder="Search articles, authors, sources..."
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
        <button v-if="searchModel" class="search-clear" @click="searchModel = ''">✕</button>
      </div>
    </div>

    <!-- Tags -->
    <div class="tags-row">
      <button
        v-for="tag in tags"
        :key="tag.id"
        :class="['tag-btn', activeTag === tag.id ? 'active' : '']"
        :style="activeTag === tag.id
          ? { color: tag.color, borderColor: tag.color + '66', background: tag.color + '14' }
          : {}"
        @click="$emit('set-tag', tag.id)"
      >
        <span
          v-if="tag.id !== 'all'"
          class="tag-dot"
          :style="{ background: tag.color }"
        />
        {{ tag.label }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tags:          Array,
  activeTag:     String,
  searchQuery:   String,
  showBookmarks: Boolean,
  bookmarkCount: Number,
  filteredCount: Number,
})

const emit = defineEmits(['update:searchQuery', 'set-tag', 'toggle-bookmarks'])

const searchFocused = ref(false)
const searchModel = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val),
})
</script>

<style scoped>
.feed-header {
  padding: 32px 32px 0 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-void);
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Title row */
.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.title-block { display: flex; flex-direction: column; gap: 4px; }

.remote-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #4d5f72;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}
.badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #42b883;
  box-shadow: 0 0 6px #42b883;
}
.badge-sep { color: #2d3d4e; }
.badge-port { color: #42b883; }

.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #e6edf3;
  letter-spacing: -0.02em;
  line-height: 1;
}
.page-sub {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #4d5f72;
  margin-top: 2px;
}

.header-actions { display: flex; gap: 8px; padding-top: 4px; }

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
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn:hover { background: #161f2a; border-color: #243447; color: #8b98a8; }
.action-btn.active { color: #ffa657; border-color: #ffa65766; background: #ffa65714; }

/* Search */
.search-row { padding-bottom: 2px; }

.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #080b0f;
  border: 1px solid #1e2d3d;
  border-radius: 8px;
  padding: 0 12px;
  color: #4d5f72;
  transition: all 0.15s;
  max-width: 560px;
}
.search-wrap.focused {
  border-color: #1a6b67;
  box-shadow: 0 0 0 3px rgba(57,208,200,0.08);
  color: #8b98a8;
}
.search-icon { flex-shrink: 0; }
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e6edf3;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  height: 38px;
}
.search-input::placeholder { color: #2d3d4e; }
.search-clear {
  background: none;
  border: none;
  color: #4d5f72;
  cursor: pointer;
  font-size: 11px;
  padding: 0 2px;
  line-height: 1;
  transition: color 0.15s;
}
.search-clear:hover { color: #8b98a8; }

/* Tags */
.tags-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 16px;
  padding-left: 1px;
  padding-right: 1px;
  padding-top: 3px;
  scrollbar-width: none;
}
.tags-row::-webkit-scrollbar { display: none; }

.tag-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  background: transparent;
  border: 1px solid #1e2d3d;
  border-radius: 20px;
  color: #4d5f72;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  flex-shrink: 0;
}
.tag-btn:hover:not(.active) { background: #111820; border-color: #243447; color: #8b98a8; }
.tag-btn.active { font-weight: 500; }

.tag-dot { width: 5px; height: 5px; border-radius: 50%; }
</style>