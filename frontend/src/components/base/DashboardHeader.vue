<script setup lang="ts">
const props = defineProps<{ loading: boolean }>();
const emit = defineEmits(['search']);
const username = defineModel<string>(); // Cleanest way to sync input in Vue 3.4+
</script>

<template>
  <header class="flex flex-col lg:flex-row justify-between items-center mb-16 gap-8">
    <div class="text-center lg:text-left">
      <h1 class="text-5xl font-black text-white tracking-tighter italic uppercase">
        DEV<span class="text-indigo-500">FOCUS</span>
      </h1>
      <p class="text-slate-500 font-mono text-[10px] mt-2 uppercase tracking-[0.4em]">
        Security Intelligence Hub
      </p>
    </div>
    
    <div class="flex bg-slate-900 p-2 rounded-2xl border border-slate-800 w-full md:w-auto shadow-2xl focus-within:ring-1 ring-indigo-500/50 transition-all">
      <input 
        v-model="username" 
        @keyup.enter="emit('search')" 
        placeholder="Target GitHub Handle..." 
        class="bg-transparent px-5 py-2 outline-none w-full md:w-80 font-medium placeholder:text-slate-700" 
      />
      <button 
        @click="emit('search')" 
        :disabled="loading" 
        class="bg-indigo-600 px-8 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50"
      >
        {{ loading ? 'LOCATING...' : 'INITIALIZE' }}
      </button>
    </div>
  </header>
</template>