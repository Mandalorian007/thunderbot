# Storm Sanctum

> Idle town + roguelike rifts for ThunderClap Gaming

## Core Concept

Summon **Heroes** with elemental affinities. Assign them to **work your Sanctum** (idle resource generation). Gear them up and take them into **Rifts** for loot. Simple loop, deep enough to hook.

---

## The Loop

```
[Summon Heroes]
      ↓
[Assign Heroes to Sanctum jobs → passive resources]
      ↓
[Take Heroes into Rifts → earn Shards + Gear]
      ↓
[Equip Gear → stronger Heroes → harder Rifts]
```

---

## Heroes

### Elements (5 total)
| Element | Strong vs | Weak vs | Color |
|---------|-----------|---------|-------|
| ⚡ Lightning | Water | Earth | Yellow |
| 🔥 Fire | Earth | Water | Red |
| 💧 Water | Fire | Lightning | Blue |
| 🌿 Earth | Lightning | Fire | Green |
| 💀 Void | — | — | Purple |

Void is neutral - no weaknesses, no strengths. Rare.

### Rarity
| Rarity | Pull Rate | Base Power | Work Speed |
|--------|-----------|------------|------------|
| ⭐ Common | 65% | 10 | 1x |
| ⭐⭐ Rare | 25% | 20 | 1.5x |
| ⭐⭐⭐ Epic | 8% | 35 | 2x |
| ⭐⭐⭐⭐ Legendary | 2% | 50 | 3x |

### MVP Hero Roster (10 heroes)

| Name | Element | Rarity | Ability |
|------|---------|--------|---------|
| Spark | ⚡ Lightning | Common | Quick Strike - attack first |
| Ember | 🔥 Fire | Common | Burn - DoT damage |
| Puddle | 💧 Water | Common | Splash - small AoE |
| Pebble | 🌿 Earth | Common | Tough - +25% HP |
| Flicker | ⚡ Lightning | Rare | Chain - hits twice |
| Blaze | 🔥 Fire | Rare | Ignite - big burn |
| Tide | 💧 Water | Rare | Heal - restore HP |
| Boulder | 🌿 Earth | Rare | Shield - block one hit |
| Tempest | ⚡ Lightning | Epic | Storm - hits all enemies |
| Nyx | 💀 Void | Legendary | Drain - damage + heal |

### Summoning
- `/summon` costs **50 Shards**
- Duplicate heroes convert to **Scraps** (used for gear crafting later - post-MVP)
- First summon is **free** + guaranteed Rare

---

## The Sanctum (Idle Town)

### How It Works
- Your Sanctum has **3 job slots** (MVP)
- Assign a Hero to a slot → they generate resources passively
- Hero's **rarity** affects generation speed (1x/1.5x/2x/3x)
- Hero's **element** gives bonus to matching job type

### Job Slots

| Slot | Generates | Element Bonus |
|------|-----------|---------------|
| ⚡ **Generator** | Energy (for Rifts) | Lightning heroes: +50% |
| 🔥 **Forge** | Shards (currency) | Fire heroes: +50% |
| 💧 **Well** | HP restore between rifts | Water heroes: +50% |

### Base Generation Rates
- Generator: 1 Energy/hour (cap: 20)
- Forge: 5 Shards/hour (no cap)
- Well: Passive - heroes start rifts at full HP

### Sanctum Display
```
⚡ YOUR SANCTUM ⚡
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Energy: 14/20
💎 Shards: 847

JOBS:
⚡ Generator: Spark (⭐ Lightning) → 1.5 Energy/hr
🔥 Forge: [Empty] → 5 Shards/hr
💧 Well: Tide (⭐⭐ Water) → Full HP on rift start

[📋 Manage Jobs] [🔮 Summon (50💎)]
```

---

## Rifts

### Starting a Rift
- `/rift` costs **5 Energy**
- Select **1 Hero** to send (MVP - expand to 2-3 later)
- Hero's element matters vs enemies

### Structure
- **3 floors** + **Boss** (MVP)
- Each floor: random encounter
- Simple choices, quick resolution

### Combat
```
═══ FLOOR 2 ═══
A wild Flame Imp appears!
Type: 🔥 Fire

Your Hero: Tide (💧 Water) - SUPER EFFECTIVE!
HP: ████████░░ 80/100

Enemy HP: ██████░░░░ 60/100

[⚔️ Attack] [🛡️ Defend] [💨 Flee]
```

**Damage calculation:**
- Base damage = Hero Power + Gear bonus
- Super effective (element advantage): 1.5x damage
- Resisted (element disadvantage): 0.5x damage
- Neutral: 1x damage

### Encounter Types (MVP: 4)

1. **Monster** - Fight or flee
2. **Treasure** - Free shards (10-30)
3. **Trap** - Take damage or spend shards to bypass
4. **Rest** - Heal 25% HP

