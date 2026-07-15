'use client';

import React, { useEffect, useRef, useCallback, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { BaseContent } from '@/types/content';

// ── Constants ────────────────────────────────────────────────────────────────
const PADDLE_WIDTH = 110;
const PADDLE_HEIGHT = 14;
const BALL_RADIUS = 12;
const BRICK_WIDTH = 80;
const BRICK_HEIGHT = 30;
const BRICK_GAP = 4;
const BRICK_COLS = 10;
const BRICK_ROWS = 6;
const BALL_SPEED = 4.5;
const MAX_SPEED = 12;
const TRAIL_LENGTH = 12;
const COMBO_WINDOW_MS = 1800;
const POPUP_DURATION_FRAMES = 180;

// ── Types ─────────────────────────────────────────────────────────────────────
type GameState = 'start' | 'playing' | 'gameOver' | 'levelComplete';

interface Brick {
  id: string;
  x: number;
  y: number;
  content: BaseContent;
  isDestroyed: boolean;
  img: HTMLImageElement | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface TrailPoint { x: number; y: number; }

interface PopupState { brick: Brick; framesLeft: number; }

interface GameEngineProps {
  content: BaseContent[];
  onBrickDestroyed: (content: BaseContent) => void;
}

// ── Cross-browser rounded rect helper ─────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Component ─────────────────────────────────────────────────────────────────
export function GameEngine({ content: allContent, onBrickDestroyed }: GameEngineProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Game state (all in refs so the RAF loop reads fresh values) ────────────
  const gsRef = useRef<GameState>('start');
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);

  const ballX = useRef(0);
  const ballY = useRef(0);
  const ballDX = useRef(0);
  const ballDY = useRef(0);
  const ballRot = useRef(0);
  const ballTrail = useRef<TrailPoint[]>([]);

  const paddleX = useRef(0);

  const bricksRef = useRef<Brick[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const comboRef = useRef(0);
  const lastHitMsRef = useRef(0);
  const comboDisplay = useRef({ text: '', alpha: 0, y: 0 });

  const shakeRef = useRef(0);
  const popupRef = useRef<PopupState | null>(null);

  // Ball face image
  const ballImgRef = useRef<HTMLImageElement | null>(null);
  // Brick image cache
  const brickImgCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Force re-render for overlay state transitions
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // ── Load ball image ────────────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.src = '/face-ball.png';
    img.onload = () => { ballImgRef.current = img; };
  }, []);

  // ── Level init ─────────────────────────────────────────────────────────────
  const initLevel = useCallback((canvas: HTMLCanvasElement) => {
    if (allContent.length === 0) return;

    const W = canvas.width;
    const H = canvas.height;
    const totalW = BRICK_COLS * (BRICK_WIDTH + BRICK_GAP) - BRICK_GAP;
    const offsetX = (W - totalW) / 2;
    const offsetY = 60;

    bricksRef.current = Array.from({ length: BRICK_ROWS * BRICK_COLS }).map((_, i) => {
      const row = Math.floor(i / BRICK_COLS);
      const col = i % BRICK_COLS;
      const c = allContent[i % allContent.length];
      const brick: Brick = {
        id: `b-${levelRef.current}-${i}`,
        x: offsetX + col * (BRICK_WIDTH + BRICK_GAP),
        y: offsetY + row * (BRICK_HEIGHT + BRICK_GAP),
        content: c,
        isDestroyed: false,
        img: null,
      };
      if (c.coverImage) {
        const cached = brickImgCache.current.get(c.coverImage);
        if (cached) {
          brick.img = cached;
        } else {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = c.coverImage;
          img.onload = () => {
            brickImgCache.current.set(c.coverImage, img);
            brick.img = img;
          };
        }
      }
      return brick;
    });

    const speed = BALL_SPEED + (levelRef.current - 1) * 0.3;
    ballX.current = W / 2;
    ballY.current = H - 80;
    ballDX.current = speed * (Math.random() > 0.5 ? 1 : -1);
    ballDY.current = -speed;
    ballRot.current = 0;
    ballTrail.current = [];
    paddleX.current = W / 2 - PADDLE_WIDTH / 2;
    particlesRef.current = [];
    popupRef.current = null;
  }, [allContent]);

  // ── Particle spawner ───────────────────────────────────────────────────────
  function spawnParticles(x: number, y: number) {
    const COLORS = ['#00FFFF', '#FF00FF', '#00FF88', '#FFFFFF'];
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 4;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 1.5,
        life: 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 2 + Math.random() * 3.5,
      });
    }
  }

  // ── Physics update ─────────────────────────────────────────────────────────
  const update = useCallback((canvas: HTMLCanvasElement) => {
    if (gsRef.current !== 'playing') return;
    const W = canvas.width;
    const H = canvas.height;

    // Trail
    ballTrail.current.push({ x: ballX.current, y: ballY.current });
    if (ballTrail.current.length > TRAIL_LENGTH) ballTrail.current.shift();

    // Rotation tied to horizontal velocity
    ballRot.current += ballDX.current * 0.05;

    // Move
    ballX.current += ballDX.current;
    ballY.current += ballDY.current;

    // Wall collisions
    if (ballX.current < BALL_RADIUS) { ballX.current = BALL_RADIUS; ballDX.current = Math.abs(ballDX.current); }
    if (ballX.current > W - BALL_RADIUS) { ballX.current = W - BALL_RADIUS; ballDX.current = -Math.abs(ballDX.current); }
    if (ballY.current < BALL_RADIUS) { ballY.current = BALL_RADIUS; ballDY.current = Math.abs(ballDY.current); }

    // Bottom (lose life)
    if (ballY.current > H + BALL_RADIUS) {
      livesRef.current--;
      shakeRef.current = 10;
      ballTrail.current = [];
      if (livesRef.current <= 0) {
        gsRef.current = 'gameOver';
        forceUpdate();
        return;
      }
      const speed = BALL_SPEED + (levelRef.current - 1) * 0.3;
      ballX.current = W / 2;
      ballY.current = H - 80;
      ballDX.current = speed * (Math.random() > 0.5 ? 1 : -1);
      ballDY.current = -speed;
      paddleX.current = W / 2 - PADDLE_WIDTH / 2;
    }

    // Paddle collision
    const paddleTop = H - 40;
    if (
      ballY.current + BALL_RADIUS > paddleTop &&
      ballY.current - BALL_RADIUS < paddleTop + PADDLE_HEIGHT &&
      ballX.current > paddleX.current - 4 &&
      ballX.current < paddleX.current + PADDLE_WIDTH + 4
    ) {
      const hitPoint = (ballX.current - (paddleX.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
      const curSpeed = Math.sqrt(ballDX.current ** 2 + ballDY.current ** 2);
      const newSpeed = Math.min(MAX_SPEED, curSpeed);
      ballDX.current = hitPoint * newSpeed * 1.2;
      ballDY.current = -Math.abs(ballDY.current); // always up
      ballY.current = paddleTop - BALL_RADIUS;
    }

    // Brick collision — circle vs AABB closest-point
    let allDestroyed = true;
    for (const brick of bricksRef.current) {
      if (brick.isDestroyed) continue;
      allDestroyed = false;

      const closestX = Math.max(brick.x, Math.min(ballX.current, brick.x + BRICK_WIDTH));
      const closestY = Math.max(brick.y, Math.min(ballY.current, brick.y + BRICK_HEIGHT));
      const dx = ballX.current - closestX;
      const dy = ballY.current - closestY;

      if (dx * dx + dy * dy < BALL_RADIUS * BALL_RADIUS) {
        brick.isDestroyed = true;

        // Reflect along dominant axis
        if (Math.abs(dx) > Math.abs(dy)) {
          ballDX.current = -ballDX.current;
        } else {
          ballDY.current = -ballDY.current;
        }

        // Accelerate (capped)
        const curSpeed = Math.sqrt(ballDX.current ** 2 + ballDY.current ** 2);
        const newSpeed = Math.min(MAX_SPEED, curSpeed * 1.05);
        const scale = newSpeed / curSpeed;
        ballDX.current *= scale;
        ballDY.current *= scale;

        // Score + combo
        scoreRef.current += 100;
        const now = Date.now();
        if (now - lastHitMsRef.current < COMBO_WINDOW_MS) {
          comboRef.current++;
        } else {
          comboRef.current = 1;
        }
        lastHitMsRef.current = now;
        if (comboRef.current >= 2) {
          scoreRef.current += 100 * (comboRef.current - 1);
          comboDisplay.current = { text: `×${comboRef.current} COMBO!`, alpha: 1, y: H / 2 };
        }

        // Particles + popup
        spawnParticles(brick.x + BRICK_WIDTH / 2, brick.y + BRICK_HEIGHT / 2);
        popupRef.current = { brick, framesLeft: POPUP_DURATION_FRAMES };
        onBrickDestroyed(brick.content);
        break;
      }
    }

    if (allDestroyed && bricksRef.current.length > 0) {
      gsRef.current = 'levelComplete';
      forceUpdate();
    }

    // Decay combo display
    if (comboDisplay.current.alpha > 0) {
      comboDisplay.current.alpha = Math.max(0, comboDisplay.current.alpha - 0.018);
      comboDisplay.current.y -= 0.4;
    }

    // Update particles
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life -= 0.033;
    }

    // Decay popup timer
    if (popupRef.current) {
      popupRef.current.framesLeft--;
      if (popupRef.current.framesLeft <= 0) popupRef.current = null;
    }

    // Decay shake
    if (shakeRef.current > 0) shakeRef.current = Math.max(0, shakeRef.current - 0.5);
  }, [onBrickDestroyed]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const draw = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const W = canvas.width;
    const H = canvas.height;

    // Screen shake
    ctx.save();
    if (shakeRef.current > 0) {
      ctx.translate(
        (Math.random() - 0.5) * shakeRef.current,
        (Math.random() - 0.5) * shakeRef.current
      );
    }

    // Background
    ctx.fillStyle = '#030305';
    ctx.fillRect(0, 0, W, H);

    // Cyan grid
    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,255,0.04)';
    ctx.lineWidth = 1;
    const g = 40;
    for (let x = 0; x < W; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const radGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.65);
    radGrad.addColorStop(0, 'rgba(0,255,255,0.04)');
    radGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Bricks
    for (const brick of bricksRef.current) {
      if (brick.isDestroyed) continue;
      ctx.save();
      if (brick.img) {
        try {
          ctx.drawImage(brick.img, brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        } catch {
          ctx.fillStyle = 'rgba(0,255,255,0.08)';
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        }
      } else {
        ctx.fillStyle = 'rgba(0,255,255,0.08)';
        ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      }
      ctx.strokeStyle = 'rgba(255,0,255,0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      ctx.fillStyle = 'rgba(0,255,255,0.9)';
      ctx.font = '5px monospace';
      ctx.fillText(
        (brick.content.subtype || brick.content.type).toUpperCase().slice(0, 12),
        brick.x + 3,
        brick.y + BRICK_HEIGHT - 4
      );
      ctx.restore();
    }

    // Paddle
    const py = H - 40;
    const px = paddleX.current;
    ctx.save();
    const pGrad = ctx.createLinearGradient(px, py, px, py + PADDLE_HEIGHT);
    pGrad.addColorStop(0, '#00FFFF');
    pGrad.addColorStop(0.35, '#00CCCC');
    pGrad.addColorStop(1, '#004444');
    ctx.fillStyle = pGrad;
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#00FFFF';
    ctx.beginPath();
    roundRect(ctx, px, py, PADDLE_WIDTH, PADDLE_HEIGHT, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(px + 6, py + 2, PADDLE_WIDTH - 12, 3);
    ctx.restore();

    // Ball trail
    for (let i = 0; i < ballTrail.current.length; i++) {
      const t = ballTrail.current[i];
      ctx.save();
      ctx.globalAlpha = (i / ballTrail.current.length) * 0.28;
      ctx.beginPath();
      ctx.arc(t.x, t.y, BALL_RADIUS * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = '#00FFFF';
      ctx.fill();
      ctx.restore();
    }

    // Ball — face image clipped to circle, spinning
    ctx.save();
    ctx.translate(ballX.current, ballY.current);
    ctx.rotate(ballRot.current);
    ctx.beginPath();
    ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
    ctx.clip();
    if (ballImgRef.current) {
      ctx.drawImage(ballImgRef.current, -BALL_RADIUS, -BALL_RADIUS, BALL_RADIUS * 2, BALL_RADIUS * 2);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }
    ctx.restore();
    // Rim glow (outside clip)
    ctx.save();
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#00FFFF';
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ballX.current, ballY.current, BALL_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Particles
    for (const p of particlesRef.current) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 5;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Combo text
    const cd = comboDisplay.current;
    if (cd.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = cd.alpha;
      ctx.font = 'bold 30px Orbitron, monospace';
      ctx.fillStyle = '#FF00FF';
      ctx.shadowBlur = 22;
      ctx.shadowColor = '#FF00FF';
      ctx.textAlign = 'center';
      ctx.fillText(cd.text, W / 2, cd.y);
      ctx.textAlign = 'left';
      ctx.restore();
    }

    // HUD — hearts
    for (let i = 0; i < 3; i++) {
      const filled = i < livesRef.current;
      ctx.save();
      ctx.font = '16px sans-serif';
      ctx.globalAlpha = filled ? 1 : 0.2;
      ctx.fillStyle = '#FF00FF';
      ctx.shadowBlur = filled ? 10 : 0;
      ctx.shadowColor = '#FF00FF';
      ctx.fillText('♥', 12 + i * 22, 26);
      ctx.restore();
    }

    // HUD — score (tabular-nums style with monospace)
    ctx.save();
    ctx.font = 'bold 13px Orbitron, monospace';
    ctx.fillStyle = '#00FFFF';
    ctx.textAlign = 'right';
    ctx.fillText(`LVL_${String(levelRef.current).padStart(2, '0')}`, W - 10, 20);
    ctx.fillText(String(scoreRef.current).padStart(6, '0'), W - 10, 36);
    ctx.textAlign = 'left';
    ctx.restore();

    // Popup
    if (popupRef.current) {
      const { brick, framesLeft } = popupRef.current;
      const popW = 210;
      const popH = 58;
      const fadeAlpha = Math.min(1, framesLeft / 20);
      let popX = brick.x;
      let popY = brick.y + BRICK_HEIGHT + 6;
      if (popX + popW > W) popX = W - popW - 6;
      if (popX < 0) popX = 6;
      if (popY + popH > H) popY = brick.y - popH - 6;

      ctx.save();
      ctx.globalAlpha = fadeAlpha;
      ctx.fillStyle = 'rgba(0,0,0,0.88)';
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00FFFF';
      ctx.beginPath();
      roundRect(ctx, popX, popY, popW, popH, 4);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.font = 'bold 8px Orbitron, monospace';
      ctx.fillStyle = '#00FFFF';
      const maxTitle = 30;
      const titleTxt = brick.content.title.length > maxTitle
        ? brick.content.title.slice(0, maxTitle) + '…'
        : brick.content.title;
      ctx.fillText(titleTxt, popX + 8, popY + 20);
      ctx.font = '8px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText('⚡ CLICK TO ACCESS NODE', popX + 8, popY + 40);
      ctx.restore();
    }

    // Overlay for non-playing states
    const state = gsRef.current;
    if (state !== 'playing') {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.82)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';

      if (state === 'start') {
        ctx.font = 'bold 26px Orbitron, monospace';
        ctx.fillStyle = '#00FFFF';
        ctx.shadowBlur = 22;
        ctx.shadowColor = '#00FFFF';
        ctx.fillText('TRANSMISSION_FAILED', W / 2, H / 2 - 30);
        ctx.font = '13px Orbitron, monospace';
        ctx.fillStyle = '#FF00FF';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#FF00FF';
        ctx.fillText('CLICK TO ESTABLISH UPLINK', W / 2, H / 2 + 12);
      } else if (state === 'gameOver') {
        ctx.font = 'bold 26px Orbitron, monospace';
        ctx.fillStyle = '#FF00FF';
        ctx.shadowBlur = 22;
        ctx.shadowColor = '#FF00FF';
        ctx.fillText('SIGNAL_LOST', W / 2, H / 2 - 40);
        ctx.font = '13px Orbitron, monospace';
        ctx.fillStyle = '#00FFFF';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00FFFF';
        ctx.fillText(`SCORE: ${String(scoreRef.current).padStart(6, '0')}`, W / 2, H / 2);
        ctx.fillText('CLICK TO RECONNECT', W / 2, H / 2 + 28);
      } else if (state === 'levelComplete') {
        ctx.font = 'bold 26px Orbitron, monospace';
        ctx.fillStyle = '#00FFFF';
        ctx.shadowBlur = 22;
        ctx.shadowColor = '#00FFFF';
        ctx.fillText('NODE_CLEARED', W / 2, H / 2 - 40);
        ctx.font = '13px Orbitron, monospace';
        ctx.fillStyle = '#FF00FF';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#FF00FF';
        ctx.fillText(`SCORE: ${String(scoreRef.current).padStart(6, '0')}`, W / 2, H / 2);
        ctx.fillText('CLICK TO ADVANCE', W / 2, H / 2 + 28);
      }

      ctx.textAlign = 'left';
      ctx.restore();
    }

    ctx.restore(); // shake transform
  }, []);

  // ── RAF loop ───────────────────────────────────────────────────────────────
  const rafRef = useRef<number | null>(null);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    update(canvas);
    draw(canvas, ctx);
    rafRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [loop]);

  // ── ResizeObserver ─────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
        if (gsRef.current === 'playing') initLevel(canvas);
      }
    });
    ro.observe(container);
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    return () => ro.disconnect();
  }, [initLevel]);

  // ── Mouse ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      paddleX.current = Math.max(0, Math.min(
        canvas.width - PADDLE_WIDTH,
        (e.clientX - rect.left) - PADDLE_WIDTH / 2
      ));
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  // ── Touch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handle = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      paddleX.current = Math.max(0, Math.min(
        canvas.width - PADDLE_WIDTH,
        (e.touches[0].clientX - rect.left) - PADDLE_WIDTH / 2
      ));
    };
    canvas.addEventListener('touchmove', handle, { passive: false });
    return () => canvas.removeEventListener('touchmove', handle);
  }, []);

  // ── Click handler ──────────────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check popup click
    if (popupRef.current && gsRef.current === 'playing') {
      const { brick } = popupRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const popW = 210;
      const popH = 58;
      let popX = brick.x;
      let popY = brick.y + BRICK_HEIGHT + 6;
      if (popX + popW > W) popX = W - popW - 6;
      if (popX < 0) popX = 6;
      if (popY + popH > H) popY = brick.y - popH - 6;

      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      if (cx >= popX && cx <= popX + popW && cy >= popY && cy <= popY + popH) {
        router.push(`/content/${brick.content.type.toLowerCase()}/${brick.content.slug}`);
        return;
      }
    }

    const state = gsRef.current;
    if (state === 'start') {
      gsRef.current = 'playing';
      if (canvas) initLevel(canvas);
      forceUpdate();
    } else if (state === 'gameOver') {
      livesRef.current = 3;
      scoreRef.current = 0;
      levelRef.current = 1;
      gsRef.current = 'playing';
      if (canvas) initLevel(canvas);
      forceUpdate();
    } else if (state === 'levelComplete') {
      levelRef.current++;
      gsRef.current = 'playing';
      if (canvas) initLevel(canvas);
      forceUpdate();
    }
  }, [router, initLevel]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden cursor-none">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        onClick={handleClick}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}

const WaterfallGame = GameEngine;
export { WaterfallGame };
