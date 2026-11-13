export type CharacterType = 'crocodile' | 'frog' | 'duck';

export interface CharacterOption {
  id: CharacterType;
  name: string;
  tagline: string;
  description: string;
  themeColor: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Platform extends Point, Size {
  hasFish: boolean;
  fishCollected: boolean;
  hasFlower: boolean;
  flowerHue?: string;
  notchAngle: number; // Angular position of the lily pad cut wedge (in radians)
  rippleAnim: number; // Countdown for splash ripple on landing
}

export interface Player extends Point, Size {
  vx: number;
  vy: number;
  isGrounded: boolean;
  facingRight: boolean;
  jumpStretch: number; // Visual squash and stretch
  blinkTimer: number;
  characterType: CharacterType;
}

export interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  alpha: number;
  vy: number;
  color: string;
}

export interface PondBubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  alpha: number;
}

export type GameState = 'START' | 'CHARACTER_SELECT' | 'PLAYING' | 'GAMEOVER';
