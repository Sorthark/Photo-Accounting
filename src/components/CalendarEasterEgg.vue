<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import catImg from '../assets/easter-egg-cat.png'

const props = defineProps<{
  count: number
  monthLabel: string
}>()

const emit = defineEmits<{ close: [] }>()

const visible = ref(false)
const messageIndex = ref(0)

const messages = computed(() => [
  `本月已录入 ${props.count} 项啦！`,
  '你真的很努力，继续加油～',
  '喵～记得适当休息，别太累哦',
  '每一单都是成长的脚印 ✨',
])

const currentMessage = computed(() => messages.value[messageIndex.value])

let messageTimer: ReturnType<typeof setInterval> | null = null
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null

function startAnim() {
  visible.value = true
  messageIndex.value = 0
  messageTimer = setInterval(() => {
    messageIndex.value = (messageIndex.value + 1) % messages.value.length
  }, 2800)
  autoCloseTimer = setTimeout(close, 12000)
}

function close() {
  visible.value = false
  if (messageTimer) clearInterval(messageTimer)
  if (autoCloseTimer) clearTimeout(autoCloseTimer)
  emit('close')
}

onMounted(() => {
  requestAnimationFrame(() => startAnim())
})
</script>

<template>
  <Teleport to="body">
    <Transition name="egg-fade">
      <div v-if="visible" class="easter-egg-overlay" @click.self="close">
        <div class="easter-egg-card">
          <div class="sparkles">
            <span v-for="i in 8" :key="i" class="sparkle" :style="{ '--i': i }" />
          </div>

          <div class="cat-wrap">
            <div class="cat-glow" />
            <img :src="catImg" alt="鼓励猫咪" class="cat-img" />
            <div class="cat-paw left">🐾</div>
            <div class="cat-paw right">🐾</div>
          </div>

          <div class="egg-content">
            <p class="egg-badge">🎉 隐藏彩蛋</p>
            <h3 class="egg-title">{{ monthLabel }} · 成就解锁</h3>
            <Transition name="msg-slide" mode="out-in">
              <p :key="messageIndex" class="egg-message">{{ currentMessage }}</p>
            </Transition>
            <p class="egg-hint">当月录入超过 8 项即可触发</p>
          </div>

          <button class="egg-close" @click="close">知道啦 ♡</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.easter-egg-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(61, 56, 48, 0.45);
  backdrop-filter: blur(4px);
  padding: 24px;
}

.easter-egg-card {
  position: relative;
  width: 100%;
  max-width: 360px;
  background: linear-gradient(160deg, #fffdf9 0%, #f7f4ef 100%);
  border-radius: 20px;
  padding: 28px 24px 24px;
  box-shadow: 0 20px 60px rgba(61, 56, 48, 0.2);
  text-align: center;
  overflow: hidden;
  animation: card-pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes card-pop {
  from {
    opacity: 0;
    transform: scale(0.7) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $color-brown-light;
  opacity: 0;
  animation: sparkle 2s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.25s);

  @for $n from 1 through 8 {
    &:nth-child(#{$n}) {
      top: #{10 + ($n * 9 % 70)}%;
      left: #{5 + ($n * 13 % 85)}%;
    }
  }
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}

.cat-wrap {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 16px;
}

.cat-glow {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba($color-brown-light, 0.35) 0%, transparent 70%);
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

.cat-img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid rgba($color-brown-light, 0.5);
  animation: cat-float 3s ease-in-out infinite;
  box-shadow: 0 8px 24px rgba(61, 56, 48, 0.12);
}

@keyframes cat-float {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-10px) rotate(1deg);
  }
}

.cat-paw {
  position: absolute;
  font-size: 18px;
  opacity: 0;
  animation: paw-wave 2.5s ease-in-out infinite;

  &.left {
    left: -8px;
    bottom: 20px;
    animation-delay: 0.3s;
  }

  &.right {
    right: -8px;
    bottom: 20px;
    animation-delay: 0.8s;
  }
}

@keyframes paw-wave {
  0%,
  70%,
  100% {
    opacity: 0;
    transform: translateY(8px) scale(0.8);
  }
  35% {
    opacity: 1;
    transform: translateY(-4px) scale(1);
  }
}

.egg-badge {
  display: inline-block;
  font-size: 12px;
  color: $color-brown;
  background: rgba($color-brown-light, 0.25);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 8px;
}

.egg-title {
  font-size: 17px;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 12px;
}

.egg-message {
  font-size: 15px;
  color: $color-text;
  line-height: 1.6;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.egg-hint {
  font-size: 11px;
  color: $color-text-secondary;
  margin-top: 8px;
}

.egg-close {
  margin-top: 16px;
  padding: 10px 28px;
  border: none;
  border-radius: 20px;
  background: $color-brown;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;

  &:hover {
    background: #8f7354;
    transform: scale(1.04);
  }
}

.egg-fade-enter-active,
.egg-fade-leave-active {
  transition: opacity 0.35s ease;
}

.egg-fade-enter-from,
.egg-fade-leave-to {
  opacity: 0;
}

.msg-slide-enter-active,
.msg-slide-leave-active {
  transition: all 0.35s ease;
}

.msg-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.msg-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
