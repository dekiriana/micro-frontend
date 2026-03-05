<template>
  <div class="feed-controls">
    <div class="search-box">
      <span class="prompt">$&gt;</span>
      <input 
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        type="text" 
        placeholder="grep -i 'tech news'..." 
        class="search-input"
      />
    </div>
    
    <div class="tag-filters">
      <button 
        v-for="tag in availableTags" 
        :key="tag"
        @click="$emit('update:activeTag', tag)"
        :class="['tag-btn', { active: activeTag === tag }]"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: String,
  activeTag: String,
  availableTags: Array
});

defineEmits(['update:searchQuery', 'update:activeTag']);
</script>

<style scoped>
.feed-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--bg-surface);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-default);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-base);
  border: 1px solid var(--border-strong);
  padding: 10px 16px;
  border-radius: 6px;
  font-family: var(--font-mono);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.prompt { color: var(--accent); font-weight: bold; }

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  outline: none;
  font-size: 13px;
  font-family: inherit;
}

.search-input::placeholder { color: var(--text-muted); }

.tag-filters { display: flex; gap: 8px; flex-wrap: wrap; }

.tag-btn {
  background: var(--bg-elevated);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover { 
  background: var(--bg-hover); 
  color: var(--text-primary); 
  border-color: var(--border-strong); 
}

.tag-btn.active {
  background: var(--accent-subtle);
  color: var(--accent);
  border-color: var(--accent-dim);
}
</style>