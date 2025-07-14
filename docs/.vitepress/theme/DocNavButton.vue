<template>
  <a :href="to" class="doc-button">
    <span class="doc-button-icon">{{ icon }}</span>
    <span class="doc-button-text">
      <span class="doc-button-title">{{ title }}</span>
      <span class="doc-button-desc">{{ desc }}</span>
    </span>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  to: string;
  icon: string;
  title: string;
  desc?: string;
}>();
</script>
