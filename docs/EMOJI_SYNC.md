# Hero Asset Pipeline

> Generate, store, and deploy hero assets to Convex + Discord

## Overview

Heroes have two visual assets:
1. **Portrait** - Full art stored in Convex (for embeds)
2. **Emoji** - 128x128 icon deployed to Discord (for inline text)

Both are organized by **hero slug** - a URL-safe identifier derived from the hero name.

```
[Generate Art] → [Process Assets] → [Deploy to Convex + Discord] → [Link in Hero Config]
```

---

## Directory Structure

```
thunder-bot/
├── assets/
│   └── heroes/
│       ├── spark/
│       │   ├── portrait.png    # Full art → Convex
│       │   └── emoji.png       # 128x128 → Discord
│       ├── ember/
│       │   ├── portrait.png
│       │   └── emoji.png
│       └── nyx/
│           ├── portrait.png
│           └── emoji.png
├── src/
│   ├── deploy-commands.ts
│   ├── deploy-heroes.ts        # Upload portraits + emojis
│   └── config/
│       └── heroes.ts           # Hero definitions with slugs
└── docs/
    └── EMOJI_SYNC.md
```

---

## Hero Slug Convention

The slug is the canonical identifier used everywhere:

| Hero Name | Slug | Asset Path | Discord Emoji |
|-----------|------|------------|---------------|
| Spark | `spark` | `assets/heroes/spark/` | `:hero_spark:` |
| Ember | `ember` | `assets/heroes/ember/` | `:hero_ember:` |
| Nyx | `nyx` | `assets/heroes/nyx/` | `:hero_nyx:` |

**Slug rules:**
- Lowercase
- Alphanumeric + hyphens only
- Derived from name: `"Flame Knight"` → `flame-knight`

**Discord emoji naming:**
- Prefix with `hero_` to namespace
- Replace hyphens with underscores (Discord requirement)
- `flame-knight` → `:hero_flame_knight:`

---

## Hero Config

```typescript
// src/config/heroes.ts

export interface HeroDefinition {
  slug: string;           // "spark" - canonical ID
  name: string;           // "Spark" - display name
  element: Element;
  rarity: Rarity;
  ability: string;
  abilityDescription: string;
}

// Static hero definitions
export const HEROES: HeroDefinition[] = [
  {
    slug: 'spark',
    name: 'Spark',
    element: 'lightning',
    rarity: 'common',
    ability: 'Quick Strike',
    abilityDescription: 'Attack first',
  },
  {
    slug: 'nyx',
    name: 'Nyx',
    element: 'void',
    rarity: 'legendary',
    ability: 'Drain',
    abilityDescription: 'Damage + heal',
  },
  // ...
];

// Runtime asset URLs (populated after deploy or from DB)
export interface HeroAssets {
  slug: string;
  portraitUrl: string;    // Convex file URL
  emojiId: string;        // Discord emoji ID "1234567890"
  emojiFormatted: string; // "<:hero_spark:1234567890>"
}
```

---

## Environment Variables

```env
# Discord server for hosting emojis (can be different from game server)
DISCORD_EMOJI_GUILD_ID=1234567890

# Convex
CONVEX_URL=https://your-project.convex.cloud
```

**Why separate emoji server?**
- Emoji limits (50 per server)
- Can use a dedicated "asset server" for emojis
- Bot can access emojis from any server it's in
- Game servers don't burn their emoji slots

---

## Asset Generation Workflow

### 1. Generate Hero Art

```bash
cd .claude/skills/image-gen/image_gen_cli/

# Generate full portrait
uv run img generate "Spark, lightning mage hero, Final Fantasy style, vibrant yellow electricity, full body, transparent background" \
  -q high \
  -b transparent \
  -o ../../assets/heroes/spark/portrait.png
```

### 2. Create Emoji Version

```bash
# Emojify the portrait (or generate a separate icon)
uv run img emojify assets/heroes/spark/portrait.png \
  -o assets/heroes/spark/emoji.png
```

### 3. Deploy Assets

```bash
pnpm run deploy-heroes   # Uploads only what's missing
```

Run it anytime. It's idempotent - skips existing assets automatically.

---

## Deploy Script Design

### `src/deploy-heroes.ts`

Smart conventions - no flags needed:

