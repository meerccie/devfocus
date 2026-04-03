<script setup lang="ts">
import RepoCard from './RepoCard.vue';
import type { GithubRepo } from '../../types/repository';

defineProps<{
  repos: GithubRepo[];
  scanningRepoName?: string; // Track which specific repo is scanning
}>();

const emit = defineEmits<{
  (e: 'select', repoName: string): void
}>();
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between px-2">
      <h3 class="text-white font-bold flex items-center gap-2 text-lg">
        <span class="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></span>
        Available Assets ({{ repos.length }})
      </h3>
      <span class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
        Select Target for Audit
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <RepoCard 
        v-for="repo in repos" 
        :key="repo.id" 
        :repo="repo"
        :is-scanning="scanningRepoName === repo.name"
        @scan="(name) => emit('select', name)"
      />
    </div>
  </section>
</template>