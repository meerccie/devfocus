<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  scanning: boolean;
  selectedRepo: string;
  riskReport: { score: number; level: string } | null;
}>();

/**
 * Dynamic styling based on the severity level
 */
const severityClasses = computed(() => {
  if (!props.riskReport) return { text: 'text-white', bg: 'bg-indigo-500' };
  
  switch (props.riskReport.level.toUpperCase()) {
    case 'CRITICAL':
      return { text: 'text-red-500 shadow-red-500/20', bg: 'bg-red-500' };
    case 'HIGH':
      return { text: 'text-orange-500', bg: 'bg-orange-500' };
    case 'MEDIUM':
      return { text: 'text-yellow-500', bg: 'bg-yellow-500' };
    case 'LOW':
      return { text: 'text-emerald-500', bg: 'bg-emerald-500' };
    default:
      return { text: 'text-white', bg: 'bg-indigo-500' };
  }
});
</script>

<template>
  <div v-if="selectedRepo || scanning" class="bg-slate-900 border border-slate-800 p-8 rounded-4xl relative overflow-hidden shadow-2xl">
    
    <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
      <span 
        class="w-1.5 h-1.5 rounded-full shadow-[0_0_8px]"
        :class="scanning ? 'bg-indigo-500 animate-pulse' : severityClasses.bg"
      ></span>
      Audit Target: {{ selectedRepo }}
    </h3>
    
    <div v-if="scanning" class="py-6 space-y-4">
      <div class="flex justify-between text-[11px] text-indigo-400 font-mono italic animate-pulse">
        <span>RUNNING RECONNAISSANCE...</span>
        <span>UPLOADING</span>
      </div>
      <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div class="h-full bg-indigo-500 animate-progress-indeterminate"></div>
      </div>
    </div>

    <div v-else-if="riskReport" class="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="flex justify-between items-end mb-4">
        <span 
          class="text-4xl font-black italic transition-colors tracking-tighter"
          :class="severityClasses.text"
        >
          {{ riskReport.level }}
        </span>
        <div class="flex flex-col items-end">
          <span class="text-[10px] text-slate-600 font-bold uppercase">Risk Score</span>
          <span class="text-slate-400 font-mono text-sm">{{ riskReport.score }}/100</span>
        </div>
      </div>

      <div class="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div 
          class="h-full rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)]" 
          :class="severityClasses.bg"
          :style="{ width: riskReport.score + '%' }"
        ></div>
      </div>

      <p class="mt-4 text-[9px] text-slate-500 leading-relaxed italic">
        * Score is derived from entropy density and high-risk file patterns.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Ensure the progress bar animation is defined if not global */
@keyframes progress-indeterminate {
  0% { transform: translateX(-100%); width: 25%; }
  50% { width: 45%; }
  100% { transform: translateX(400%); width: 25%; }
}
.animate-progress-indeterminate {
  animation: progress-indeterminate 1.8s infinite linear;
}
</style>