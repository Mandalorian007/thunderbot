# Sanctum Elements & Work Types

> Core elemental system for Storm Sanctum idle mechanics

## Elements (5 total)

| Element | Icon | Combat Identity | Strong vs | Weak vs |
|---------|------|-----------------|-----------|---------|
| **Fire** | 🔥 | Offense, Burn | Ice | Water |
| **Water** | 💧 | Support, Heal | Fire | Lightning |
| **Lightning** | ⚡ | Speed, Chain | Water | Earth |
| **Earth** | 🪨 | Defense, Tank | Lightning | Ice |
| **Ice** | ❄️ | Control, Slow | Earth | Fire |

```
Combat Pentagon:

        🔥 Fire
       ↙     ↖
    ❄️ Ice    💧 Water
      ↓         ↑
    🪨 Earth ← ⚡ Lightning

Fire > Ice > Earth > Lightning > Water > Fire
```

---

## Work Types (2 per element)

Each element has two work specializations. Heroes of that element can have either or both at varying levels.

### 🔥 Fire

| Work Type | Station | Description | Output |
|-----------|---------|-------------|--------|
| **Smithing** | Forge | Forge ore into ingots, ingots into gear | Ore → Ingots → Gear |
| **Cooking** | Hearth | Transform crops into food buffs | Crops → Food |

*Fire heroes are your forgemasters - they work the metal from raw ore to finished gear.*

---

### 💧 Water

| Work Type | Station | Description | Output |
|-----------|---------|-------------|--------|
| **Watering** | Well | Speed up crop growth at farms | Boosts Farming output |
| **Brewing** | Apothecary | Create potions and elixirs | Crops → Potions |

*Water heroes are your nurturers - they accelerate growth and enhance organic materials.*

---

### ⚡ Lightning

| Work Type | Station | Description | Output |
|-----------|---------|-------------|--------|
| **Charging** | Storm Spire | Generate power for stations | → Power |
| **Tempering** | Tempering Conduit | Infuse gear with elemental essences | Gear + Essences → Elemental Gear |

*Lightning heroes are your energizers - they power systems and enhance equipment.*

---

### 🪨 Earth

| Work Type | Station | Description | Output |
|-----------|---------|-------------|--------|
| **Mining** | Mine | Extract raw ore from the earth | → Ore |
| **Farming** | Farm | Till soil and plant crops | → Crops (base rate) |

*Earth heroes are your foundation - they extract resources and work the land.*

---

### ❄️ Ice

| Work Type | Station | Description | Output |
|-----------|---------|-------------|--------|
| **Preserving** | Frost Vault | Reduce resource decay, increase storage | Passive efficiency |
| **Condensing** | Condenser | Distill essences from refined materials | Ingots + Potions → Essences |

*Ice heroes are your optimizers - they reduce waste and distill pure essences for elemental gear.*

---

## Stations Summary

| Element | Station | Work Type | Requires Power |
|---------|---------|-----------|----------------|
| ⚡ Lightning | **Storm Spire** | Charging | No (generates power) |
| ⚡ Lightning | **Tempering Conduit** | Tempering | Yes |
| 🔥 Fire | **Forge** | Smithing | Yes |
| 🔥 Fire | **Hearth** | Cooking | Yes |
| 💧 Water | **Well** | Watering | Yes |
| 💧 Water | **Apothecary** | Brewing | Yes |
| 🪨 Earth | **Mine** | Mining | Yes |
| 🪨 Earth | **Farm** | Farming | Yes |
| ❄️ Ice | **Frost Vault** | Preserving | Yes |
| ❄️ Ice | **Condenser** | Condensing | Yes |

**Total: 10 stations** (1 generates power, 9 consume power)

---

## Power System

The **Storm Spire** generates Power. All other stations require Power to operate.

- No Power = stations are offline (no production)
- Power is consumed continuously while stations run
- Starter hero is **Lightning-based** so players can generate power immediately

```
⚡ Storm Spire → Power → All other stations
```

---

## Hero Work Suitability

Heroes have work suitability levels (1-3) for their element's work types:

```
Ember (🔥 Fire, Common)
├── Smelting: Lv.2
└── Cooking: Lv.1

Glacier (❄️ Ice, Rare)
├── Preserving: Lv.1
└── Refining: Lv.3

Titan (🪨 Earth, Epic)
├── Mining: Lv.3
└── Hauling: Lv.2
```

**Suitability affects output:**
- Lv.1 = 1.0x speed
- Lv.2 = 1.5x speed
- Lv.3 = 2.0x speed

**Rarity adds flat bonus:**
- Common: +0%
- Rare: +25%
- Epic: +50%
- Legendary: +100%

---

## Design Notes

### Why 2 work types per element?
- Creates hero variety within same element
- Gives reasons to collect multiple heroes of same element
- Some heroes specialize (high Lv in one), others generalize (medium in both)

### Why these specific pairings?
- **Fire**: Both involve heat transformation (ore → ingots, crops → food)
- **Water**: Both involve liquid nurturing (speed growth, brew potions)
- **Lightning**: Both involve energy application (power systems, enhance gear)
- **Earth**: Both involve physical labor (dig ore, till soil)
- **Ice**: Both involve slow/careful processes (preserve, distill)

### Key Synergies
- **Earth + Water**: Farming + Watering = faster crop production
- **Fire + Earth**: Smithing needs Ore from Mining
- **Fire + Earth**: Cooking needs Crops from Farming
- **Ice + Fire + Water**: Condensing needs Ingots (from Smithing) + Potions (from Brewing)
- **Lightning + Ice**: Tempering needs Gear (from Smithing) + Essences (from Condensing) = Elemental Gear

### Resource Flow
```
METAL PATH:
🪨 Mining → Ore → 🔥 Smithing → Ingots → 🔥 Smithing → Gear
                       │                                 ↓
                       │                       ⚡ Tempering (+Essences)
                       │                                 ↓
                       │                          Elemental Gear
                       ↓
ORGANIC PATH:        Ingots ────────────────────────────┐
🪨 Farming (+💧 Watering) → Crops ──┬──→ 🔥 Cooking → Food
                                    │
                                    └──→ 💧 Brewing → Potions
                                                        │
                                   Ingots + Potions → ❄️ Condensing → Essences
```

**Key insight**: Essences require BOTH production lines (metal + organic) to be running.
Fire heroes are essential - they run the entire metal path from ore to gear.
