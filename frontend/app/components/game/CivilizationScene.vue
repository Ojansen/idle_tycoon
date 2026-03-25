<script setup lang="ts">
</script>

<template>
  <div class="scene-container">
    <div class="scene type-0">
      <div class="stars" />
      <div class="planet">
        <div class="planet-surface" />
        <div class="city-light light-1" />
        <div class="city-light light-2" />
        <div class="city-light light-3" />
        <div class="atmosphere" />
      </div>
      <div class="satellite" />
    </div>
  </div>
</template>

<style scoped>
.scene-container {
  width: 100%;
  height: 160px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  pointer-events: none;
}

.scene {
  width: 100%;
  height: 100%;
  position: relative;
}

.stars {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.5), transparent),
    radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 50% 15%, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 70% 45%, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,0.4), transparent),
    radial-gradient(1px 1px at 15% 55%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 85% 25%, rgba(255,255,255,0.5), transparent),
    radial-gradient(1px 1px at 45% 90%, rgba(255,255,255,0.3), transparent);
  animation: twinkle 4s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

@keyframes orbit {
  from { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); }
  to { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 1; }
}

.type-0 {
  background: radial-gradient(ellipse at 50% 120%, #0a0a2e 0%, #09090b 70%);
}

.type-0 .planet {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
}

.type-0 .planet-surface {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #1a3a5c, #0a1628);
  box-shadow: inset -8px -4px 12px rgba(0,0,0,0.6);
}

.type-0 .city-light {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #fbbf24;
  box-shadow: 0 0 6px 2px rgba(251,191,36,0.6);
  animation: pulse 2s ease-in-out infinite;
}
.type-0 .light-1 { top: 35%; left: 30%; animation-delay: 0s; }
.type-0 .light-2 { top: 45%; left: 55%; animation-delay: 0.7s; }
.type-0 .light-3 { top: 55%; left: 40%; animation-delay: 1.3s; }

.type-0 .atmosphere {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(100,149,237,0.2);
  box-shadow: 0 0 15px rgba(100,149,237,0.1);
}

.type-0 .satellite {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 3px;
  height: 3px;
  background: white;
  border-radius: 50%;
  --orbit-r: 48px;
  animation: orbit 8s linear infinite;
  box-shadow: 0 0 4px rgba(255,255,255,0.8);
}
</style>
