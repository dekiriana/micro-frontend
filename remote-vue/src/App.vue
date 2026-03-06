<template>
  <div class="feed-app" :class="{ 'panel-open': showBookmarks }">

    <!-- Header with search + filters -->
    <FeedHeader
      :tags="tags"
      :active-tag="activeTag"
      :search-query="searchQuery"
      :show-bookmarks="showBookmarks"
      :bookmark-count="bookmarkCount"
      :filtered-count="filteredArticles.length"
      :can-create="canCreate"
      @update:search-query="searchQuery = $event"
      @set-tag="setTag"
      @toggle-bookmarks="toggleShowBookmarks"
      @create-post="openCreateModal"
    />

    <!-- Main content -->
    <div class="feed-body">
      <!-- Publish success toast -->
      <Transition name="toast">
        <div v-if="showToast" class="publish-toast">
          <span class="toast-icon">✓</span>
          Article published to the feed!
        </div>
      </Transition>

      <!-- Role gate hint for non-admin -->
      <div v-if="authLoaded && !canCreate && isAuth" class="role-hint">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="#3d5166" stroke-width="1.2"/>
          <path d="M6 5v3M6 3.5v.5" stroke="#3d5166" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        <span>You're viewing as <strong>{{ userRole }}</strong> — only admins can publish articles.</span>
      </div>

      <!-- Empty state -->
      <Transition name="fade" mode="out-in">
        <div v-if="filteredArticles.length === 0" class="empty-state" key="empty">
          <div class="empty-icon">◌</div>
          <p class="empty-title">No articles found</p>
          <p class="empty-sub">Try a different tag or search query</p>
          <button class="empty-reset" @click="reset">Clear filters</button>
        </div>

        <!-- Articles grid -->
        <div v-else class="articles-grid" key="grid">
          <TransitionGroup name="card" tag="div" class="articles-inner">
            <!-- Featured first -->
            <ArticleCard
              v-if="featuredArticle && activeTag === 'all' && !searchQuery && !showBookmarks"
              :key="`featured-${featuredArticle.id}`"
              :article="featuredArticle"
              :featured="true"
              @bookmark="toggleBookmark"
            />

            <!-- Regular articles -->
            <ArticleCard
              v-for="(article, i) in regularArticles"
              :key="article.id"
              :article="article"
              :style="{ animationDelay: `${i * 40}ms` }"
              @bookmark="toggleBookmark"
            />
          </TransitionGroup>

          <!-- Footer stats -->
          <div class="feed-footer">
            <span class="footer-stat">{{ filteredArticles.length }} articles</span>
            <span class="footer-sep">·</span>
            <span class="footer-stat">{{ totalReadTime }} min total read time</span>
            <span class="footer-sep">·</span>
            <span class="footer-powered">
              powered by <span class="vue-badge">Vue 3</span> via Module Federation
            </span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Bookmark panel -->
    <BookmarkPanel
      :show="showBookmarks"
      :bookmarked="bookmarkedArticles"
      @close="showBookmarks = false"
      @remove="toggleBookmark"
    />

    <!-- Create Post Modal — only mounted when open -->
    <Teleport to="body">
      <CreatePostModal
        v-if="showCreateModal"
        :user="authUser"
        @close="showCreateModal = false"
        @published="handlePublished"
      />
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FeedHeader      from './components/FeedHeader.vue'
import ArticleCard     from './components/ArticleCard.vue'
import BookmarkPanel   from './components/BookmarkPanel.vue'
import CreatePostModal from './components/CreatePostModal.vue'
import { useFeed }     from './composables/useFeed.js'
import { useAuth }     from './composables/useAuth.js'

// ── Auth ──────────────────────────────────────────────────────────────────
const { isAuth, user: authUser, role: userRole, caps } = useAuth()
const authLoaded  = ref(false)
const canCreate   = computed(() => caps.value?.canWrite || false)

onMounted(() => {
  // Give auth store 500ms to hydrate before showing role hint
  setTimeout(() => { authLoaded.value = true }, 500)
})

// ── Feed ──────────────────────────────────────────────────────────────────
const {
  filteredArticles, featuredArticle, activeTag, searchQuery,
  showBookmarks, bookmarkCount, tags, toggleBookmark, setTag,
  toggleShowBookmarks, articles,
} = useFeed()

const regularArticles = computed(() => {
  if (activeTag.value === 'all' && !searchQuery.value && !showBookmarks.value && featuredArticle.value) {
    return filteredArticles.value.filter(a => !a.featured)
  }
  return filteredArticles.value
})

