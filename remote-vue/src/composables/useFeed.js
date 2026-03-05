import { ref, computed } from 'vue'
import { ARTICLES, TAGS } from '../data/articles.js'

export function useFeed() {
  const articles     = ref(ARTICLES.map(a => ({ ...a })))
  const activeTag    = ref('all')
  const searchQuery  = ref('')
  const sortBy       = ref('date') // 'date' | 'views' | 'readTime'
  const showBookmarks = ref(false)

  const filteredArticles = computed(() => {
    let list = articles.value

    // Bookmark filter
    if (showBookmarks.value) {
      list = list.filter(a => a.bookmarked)
    }

    // Tag filter
    if (activeTag.value !== 'all') {
      list = list.filter(a => a.tag === activeTag.value)
    }

    // Search
    const q = searchQuery.value.toLowerCase().trim()
    if (q) {
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
      )
    }

    return list
  })

  const featuredArticle = computed(() =>
    articles.value.find(a => a.featured) ?? null
  )

  const bookmarkCount = computed(() =>
    articles.value.filter(a => a.bookmarked).length
  )

  function toggleBookmark(id) {
    const article = articles.value.find(a => a.id === id)
    if (article) article.bookmarked = !article.bookmarked
  }

  function setTag(tag) {
    activeTag.value = tag
    showBookmarks.value = false
  }

  function toggleShowBookmarks() {
    showBookmarks.value = !showBookmarks.value
    if (showBookmarks.value) activeTag.value = 'all'
  }

  return {
    articles,
    filteredArticles,
    featuredArticle,
    activeTag,
    searchQuery,
    sortBy,
    showBookmarks,
    bookmarkCount,
    tags: TAGS,
    toggleBookmark,
    setTag,
    toggleShowBookmarks,
  }
}