```typescript
import { ConvexHttpClient } from 'convex/browser';
import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { HEROES } from './config/heroes';

const ASSETS_DIR = './assets/heroes';
const EMOJI_PREFIX = 'hero_';

async function deployHeroes() {
  const convex = new ConvexHttpClient(process.env.CONVEX_URL!);
  const discord = new Client({ intents: [GatewayIntentBits.Guilds] });
  await discord.login(process.env.DISCORD_TOKEN);

  const emojiGuild = await discord.guilds.fetch(process.env.DISCORD_EMOJI_GUILD_ID!);
  const existingEmojis = await emojiGuild.emojis.fetch();
  const existingAssets = await convex.query('heroAssets:list');

  for (const hero of HEROES) {
    const heroDir = path.join(ASSETS_DIR, hero.slug);
    const portraitPath = path.join(heroDir, 'portrait.png');
    const emojiPath = path.join(heroDir, 'emoji.png');

    const emojiName = `${EMOJI_PREFIX}${hero.slug.replace(/-/g, '_')}`;
    const hasEmoji = existingEmojis.some(e => e.name === emojiName);
    const hasPortrait = existingAssets.some(a => a.slug === hero.slug);

    // Skip if both exist
    if (hasEmoji && hasPortrait) {
      console.log(`⏭️  ${hero.slug} (exists)`);
      continue;
    }

    // Upload portrait to Convex if missing
    if (!hasPortrait && fs.existsSync(portraitPath)) {
      const uploadUrl = await convex.mutation('files:generateUploadUrl');
      const file = fs.readFileSync(portraitPath);
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'image/png' },
        body: file,
      });
      const { storageId } = await response.json();

      // Store reference in DB
      await convex.mutation('heroAssets:create', {
        slug: hero.slug,
        portraitStorageId: storageId,
      });
      console.log(`📤 Portrait: ${hero.slug}`);
    }

    // Upload emoji to Discord if missing
    if (!hasEmoji && fs.existsSync(emojiPath)) {
      const emoji = await emojiGuild.emojis.create({
        attachment: emojiPath,
        name: emojiName,
      });

      // Update DB with emoji ID
      await convex.mutation('heroAssets:setEmojiId', {
        slug: hero.slug,
        emojiId: emoji.id,
      });
      console.log(`✅ Emoji: :${emojiName}:`);
    }
  }

  await discord.destroy();
  console.log('Done.');
}
```

---

## Using Assets in Bot

```typescript
import { HEROES } from './config/heroes';
import { getHeroAssets } from './convex/heroes';  // From Convex

// Fetch hero with assets
const hero = HEROES.find(h => h.slug === 'spark');
const assets = await getHeroAssets('spark');

// Rich embed with portrait
const embed = new EmbedBuilder()
  .setTitle(`${assets.emojiFormatted} ${hero.name}`)
  .setThumbnail(assets.portraitUrl)
  .addFields(
    { name: 'Element', value: `${EMOJIS.ELEMENT_LIGHTNING} Lightning`, inline: true },
    { name: 'Rarity', value: '⭐ Common', inline: true },
  )
  .setDescription(`**${hero.ability}** - ${hero.abilityDescription}`);

// Inline text with emoji
await channel.send(`You summoned ${assets.emojiFormatted} **${hero.name}**!`);
```

---

## Convex Schema (Example)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  heroAssets: defineTable({
    slug: v.string(),
    portraitStorageId: v.id('_storage'),
    emojiId: v.string(),
  }).index('by_slug', ['slug']),
});
```

```typescript
// convex/heroes.ts
import { query } from './_generated/server';
import { v } from 'convex/values';

export const getAssets = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const assets = await ctx.db
      .query('heroAssets')
      .withIndex('by_slug', q => q.eq('slug', slug))
      .first();

    if (!assets) return null;

    const portraitUrl = await ctx.storage.getUrl(assets.portraitStorageId);
    return {
      slug,
      portraitUrl,
      emojiId: assets.emojiId,
      emojiFormatted: `<:hero_${slug.replace(/-/g, '_')}:${assets.emojiId}>`,
    };
  },
});
```

---

## Discord Limits

| Limit | Value |
|-------|-------|
| Emojis per server | 50 static (base), up to 250 with boosts |
| Emoji file size | 256KB max |
| Emoji dimensions | 128x128 recommended |
| Emoji name | 2-32 chars, alphanumeric + underscores |

**With 10 MVP heroes + ~10 UI icons = 20 emojis**, well under the limit.

---

## Checklist

### Setup
- [ ] Create `assets/heroes/` directory structure
- [ ] Add `DISCORD_EMOJI_GUILD_ID` to `.env`
- [ ] Set up Convex project with file storage

### Per Hero
- [ ] Generate portrait with image-gen skill
- [ ] Create emoji version (emojify or separate generation)
- [ ] Add hero definition to `src/config/heroes.ts`
- [ ] Run `pnpm run deploy-heroes --hero <slug>`

### Bot Integration
- [ ] Create Convex schema for hero assets
- [ ] Build helper to fetch hero with assets
- [ ] Use in embeds and messages
