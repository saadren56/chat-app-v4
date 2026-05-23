# CyberChat Tailwind CSS Configuration Guide

A complete luxury cyberpunk Tailwind CSS setup with glassmorphism, animations, and custom utilities.

---

## 🎨 Color Palette

### Cyber Purple
```css
cyber-50  → #faf5ff
cyber-100 → #f3e8ff
cyber-200 → #e9d5ff
cyber-300 → #d8b4fe
cyber-400 → #c084fc
cyber-500 → #a855f7 (primary)
cyber-600 → #9333ea
cyber-700 → #7e22ce
cyber-800 → #6b21a8
cyber-900 → #581c87
cyber-950 → #3b0764
```

### Neon Accents
```css
neon-pink    → #ff00ff
neon-purple  → #a855f7
neon-violet  → #8b5cf6
neon-cyan    → #06b6d4
neon-blue    → #38bdf8
neon-magenta → #ec4899
```

### Luxury Colors
```css
luxury-gold     → #f59e0b
luxury-silver   → #e5e7eb
luxury-platinum → #f9fafb
luxury-rose     → #f43f5e
luxury-emerald  → #10b981
```

### Dark Theme Base
```css
dark-900 → #0a0a0f
dark-800 → #111118
dark-700 → #181825
dark-600 → #1f1f2e
dark-500 → #2a2a3e
```

---

## ✨ Custom Shadows

### Cyber Glow Shadows
```html
<div class="shadow-cyber-sm">     Small cyber glow</div>
<div class="shadow-cyber">        Default cyber glow</div>
<div class="shadow-cyber-lg">     Large cyber glow</div>
<div class="shadow-cyber-pink">   Pink neon glow</div>
<div class="shadow-cyber-cyan">   Cyan neon glow</div>
<div class="shadow-cyber-gold">   Gold luxury glow</div>
```

### Glass Shadows
```html
<div class="shadow-glass">        Glass panel shadow</div>
<div class="shadow-inner-glow">   Inner glow effect</div>
```

### Drop Shadows
```html
<div class="drop-shadow-cyber">       Purple drop shadow</div>
<div class="drop-shadow-cyber-pink">  Pink drop shadow</div>
<div class="drop-shadow-cyan">        Cyan drop shadow</div>
```

---

## 🔮 Glassmorphism

### Glass Variants
```html
<div class="glass">          Standard glass</div>
<div class="glass-strong">   Stronger blur</div>
<div class="glass-soft">     Softer effect</div>
<div class="glass-dark">     Darker glass</div>
<div class="glass-gradient"> Gradient glass</div>
```

### Backgrounds
```html
<div class="bg-cyber-luxury">       Luxury cyber background</div>
<div class="bg-radial-cyber">        Radial gradient background</div>
<div class="bg-gradient-luxury">      Luxury gradient</div>
<div class="bg-gradient-cyber">       Cyber gradient</div>
<div class="bg-gradient-gold">        Gold gradient</div>
```

### Patterns
```html
<div class="bg-grid">    Grid pattern</div>
<div class="bg-dots">    Dots pattern</div>
```

---

## 🎬 Animations

### Entrance Animations
```html
<div class="animate-fade-in">      Fade in</div>
<div class="animate-fade-in-up">   Fade in up</div>
<div class="animate-fade-in-down"> Fade in down</div>
<div class="animate-fade-in-left"> Fade in left</div>
<div class="animate-fade-in-right">Fade in right</div>
<div class="animate-scale-in">      Scale in</div>
<div class="animate-scale-up">      Scale up</div>
<div class="animate-slide-up">      Slide up</div>
<div class="animate-slide-down">    Slide down</div>
<div class="animate-bounce-in">     Bounce in</div>
<div class="animate-zoom-in">       Zoom in</div>
<div class="animate-back-in">       Back in</div>
```

### Continuous Animations
```html
<div class="animate-float">          Float up/down</div>
<div class="animate-float-slow">     Slow float</div>
<div class="animate-pulse-glow">     Pulse glow</div>
<div class="animate-rotate-slow">    Slow rotate (360°)</div>
<div class="animate-spin-slow">      Slow spin</div>
<div class="animate-bounce-subtle">  Subtle bounce</div>
<div class="animate-heart-beat">     Heart beat</div>
```

### Attention Seekers
```html
<div class="animate-wobble">     Wobble</div>
<div class="animate-rubber-band">Rubber band</div>
<div class="animate-shake">      Shake</div>
<div class="animate-jello">      Jello</div>
<div class="animate-flip">       Flip</div>
<div class="animate-zoom-out">   Zoom out</div>
<div class="animate-back-out">   Back out</div>
```

