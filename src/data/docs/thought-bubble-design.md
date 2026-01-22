# Thought Bubble Design System

> **Bubbles' thoughts must manifest as slowly emerging, cloud-like bubbles containing readable but misguided text from its knowledge base, appearing at random intervals and remaining visible long enough for the user to read, without comic-strip styling or abrupt motion.**

---

## Core Principle

Thought bubbles represent **internal thoughts**, not speech, labels, or UI elements.

---

## Bubble Shape Requirements

### Mandatory Characteristics

| Requirement | Correct | Incorrect |
|-------------|---------|-----------|
| Shape | Organic, cloud-like | Rectangular, rounded-corner boxes |
| Edges | Irregular, soft | Sharp, geometric |
| Form | Natural, atmospheric | Panel-like, tooltip-style |

### SVG Cloud Path Example

```svg
<path
  d="M 20 70 
     C 5 65, 5 45, 20 40
     C 15 25, 35 15, 55 20
     C 65 8, 90 5, 110 15
     C 130 5, 160 10, 175 25
     C 195 30, 198 50, 185 65
     C 195 80, 175 90, 155 85
     C 140 95, 100 98, 70 90
     C 45 95, 15 85, 20 70
     Z"
/>
```

---

## Emergence & Motion

### Animation Guidelines

| Aspect | Correct | Incorrect |
|--------|---------|-----------|
| Appearance | Fade in gently | Snap, pop, bounce |
| Growth | Small to full size | Instant appearance |
| Movement | Subtle drift (upward/sideways) | Sliding, flying |
| Exit | Soft fade out | Hard cut |

### Framer Motion Settings

```tsx
initial={{ opacity: 0, scale: 0.7, y: 15 }}
animate={{ 
  opacity: 1, 
  scale: 1, 
  y: [0, -4, 0], // Gentle drift
}}
exit={{ opacity: 0, scale: 0.85, y: -8 }}
transition={{
  opacity: { duration: 0.8, ease: "easeOut" },
  scale: { duration: 1, ease: [0.34, 1.56, 0.64, 1] },
  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
}}
```

---

## Timing & Readability

### Display Duration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Initial delay | 1.2s | Allow page to settle |
| Display interval | 6-9s | Long enough to read comfortably |
| Visible at once | 1 (primary) | No overlapping text |

### Anti-Patterns

- ❌ Rapid cycling
- ❌ Multiple overlapping bubbles
- ❌ Text truncated too aggressively (allow 120 chars)

---

## Text Content

### Source Requirements

All thought text must come from:
- Bubbles' RAG/knowledge base (`bubbles_thoughts` table)
- Misguided, erroneous, overconfident content

### Presentation

| Aspect | Correct | Incorrect |
|--------|---------|-----------|
| Tone | Calmly presented | Shouting, exclamatory |
| Typography | Clean sans-serif | Bold comic fonts |
| Style | Readable | Decorative, stylized |
| Wrongness | Content-driven | Visually exaggerated |

---

## Typography & Layout

### Text Placement

- Float naturally inside bubble
- Adequate padding from edges (px-6 py-4 minimum)
- Line length optimized for reading
- Center-aligned within cloud form

### Font Guidelines

```css
font-family: sans-serif;
font-size: 0.75rem (mobile), 0.875rem (desktop);
line-height: relaxed;
text-align: center;
```

---

## Environmental Integration

Thought bubbles must harmonize with:

- ✓ Wicklow bog mist aesthetic
- ✓ Damp air, low clouds
- ✓ Muted, atmospheric color palette
- ✓ Feels part of the environment, not layered on top

### Color Palette (By Mode)

| Mode | Fill Color | Description |
|------|------------|-------------|
| Innocent | `hsl(45 30% 92%)` | Warm cream - bog cotton |
| Concerned | `hsl(210 25% 88%)` | Misty grey-blue |
| Triggered | `hsl(35 35% 85%)` | Warm bracken tint |
| Savage | `hsl(330 25% 88%)` | Muted heather |
| Nuclear | `hsl(50 40% 88%)` | Soft gorse hint |

---

## Origin Indication

### Correct: Soft Bubble Clustering

```tsx
<div className="flex gap-1">
  <div className="w-2.5 h-2.5 rounded-full blur-[0.3px]" />
  <div className="w-1.5 h-1.5 rounded-full blur-[0.2px] mt-1" />
</div>
```

### Incorrect

- ❌ Comic-strip speech tails
- ❌ Descending dot trails (comic convention)
- ❌ Arrow pointers

---

## Behavioral Constraints

### Character Non-Reaction

Bubbles (the character) must NOT react to the thoughts:

- No facial change when thoughts appear
- No acknowledgement of bubble content
- Thoughts appear independently of expression
- Maintains neutral, vacant gaze regardless

---

## Anti-Drift Safeguards

### Rejection Criteria

If bubbles resemble any of the following → **REJECT**:

- Comic strip thought clouds
- Meme captions
- UI tooltips or notifications
- Speech bubbles with tails
- Chat message bubbles

If text appears:

- Too clever or witty
- Self-aware or knowingly ironic
- Like a punchline

→ **REJECT**

---

## Component Implementation

```tsx
<OrganicThoughtBubble 
  text="Clouds are just fog that got promoted."
  mode="innocent"
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| text | string | Thought content from knowledge base |
| mode | BubblesMode | innocent, concerned, triggered, savage, nuclear |

---

## Version History

| Date | Change |
|------|--------|
| 2025-01 | Redesigned from comic-style to organic cloud shapes |
| 2025-01 | Extended display duration for readability |
| 2025-01 | Replaced thought trail with soft bubble cluster |
| 2025-01 | Added atmospheric glow for environmental integration |
