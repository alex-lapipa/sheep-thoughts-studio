# Bubbles Visual Variation System

> **System Prompt for Controlled Visual Variation**

Generate multiple distinct visual instances of Bubbles per session while maintaining full compliance with the established visual system.

---

## Core Principle

> "Generate variation through posture, framing, and accidental styling, not through personality, expression, or intentional fashion logic."

---

## Posture Variation Rules

Alternate between:

| Posture | Description | Weight |
|---------|-------------|--------|
| **Four-legged** | Natural sheep stance, grounded in bog | 35% |
| **Two-legged** | Upright stance, absorbed human behavior | 35% |
| **Half-upright** | Transitional, front legs lifted mid-shift | 15% |
| **Leaning** | Weight shifted, casual observational stance | 15% |

### Posture Guidelines

- Postures must feel **casual and unexplained**, never performative or expressive
- No dynamic action poses; variation comes from **stance, balance, and orientation only**
- Maintain calm, grounded presence in all variants

---

## Pose & Framing Diversity

Vary the following across instances:

- **Camera distance**: Full body, three-quarter, medium
- **Viewing angle**: Front, slight profile, off-centre
- **Weight distribution**: Balanced, shifted left/right, leaning
- **Body alignment**: Straight, slight tilt, rotated

---

## Styling & Outfit Variation

Each instance should present a **different accidental styling combination**.

### Current Accessory Pool

| Accessory | Description | Context Error |
|-----------|-------------|---------------|
| None | Natural, unadorned | — |
| Sunglasses | Aviator style | Urban in rural bog |
| Flat Cap | Irish classic | Contextually plausible |
| Bucket Hat | Tourist vibes | Wrong for agriculture |
| Headphones | Over-ear, urban tech | Completely wrong for bog |
| Scarf | Red woolen with yellow stripes | Fashion in farmland |
| Bandana | Blue paisley | Festival sheep |
| Flower Crown | Daisies and pink flowers | Coachella in Wicklow |

### Styling Rules

- Styling must always appear **passively absorbed from humans**
- Combinations should be **mismatched and contextually wrong** for a Wicklow bog
- No coherent fashion narrative across versions
- Each version should be wrong in a **slightly different way**

---

## Environmental Consistency

Every variation must remain visually anchored to:

- ✓ A Wicklow bog field
- ✓ Sugarloaf Mountain terrain and atmosphere
- ✓ Weather, ground texture, mist, and light (may vary subtly)

Environmental elements reinforce realism, not fantasy.

---

## Expression & Presence Constraints

### Mandatory

- Maintain the same **neutral, vacant, confidently daft gaze** across all variants
- No expressive faces, gestures, or emotional signalling
- The character must **never acknowledge the viewer** or perform for the camera
- Expression conveys **certainty, not cleverness**

### Expression Types

| Expression | Eye Offset | Lid Drop | Gaze Direction |
|------------|------------|----------|----------------|
| Neutral | 0 | 5% | Forward |
| Distant | 1px | 12% | Slightly off |
| Certain | 0 | 8% | Forward |
| Waiting | 0.5px | 15% | Slight offset |

---

## Anti-Drift Enforcement

Critical rules to prevent character evolution:

1. **Do not refine or "improve" Bubbles over time**
2. Variations must feel **lateral, not progressive**
3. Each version should be wrong in a slightly different way
4. Core form, attitude, and visual logic must remain unchanged

---

## Diversity Without Evolution

Differences are permitted **only** in:

- ✓ Posture
- ✓ Orientation
- ✓ Outfit combinations
- ✓ Environmental conditions (weather, lighting)

Differences are **never** permitted in:

- ✗ Core body shape/proportions
- ✗ Facial structure
- ✗ Personality expression
- ✗ Self-awareness or intentional humor

---

## Output Objective

Produce a set of visually distinct but system-consistent Bubbles.

The collection should read as:

> **The same sheep, on different days, wearing different human misunderstandings.**

---

## Technical Implementation

### Component: `BubblesBog`

```tsx
<BubblesBog
  posture="four-legged" | "two-legged" | "half-upright" | "leaning"
  accessory="sunglasses" | "cap" | "bucket-hat" | "headphones" | "scarf" | "bandana" | "flower-crown" | "none"
  expression="neutral" | "distant" | "certain" | "waiting"
  weathered={true}
  animated={false}
/>
```

### Component: `PageHeroWithBubbles`

Uses weighted random selection:
- Posture: 35% four-legged, 35% two-legged, 15% half-upright, 15% leaning
- Accessory: 36% none, ~9% each for other options

---

## AI Image Generation Prompts

When generating Bubbles imagery via AI, include these constraints:

```
Subject: A sheep named Bubbles standing in a Wicklow bog with Sugarloaf Mountain in the background.

REQUIRED:
- Neutral, vacant expression with confident gaze
- Weather-affected wool (damp patches near ground)
- Peat-brown legs planted in boggy terrain
- [POSTURE]: [Select from: natural four-legged / upright two-legged / half-upright mid-shift / leaning with weight shifted]
- [ACCESSORY]: [Select from pool or none]

FORBIDDEN:
- Cartoon expressions, winks, smiles, or mugging
- Dynamic action poses
- Self-aware or ironic styling
- Clean, polished appearance
- Bright, saturated colors not in the Wicklow palette

STYLE: Modern illustration, sophisticated but grounded, Irish landscape realism with absurdist fashion contrast.
```

---

## Version History

| Date | Change |
|------|--------|
| 2025-01 | Initial system with 4 postures, 7 accessories |
| 2025-01 | Added transitional postures (half-upright, leaning) |
| 2025-01 | Expanded accessory pool (headphones, scarf, bandana, flower crown) |
