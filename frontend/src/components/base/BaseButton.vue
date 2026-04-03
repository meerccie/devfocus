<template>
  <button 
    :disabled="disabled || loading"
    class="px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    :class="variant === 'danger' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'"
  >
    <span v-if="loading" class="animate-pulse">Processing...</span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger';
}>();
</script>