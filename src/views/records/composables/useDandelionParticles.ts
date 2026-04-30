import { ref } from 'vue';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  scale: number;
}

/**
 * 蒲公英粒子特效组合式函数
 * 负责点击时的粒子爆炸效果
 */
export function useDandelionParticles() {
  const dandelionParticles = ref<Particle[]>([]);
  let particleId = 0;
  let animationFrameId: number | null = null;

  /**
   * 点击处理 - 蒲公英爆炸效果
   */
  function handleClick(event: MouseEvent) {
    const x = event.clientX;
    const y = event.clientY;
    
    // 创建8-12个透明白色蒲公英粒子
    const particleCount = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
      const speed = 0.375 + Math.random() * 0.5;
      
      dandelionParticles.value.push({
        id: particleId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.2,
        size: 10 + Math.random() * 8,
        opacity: 0.6 + Math.random() * 0.3,
        rotation: Math.random() * 360,
        scale: 1,
      });
    }
    
    // 开始动画
    if (!animationFrameId) {
      animateParticles();
    }
  }

  /**
   * 粒子动画
   */
  function animateParticles() {
    if (dandelionParticles.value.length === 0) {
      animationFrameId = null;
      return;
    }
    
    dandelionParticles.value.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.vx *= 0.98;
      p.opacity -= 0.006;
      p.rotation += 1.5;
      p.scale = Math.max(0.3, p.opacity);
    });
    
    // 过滤掉完全消失的粒子
    dandelionParticles.value = dandelionParticles.value.filter(p => p.opacity > 0);
    
    animationFrameId = requestAnimationFrame(animateParticles);
  }

  return {
    dandelionParticles,
    handleClick,
  };
}
