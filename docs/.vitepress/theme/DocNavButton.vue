<template>
  <a :href="withBase(to)" class="doc-button">
    <span class="doc-button-icon">{{ icon }}</span>
    <span class="doc-button-text">
      <span class="doc-button-title">{{ title }}</span>
      <span class="doc-button-desc">{{ desc }}</span>
    </span>
  </a>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress'

defineProps<{
  to: string;
  icon: string;
  title: string;
  desc?: string;
}>();
</script>