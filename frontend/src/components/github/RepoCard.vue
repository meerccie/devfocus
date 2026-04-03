<script setup lang="ts">
import type { GithubRepo } from '../../types/repository';

defineProps<{
  repo: GithubRepo;
  isScanning?: boolean;
}>();

defineEmits<{
  (e: 'scan', repoName: string): void
}>();
</script>

<template>
  <div class="group bg-slate-900 border border-slate-800 p-5 rounded-3xl hover:border-indigo-500/40 transition-all flex flex-col justify-between">
    <div>
      <div class="flex justify-between items-start mb-3">
        <h4 class="font-bold text-white group-hover:text-indigo-400 transition-colors truncate pr-2">
          {{ repo.name }}
        </h4>
        <span v-if="repo.isPrivate" class="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 uppercase font-black">
          Private
        </span>
      </div>
      
      <p class="text-xs text-slate-400 line-clamp-2 mb-4 min-h-[32px]">
        {{ repo.description || 'No description provided for this repository.' }}
      </p>

      <div class="flex gap-3 mb-6">
        <div class="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
          <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
          {{ repo.language || 'Plain' }}
        </div>
        <div class="text-[10px] text-yellow-500 font-bold">
          ★ {{ repo.stars }}
        </div>
      </div>
    </div>

    <button 
      @click="$emit('scan', repo.name)"
      :disabled="isScanning"
      class="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
             border border-slate-800 bg-slate-950 text-slate-500 
             hover:bg-red-600 hover:text-white hover:border-red-500 disabled:opacity-50"
    >
      <span v-if="isScanning" class="animate-pulse">Analyzing...</span>
      <span v-else>Run Security Audit</span>
    </button>
  </div>
</template>