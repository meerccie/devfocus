<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder?: string;
  type?: string;
}>();

defineEmits(['update:modelValue', 'enter']);
</script>

<template>
  <input
    :type="type || 'text'"
    :value="modelValue"
    :placeholder="placeholder"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    @keyup.enter="$emit('enter')"
    class="bg-slate-900 border border-slate-800 text-slate-200 px-4 py-2 rounded-xl 
           focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
           transition-all w-full placeholder:text-slate-600"
  />
</template>