import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLATFORM_WIDTH, 
  PLATFORM_HEIGHT, 
  FISH_WIDTH,
  FISH_HEIGHT,
  GRAVITY, 
  JUMP_FORCE, 
  MOVE_SPEED 
} from '../constants';
import { 
  Player, 
  Platform, 
  GameState, 
  CharacterType,
  CharacterOption,
  SplashParticle, 
  FloatingText, 
  PondBubble 
} from '../types';
import { audioManager } from '../audio';
import { 
  Trophy, 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  Music,
  Check,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const HIGH_SCORE_KEY = 'lilypad-game-highscore';

// Character Selection Definitions
const CHARACTERS: CharacterOption[] = [
  {
    id: 'crocodile',
    name: 'Crocodile',
    tagline: 'Snappy Leaper',
    description: 'Chomps through the pond with powerful spring leaps!',
    themeColor: 'from-emerald-600 to-green-700',
  },
  {
    id: 'frog',
    name: 'Frog',
    tagline: 'Classic Hopper',
    description: 'The master of buoyant bounces and lily pad acrobatics!',
    themeColor: 'from-green-500 to-emerald-600',
  },
  {
    id: 'duck',
    name: 'Duck',
    tagline: 'Bouncy Waddler',
    description: 'Glides with cheerful quack-hops and flapping wings!',
    themeColor: 'from-amber-400 to-orange-500',
  },
];

// --- Character SVG Visuals (Displayed directly above character names) ---

const CrocodileVisual: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-14 h-14 mx-auto drop-shadow-sm" fill="none">
    {/* Dorsal scutes / spikes */}
    <polygon points="17,17 21,9 25,17" fill="#14532d" />
    <polygon points="25,16 29,8 33,16" fill="#14532d" />
    <polygon points="33,17 37,10 41,17" fill="#14532d" />
    {/* Tail */}
    <path d="M14 36 C8 38, 4 32, 2 24 C5 26, 10 28, 16 28 Z" fill="#15803d" stroke="#14532d" strokeWidth="1.5" />
    {/* Body */}
    <ellipse cx="28" cy="35" rx="18" ry="14" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
    {/* Pale Yellow Underbelly */}
    <ellipse cx="29" cy="38" rx="12" ry="8" fill="#fef08a" />
    {/* Snout */}
    <path d="M34 29 C46 28, 56 31, 57 37 C56 43, 44 44, 34 43 Z" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
    {/* Nostrils */}
    <circle cx="53" cy="33" r="1.5" fill="#14532d" />
    {/* Mouth smile line */}
    <path d="M36 38 Q46 39 54 37" stroke="#14532d" strokeWidth="1.5" strokeLinecap="round" />
    {/* Cute white teeth */}
    <polygon points="42,38 44,42 46,38" fill="#ffffff" />
    <polygon points="47,39 49,36 51,39" fill="#ffffff" />
    {/* Eye ridge & eye */}
    <circle cx="27" cy="22" r="7" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
    <circle cx="27" cy="22" r="5.5" fill="#fef08a" />
    <ellipse cx="28" cy="22" rx="2" ry="4" fill="#0f172a" />
    <circle cx="29" cy="20" r="1.2" fill="#ffffff" />
    {/* Webbed front paw */}
    <ellipse cx="32" cy="44" rx="4" ry="2.5" fill="#15803d" />
    {/* Rosy blush */}
    <circle cx="34" cy="36" r="3" fill="#fb7185" fillOpacity="0.5" />
  </svg>
);

const FrogVisual: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-14 h-14 mx-auto drop-shadow-sm" fill="none">
    {/* Folded thighs */}
    <ellipse cx="14" cy="40" rx="7" ry="5" fill="#15803d" />
    <ellipse cx="50" cy="40" rx="7" ry="5" fill="#15803d" />
    <ellipse cx="14" cy="45" rx="5" ry="3" fill="#22c55e" stroke="#14532d" strokeWidth="1" />
    <ellipse cx="50" cy="45" rx="5" ry="3" fill="#22c55e" stroke="#14532d" strokeWidth="1" />
    {/* Body */}
    <ellipse cx="32" cy="36" rx="18" ry="15" fill="#22c55e" stroke="#14532d" strokeWidth="1.5" />
    {/* Light lime belly */}
    <ellipse cx="32" cy="38" rx="11" ry="9" fill="#dcfce7" />
    {/* Eye mounds */}
    <circle cx="22" cy="20" r="7.5" fill="#22c55e" stroke="#14532d" strokeWidth="1.5" />
    <circle cx="42" cy="20" r="7.5" fill="#22c55e" stroke="#14532d" strokeWidth="1.5" />
    {/* Eyeballs */}
    <circle cx="22" cy="20" r="6" fill="#ffffff" />
    <circle cx="42" cy="20" r="6" fill="#ffffff" />
    {/* Pupils */}
    <circle cx="23" cy="20" r="3.2" fill="#0f172a" />
    <circle cx="43" cy="20" r="3.2" fill="#0f172a" />
    {/* Eye sparkles */}
    <circle cx="24.5" cy="18.5" r="1.3" fill="#ffffff" />
    <circle cx="44.5" cy="18.5" r="1.3" fill="#ffffff" />
    {/* Rosy cheeks */}
    <circle cx="20" cy="36" r="3.5" fill="#fb7185" fillOpacity="0.6" />
    <circle cx="44" cy="36" r="3.5" fill="#fb7185" fillOpacity="0.6" />
    {/* Smile */}
    <path d="M26 34 Q32 40 38 34" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
    {/* Front paws */}
    <ellipse cx="23" cy="43" rx="4" ry="2.5" fill="#22c55e" stroke="#14532d" strokeWidth="1" />
    <ellipse cx="41" cy="43" rx="4" ry="2.5" fill="#22c55e" stroke="#14532d" strokeWidth="1" />
  </svg>
);

