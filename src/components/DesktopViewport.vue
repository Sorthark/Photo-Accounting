<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const LAYOUT_WIDTH = 1280

const canvasRef = ref<HTMLElement | null>(null)
const scale = ref(1)
const hostHeight = ref<number | null>(null)

function updateScale() {
  const width = window.innerWidth
  scale.value = width >= LAYOUT_WIDTH ? 1 : width / LAYOUT_WIDTH
  updateHostHeight()
}

function updateHostHeight() {
  const canvas = canvasRef.value
  if (!canvas || scale.value >= 1) {
    hostHeight.value = null
    return
  }
  hostHeight.value = Math.ceil(canvas.offsetHeight * scale.value)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateScale()
  window.addEventListener('resize', updateScale)

  if (canvasRef.value) {
    resizeObserver = new ResizeObserver(updateHostHeight)
    resizeObserver.observe(canvasRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
  resizeObserver?.disconnect()
})
</script>

<template>
  <div
    class="desktop-viewport-host"
    :class="{ scaled: scale < 1 }"
    :style="hostHeight != null ? { height: `${hostHeight}px` } : undefined"
  >
    <div
      ref="canvasRef"
      class="desktop-viewport-canvas"
      :style="{
        width: `${LAYOUT_WIDTH}px`,
        transform: scale < 1 ? `scale(${scale})` : undefined,
      }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.desktop-viewport-host {
  width: 100%;
  min-height: 100vh;

  &.scaled {
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.desktop-viewport-canvas {
  min-height: 100vh;
  transform-origin: top left;
}
</style>
