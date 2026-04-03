<template>
  <div :class="['p-4 rounded-xl border mb-3', severityClasses]">
    <div class="flex justify-between font-mono text-xs mb-2">
      <span class="truncate pr-4">{{ issue.path }}</span>
      <span class="font-black">{{ issue.severity }}</span>
    </div>
    <p class="text-sm opacity-80">{{ issue.description }}</p>
    <div v-if="issue.remediation" class="mt-2 text-[10px] border-t border-white/10 pt-2 italic">
      <strong>REMEDY:</strong> {{ issue.remediation }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SecurityIssue } from '../../types/security';

const props = defineProps<{ issue: SecurityIssue }>();

const severityClasses = computed(() => {
  const map = {
    CRITICAL: 'bg-red-500/10 border-red-500/30 text-red-400',
    HIGH: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    MEDIUM: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    LOW: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };
  return map[props.issue.severity];
});
</script>