### Boss
- Floor 4 is always a boss
- Bosses hit hard but drop good loot
- Boss element rotates daily

### Loot
- **Shards**: 10-20 per floor, 50+ from boss
- **Gear**: Random drop chance from boss (~30%)

### Death
- Hero "retreats" - no penalty except failed run
- Keep any shards earned before death

---

## Gear

### How It Works
- Heroes have **1 gear slot** (MVP)
- Gear adds flat Power bonus
- Gear has no element (keeps it simple)

### Gear Tiers
| Tier | Power Bonus | Drop Rate |
|------|-------------|-----------|
| Common | +5 | 60% |
| Rare | +12 | 30% |
| Epic | +25 | 10% |

### Gear Management
- `/gear` - View all gear
- `/equip <hero> <gear>` - Equip gear to hero
- Gear can be swapped freely
- Sell gear for Shards (5/15/40 by tier)

### Display
```
🗡️ YOUR GEAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Iron Sword (Common) +5 → Equipped: Spark
2. Flame Blade (Rare) +12 → Unequipped
3. Crystal Staff (Epic) +25 → Equipped: Tempest

[Sell] to convert to Shards
```

---

## Booster Perks

| Perk | Effect |
|------|--------|
| **Fast Workers** | +25% Sanctum generation speed |
| **Lucky Pulls** | +1% Legendary rate (2% → 3%) |
| **Loot Bonus** | +20% Shards from rifts |
| **Gear Hunter** | +10% gear drop rate from bosses |
| **⚡ Stormbringer** | Exclusive Legendary hero (Void element) |

Stormbringer is auto-granted while boosting, goes dormant if boost lapses.

---

## Commands

| Command | Description |
|---------|-------------|
| `/sanctum` | View town, manage jobs, collect resources |
| `/summon` | Spend 50 Shards for random hero |
| `/heroes` | View all owned heroes |
| `/assign <hero> <job>` | Put hero to work |
| `/rift` | Start a rift run (5 Energy) |
| `/gear` | View and manage gear |
| `/equip <hero> <gear>` | Equip gear to hero |
| `/leaderboard` | Top players by shards/rifts |

---

## Data Model

```typescript
interface Hero {
  id: string           // "spark", "ember", etc.
  gearId: string | null
}

interface Gear {
  id: string           // unique ID
  name: string
  tier: "common" | "rare" | "epic"
  power: number
}

interface Player {
  odiscordId: string
  shards: number

  // Sanctum
  energy: number
  maxEnergy: number      // base 20
  lastTick: number       // timestamp for resource calc
  jobs: {
    generator: string | null   // hero ID or null
    forge: string | null
    well: string | null
  }

  // Collection
  heroes: Hero[]
  gear: Gear[]

  // Stats
  riftsCompleted: number
  bossesKilled: number
}
```

---

## MVP Checklist

### Must Have
- [ ] Player data + JSON persistence
- [ ] `/sanctum` - view, collect, assign jobs
- [ ] `/summon` - gacha with 10 heroes
- [ ] `/heroes` - list owned
- [ ] `/assign` - put heroes to work
- [ ] `/rift` - 3 floors + boss, element combat
- [ ] 4 encounter types
- [ ] Gear drops from bosses
- [ ] `/gear` and `/equip`
- [ ] Booster perks (generation + loot bonus)
- [ ] Basic leaderboard

### Not in MVP
- Multiple heroes per rift
- Gear crafting
- Hero leveling
- PvP
- Co-op
- More than 10 heroes

---

## Dev Time Estimate

| Component | Hours |
|-----------|-------|
| Data model + persistence | 2 |
| Sanctum (jobs, resources) | 3 |
| Heroes + Summon | 2 |
| Rift system + combat | 5 |
| Gear system | 2 |
| Booster perks | 1 |
| Polish | 2 |
| **Total** | **~17 hours** |

Solid weekend project.

---

## Open Questions

1. **Job reassignment**: Free anytime, or cooldown?
   *(Rec: Free - don't punish experimentation)*

2. **Energy cap**: 20 enough? Should boosters get +5?
   *(Rec: 20 is fine, boosters get faster regen instead)*

3. **Gear inventory limit**: Cap at 10? 20? Unlimited?
   *(Rec: 10 for MVP - forces sell decisions)*

4. **Duplicate heroes**: Convert to shards directly, or "Scraps" currency?
   *(Rec: Shards directly - one fewer currency to track)*

---

## Future Iterations

**Phase 2**: Multi-hero rifts (bring 2-3), harder difficulties

**Phase 3**: Gear crafting with Scraps, gear elements

**Phase 4**: Hero leveling, awakening/evolution

**Phase 5**: Co-op rifts, trading, clan bonuses
