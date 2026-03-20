<script setup lang="ts">
const { kardashevLevel } = useGameState()
</script>

<template>
  <div class="scene-container">
    <!-- Type 0: Small planet with city lights -->
    <div v-if="kardashevLevel === 0" class="scene type-0">
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

    <!-- Type I: Fully lit planet with orbital ring -->
    <div v-else-if="kardashevLevel === 1" class="scene type-1">
      <div class="stars" />
      <div class="star-bg" />
      <div class="planet">
        <div class="planet-surface" />
        <div class="grid-overlay" />
        <div class="atmosphere" />
      </div>
      <div class="orbital-ring" />
      <div class="satellite sat-1" />
      <div class="satellite sat-2" />
      <div class="satellite sat-3" />
    </div>

    <!-- Type II: Star with Dyson sphere -->
    <div v-else-if="kardashevLevel === 2" class="scene type-2">
      <div class="stars" />
      <div class="star">
        <div class="star-core" />
        <div class="star-corona" />
      </div>
      <div class="dyson-ring ring-1" />
      <div class="dyson-ring ring-2" />
      <div class="dyson-ring ring-3" />
      <div class="energy-beam beam-1" />
      <div class="energy-beam beam-2" />
    </div>

    <!-- Type III: Galaxy with glowing core -->
    <div v-else-if="kardashevLevel === 3" class="scene type-3">
      <div class="stars" />
      <div class="galaxy">
        <div class="galaxy-core" />
        <div class="spiral-arm arm-1" />
        <div class="spiral-arm arm-2" />
        <div class="spiral-arm arm-3" />
        <div class="spiral-arm arm-4" />
      </div>
      <div class="harvester h-1" />
      <div class="harvester h-2" />
      <div class="harvester h-3" />
    </div>

    <!-- Type IV+: Cosmic web / multiverse -->
    <div v-else class="scene type-4">
      <div class="void" />
      <div class="universe u-1" />
      <div class="universe u-2" />
      <div class="universe u-3" />
      <div class="universe u-4" />
      <div class="universe u-5" />
      <div class="cosmic-string s-1" />
      <div class="cosmic-string s-2" />
      <div class="cosmic-string s-3" />
      <div class="cosmic-web" />
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

/* === SHARED === */
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

@keyframes spin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes spin-reverse {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(-360deg); }
}

/* === TYPE 0: Sub-planetary === */
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

/* === TYPE I: Planetary === */
.type-1 {
  background: radial-gradient(ellipse at 50% 120%, #0f1b3d 0%, #09090b 70%);
}

.type-1 .star-bg {
  position: absolute;
  right: 10%;
  top: 15%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fef3c7;
  box-shadow: 0 0 30px 10px rgba(254,243,199,0.3);
}

.type-1 .planet {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
}

.type-1 .planet-surface {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #2563eb, #1e1b4b);
  box-shadow: inset -10px -5px 15px rgba(0,0,0,0.5);
}

.type-1 .grid-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(167,139,250,0.15) 8px, rgba(167,139,250,0.15) 9px),
    repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(167,139,250,0.15) 8px, rgba(167,139,250,0.15) 9px);
  animation: pulse 3s ease-in-out infinite;
}

.type-1 .atmosphere {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(139,92,246,0.3);
  box-shadow: 0 0 20px rgba(139,92,246,0.2), inset 0 0 20px rgba(139,92,246,0.1);
}

.type-1 .orbital-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotateX(70deg);
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 1px solid rgba(167,139,250,0.3);
  animation: spin 20s linear infinite;
}

.type-1 .satellite {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 4px;
  background: #a78bfa;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(167,139,250,0.8);
}
.type-1 .sat-1 { --orbit-r: 52px; animation: orbit 6s linear infinite; }
.type-1 .sat-2 { --orbit-r: 58px; animation: orbit 9s linear infinite reverse; }
.type-1 .sat-3 { --orbit-r: 64px; animation: orbit 12s linear infinite; }

/* === TYPE II: Stellar === */
.type-2 {
  background: radial-gradient(ellipse at 50% 50%, #1a0a00 0%, #09090b 70%);
}

.type-2 .star {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.type-2 .star-core {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff7ed, #f59e0b, #b45309);
  box-shadow: 0 0 40px 15px rgba(245,158,11,0.4), 0 0 80px 30px rgba(245,158,11,0.15);
  animation: pulse 2s ease-in-out infinite;
}

.type-2 .star-corona {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245,158,11,0.2), transparent 70%);
  animation: pulse 3s ease-in-out infinite alternate;
}

.type-2 .dyson-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 50%;
  border: 1px solid rgba(251,191,36,0.4);
  box-shadow: 0 0 8px rgba(251,191,36,0.2);
}
.type-2 .ring-1 {
  width: 90px; height: 90px;
  transform: translate(-50%, -50%) rotateX(75deg) rotateY(10deg);
  animation: spin 15s linear infinite;
}
.type-2 .ring-2 {
  width: 100px; height: 100px;
  transform: translate(-50%, -50%) rotateX(65deg) rotateY(-20deg);
  animation: spin-reverse 20s linear infinite;
}
.type-2 .ring-3 {
  width: 110px; height: 110px;
  transform: translate(-50%, -50%) rotateX(80deg) rotateY(30deg);
  animation: spin 25s linear infinite;
}

