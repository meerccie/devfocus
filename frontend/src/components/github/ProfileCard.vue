<script setup lang="ts">
import type { GithubUser } from '../../types/user';

defineProps<{
  user: GithubUser;
}>();
</script>

<template>
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
    <div class="flex flex-col items-center text-center">
      <img :src="user.avatarUrl" :alt="user.username" class="w-24 h-24 rounded-full border-4 border-slate-800 mb-4 shadow-lg" />
      <h2 class="text-xl font-bold text-white">{{ user.displayName || user.username }}</h2>
      <p class="text-indigo-400 text-sm mb-4">@{{ user.username }}</p>
      
      <p v-if="user.bio" class="text-slate-400 text-sm leading-relaxed mb-6 italic italic">"{{ user.bio }}"</p>

      <div class="grid grid-cols-2 gap-4 w-full">
        <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
          <p class="text-[10px] uppercase font-black text-slate-500 tracking-widest">Repos</p>
          <p class="text-lg font-mono text-white">{{ user.repoCount }}</p>
        </div>
        <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
          <p class="text-[10px] uppercase font-black text-slate-500 tracking-widest">Commits</p>
          <p class="text-lg font-mono text-white">{{ user.totalCommits || 0 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>