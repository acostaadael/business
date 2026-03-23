<template>
  <div class="spark">
    <svg v-if="normalized.length" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none" class="spark__svg">
      <polyline :points="points" fill="none" stroke="currentColor" stroke-width="2" />
      <polyline :points="pointsArea" fill="currentColor" opacity="0.15" stroke="none" />
    </svg>
    <div v-else class="text-muted small">Sin datos</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    values: number[];
    width?: number;
    height?: number;
  }>(),
  {
    width: 240,
    height: 64,
  },
);

const width = computed(() => props.width);
const height = computed(() => props.height);

const normalized = computed(() => {
  const vals = (props.values ?? []).filter(v => Number.isFinite(v));
  if (!vals.length) return [] as number[];
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  return vals.map(v => (v - min) / range);
});

const points = computed(() => {
  const n = normalized.value;
  if (!n.length) return '';
  const step = n.length === 1 ? 0 : width.value / (n.length - 1);
  return n
    .map((v, i) => {
      const x = i * step;
      const y = height.value - v * height.value;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
});

const pointsArea = computed(() => {
  if (!points.value) return '';
  return `0,${height.value} ${points.value} ${width.value},${height.value}`;
});
</script>

<style scoped>
.spark {
  width: 100%;
}
.spark__svg {
  width: 100%;
  height: 64px;
  color: #2d78ff;
}
</style>
