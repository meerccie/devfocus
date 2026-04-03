<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Mousewheel, Grid } from 'swiper/modules'; // Added Grid
import RepoCard from './RepoCard.vue';
import type { GithubRepo } from '../../types/repository';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/grid'; // Required for multi-row logic

defineProps<{
  repos: GithubRepo[];
  scanningRepoName?: string;
}>();

const emit = defineEmits<{
  (e: 'select', repoName: string): void
}>();

// Add Grid to the modules
const modules = [Navigation, Pagination, Mousewheel, Grid];
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between px-2">
      <h3 class="text-white font-bold flex items-center gap-2 text-lg">
        <span class="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></span>
        Public Repos ({{ repos.length }})
      </h3>
      <div class="flex items-center gap-4">
        <div class="flex gap-2">
          <button class="swiper-prev-btn p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button class="swiper-next-btn p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>

    <swiper
      :modules="modules"
      :slides-per-view="1"
      :grid="{ rows: 2, fill: 'row' }"
      :space-between="20"
      :mousewheel="true"
      :grab-cursor="true"
      :navigation="{
        prevEl: '.swiper-prev-btn',
        nextEl: '.swiper-next-btn',
      }"
      :pagination="{ clickable: true, dynamicBullets: true }"
      :breakpoints="{
        '640': { slidesPerView: 2, grid: { rows: 2 } },
        '1024': { slidesPerView: 3, grid: { rows: 2 } }
      }"
      class="repo-swiper"
    >
      <swiper-slide v-for="repo in repos" :key="repo.id" class="uniform-slide">
        <RepoCard 
          :repo="repo"
          :is-scanning="scanningRepoName === repo.name"
          @scan="(name) => emit('select', name)"
          class="h-full w-full" 
        />
      </swiper-slide>
    </swiper>
  </section>
</template>

<style scoped>
/* To keep cards the same size, this height must be:
  (Single Card Height * 2) + gap (20px) + padding for pagination 
*/
.repo-swiper {
  width: 100%;
  height: 500px; 
  padding-bottom: 3rem !important;
}

/* Forces each slide to be exactly half the container height minus the gap */
.uniform-slide {
  height: calc((100% - 20px) / 2) !important;
  display: flex;
}

.swiper-pagination-bullet {
  background: #1e293b !important;
  opacity: 1 !important;
}
.swiper-pagination-bullet-active {
  background: #6366f1 !important;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
}

.swiper-button-disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>