const DuckVisual: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-14 h-14 mx-auto drop-shadow-sm" fill="none">
    {/* Pointed Tail feather */}
    <path d="M16 34 C8 33, 4 25, 2 18 C7 21, 13 25, 18 28 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.3" />
    {/* Orange webbed feet */}
    <ellipse cx="24" cy="47" rx="5" ry="3" fill="#f97316" stroke="#c2410c" strokeWidth="1" />
    <ellipse cx="38" cy="47" rx="5" ry="3" fill="#f97316" stroke="#c2410c" strokeWidth="1" />
    {/* Body */}
    <ellipse cx="28" cy="36" rx="17" ry="13" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
    {/* Soft light belly */}
    <ellipse cx="28" cy="38" rx="11" ry="8" fill="#fef9c3" />
    {/* Wing */}
    <path d="M24 33 C18 31, 15 37, 20 42 C26 44, 30 38, 28 34 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
    {/* Head */}
    <circle cx="39" cy="24" r="11" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
    {/* Tuft feather */}
    <path d="M37 14 C35 9, 41 8, 41 13 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
    {/* Orange Bill */}
    <path d="M47 22 C56 22, 59 26, 59 29 C56 33, 47 31, 46 29 Z" fill="#f97316" stroke="#c2410c" strokeWidth="1.4" />
    <circle cx="49" cy="24" r="0.8" fill="#9a3412" />
    {/* Eye */}
    <circle cx="41" cy="21" r="4" fill="#0f172a" />
    <circle cx="42.5" cy="19.5" r="1.4" fill="#ffffff" />
    <circle cx="39.8" cy="22" r="0.8" fill="#ffffff" />
    {/* Rosy blush */}
    <circle cx="37" cy="28" r="3" fill="#fb7185" fillOpacity="0.6" />
  </svg>
);

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('START');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('frog');
  const [score, setScore] = useState(0);
  const [fishCount, setFishCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - 120,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    isGrounded: false,
    facingRight: true,
    jumpStretch: 1,
    blinkTimer: 180,
    characterType: 'frog',
  });

  const platformsRef = useRef<Platform[]>([]);
  const particlesRef = useRef<SplashParticle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const bubblesRef = useRef<PondBubble[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const cameraYRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const fishCollectedCountRef = useRef(0);

  // Initialize pond bubbles
  const initBubbles = () => {
    const bubbles: PondBubble[] = [];
    for (let i = 0; i < 20; i++) {
      bubbles.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        radius: 2 + Math.random() * 4.5,
        speed: 0.4 + Math.random() * 0.7,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.02,
        alpha: 0.25 + Math.random() * 0.35,
      });
    }
    bubblesRef.current = bubbles;
  };

  const createPlatform = (y: number, isBase = false): Platform => {
    const x = isBase 
      ? CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2 
      : Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH - 20) + 10;
    
    const hasFish = !isBase && Math.random() < 0.65;
    const hasFlower = !isBase && Math.random() < 0.35;
    const flowerHues = ['#f472b6', '#fb7185', '#ffffff', '#e879f9'];
    const flowerHue = flowerHues[Math.floor(Math.random() * flowerHues.length)];
    
    return {
      x,
      y,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      hasFish,
      fishCollected: false,
      hasFlower,
      flowerHue,
      notchAngle: Math.random() * Math.PI * 2,
      rippleAnim: 0,
    };
  };

  const initGame = (charType: CharacterType = selectedCharacter) => {
    playerRef.current = {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - 120,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      vx: 0,
      vy: 0,
      isGrounded: false,
      facingRight: true,
      jumpStretch: 1,
      blinkTimer: 180,
      characterType: charType,
    };

    const initialPlatforms: Platform[] = [];
    initialPlatforms.push(createPlatform(CANVAS_HEIGHT - 60, true));

    for (let i = 1; i < 9; i++) {
      initialPlatforms.push(createPlatform(CANVAS_HEIGHT - 60 - i * 85));
    }

    platformsRef.current = initialPlatforms;
    particlesRef.current = [];
    floatingTextsRef.current = [];
    cameraYRef.current = 0;
    fishCollectedCountRef.current = 0;
    setScore(0);
    setFishCount(0);
    initBubbles();
  };

  const spawnSplash = (x: number, y: number, count = 8, color = 'rgba(255, 255, 255, 0.75)') => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI - Math.PI;
      const speed = 1.5 + Math.random() * 3.5;
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2.5,
        alpha: 0.9,
        color,
      });
    }
  };

  const spawnFishCatchEffect = (x: number, y: number) => {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        radius: 2 + Math.random() * 3,
        alpha: 1,
        color: Math.random() > 0.4 ? '#fde047' : '#ffffff',
      });
    }

    floatingTextsRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y: y - 10,
      text: '+15 🐟',
      alpha: 1,
      vy: -1.6,
      color: '#fbbf24',
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    keysRef.current[e.code] = true;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    keysRef.current[e.code] = false;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    initBubbles();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const toggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      audioManager.playMusic();
    }
  };

  const update = () => {
    if (gameState !== 'PLAYING') return;

    frameCountRef.current++;
    const player = playerRef.current;

    // Movement
    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
      player.vx = -MOVE_SPEED;
      player.facingRight = false;
    } else if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
      player.vx = MOVE_SPEED;
      player.facingRight = true;
    } else {
      player.vx *= 0.82;
    }

    player.x += player.vx;

    // Screen wrap
    if (player.x + player.width < 0) player.x = CANVAS_WIDTH;
    if (player.x > CANVAS_WIDTH) player.x = -player.width;

    // Gravity
    player.vy += GRAVITY;
    player.y += player.vy;

    // Eye blink counter
    player.blinkTimer--;
    if (player.blinkTimer < 0) {
      player.blinkTimer = 160 + Math.floor(Math.random() * 120);
    }

    const isPressingJump = keysRef.current['Space'] || keysRef.current['ArrowUp'] || keysRef.current['KeyW'];

    let justLanded = false;
    platformsRef.current.forEach((platform) => {
      if (platform.rippleAnim > 0) {
        platform.rippleAnim--;
      }

      // Check landing on lily pad
      if (player.vy > 0) {
        const footY = player.y + player.height;
        const prevFootY = footY - player.vy;
        const padTolerance = 8;

        if (
          player.x + player.width * 0.75 > platform.x &&
          player.x + player.width * 0.25 < platform.x + platform.width &&
          footY >= platform.y &&
          prevFootY <= platform.y + platform.height + padTolerance
        ) {
          player.y = platform.y - player.height;
          player.vy = isPressingJump ? JUMP_FORCE * 1.15 : JUMP_FORCE;
          player.isGrounded = false;
          justLanded = true;
          platform.rippleAnim = 16;
          
          audioManager.playJump(player.characterType);
          spawnSplash(player.x + player.width / 2, platform.y + 4, 6, '#e0f2fe');
        }
      }

      // Catch mini fish
      if (platform.hasFish && !platform.fishCollected) {
        const time = frameCountRef.current;
        const fishX = platform.x + platform.width / 2 - FISH_WIDTH / 2;
        const fishY = platform.y - 32 + Math.sin(time * 0.05 + platform.x) * 4;

        if (
          player.x < fishX + FISH_WIDTH + 8 &&
          player.x + player.width > fishX - 8 &&
          player.y < fishY + FISH_HEIGHT + 8 &&
          player.y + player.height > fishY - 8
        ) {
          platform.fishCollected = true;
          fishCollectedCountRef.current += 1;
          setFishCount(fishCollectedCountRef.current);
          setScore((s) => s + 15);
          audioManager.playFish();
          spawnFishCatchEffect(fishX + FISH_WIDTH / 2, fishY + FISH_HEIGHT / 2);
        }
      }
    });

    if (justLanded) {
      player.jumpStretch = 0.75;
    } else {
      player.jumpStretch += (1 - player.jumpStretch) * 0.15;
    }

    // Camera follow
    if (player.y < cameraYRef.current + CANVAS_HEIGHT * 0.45) {
      const diff = (cameraYRef.current + CANVAS_HEIGHT * 0.45) - player.y;
      cameraYRef.current -= diff;

      const altitudeScore = Math.floor(Math.abs(cameraYRef.current) / 8);
      const totalCalculated = altitudeScore + fishCollectedCountRef.current * 15;
      setScore((prev) => Math.max(prev, totalCalculated));
    }

    // Generate new lily pads above
    const topPlatform = platformsRef.current[platformsRef.current.length - 1];
    if (topPlatform && topPlatform.y > cameraYRef.current - 120) {
      const nextY = topPlatform.y - (75 + Math.random() * 25);
      platformsRef.current.push(createPlatform(nextY));
    }

    // Clean up lily pads that fell off bottom
    if (platformsRef.current[0] && platformsRef.current[0].y > cameraYRef.current + CANVAS_HEIGHT + 80) {
      platformsRef.current.shift();
    }

    // Update splash particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.alpha -= 0.025;
      if (p.alpha <= 0) {
        particlesRef.current.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
      const ft = floatingTextsRef.current[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        floatingTextsRef.current.splice(i, 1);
      }
    }

    // Update ambient pond bubbles
    bubblesRef.current.forEach((b) => {
      b.y -= b.speed;
      b.x += Math.sin(frameCountRef.current * b.wobbleSpeed + b.wobbleOffset) * 0.4;
      if (b.y < cameraYRef.current - 20) {
        b.y = cameraYRef.current + CANVAS_HEIGHT + 20;
        b.x = Math.random() * CANVAS_WIDTH;
      }
    });

    // Game Over: falls below viewport
    if (player.y > cameraYRef.current + CANVAS_HEIGHT + 40) {
      setGameState('GAMEOVER');
      audioManager.pauseMusic();
      audioManager.playGameOver();
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
      }
    }
  };

  // --- DRAWING FUNCTIONS ---

  const drawPondBackground = (ctx: CanvasRenderingContext2D) => {
    const pondGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    pondGrad.addColorStop(0, '#a5f3fc');
    pondGrad.addColorStop(0.35, '#7dd3fc');
    pondGrad.addColorStop(0.7, '#38bdf8');
    pondGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = pondGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Light caustics
    ctx.save();
    const time = frameCountRef.current * 0.015;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const xOffset = ((i * 120 + time * 15) % (CANVAS_WIDTH + 150)) - 75;
      ctx.moveTo(xOffset, 0);
      ctx.lineTo(xOffset + 70, 0);
      ctx.lineTo(xOffset + 20, CANVAS_HEIGHT);
      ctx.lineTo(xOffset - 50, CANVAS_HEIGHT);
      ctx.closePath();
      const beamGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
      beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fill();
    }
    ctx.restore();

    // Ambient bubbles
    ctx.save();
    bubblesRef.current.forEach((b) => {
      const renderY = b.y - cameraYRef.current;
      if (renderY >= -20 && renderY <= CANVAS_HEIGHT + 20) {
        ctx.beginPath();
        ctx.arc(b.x, renderY, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.4})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.35, renderY - b.radius * 0.35, b.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.9})`;
        ctx.fill();
      }
    });
    ctx.restore();
  };

  const drawLilyPad = (ctx: CanvasRenderingContext2D, platform: Platform) => {
    const cx = platform.x + platform.width / 2;
    const cy = platform.y + platform.height / 2;
    const rx = platform.width / 2;
    const ry = platform.height / 2;

    ctx.save();

    // Water shadow
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, rx * 0.96, ry * 0.92, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(2, 44, 84, 0.18)';
    ctx.fill();

    // Landing ripple
    if (platform.rippleAnim > 0) {
      const rippleExpand = (16 - platform.rippleAnim) * 2.2;
      const rippleAlpha = platform.rippleAnim / 16;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx + rippleExpand, ry + rippleExpand * 0.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${rippleAlpha * 0.7})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Lily pad with wedge notch
    const notch = platform.notchAngle;
    const notchSpread = 0.38;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, notch + notchSpread, notch + Math.PI * 2 - notchSpread);
    ctx.lineTo(cx, cy);
    ctx.closePath();

    const leafGrad = ctx.createRadialGradient(cx - 10, cy - 4, 4, cx, cy, rx);
    leafGrad.addColorStop(0, '#22c55e');
    leafGrad.addColorStop(0.65, '#16a34a');
    leafGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = leafGrad;
    ctx.fill();

    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#4ade80';
    ctx.stroke();

    // Radiating veins
    ctx.strokeStyle = 'rgba(187, 247, 208, 0.38)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 / 7) * i + notch + 0.5;
      if (Math.abs(angle - notch) > notchSpread + 0.15) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const vx = cx + Math.cos(angle) * (rx * 0.85);
        const vy = cy + Math.sin(angle) * (ry * 0.85);
        ctx.quadraticCurveTo(
          cx + Math.cos(angle + 0.2) * (rx * 0.45),
          cy + Math.sin(angle + 0.2) * (ry * 0.45),
          vx,
          vy
        );
        ctx.stroke();
      }
    }

    // Lotus flower
    if (platform.hasFlower) {
      const flowerX = cx + rx * 0.55;
      const flowerY = cy - 4;
      const petalColor = platform.flowerHue || '#f472b6';

      for (let p = 0; p < 6; p++) {
        const petalAngle = (p * Math.PI) / 3;
        ctx.beginPath();
        ctx.ellipse(
          flowerX + Math.cos(petalAngle) * 4,
          flowerY + Math.sin(petalAngle) * 3,
          4,
          2.5,
          petalAngle,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = petalColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(flowerX, flowerY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.fill();
    }

    ctx.restore();
  };

  const drawMiniFish = (ctx: CanvasRenderingContext2D, platform: Platform) => {
    if (!platform.hasFish || platform.fishCollected) return;

    const time = frameCountRef.current;
    const fishCenterX = platform.x + platform.width / 2;
    const fishCenterY = platform.y - 30 + Math.sin(time * 0.06 + platform.x) * 4;
    const wag = Math.sin(time * 0.16 + platform.x) * 0.35;

    ctx.save();
    ctx.translate(fishCenterX, fishCenterY);

    ctx.beginPath();
    ctx.ellipse(0, 0, FISH_WIDTH * 0.85, FISH_HEIGHT * 0.95, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
    ctx.fill();

    // Tail fin
    ctx.save();
    ctx.translate(-FISH_WIDTH * 0.45, 0);
    ctx.rotate(wag);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-9, -6);
    ctx.quadraticCurveTo(-12, 0, -9, 6);
    ctx.closePath();
    ctx.fillStyle = '#ea580c';
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, FISH_WIDTH * 0.5, FISH_HEIGHT * 0.48, 0, 0, Math.PI * 2);
    const bodyGrad = ctx.createLinearGradient(0, -FISH_HEIGHT * 0.5, 0, FISH_HEIGHT * 0.5);
    bodyGrad.addColorStop(0, '#f97316');
    bodyGrad.addColorStop(0.5, '#ea580c');
    bodyGrad.addColorStop(1, '#fde047');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Dorsal fin
    ctx.beginPath();
    ctx.moveTo(-4, -FISH_HEIGHT * 0.45);
    ctx.quadraticCurveTo(0, -FISH_HEIGHT * 0.85, 4, -FISH_HEIGHT * 0.45);
    ctx.fillStyle = '#fb923c';
    ctx.fill();

    // Pectoral fin
    ctx.beginPath();
    ctx.ellipse(1, 2, 4, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(253, 224, 71, 0.9)';
    ctx.fill();

    // Eye
    const eyeX = FISH_WIDTH * 0.28;
    const eyeY = -2;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eyeX + 0.6, eyeY, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eyeX + 0.2, eyeY - 0.7, 0.7, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.arc(FISH_WIDTH * 0.5, 0.5, 1.5, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bubble
    if (time % 40 < 20) {
      ctx.beginPath();
      ctx.arc(FISH_WIDTH * 0.5 + 4, -4 - (time % 40) * 0.3, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
    }

    ctx.restore();
  };

  // --- CHARACTER IN-GAME RENDERERS ---

  // 1. FROG CHARACTER RENDERER
  const drawFrog = (ctx: CanvasRenderingContext2D, player: Player) => {
    const cx = player.x + player.width / 2;
    const cy = player.y + player.height / 2;

    ctx.save();
    ctx.translate(cx, cy);

    if (!player.facingRight) {
      ctx.scale(-1, 1);
    }

    let scaleX = 1;
    let scaleY = 1;
    if (player.vy < -2) {
      scaleY = 1 + Math.min(0.25, -player.vy * 0.018);
      scaleX = 1 / scaleY;
    } else if (player.vy > 3) {
      scaleY = 0.95;
      scaleX = 1.05;
    } else {
      scaleY = player.jumpStretch;
      scaleX = 2 - scaleY;
    }
    ctx.scale(scaleX, scaleY);

    const isAirborne = player.vy !== 0;

    // Frog Back Legs
    if (isAirborne && player.vy < 0) {
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(-10, 6);
      ctx.quadraticCurveTo(-18, 14, -14, 20);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(10, 6);
      ctx.quadraticCurveTo(18, 14, 14, 20);
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(-14, 20, 3, 0, Math.PI * 2);
      ctx.arc(14, 20, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(-14, 7, 7, 5, -0.2, 0, Math.PI * 2);
      ctx.ellipse(14, 7, 7, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(-14, 12, 4.5, 2.5, 0, 0, Math.PI * 2);
      ctx.ellipse(14, 12, 4.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Frog Body
    ctx.beginPath();
    ctx.ellipse(0, 3, 16, 13.5, 0, 0, Math.PI * 2);
    const frogBodyGrad = ctx.createRadialGradient(-3, -2, 2, 0, 3, 16);
    frogBodyGrad.addColorStop(0, '#4ade80');
    frogBodyGrad.addColorStop(0.7, '#22c55e');
    frogBodyGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = frogBodyGrad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#14532d';
    ctx.stroke();

    // Belly
    ctx.beginPath();
    ctx.ellipse(0, 5, 10, 8.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#dcfce7';
    ctx.fill();

    // Front Paws
    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(-8, 9, 3.5, 2.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(8, 9, 3.5, 2.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Frog Eyes
    const eyeSpacing = 8.5;
    const eyeY = -9;
    const eyeRadius = 6.2;
    const isBlinking = player.blinkTimer < 8;

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(-eyeSpacing, eyeY, eyeRadius + 1.2, 0, Math.PI * 2);
    ctx.arc(eyeSpacing, eyeY, eyeRadius + 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    if (isBlinking) {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      const lookX = 1.2;
      const lookY = -1;
      const pupilRadius = 3.2;

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-eyeSpacing + lookX, eyeY + lookY, pupilRadius, 0, Math.PI * 2);
      ctx.arc(eyeSpacing + lookX, eyeY + lookY, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-eyeSpacing + lookX + 1, eyeY + lookY - 1, 1.3, 0, Math.PI * 2);
      ctx.arc(eyeSpacing + lookX + 1, eyeY + lookY - 1, 1.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-eyeSpacing + lookX - 1, eyeY + lookY + 1, 0.7, 0, Math.PI * 2);
      ctx.arc(eyeSpacing + lookX - 1, eyeY + lookY + 1, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cheeks
    ctx.fillStyle = 'rgba(251, 113, 133, 0.55)';
    ctx.beginPath();
    ctx.arc(-11, 2, 3, 0, Math.PI * 2);
    ctx.arc(11, 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.restore();
  };

  // 2. CROCODILE CHARACTER RENDERER
  const drawCrocodile = (ctx: CanvasRenderingContext2D, player: Player) => {
    const cx = player.x + player.width / 2;
    const cy = player.y + player.height / 2;

    ctx.save();
    ctx.translate(cx, cy);

    if (!player.facingRight) {
      ctx.scale(-1, 1);
    }

    let scaleX = 1;
    let scaleY = 1;
    if (player.vy < -2) {
      scaleY = 1 + Math.min(0.25, -player.vy * 0.018);
      scaleX = 1 / scaleY;
    } else if (player.vy > 3) {
      scaleY = 0.95;
      scaleX = 1.05;
    } else {
      scaleY = player.jumpStretch;
      scaleX = 2 - scaleY;
    }
    ctx.scale(scaleX, scaleY);

    const isAirborne = player.vy !== 0;

    // Tail
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-10, 4);
    const tailWag = Math.sin(frameCountRef.current * 0.12) * 3;
    ctx.quadraticCurveTo(-22, 6 + tailWag, -26, -2 + tailWag);
    ctx.quadraticCurveTo(-20, -1, -8, -1);
    ctx.closePath();
    ctx.fillStyle = '#15803d';
    ctx.fill();
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Tail spikes
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.moveTo(-16, 2 + tailWag);
    ctx.lineTo(-19, -4 + tailWag);
    ctx.lineTo(-21, 1 + tailWag);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Back legs
    if (isAirborne && player.vy < 0) {
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-8, 6);
      ctx.quadraticCurveTo(-14, 14, -12, 19);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(8, 6);
      ctx.quadraticCurveTo(14, 14, 12, 19);
      ctx.stroke();

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(-12, 19, 3, 0, Math.PI * 2);
      ctx.arc(12, 19, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(-12, 8, 6, 4.5, -0.2, 0, Math.PI * 2);
      ctx.ellipse(12, 8, 6, 4.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(-12, 12, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.ellipse(12, 12, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 3, 17, 13, 0, 0, Math.PI * 2);
    const crocGrad = ctx.createRadialGradient(-2, -1, 3, 0, 3, 17);
    crocGrad.addColorStop(0, '#22c55e');
    crocGrad.addColorStop(0.6, '#16a34a');
    crocGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = crocGrad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#14532d';
    ctx.stroke();

    // Dorsal scutes on back
    ctx.fillStyle = '#166534';
    for (let s = -8; s <= 4; s += 6) {
      ctx.beginPath();
      ctx.moveTo(s - 3, -8);
      ctx.lineTo(s, -13);
      ctx.lineTo(s + 3, -8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Yellow underbelly
    ctx.beginPath();
    ctx.ellipse(1, 6, 11, 7.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();

    // Belly segments
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, 4); ctx.lineTo(7, 4);
    ctx.moveTo(-6, 7); ctx.lineTo(8, 7);
    ctx.stroke();

    // Extended Snout
    ctx.beginPath();
    ctx.moveTo(6, -2);
    ctx.quadraticCurveTo(22, -3, 23, 3);
    ctx.quadraticCurveTo(22, 9, 6, 9);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Nostril bumps
    ctx.beginPath();
    ctx.arc(20, -1, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#15803d';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(20.5, -1, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Mouth line
    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.quadraticCurveTo(16, 5, 21, 3.5);
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Sharp white teeth
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(13, 4);
    ctx.lineTo(15, 7.5);
    ctx.lineTo(17, 4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(17, 5.5);
    ctx.lineTo(18.5, 2.5);
    ctx.lineTo(20, 5.5);
    ctx.closePath();
    ctx.fill();

    // Front paw
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(3, 9, 3.5, 2.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Crocodile Eye
    const eyeX = -3;
    const eyeY = -9;
    const isBlinking = player.blinkTimer < 8;

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    if (isBlinking) {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 5.2, 0, Math.PI * 2);
      ctx.fill();

      // Slit Pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(eyeX + 0.8, eyeY, 2.2, 4.2, 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX + 1.6, eyeY - 1.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cheek blush
    ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
    ctx.beginPath();
    ctx.arc(2, 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // 3. DUCK CHARACTER RENDERER
  const drawDuck = (ctx: CanvasRenderingContext2D, player: Player) => {
    const cx = player.x + player.width / 2;
    const cy = player.y + player.height / 2;

    ctx.save();
    ctx.translate(cx, cy);

    if (!player.facingRight) {
      ctx.scale(-1, 1);
    }

    let scaleX = 1;
    let scaleY = 1;
    if (player.vy < -2) {
      scaleY = 1 + Math.min(0.25, -player.vy * 0.018);
      scaleX = 1 / scaleY;
    } else if (player.vy > 3) {
      scaleY = 0.95;
      scaleX = 1.05;
    } else {
      scaleY = player.jumpStretch;
      scaleX = 2 - scaleY;
    }
    ctx.scale(scaleX, scaleY);

    const isAirborne = player.vy !== 0;

    // Tail Feather
    ctx.beginPath();
    ctx.moveTo(-12, 1);
    ctx.quadraticCurveTo(-22, -1, -24, -8);
    ctx.quadraticCurveTo(-17, -4, -10, -3);
    ctx.closePath();
    ctx.fillStyle = '#eab308';
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Orange Webbed Feet
    if (isAirborne && player.vy < 0) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.lineTo(-11, 18);
      ctx.lineTo(-7, 18);
      ctx.lineTo(-5, 14);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(4, 8);
      ctx.lineTo(2, 18);
      ctx.lineTo(6, 18);
      ctx.lineTo(7, 14);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(-7, 12, 4.5, 2.5, 0, 0, Math.PI * 2);
      ctx.ellipse(5, 12, 4.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Duck Body
    ctx.beginPath();
    ctx.ellipse(-2, 3, 16, 12.5, 0, 0, Math.PI * 2);
    const duckGrad = ctx.createRadialGradient(-3, -2, 3, -2, 3, 16);
    duckGrad.addColorStop(0, '#fef08a');
    duckGrad.addColorStop(0.6, '#facc15');
    duckGrad.addColorStop(1, '#eab308');
    ctx.fillStyle = duckGrad;
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = '#ca8a04';
    ctx.stroke();

    // Light belly
    ctx.beginPath();
    ctx.ellipse(-1, 5, 10, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fef9c3';
    ctx.fill();

    // Duck Wing (flaps when jumping)
    ctx.save();
    ctx.translate(-4, 3);
    if (isAirborne && player.vy < 0) {
      ctx.rotate(-0.4);
    } else {
      ctx.rotate(0.08);
    }
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-11, -3, -12, 5);
    ctx.quadraticCurveTo(-5, 10, 3, 4);
    ctx.closePath();
    ctx.fillStyle = '#eab308';
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // Head
    ctx.beginPath();
    ctx.arc(5, -7, 10.5, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Head Tuft Feather
    ctx.beginPath();
    ctx.moveTo(3, -16);
    ctx.quadraticCurveTo(1, -21, 6, -21);
    ctx.quadraticCurveTo(5, -17, 7, -15);
    ctx.closePath();
    ctx.fillStyle = '#fde047';
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Orange Duck Bill
    ctx.beginPath();
    ctx.moveTo(12, -8);
    ctx.quadraticCurveTo(23, -7, 24, -3);
    ctx.quadraticCurveTo(21, 1, 12, 0);
    ctx.closePath();
    ctx.fillStyle = '#f97316';
    ctx.fill();
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Smiling bill line & nostril
    ctx.beginPath();
    ctx.moveTo(13, -4);
    ctx.lineTo(21, -3.5);
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(15, -6, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = '#9a3412';
    ctx.fill();

    // Eye
    const eyeX = 7;
    const eyeY = -9;
    const isBlinking = player.blinkTimer < 8;

    if (isBlinking) {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 3.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX + 1, eyeY - 1, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(eyeX - 0.8, eyeY + 1, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rosy cheek
    ctx.fillStyle = 'rgba(251, 113, 133, 0.6)';
    ctx.beginPath();
    ctx.arc(4, -3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Dispatcher to draw active character
  const drawCharacter = (ctx: CanvasRenderingContext2D, player: Player) => {
    switch (player.characterType) {
      case 'crocodile':
        drawCrocodile(ctx, player);
        break;
      case 'duck':
        drawDuck(ctx, player);
        break;
      case 'frog':
      default:
        drawFrog(ctx, player);
        break;
    }
  };

  const drawEffects = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    floatingTextsRef.current.forEach((ft) => {
      ctx.save();
      ctx.font = 'bold 15px "JetBrains Mono", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 4;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawPondBackground(ctx);

    ctx.save();
    ctx.translate(0, -cameraYRef.current);

    platformsRef.current.forEach((platform) => {
      drawLilyPad(ctx, platform);
      drawMiniFish(ctx, platform);
    });

    // Draw active character
    drawCharacter(ctx, playerRef.current);

    drawEffects(ctx);

    ctx.restore();
  }, []);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      update();
      draw(ctx);
    }
    requestRef.current = requestAnimationFrame(loop);
  }, [draw, gameState]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      audioManager.stopMusic();
    };
  }, [loop]);

  const startGameWithCharacter = (charType: CharacterType = selectedCharacter) => {
    initGame(charType);
    setGameState('PLAYING');
    audioManager.playMusic();
  };

  const selectCharacterChoice = (id: CharacterType) => {
    setSelectedCharacter(id);
    audioManager.playJump(id);
  };

  // Touch / Mobile On-Screen controls
  const handleTouchLeft = (pressed: boolean) => {
    keysRef.current['ArrowLeft'] = pressed;
  };

  const handleTouchRight = (pressed: boolean) => {
    keysRef.current['ArrowRight'] = pressed;
  };

  const handleTouchJump = (pressed: boolean) => {
    keysRef.current['Space'] = pressed;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-3 sm:p-6">
      {/* Game Card Container */}
      <div className="relative group max-w-full">
        {/* Soft Aquatic Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-teal-400 via-sky-300 to-emerald-400 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-700"></div>

        <div className="relative bg-white/40 backdrop-blur-md p-2 sm:p-3 rounded-3xl border border-white/70 shadow-2xl">
          <div className="relative rounded-2xl overflow-hidden shadow-inner bg-[#7dd3fc]">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="block max-w-full h-auto mx-auto select-none touch-none"
            />

            {/* In-Game Heads-Up Display (Score, Fish, Sound, Active Character) */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2">
                {/* Score Pill */}
                <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/80 shadow-sm pointer-events-auto">
                  <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="font-mono text-sm font-extrabold text-slate-800">{score}</span>
                </div>

                {/* Mini Fish Caught Pill */}
                <div className="flex items-center gap-1.5 bg-amber-50/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-200/80 shadow-sm pointer-events-auto">
                  <span className="text-sm">🐟</span>
                  <span className="font-mono text-sm font-bold text-amber-900">{fishCount}</span>
                </div>
              </div>

              {/* High Score & Mute Button */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="hidden sm:flex items-center gap-1 bg-white/75 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/70 shadow-sm text-xs font-semibold text-slate-600">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">BEST</span>
                  <span className="font-mono font-bold text-slate-700">{highScore}</span>
                </div>

                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute Upbeat Music' : 'Mute Upbeat Music'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-all cursor-pointer ${
                    isMuted 
                      ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/20'
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-extrabold">Music OFF</span>
                    </>
                  ) : (
                    <>
                      <Music className="w-3.5 h-3.5 animate-pulse" />
                      <span className="text-[11px] font-extrabold tracking-tight">Music ON 🎵</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Overlays: Start Screen, Character Selection & Game Over */}
            <AnimatePresence mode="wait">
              {/* 1. START SCREEN */}
              {gameState === 'START' && (
                <motion.div 
                  key="start-screen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-sky-900/40 backdrop-blur-md p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.85, y: -10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white shadow-2xl max-w-xs w-full text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-tr from-emerald-400 to-teal-300 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/30 text-4xl">
                      🐸
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">
                       LILY PAD HOP
                    </h1>
                    <p className="text-emerald-700 font-medium text-xs mb-4">
                      Hop across lush lily pads and catch the swimming mini fish!
                    </p>

                    {/* Interactive Upbeat Music Toggle Banner */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isMuted) {
                          const newMuted = audioManager.toggleMute();
                          setIsMuted(newMuted);
                        }
                        audioManager.playMusic();
                      }}
                      className="w-full mb-3.5 flex items-center justify-between px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 rounded-2xl text-xs font-bold text-emerald-900 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <div className="flex items-center gap-2">
                        <Music className={`w-4 h-4 ${isMuted ? 'text-slate-400' : 'text-emerald-600 animate-bounce'}`} />
                        <span>Upbeat Pond Tune</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${isMuted ? 'bg-slate-200 text-slate-700' : 'bg-emerald-600 text-white shadow-sm'}`}>
                        {isMuted ? 'Tap to Play 🔈' : 'Playing 🎵'}
                      </span>
                    </button>
                    
                    {/* Play button opens the Character Selection Page */}
                    <button
                      onClick={() => {
                        setGameState('CHARACTER_SELECT');
                        audioManager.playMusic();
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-base"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      PLAY GAME
                    </button>

                    <div className="grid grid-cols-2 gap-2 mt-5 text-[11px] font-semibold text-slate-500">
                      <div className="bg-slate-100/80 p-2.5 rounded-xl border border-slate-200/60">
                        <div className="text-slate-400 text-[9px] uppercase tracking-wider mb-0.5">Move</div>
                        <div className="text-slate-800">← → or A / D</div>
                      </div>
                      <div className="bg-slate-100/80 p-2.5 rounded-xl border border-slate-200/60">
                        <div className="text-slate-400 text-[9px] uppercase tracking-wider mb-0.5">Super Leap</div>
                        <div className="text-slate-800">SPACE or UP</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* 2. CHARACTER SELECTION SCREEN (Appears after user presses Play) */}
              {gameState === 'CHARACTER_SELECT' && (
                <motion.div 
                  key="character-select-screen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-sky-950/50 backdrop-blur-md p-4 text-center z-20"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 16 }}
                    className="bg-white/95 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white shadow-2xl max-w-sm w-full text-center"
                  >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-extrabold tracking-wide uppercase mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Pond Champions
                    </div>

                    <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">
                      CHOOSE YOUR CHARACTER
                    </h2>
                    <p className="text-slate-500 text-xs mb-4">
                      Select your companion to leap across the pond!
                    </p>

                    {/* Character Cards Grid: Visuals directly above names */}
                    <div className="grid grid-cols-3 gap-2.5 mb-5">
                      {CHARACTERS.map((char) => {
                        const isSelected = selectedCharacter === char.id;
                        return (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => selectCharacterChoice(char.id)}
                            className={`relative flex flex-col items-center p-2.5 rounded-2xl transition-all cursor-pointer select-none text-center ${
                              isSelected 
                                ? 'bg-gradient-to-b from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-md ring-2 ring-emerald-400/40 scale-[1.04]' 
                                : 'bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:scale-[1.01] text-slate-700'
                            }`}
                          >
                            {/* Selected Checkmark Badge */}
                            {isSelected && (
                              <div className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white rounded-full p-0.5 shadow-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}

                            {/* Character Visual directly ABOVE the name */}
                            <div className="h-14 w-full flex items-center justify-center mb-1">
                              {char.id === 'crocodile' && <CrocodileVisual />}
                              {char.id === 'frog' && <FrogVisual />}
                              {char.id === 'duck' && <DuckVisual />}
                            </div>

                            {/* Character Name */}
                            <div className={`font-black text-xs tracking-tight ${isSelected ? 'text-emerald-950 font-extrabold' : 'text-slate-800'}`}>
                              {char.name}
                            </div>

                            {/* Tagline */}
                            <div className="text-[9px] font-semibold text-slate-400 mt-0.5 leading-tight">
                              {char.tagline}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Character Preview Info Box */}
                    <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-2.5 mb-4 text-left flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm">
                        {selectedCharacter === 'crocodile' && '🐊'}
                        {selectedCharacter === 'frog' && '🐸'}
                        {selectedCharacter === 'duck' && '🦆'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-extrabold text-emerald-950 leading-tight">
                          {CHARACTERS.find(c => c.id === selectedCharacter)?.name} Active
                        </div>
                        <div className="text-[10px] text-emerald-700 truncate">
                          {CHARACTERS.find(c => c.id === selectedCharacter)?.description}
                        </div>
                      </div>
                    </div>

                    {/* CONTINUE TO GAME BUTTON */}
                    <button
                      onClick={() => startGameWithCharacter(selectedCharacter)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-base"
                    >
                      <span>CONTINUE TO GAME</span>
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Back to title screen */}
                    <button
                      type="button"
                      onClick={() => setGameState('START')}
                      className="mt-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      ← Back to Title
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* 3. GAME OVER SCREEN */}
              {gameState === 'GAMEOVER' && (
                <motion.div 
                  key="gameover-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-sky-950/45 backdrop-blur-md p-6 text-center z-20"
                >
                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white shadow-2xl max-w-xs w-full text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center text-3xl shadow-inner">
                      🌊
                    </div>

                    <div className="text-sky-700 text-xs font-bold uppercase tracking-wider mb-1">
                      Took a Pond Dip!
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
                      SPLASHDOWN!
                    </h2>

                    {/* Stats Card */}
                    <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-4 mb-4">
                      <div className="grid grid-cols-2 gap-3 divide-x divide-sky-200">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</div>
                          <div className="text-2xl font-mono font-black text-emerald-600">{score}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mini Fish</div>
                          <div className="text-2xl font-mono font-black text-amber-500">🐟 {fishCount}</div>
                        </div>
                      </div>

                      {score >= highScore && score > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-sky-200/70 text-[11px] font-bold text-amber-600 flex items-center justify-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          New High Score Record!
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => startGameWithCharacter(selectedCharacter)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-base"
                      >
                        <RotateCcw className="w-5 h-5" />
                        HOP AGAIN
                      </button>

                      <button
                        onClick={() => setGameState('CHARACTER_SELECT')}
                        className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                      >
                        Change Character
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* On-Screen Touch Controls (Mobile Friendly) */}
          <div className="mt-2.5 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <button
                onTouchStart={() => handleTouchLeft(true)}
                onTouchEnd={() => handleTouchLeft(false)}
                onMouseDown={() => handleTouchLeft(true)}
                onMouseUp={() => handleTouchLeft(false)}
                onMouseLeave={() => handleTouchLeft(false)}
                aria-label="Move Left"
                className="w-13 h-11 bg-white/80 hover:bg-white active:bg-emerald-100 rounded-xl border border-white/80 shadow-sm flex items-center justify-center text-slate-700 active:text-emerald-700 font-bold transition-all select-none cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onTouchStart={() => handleTouchRight(true)}
                onTouchEnd={() => handleTouchRight(false)}
                onMouseDown={() => handleTouchRight(true)}
                onMouseUp={() => handleTouchRight(false)}
                onMouseLeave={() => handleTouchRight(false)}
                aria-label="Move Right"
                className="w-13 h-11 bg-white/80 hover:bg-white active:bg-emerald-100 rounded-xl border border-white/80 shadow-sm flex items-center justify-center text-slate-700 active:text-emerald-700 font-bold transition-all select-none cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onTouchStart={() => handleTouchJump(true)}
              onTouchEnd={() => handleTouchJump(false)}
              onMouseDown={() => handleTouchJump(true)}
              onMouseUp={() => handleTouchJump(false)}
              onMouseLeave={() => handleTouchJump(false)}
              aria-label="Super Leap"
              className="flex-1 max-w-[170px] h-11 bg-emerald-500/90 hover:bg-emerald-500 active:bg-emerald-600 text-white rounded-xl shadow-sm flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider transition-all select-none cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
              Super Leap
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info Tips */}
      <div className="mt-4 text-center max-w-sm px-4">
        <p className="text-slate-600 text-xs font-medium leading-relaxed">
          Playing as <span className="text-emerald-700 font-bold capitalize">{selectedCharacter}</span>. 
          Bounce across the <span className="text-emerald-700 font-bold">lily pads</span> and catch 
          the swimming <span className="text-amber-600 font-bold">mini fish</span>!
        </p>
      </div>
    </div>
  );
};

export default Game;
