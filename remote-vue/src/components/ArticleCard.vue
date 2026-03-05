<template>
  <!-- Featured card (large) -->
  <article v-if="featured" class="card card-featured" @click="handleClick">
    <div class="featured-inner">
      <div class="card-meta-row">
        <span class="tag-chip" :style="tagStyle">{{ tagLabel }}</span>
        <span class="trend-chip" v-if="article.trend" :class="article.trend">
          {{ article.trend === 'hot' ? '🔥 Trending' : '↑ Rising' }}
        </span>
        <span class="featured-label">FEATURED</span>
      </div>
      <h2 class="featured-title">{{ article.title }}</h2>
      <p class="card-excerpt">{{ article.excerpt }}</p>
      <div class="card-footer">
        <div class="author-row">
          <span class="author-avatar" :style="avatarStyle">{{ article.authorInitials }}</span>
          <div class="author-info">
            <span class="author-name">{{ article.author }}</span>
            <span class="author-source">{{ article.source }}</span>
          </div>
        </div>
        <div class="card-stats">
          <span class="stat">{{ article.readTime }} min read</span>
          <span class="stat-sep">·</span>
          <span class="stat">{{ article.views }} views</span>
          <span class="stat-sep">·</span>
          <span class="stat">{{ article.date }}</span>
          <button class="bookmark-btn" :class="{ active: article.bookmarked }" @click.stop="$emit('bookmark', article.id)" :title="article.bookmarked ? 'Remove bookmark' : 'Bookmark'">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1h10v10l-5-3-5 3V1z"
                :fill="article.bookmarked ? 'currentColor' : 'none'"
                stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="featured-accent" :style="{ background: `linear-gradient(135deg, ${tagColor}22, transparent)` }"></div>
  </article>

  <!-- Regular card -->
  <article v-else class="card card-regular" @click="handleClick">
    <div class="card-top">
      <div class="card-meta-row">
        <span class="tag-chip" :style="tagStyle">{{ tagLabel }}</span>
        <span class="trend-chip" v-if="article.trend" :class="article.trend">
          {{ article.trend === 'hot' ? '🔥' : '↑' }}
        </span>
      </div>
      <button
        class="bookmark-btn"
        :class="{ active: article.bookmarked }"
        @click.stop="$emit('bookmark', article.id)"
        :title="article.bookmarked ? 'Remove bookmark' : 'Bookmark'"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 1h10v10l-5-3-5 3V1z"
            :fill="article.bookmarked ? 'currentColor' : 'none'"
            stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <h3 class="card-title">{{ article.title }}</h3>
    <p class="card-excerpt">{{ article.excerpt }}</p>

    <div class="card-footer">
      <div class="author-row">
        <span class="author-avatar-sm" :style="avatarStyle">{{ article.authorInitials }}</span>
        <span class="author-name-sm">{{ article.author }}</span>
        <span class="stat-sep">·</span>
        <span class="author-source-sm">{{ article.source }}</span>
      </div>
      <div class="card-stats">
        <span class="stat">{{ article.readTime }}m</span>
        <span class="stat-sep">·</span>
        <span class="stat">{{ article.views }}</span>
        <span class="stat-sep">·</span>
        <span class="stat">{{ article.date }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { TAGS } from '../data/articles.js'

const props = defineProps({
  article:  { type: Object, required: true },
  featured: { type: Boolean, default: false },
})
const emit = defineEmits(['bookmark'])

const tagInfo   = computed(() => TAGS.find(t => t.id === props.article.tag) ?? TAGS[0])
const tagColor  = computed(() => tagInfo.value.color)
const tagLabel  = computed(() => tagInfo.value.label)
const tagStyle  = computed(() => ({
  color:       tagColor.value,
  borderColor: tagColor.value + '44',
  background:  tagColor.value + '12',
}))

// Deterministic avatar gradient from initials
const avatarColors = ['#39d0c8', '#58a6ff', '#3fb950', '#bc8cff', '#ffa657', '#f85149']
const avatarStyle = computed(() => {
  const idx = props.article.id % avatarColors.length
  const c = avatarColors[idx]
  return {
    background: `linear-gradient(135deg, ${c}33, ${c}11)`,
    border: `1px solid ${c}44`,
    color: c,
  }
})

function handleClick() {
  // Future: open article detail / external link
}
</script>

<style scoped>
/* ===== BASE CARD ===== */
.card {
  background: #111820;
  border: 1px solid #1e2d3d;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
  position: relative;
  overflow: hidden;
}
.card:hover {
  border-color: #243447;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

/* ===== FEATURED ===== */
.card-featured {
  grid-column: 1 / -1;
  padding: 28px;
  display: grid;
  min-height: 220px;
}
.featured-inner { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; }
.featured-accent {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.featured-label {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: #4d5f72;
  margin-left: auto;
}
.featured-title {
  font-family: 'Fraunces', serif;
  font-size: 22px;
  font-weight: 600;
  color: #e6edf3;
  line-height: 1.3;
  max-width: 700px;
}

/* ===== REGULAR ===== */
.card-regular {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.card-title {
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #e6edf3;
  line-height: 1.4;
  flex: 1;
}

/* ===== SHARED ===== */
.card-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-chip {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 3px;
  border: 1px solid;
}

.trend-chip {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
}
.trend-chip.hot     { color: #ffa657; background: #ffa65714; border: 1px solid #ffa65733; }
.trend-chip.rising  { color: #3fb950; background: #3fb95014; border: 1px solid #3fb95033; }

.card-excerpt {
  font-family: 'DM Mono', monospace;
  font-size: 11.5px;
  color: #4d5f72;
  line-height: 1.65;
  display: -webkit-box;
  ---line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-featured .card-excerpt { color: #8b98a8; --line-clamp: 2; }

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 28px; height: 28px;
  border-radius: 6px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.author-info { display: flex; flex-direction: column; gap: 1px; }
.author-name { font-size: 12px; color: #8b98a8; font-weight: 500; }
.author-source { font-family: 'DM Mono', monospace; font-size: 10px; color: #4d5f72; }

.author-avatar-sm {
  width: 18px; height: 18px;
  border-radius: 4px;
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.author-name-sm   { font-size: 11px; color: #8b98a8; }
.author-source-sm { font-family: 'DM Mono', monospace; font-size: 10px; color: #4d5f72; }

.card-stats {
  display: flex;
  align-items: center;
  gap: 5px;
}
.stat {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #2d3d4e;
}
.stat-sep { color: #1e2d3d; font-size: 10px; }

/* Bookmark */
.bookmark-btn {
  background: none;
  border: none;
  color: #2d3d4e;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.bookmark-btn:hover { color: #ffa657; background: #ffa65714; }
.bookmark-btn.active { color: #ffa657; }
</style>