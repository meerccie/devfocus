<script setup lang="ts">
const props = defineProps<{ loading: boolean }>();
const emit = defineEmits(['search']);
const username = defineModel<string>(); // Vue 3.4+ way to handle v-model
</script>

<template>
  <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
    <div>
      <h1 class="text-4xl font-black text-white tracking-tighter">DEV<span class="text-indigo-500">FOCUS</span></h1>
      <p class="text-slate-500 font-mono text-xs mt-1 uppercase tracking-widest">Security Intelligence Dashboard</p>
    </div>
    <div class="flex bg-slate-900 p-2 rounded-2xl border border-slate-800 w-full md:w-auto shadow-2xl">
      <input 
        v-model="username" 
        @keyup.enter="emit('search')" 
        placeholder="Target Username..." 
        class="bg-transparent px-4 py-2 outline-none w-full md:w-64" 
      />
      <button 
        @click="emit('search')" 
        :disabled="loading" 
        class="bg-indigo-600 px-6 py-2 rounded-xl font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50"
      >
        {{ loading ? 'Locating...' : 'Search' }}
      </button>
    </div>
  </div>
</template>