# MEGACORP

An idle/incremental business simulation game set in a sci-fi universe. Build a mega-corporation spanning multiple technological civilizations on the Kardashev scale — from solar panels to Big Bang Echo Harvesters.

![MEGACORP Screenshot](../megacorp-screenshot.png)

## Tech Stack

- **Frontend:** Nuxt 4, Vue 3, TypeScript, Tailwind CSS, Nuxt UI
- **Backend:** Nuxt server routes with SQLite via Drizzle ORM
- **Database:** SQLite with NuxtHub
- **Libraries:** @vueuse/nuxt, @nuxt/image, nuxt-toast

## Setup

```bash
bun install
```

### Development

```bash
bun run dev
```

### Production

```bash
bun run build
bun run preview
```

### Testing

```bash
bun run test          # Run all tests
bun run test:unit     # Unit tests only
bun run test:nuxt     # Nuxt integration tests
```

---

## Game Features

### Setup Wizard

![Setup Wizard](../megacorp-setup-wizard.png)

New players complete a multi-step wizard to:

- Name their corporation (max 30 characters)
- Write an optional mission statement (max 120 characters)
- Select exactly 3 corporate traits (each with a bonus and a malus)
- Receive a unique Account ID for save restoration

### Core Resources

The game revolves around three currencies:

| Currency | Symbol | Purpose |
|----------|--------|---------|
| **Credits** | ₢ | Main currency — buy buildings, stocks, gamble |
| **Energy** | TW/s | Drives Kardashev level progression |
| **Influence** | ★ | Prestige currency spent on permanent upgrades |

---

### Empire Tab (Main Gameplay)

![Empire Tab](../megacorp-3col-layout.png)

#### Click System

- Click (or press Space) to earn credits manually
- Base click power starts at 1, scales with upgrades, traits, prestige, and ascension perks
- **Pop boost:** Click power is multiplied by `(1 + autoclicks/sec)` from pop buildings

#### Click Upgrades

![Click Upgrades](../megacorp-click-upgrades.png)

6 one-time purchasable upgrades that increase base click power from 1 up to 50,000.

#### Building System

![Buy Multiplier](../megacorp-buy-multiplier.png)

70 buildings across 5 Kardashev tiers (Type 0 through Type V), in three categories:

- **Credits buildings** — Generate passive credits/sec (Mining Drone → Omega Corp)
- **Energy buildings** — Generate energy/sec (Solar Array → Big Bang Echo Harvester)
- **Pop buildings** — Generate auto-clicks/sec (Corporate Drone → Galactic Viceroy)

Each building has a base cost that scales by 1.12–1.15x per unit owned. Buildings unlock as you reach higher Kardashev levels.

#### Kardashev Scale

Civilization level based on total energy output:

| Level | Threshold |
|-------|-----------|
| Type 0 | 0 TW/s |
| Type I | 10,000 TW/s |
| Type II | 10^14 TW/s |
| Type III | 10^24 TW/s |
| Type IV | 10^34 TW/s |
| Type V | 10^44 TW/s |

Reaching new levels unlocks higher-tier buildings and ascension perks.

#### Civilization Scene

![Civilization Scene](../megacorp-civ-scene.png)

An animated canvas visualization of your growing civilization in the click area.

---

### Prestige Tab (Corporate Restructuring)

![Prestige Tab](../megacorp-prestige-tab.png)

#### How Prestige Works

- Earn Influence (★) based on `sqrt(totalEnergyEarned / 10,000)`
- **Resets:** Credits, energy, buildings, click upgrades, total earned stats
- **Keeps:** Influence, prestige count, traits, prestige upgrades, ascension perks, achievements

#### Prestige Shop (6 one-time upgrades)

| Upgrade | Effect |
|---------|--------|
| Efficient Management | +50% credits/sec |
| Advanced Reactors | +50% energy/sec |
| Power Clicks | 2x click power |
| Quick Start | Spawn 5 Mining Drones + 5 Solar Arrays on reset |
| Deep Space Network | Unlock Type IV buildings immediately |
| Cosmic Insight | Unlock Type V buildings immediately |

#### Repeatable Upgrades (6 types, up to 50 levels each)

| Upgrade | Effect per Level |
|---------|-----------------|
| Profit Margins | +20% credits/sec |
| Reactor Efficiency | +20% energy/sec |
| Click Amplifier | +25% click power |
| Workforce Training | +20% pop output |
| Bulk Purchasing | -10% building costs |
| Casino VIP | +15% casino winnings |

#### Ascension Perks

One perk claimable per Kardashev level reached. Choice of 3 options per level, permanent and irreversible. Examples include +25% credits, -50% building costs, or +1000% energy at higher tiers.

---

### Stock Market Tab

![Stock Market](../megacorp-market.png)