### Animation Delays
```html
<div class="animate-delay-100">100ms delay</div>
<div class="animate-delay-200">200ms delay</div>
<div class="animate-delay-300">300ms delay</div>
<div class="animate-delay-500">500ms delay</div>
```

### Stagger Children
```html
<div class="stagger-children">
  <div>Child 1 (0ms)</div>
  <div>Child 2 (50ms)</div>
  <div>Child 3 (100ms)</div>
  <!-- ...up to 10 children -->
</div>
```

---

## 💫 Text Effects

### Gradient Text
```html
<p class="text-gradient">      Cyber gradient text</p>
<p class="text-gradient-gold"> Gold gradient text</p>
```

### Glow Text
```html
<p class="glow-text">       Purple glow</p>
<p class="glow-text-pink">  Pink glow</p>
<p class="glow-text-cyan">  Cyan glow</p>
```

### Text Shadow
```html
<p class="text-shadow">       Text shadow</p>
<p class="text-shadow-pink">  Pink text shadow</p>
<p class="text-shadow-cyan">  Cyan text shadow</p>
```

### Typography
```html
<p class="text-elegant">  Elegant letter spacing</p>
<p class="text-luxury">   Luxury font (Orbitron)</p>
<p class="text-mono">     Monospace font</p>
```

---

## 🎯 Hover Effects

```html
<div class="hover-lift">       Lift on hover</div>
<div class="hover-glow">       Glow on hover</div>
<div class="hover-scale">      Scale on hover</div>
<div class="glow-hover">       Glow effect</div>
```

---

## 🔲 Border Effects

### Neon Borders
```html
<div class="neon-border">       Cyber neon border</div>
<div class="neon-border-pink">  Pink neon border</div>
```

---

## 📜 Custom Scrollbar

```html
<div class="scrollbar-cyber">     Custom cyber scrollbar</div>
<div class="scrollbar-hide">      Hide scrollbar</div>
<div class="no-scrollbar">        No scrollbar</div>
```

---

## 🎨 Focus States

```html
<button class="focus-ring">      Purple focus ring</button>
<button class="focus-ring-cyan">  Cyan focus ring</button>
```

---

## ⏱️ Transitions

```html
<div class="transition-all-smooth">        All properties</div>
<div class="transition-transform-smooth">  Transform only</div>
<div class="transition-colors-smooth">     Colors only</div>
<div class="transition-shadow-smooth">     Shadow only</div>
```

### Custom Timing
```html
<div class="ease-cyber">           Cyber cubic-bezier</div>
<div class="ease-bounce-smooth">   Smooth bounce</div>
```

---

## 📱 Responsive Utilities

```html
<div class="hide-mobile">    Hide on mobile</div>
<div class="hide-desktop">   Hide on desktop</div>
```

---

## 🎛️ 3D Effects

```html
<div class="preserve-3d">  Preserve 3D context</div>
<div class="perspective">   Perspective container</div>
```

---

## 🚀 Performance

```html
<div class="content-auto">  Content visibility auto</div>
```

---

## 📦 Complete Examples

### Luxury Card
```html
<div class="glass rounded-3xl p-8 shadow-cyber hover-glow transition-all-smooth">
  <h2 class="text-2xl font-bold text-gradient mb-4">Luxury Card</h2>
  <p class="text-gray-300">Elegant glassmorphism design</p>
</div>
```

### Cyber Button
```html
<button class="bg-gradient-cyber text-white px-8 py-3 rounded-2xl 
               shadow-cyber hover-scale transition-all-smooth
               animate-pulse-glow">
  Launch
</button>
```

### Chat Message
```html
<div class="glass-soft rounded-2xl px-4 py-3 animate-slide-up">
  <p class="text-white">Hello, world!</p>
</div>
```

### Avatar with Status
```html
<div class="relative">
  <div class="w-12 h-12 rounded-2xl bg-gradient-cyber flex items-center justify-center">
    <span class="text-white font-bold">A</span>
  </div>
  <span class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-900"></span>
</div>
```

---

## 🎨 Quick Reference

### Most Used Classes
```css
glass          - Glass effect
shadow-cyber   - Cyber glow
text-gradient  - Gradient text
animate-float  - Floating animation
bg-cyber-luxury- Luxury background
```

### Color Combinations
- **Primary:** `cyber-500` + `neon-cyan`
- **Secondary:** `cyber-400` + `neon-pink`
- **Luxury:** `luxury-gold` + `cyber-600`
- **Dark:** `dark-900` + `cyber-950`

---

## 📚 Additional Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/) - For advanced animations
- [Lucide Icons](https://lucide.dev/) - Icon library
