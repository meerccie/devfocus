<script setup lang="ts">
defineProps<{
  scanning: boolean;
  selectedRepo: string;
  riskReport: { score: number; level: string } | null;
}>();
</script>

<template>
  <div v-if="selectedRepo || scanning" class="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
    <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
      <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"></span>
      Threat Level: {{ selectedRepo }}
    </h3>
    
    <div v-if="scanning" class="py-6 space-y-4">
      <div class="flex justify-between text-[11px] text-indigo-400 font-mono italic animate-pulse">
        <span>ANALYZING SOURCE...</span>
        <span>UPLOADING</span>
      </div>
      <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div class="h-full bg-indigo-500 animate-progress-indeterminate"></div>
      </div>
    </div>

    <div v-else-if="riskReport">
      <div class="flex justify-between items-end mb-4">
        <span :class="['text-4xl font-black italic transition-colors', riskReport.level === 'CRITICAL' ? 'text-red-500' : 'text-white']">
          {{ riskReport.level }}
        </span>
        <span class="text-slate-500 font-mono text-sm tracking-tighter">{{ riskReport.score }}/100</span>
      </div>
      <div class="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50 text-white">
        <div 
          class="h-full bg-indigo-500 rounded-full transition-all duration-[1500ms] ease-out" 
          :style="{ width: riskReport.score + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>