- **12 companies** with prices ranging from ₢50 to ₢20M
- Prices fluctuate every ~1 second based on volatility
- Price range clamped to 0.3x–3x base price
- **100 shares per company** — buy and sell at current market price
- **Dividends:** Owning 100% of a company (all 100 shares) generates passive credits/sec
- Sparkline price charts show recent price history

![Market 2-Column Layout](../megacorp-market-2col.png)

---

### Casino Tab

![Casino](../megacorp-casino-fixed.png)

Three gambling games (disabled if "Risk Averse" trait is selected):

| Game | Mechanic | Payout |
|------|----------|--------|
| **Coin Flip** | Pick heads or tails | 1.9x on correct guess |
| **Slot Machine** | 3 reels with pattern matching | Variable payouts |
| **Crash** | Multiplier climbs from 1.0x, cash out before it crashes | Whatever multiplier you cash out at |

Casino winnings are boosted by the High Rollers trait (+20%), Casino VIP repeatable (+15%/level), and ascension perks.

---

### Profile Tab

![Profile](../megacorp-profile.png)

- Company name, description, and selected traits
- Account ID (copy to clipboard for backup/restoration)
- Game statistics and achievement grid

#### Achievements

25 achievements across categories:

- **Clicks:** First click, 100 clicks, 10,000 clicks
- **Credits:** 10K, 1M, 1B, 1T earned
- **Energy:** 10K TW/s, 1M TW/s
- **Kardashev:** Reach Type I, II, III
- **Prestige:** First prestige, 5 prestiges
- **Casino:** Win 100K+ in one game, play 100+ games
- **Market:** Fully acquire a company, reach 1M portfolio value
- **Buildings:** Own 100+ of any building, own all Type 0 buildings

---

### Corporate Traits

Selected at setup (immutable). Each trait has a bonus and a malus:

| Trait | Bonus | Malus |
|-------|-------|-------|
| Ruthless Exploiters | +25% Credits/sec | -15% Energy/sec |
| Green Energy | +25% Energy/sec | -15% Credits/sec |
| Worker Drones | +30% Pop output | -20% Click power |
| Hands-On CEO | +50% Click power | -20% Pop output |
| High Rollers | +20% Casino winnings | -10% Credits/sec |
| Risk Averse | +15% Credits/sec | Casino disabled |
| Rapid Expansion | -15% Building costs | -10% Energy/sec |
| Research Focus | +30% Energy/sec | -20% Pop output |

---

### Multiplier Stacking

All production multipliers stack **multiplicatively**:

- **Credits/sec:** `base × prestige × trait × ascension × repeatable`
- **Energy/sec:** `base × prestige × trait × ascension × repeatable`
- **Click power:** `(base × prestige × trait × ascension × repeatable) × (1 + autoclicks/sec)`
- **Building cost:** `baseCost × 1.12^qty × trait × ascension × repeatable`

---

### Offline Earnings

- On game load, calculates time elapsed since last save
- Auto-generates credits and energy for up to 24 hours of offline time
- Shows a summary modal before entering the game

### Auto-Save

- Game state auto-saves every 30 seconds
- Additional debounced saves on purchases
- Uses `sendBeacon` API as fallback on page unload

---

## Server API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/game/save` | POST | Saves game state (JSON) keyed by player ID cookie |
| `/api/game/load` | GET | Loads game state by player ID cookie |

No authentication — uses a UUID v4 cookie (`megacorp-player-id`, 365-day expiry) for save identification.

---

## Project Structure

```
app/
  pages/
    index.vue                    # Main game page with tabbed UI
  components/
    game/                        # Empire tab (click area, buildings, stats)
    casino/                      # Casino games (coin flip, slots, crash)
    market/                      # Stock exchange (cards, sparklines)
    setup/                       # Setup wizard
  composables/
    useGameState.ts              # Core state + computed multipliers
    useGameActions.ts            # Click, buy, prestige actions
    useGameConfig.ts             # Building/upgrade definitions
    useGamePersistence.ts        # Save/load, auto-save, offline calc
    useStockMarket.ts            # Stock price simulation, trading
    useCasino.ts                 # Casino logic, winnings multiplier
    useAchievements.ts           # Achievement definitions + checking
    useAscensionPerks.ts         # Ascension perk system
    useTraits.ts                 # Trait definitions
    useMultiplierBreakdown.ts    # Multiplier decomposition for UI
    useNumberFormat.ts           # Large number abbreviation
  types/
    game.ts                      # TypeScript interfaces
server/
  api/game/
    load.get.ts                  # Load game state endpoint
    save.post.ts                 # Save game state endpoint
  db/
    schema.ts                    # Drizzle ORM schema (game_saves table)
    migrations/                  # SQLite migrations
```