.type-2 .energy-beam {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2px;
  background: linear-gradient(to bottom, rgba(251,191,36,0.6), transparent);
  transform-origin: top center;
}
.type-2 .beam-1 {
  height: 70px;
  transform: translateX(-50%) rotate(35deg);
  animation: pulse 1.5s ease-in-out infinite;
}
.type-2 .beam-2 {
  height: 65px;
  transform: translateX(-50%) rotate(-140deg);
  animation: pulse 1.5s ease-in-out infinite 0.7s;
}

/* === TYPE III: Galactic === */
.type-3 {
  background: radial-gradient(ellipse at 50% 50%, #0a0020 0%, #09090b 70%);
}

.type-3 .galaxy {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  animation: spin 60s linear infinite;
}

.type-3 .galaxy-core {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, #e9d5ff, #7c3aed, #3b0764);
  box-shadow: 0 0 30px 10px rgba(139,92,246,0.4), 0 0 60px 20px rgba(139,92,246,0.15);
  animation: pulse 2s ease-in-out infinite;
}

.type-3 .spiral-arm {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100px;
  height: 40px;
  border-radius: 50%;
  border-top: 2px solid rgba(167,139,250,0.3);
  box-shadow: 0 -4px 15px rgba(167,139,250,0.1);
}
.type-3 .arm-1 { transform: translate(-50%, -50%) rotate(0deg); }
.type-3 .arm-2 { transform: translate(-50%, -50%) rotate(90deg); }
.type-3 .arm-3 { transform: translate(-50%, -50%) rotate(180deg); }
.type-3 .arm-4 { transform: translate(-50%, -50%) rotate(270deg); }

.type-3 .harvester {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 5px;
  height: 5px;
  background: #c084fc;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(192,132,252,0.8);
}
.type-3 .h-1 { --orbit-r: 50px; animation: orbit 10s linear infinite; }
.type-3 .h-2 { --orbit-r: 55px; animation: orbit 14s linear infinite reverse; }
.type-3 .h-3 { --orbit-r: 45px; animation: orbit 8s linear infinite; }

/* === TYPE IV+: Universal/Multiversal === */
.type-4 {
  background: #050505;
}

.type-4 .void {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(20,0,40,0.5), transparent);
}

.type-4 .universe {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(167,139,250,0.6), rgba(139,92,246,0.2), transparent 70%);
  animation: pulse 3s ease-in-out infinite;
}
.type-4 .u-1 { width: 30px; height: 30px; left: 50%; top: 50%; transform: translate(-50%,-50%); box-shadow: 0 0 25px rgba(139,92,246,0.5); animation-delay: 0s; }
.type-4 .u-2 { width: 18px; height: 18px; left: 25%; top: 35%; box-shadow: 0 0 15px rgba(236,72,153,0.4); animation-delay: 0.5s; background: radial-gradient(circle, rgba(236,72,153,0.6), transparent 70%); }
.type-4 .u-3 { width: 22px; height: 22px; left: 70%; top: 30%; box-shadow: 0 0 18px rgba(34,211,238,0.4); animation-delay: 1s; background: radial-gradient(circle, rgba(34,211,238,0.5), transparent 70%); }
.type-4 .u-4 { width: 14px; height: 14px; left: 30%; top: 70%; box-shadow: 0 0 12px rgba(251,191,36,0.4); animation-delay: 1.5s; background: radial-gradient(circle, rgba(251,191,36,0.5), transparent 70%); }
.type-4 .u-5 { width: 16px; height: 16px; left: 72%; top: 65%; box-shadow: 0 0 14px rgba(74,222,128,0.4); animation-delay: 2s; background: radial-gradient(circle, rgba(74,222,128,0.5), transparent 70%); }

.type-4 .cosmic-string {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(167,139,250,0.3), transparent);
  animation: pulse 2s ease-in-out infinite;
}
.type-4 .s-1 { width: 80px; left: 25%; top: 42%; transform: rotate(-15deg); animation-delay: 0.3s; }
.type-4 .s-2 { width: 60px; left: 50%; top: 55%; transform: rotate(25deg); animation-delay: 0.8s; }
.type-4 .s-3 { width: 70px; left: 35%; top: 38%; transform: rotate(-40deg); animation-delay: 1.5s; }

.type-4 .cosmic-web {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 50%, transparent 20%, rgba(139,92,246,0.03) 40%, transparent 60%),
    radial-gradient(circle at 25% 35%, transparent 10%, rgba(236,72,153,0.02) 30%, transparent 50%),
    radial-gradient(circle at 70% 30%, transparent 10%, rgba(34,211,238,0.02) 30%, transparent 50%);
  animation: pulse 4s ease-in-out infinite;
}
</style>
