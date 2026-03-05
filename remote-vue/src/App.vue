<template>
  <div class="feed-app" :class="{ 'panel-open': showBookmarks }">
    <FeedHeader
      :tags="tags"
      :active-tag="activeTag"
      :search-query="searchQuery"
      :show-bookmarks="showBookmarks"
      :bookmark-count="bookmarkCount"
      :filtered-count="filteredArticles.length"
      @update:search-query="searchQuery = $event"
      @set-tag="setTag"
      @toggle-bookmarks="toggleShowBookmarks"
    />

    <div class="feed-body">
      <Transition name="fade" mode="out-in">
        <div v-if="filteredArticles.length === 0" class="empty-state" key="empty">
          <div class="empty-icon">◌</div>
          <p class="empty-title">No articles found</p>
          <p class="empty-sub">Try a different tag or search query</p>
          <button class="empty-reset" @click="reset">Clear filters</button>
        </div>

        <div v-else class="articles-grid" key="grid">
          <TransitionGroup name="card" tag="div" class="articles-inner">
            <ArticleCard
              v-if="featuredArticle && activeTag === 'all' && !searchQuery && !showBookmarks"
              :key="`featured-${featuredArticle.id}`"
              :article="featuredArticle"
              :featured="true"
              @bookmark="toggleBookmark"
            />

            <ArticleCard
              v-for="(article, i) in regularArticles"
              :key="article.id"
              :article="article"
              :style="{ animationDelay: `${i * 40}ms` }"
              @bookmark="toggleBookmark"
            />
          </TransitionGroup>

          <div class="feed-footer">
            <span class="footer-stat">
              {{ filteredArticles.length }} articles
            </span>
            <span class="footer-sep">·</span>
            <span class="footer-stat">
              {{ totalReadTime }} min total read time
            </span>
            <span class="footer-sep">·</span>
            <span class="footer-powered">
              powered by
              <span class="vue-badge">Vue 3</span>
              via Module Federation
            </span>
          </div>
        </div>
      </Transition>
    </div>

    <BookmarkPanel
      :show="showBookmarks"
      :bookmarked="bookmarkedArticles"
      @close="showBookmarks = false"
      @remove="toggleBookmark"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import FeedHeader    from './components/FeedHeader.vue'
import ArticleCard   from './components/ArticleCard.vue'
import BookmarkPanel from './components/BookmarkPanel.vue'
import { useFeed }   from './composables/useFeed.js'

const {
  filteredArticles,
  featuredArticle,
  activeTag,
  searchQuery,
  showBookmarks,
  bookmarkCount,
  tags,
  toggleBookmark,
  setTag,
  toggleShowBookmarks,
  articles,
} = useFeed()


const regularArticles = computed(() => {
  if (activeTag.value === 'all' && !searchQuery.value && !showBookmarks.value && featuredArticle.value) {
    return filteredArticles.value.filter(a => !a.featured)
  }
  return filteredArticles.value
})

const bookmarkedArticles = computed(() =>
  articles.value.filter(a => a.bookmarked)
)

const totalReadTime = computed(() =>
  filteredArticles.value.reduce((sum, a) => sum + a.readTime, 0)
)

function reset() {
  searchQuery.value   = ''
  activeTag.value     = 'all'
  showBookmarks.value = false
}
</script>

<style>
/* Global font import — ini akan menambah font cantik Fraunces dan Syne */
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&family=Fraunces:ital,wght@0,300;0,600;1,300;1,600&display=swap');

/* Kita HAPUS body styling di sini karena body sudah diatur oleh React Host di global.css */
</style>

<style scoped>
.feed-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: padding-right 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'DM Mono', monospace;
}
/* Saat panel bookmark terbuka, kita geser konten ke kiri */
.feed-app.panel-open { padding-right: 300px; }

.feed-body {
  flex: 1;
  padding: 24px 32px 40px 32px; /* Tambahkan 32px di kiri dan kanan */
}

/* Grid */
.articles-grid { display: flex; flex-direction: column; gap: 0; }
.articles-inner {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
  margin-bottom: 32px;
}

/* Card entrance animation */
.card-enter-active {
  animation: cardIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.card-leave-active {
  animation: cardOut 0.2s ease-in both;
}
.card-move { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }

@keyframes cardIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cardOut {
  to { opacity: 0; transform: scale(0.96); }
}

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 80px 40px;
  text-align: center;
}
.empty-icon  { font-size: 36px; color: #2d3d4e; line-height: 1; }
.empty-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #8b98a8; }
.empty-sub   { font-size: 12px; color: #4d5f72; }
.empty-reset {
  margin-top: 8px;
  padding: 7px 18px;
  background: transparent;
  border: 1px solid #243447;
  border-radius: 6px;
  color: #8b98a8;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.empty-reset:hover { border-color: #39d0c8; color: #39d0c8; background: rgba(57,208,200,0.06); }

/* Footer */
.feed-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #1e2d3d;
}
.footer-stat { font-size: 11px; color: #2d3d4e; }
.footer-sep  { font-size: 11px; color: #1e2d3d; }
.footer-powered { font-size: 11px; color: #2d3d4e; display: flex; align-items: center; gap: 5px; }
.vue-badge {
  color: #42b883;
  background: #42b88314;
  border: 1px solid #42b88333;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
}
</style>