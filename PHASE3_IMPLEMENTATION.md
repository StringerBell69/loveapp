# Phase 3 Implementation Guide - Planning & Projets 💕

## ✅ Completed (Foundation)

### Database Schema
- ✅ Created `bucket_list_items` table with status (todo/in_progress/done)
- ✅ Created `wishlist_items` table with secret purchase tracking
- ✅ Created `rituals` table with frequency configurations
- ✅ Created `ritual_completions` table for tracking streak
- ✅ Added all necessary enums and constraints

### RLS Policies
- ✅ Row Level Security enabled on all new tables
- ✅ Couple-based access control
- ✅ Secret purchase policy (partner can't see who bought)
- ✅ Created `calculate_ritual_streak()` function
- ✅ Created trigger `update_ritual_streak()` for auto-calculation
- ✅ Triggers for `updated_at` columns

### Custom Hooks
- ✅ `useBucketList.ts` - Full CRUD + statistics
- ✅ `useWishlist.ts` - Separate my/partner items + purchase toggle
- ✅ `useRituals.ts` - CRUD + completion tracking

### Dependencies
- ✅ Installed `canvas-confetti` for celebrations

## 🚧 Next Steps - Components & Pages

### 1. Bucket List Components

Create in `components/bucket-list/`:

**BucketListCard.tsx** - Essential props:
```typescript
{
  item: BucketListItem
  onToggleComplete: (id) => void
  onEdit: (id) => void
  onDelete: (id) => void
}
```
Features:
- Left border colored by category
- Checkbox for completion (with confetti animation)
- Category badge with emoji
- Progress bar if status = "in_progress"
- Priority stars (1-3)
- Swipe actions

**BucketListForm.tsx** - Create/Edit form:
- Title input
- Description textarea
- Category selector (6 colored pills)
- Priority (1-3 stars)
- Estimated cost (€/€€/€€€)
- Status (if editing)
- Progress slider (if in_progress)

**CompletionModal.tsx** - Celebration modal:
- Confetti animation on open
- Date picker (default today)
- Photo upload (optional, use ImageUploader from memories)
- Completion note textarea
- "Célébrer" button

**BucketListStats.tsx** - Statistics card:
- "X/Y rêves réalisés"
- Progress bar
- Percentage

### 2. Wishlist Components

Create in `components/wishlist/`:

**WishlistTabs.tsx** - Switch between wishlists:
```typescript
<Tabs>
  <TabsList>
    <TabsTrigger value="mine">Ma wishlist</TabsTrigger>
    <TabsTrigger value="partner">{partner.name}</TabsTrigger>
  </TabsList>
</Tabs>
```

**WishlistCard.tsx** - Essential props:
```typescript
{
  item: WishlistItem
  isOwnWishlist: boolean
  currentUserId: string
  onMarkPurchased?: (id, purchased) => void
}
```
Features:
- Product photo (80x80px) or gift icon
- Title, price, priority stars
- Product link (external icon)
- If own wishlist: Edit/Delete menu
- If partner wishlist: Gift button to mark purchased
- Secret badge "Acheté ✓" (only visible to purchaser)

**WishlistForm.tsx** - Create/Edit form:
- Photo upload (optional, like memories)
- Title input
- Description textarea
- Price input (decimal) OR price range buttons (€/€€/€€€)
- Product link input (URL validation)
- Priority stars (1-3)
- Category selector

### 3. Rituals Components

Create in `components/rituals/`:

**RitualCard.tsx** - Essential props:
```typescript
{
  ritual: Ritual
  isCompletedToday: boolean
  onToggle: (id, done) => void
}
```
Features:
- Large emoji icon
- Frequency label (e.g., "Tous les vendredis")
- Last done + streak badge (🔥 X fois)
- Toggle switch "Fait aujourd'hui"
- Border colors: green (done), orange (overdue), gray (pending)
- Confetti on toggle

**RitualForm.tsx** - Create/Edit form:
- Title input
- Description textarea
- Emoji picker (grid of common emojis)
- **Frequency selector (IMPORTANT)**:
  ```typescript
  type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

  // Config examples:
  daily: { days: [0,1,2,3,4,5,6] } // All days
  weekly: { dayOfWeek: 5 } // Every Friday
  monthly: { dayOfMonth: 15 } // 15th of each month
  yearly: { month: 2, day: 14 } // Feb 14
  custom: { intervalDays: 3 } // Every 3 days
  ```
- Reminder toggle + time picker
- Reminder "X before" selector (30min/1h/2h/1 day)

**RitualStats.tsx** - Statistics display:
- "Réalisé X fois au total"
- "Dernier: [date]"
- "Streak actuel: X 🔥"
- "Plus long streak: Y"

**RitualHistory.tsx** - Scrollable completions list:
- Last 10 completions
- Date + completed by (avatar)
- Note if provided

### 4. Pages Structure

```
app/(app)/
├── bucket-list/
│   ├── page.tsx              # List view with tabs (todo/in_progress/done)
│   ├── new/page.tsx          # Create form
│   └── [id]/
│       ├── page.tsx          # Details view
│       └── edit/page.tsx     # Edit form
│
├── wishlist/
│   ├── page.tsx              # Tabs: My wishlist / Partner's wishlist
│   ├── new/page.tsx          # Create form
│   └── [id]/
│       ├── page.tsx          # Details view
│       └── edit/page.tsx     # Edit form
│
└── rituals/
    ├── page.tsx              # List view with filters
    ├── new/page.tsx          # Create form
    └── [id]/
        ├── page.tsx          # Details with stats + history
        └── edit/page.tsx     # Edit form
```

### 5. Dashboard Updates

Create in `components/dashboard/`:

**DailyRitualCard.tsx**:
```typescript
// Shows ritual(s) due today
// Quick toggle to mark as done
// Confetti animation on completion
```

**NextDreamCard.tsx**:
```typescript
// Shows next bucket list item with status = 'todo'
// Or item with status = 'in_progress' + progress bar
// Tap to go to /bucket-list
```

Update `app/(app)/page.tsx`:
```typescript
import { DailyRitualCard } from "@/components/dashboard/DailyRitualCard"
import { NextDreamCard } from "@/components/dashboard/NextDreamCard"

// Add after UpcomingEvents:
<motion.div variants={staggerItem}>
  <DailyRitualCard />
</motion.div>

<motion.div variants={staggerItem}>
  <NextDreamCard />
</motion.div>
```

### 6. BottomNav Update

Update `components/layout/BottomNav.tsx`:

```typescript
import { Sparkles } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Add 5th icon in navItems (or replace one):
const navItems = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/calendar", icon: Calendar, label: "Calendrier" },
  { href: "/messages", icon: Heart, label: "Messages" },
  { icon: Sparkles, label: "Projets", isSheet: true }, // Special
  { href: "/settings", icon: Settings, label: "Paramètres" },
]

// Render Sheet for Projects:
{item.isSheet ? (
  <Sheet>
    <SheetTrigger>
      <Icon className="w-6 h-6" />
    </SheetTrigger>
    <SheetContent side="bottom">
      <div className="space-y-4 p-4">
        <h2 className="text-xl font-bold">Nos Projets 💕</h2>

        <Link href="/bucket-list">
          <Card className="p-4 hover:bg-muted">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✨</span>
              <div>
                <h3 className="font-semibold">Bucket List</h3>
                <p className="text-sm text-muted-foreground">
                  Nos rêves ensemble
                </p>
              </div>
            </div>
          </Card>
        </Link>

        {/* Similar cards for Wishlist and Rituals */}
      </div>
    </SheetContent>
  </Sheet>
) : (
  // Normal link
)}
```

## 🎨 Design Guidelines

### Category Colors (Bucket List)
```typescript
const categoryColors = {
  travel: { border: 'border-blue-400', bg: 'bg-blue-100', emoji: '🌍' },
  restaurant: { border: 'border-orange-400', bg: 'bg-orange-100', emoji: '🍽️' },
  activity: { border: 'border-purple-400', bg: 'bg-purple-100', emoji: '🎬' },
  experience: { border: 'border-pink-400', bg: 'bg-pink-100', emoji: '💝' },
  home: { border: 'border-green-400', bg: 'bg-green-100', emoji: '🏠' },
  other: { border: 'border-lavender', bg: 'bg-lavender/20', emoji: '✨' },
}
```

### Wishlist Category Colors
```typescript
const wishlistCategories = {
  tech: { emoji: '📱', color: 'blue' },
  fashion: { emoji: '👗', color: 'pink' },
  books: { emoji: '📚', color: 'purple' },
  hobbies: { emoji: '🎮', color: 'orange' },
  home: { emoji: '🏠', color: 'green' },
  other: { emoji: '✨', color: 'lavender' },
}
```

### Ritual Emoji Suggestions
Common emojis: 🍕 ☕ 🌙 💬 🎬 📚 🏃 🧘 🍷 🎮 🌹 💝 🕯️ 🎵

## 🎆 Confetti Usage

```typescript
import confetti from 'canvas-confetti'

// On bucket list completion:
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#FFB3BA', '#FF6B9D', '#C7CEEA'],
})

// On ritual completion (lighter):
confetti({
  particleCount: 30,
  spread: 40,
  origin: { y: 0.8 },
})
```

## ⚙️ Frequency Config Examples

```typescript
// Daily - every day
{
  frequencyType: 'daily',
  frequencyConfig: { days: [0,1,2,3,4,5,6] } // All days
}

// Daily - only weekdays
{
  frequencyType: 'daily',
  frequencyConfig: { days: [1,2,3,4,5] } // Mon-Fri
}

// Weekly - every Friday
{
  frequencyType: 'weekly',
  frequencyConfig: { dayOfWeek: 5, time: "19:00" }
}

// Monthly - 15th of each month
{
  frequencyType: 'monthly',
  frequencyConfig: { dayOfMonth: 15 }
}

// Yearly - February 14
{
  frequencyType: 'yearly',
  frequencyConfig: { month: 2, day: 14 }
}

// Custom - every 3 days
{
  frequencyType: 'custom',
  frequencyConfig: { intervalDays: 3 }
}
```

## 🧪 Testing Checklist

After implementation:

### Bucket List
- [ ] Create new dream
- [ ] Mark as "En cours" + set progress
- [ ] Complete dream with photo + note
- [ ] View statistics
- [ ] Filter by category
- [ ] Delete dream

### Wishlist
- [ ] Add item to my wishlist
- [ ] View partner's wishlist
- [ ] Mark partner's item as "purchased" (SECRET)
- [ ] Verify partner can't see purchase status
- [ ] Upload product photo
- [ ] Add product link (clickable)

### Rituals
- [ ] Create daily ritual
- [ ] Create weekly ritual
- [ ] Mark ritual as done today
- [ ] Verify can't mark same ritual twice today
- [ ] View streak calculation
- [ ] Verify streak breaks when missed
- [ ] View completion history

### Dashboard
- [ ] Daily ritual card shows correct rituals
- [ ] Next dream card shows first "todo" or "in_progress"
- [ ] Quick actions work

### Navigation
- [ ] Projects sheet opens
- [ ] All 3 sections accessible
- [ ] Sheet closes after navigation

## 🚀 Deployment Steps

1. **Push schema to database**:
   ```bash
   bun db:push
   ```

2. **Apply RLS policies** in Supabase SQL Editor:
   - Copy all content from `lib/db/rls-policies.sql`
   - Run in SQL Editor
   - Verify all tables have RLS enabled
   - Test policies work correctly

3. **Test locally**:
   - Create test data for each section
   - Verify all CRUD operations
   - Test confetti animations
   - Test secret purchase feature

4. **Deploy to production**:
   - Build: `npm run build`
   - Deploy to Vercel/hosting
   - Verify environment variables
   - Test in production

## 📚 Resources

- [Canvas Confetti Docs](https://www.npmjs.com/package/canvas-confetti)
- [Shadcn/ui Sheet](https://ui.shadcn.com/docs/components/sheet)
- [Framer Motion](https://www.framer.com/motion/)
- [Date-fns](https://date-fns.org/)

---

**Good luck with Phase 3! 💕✨**

The foundation is solid - now build the UI to bring it to life!