const bookmarkedArticles = computed(() => articles.value.filter(a => a.bookmarked))
const totalReadTime      = computed(() => filteredArticles.value.reduce((s, a) => s + a.readTime, 0))

function reset() {
  searchQuery.value   = ''
  activeTab.value     = 'all'
  showBookmarks.value = false
}

// ── Create Post ───────────────────────────────────────────────────────────
const showCreateModal = ref(false)
const showToast       = ref(false)

function openCreateModal() {
  if (!canCreate.value) return
  showCreateModal.value = true
}

function handlePublished(newArticle) {
  // Prepend to articles list
  articles.value.unshift(newArticle)
  showCreateModal.value = false

  // Show success toast
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3500)
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&family=Fraunces:ital,wght@0,300;0,600;1,300;1,600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Mono', monospace; background: #0d1117; color: #e6edf3; min-height: 100vh; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #243447; border-radius: 2px; }
</style>

<style scoped>
.feed-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0d1117;
  font-family: 'DM Mono', monospace;
  transition: padding-right 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.feed-app.panel-open { padding-right: 300px; }

.feed-body {
  flex: 1;
  padding: 20px 32px 40px;
  position: relative;
}

/* ── Publish toast ── */
.publish-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: #111820;
  border: 1px solid rgba(55,201,125,0.4);
  border-radius: 30px;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #37c97d;
  z-index: 300;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.toast-icon { font-size: 14px; }
.toast-enter-active { transition: all 0.35s cubic-bezier(0.16,1,0.3,1); }
.toast-leave-active { transition: all 0.25s ease-in; }
.toast-enter-from   { opacity: 0; transform: translateX(-50%) translateY(16px); }
.toast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(8px); }

/* ── Role hint ── */
.role-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: rgba(61,82,104,0.1);
  border: 1px solid #1e2d3d;
  border-radius: 7px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #3d5166;
}
.role-hint strong { color: #4d5f72; }

/* ── Grid ── */
.articles-grid { display: flex; flex-direction: column; gap: 0; }
.articles-inner {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
  margin-bottom: 32px;
}

.card-enter-active { animation: cardIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
.card-leave-active { animation: cardOut 0.2s ease-in both; }
.card-move { transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); }
@keyframes cardIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cardOut { to { opacity: 0; transform: scale(0.96); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Empty ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 80px 40px;
  text-align: center;
}
.empty-icon  { font-size: 36px; color: #2d3d4e; }
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
.empty-reset:hover { border-color: #39d0c8; color: #39d0c8; }

/* ── Footer ── */
.feed-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #111820;
}
.footer-stat    { font-size: 11px; color: #2d3d4e; }
.footer-sep     { font-size: 11px; color: #1e2d3d; }
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


<!-- <template>
  <div class="feed-app" :class="{ 'panel-open': showBookmarks }">
    <div class="feed-header-wrapper">
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
      
      <div class="auth-controls">
        <span v-if="role" :class="['role-badge', role]">
          {{ role }}
        </span>
        
        <button v-if="caps.canWrite" class="create-post-btn">
          + Create Post
        </button>
      </div>
    </div>

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

import { useAuth } from './composables/useAuth.js'

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

const { role, caps } = useAuth()

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

@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&family=Fraunces:ital,wght@0,300;0,600;1,300;1,600&display=swap');
</style>

<style scoped>
.feed-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: padding-right 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'DM Mono', monospace;
}

.feed-app.panel-open { padding-right: 300px; }


.feed-header-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px 0 32px; 
}

.auth-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}


.role-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: 'DM Mono', monospace;
  text-transform: uppercase;
  font-weight: 600;
  border: 1px solid;
}
.role-badge.admin { color: #e5393d; border-color: #e5393d; background: rgba(229, 57, 61, 0.1); }
.role-badge.developer { color: #4da6ff; border-color: #4da6ff; background: rgba(77, 166, 255, 0.1); }
.role-badge.viewer { color: #37c97d; border-color: #37c97d; background: rgba(55, 201, 125, 0.1); }


.create-post-btn {
  background: var(--accent, #3ecfca); 
  color: var(--bg-void, #060809);
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-family: 'DM Mono', monospace;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.create-post-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(62, 207, 202, 0.2);
}

.feed-body {
  flex: 1;
  padding: 24px 32px 40px 32px; 
}


.articles-grid { display: flex; flex-direction: column; gap: 0; }
.articles-inner {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
  margin-bottom: 32px;
}


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


.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }


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
</style> -->