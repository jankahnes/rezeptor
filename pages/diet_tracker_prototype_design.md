# Diet / Macro Tracking — Prototype Design

**Overview & goal**

Create a simple, delightful prototype page where a user can add any foods (typed, scanned, requested, or from a recipe) into _meals_ and see the nutrition totals for the day. No history/backend required for prototype — all UI/UX and local state only. Use the app's existing parsing input, calculate/nutrition endpoint, barcode scan, request-food, recipes data, and recipe_foods join table.

---

## 🎉 IMPLEMENTATION STATUS

### ✅ COMPLETED (MVP Features)

**Core Input & Parsing**

- ✅ Typed ingredient input with live parsing (reusing existing parser)
- ✅ Food Row component (`TrackingInput.vue`) with edit/preview states
- ✅ Parsed preview rendering (amount, unit, food name, extra styling)
- ✅ Focus/blur toggling between edit and preview
- ✅ Enter key commits and creates new row below
- ✅ Keyboard-first navigation (focus next input across meals)

**Meal Structure**

- ✅ Meal cards with collapsible headers
- ✅ Meal presets (Breakfast, Lunch, Dinner, Snack, Dessert)
- ✅ Custom meal names (editable inline)
- ✅ Add/remove meals
- ✅ Delete individual ingredients
- ✅ Auto-add empty input row to each meal

**Recipes Integration**

- ✅ "Add Meal from Recipe" modal with search
- ✅ Recipe search with live autocomplete
- ✅ Clicking recipe adds meal with all ingredients pre-filled
- ✅ Recipe meals visually distinguished (tinted background + badge)
- ✅ Link to jump to original recipe page

**Barcode Scanning**

- ✅ Extracted `BarcodeScanner.vue` component (modal, not redirect)
- ✅ Per-input scan button (focus-anchored)
- ✅ Native BarcodeDetector + Quagga fallback
- ✅ Torch/flashlight toggle
- ✅ Product not found → completion modal flow
- ✅ `[barcode]` marker in rawText for stable re-parsing
- ✅ `BrandedFoodCompletionModal` with 2-step flow:
  - Step 1: Basic info (name, brand)
  - Step 2: Nutrition (manual or photo OCR)
- ✅ Photo capture → GPT-4 Vision nutrition extraction
- ✅ Background matching to generic food after completion
- ✅ Visual states: needs_basic_info, needs_nutrition, matching, complete, error
- ✅ Locked input during processing

**Request Food**

- ✅ Text selection → popup button "Request [text]"
- ✅ Snappy animation (spring scale-in)
- ✅ Calls `/api/db/request-food` endpoint
- ✅ Shows loading spinner in parsed preview during request
- ✅ Auto-hides on click outside / Escape key

**Nutrition Display**

- ✅ Daily nutrition totals (live debounced computation)
- ✅ Reuses existing `NutritionLabel` and `HealthFacts` components
- ✅ Auto-updates on any ingredient change (1s debounce)

**UX Polish**

- ✅ Mobile-first responsive design
- ✅ Placeholder text with random examples
- ✅ Ensures one empty input per meal at all times
- ✅ Locked state during async operations (scan, request)
- ✅ Random placeholder suggestions per input

---

### 🚧 NOT YET IMPLEMENTED (Future Enhancements)

---

## Assumptions

- You already have: typed parsed input (`{amount, unit, food: FoodFromDB, extra}`), nutrition calculation endpoint, barcode scanner, request-food endpoint, recipes table + join table.
- Prototype is single-day, single-user, no persistence.
- Target devices: mobile-first but responsive to desktop.

---

## Core UX principles

1. **Minimal friction for input** — make typed input remain the default path; everything else should augment it, not replace it.
2. **Contextual actions** — only show the extra actions (scan / request / recipe-search) when the user focuses an input or explicitly opens a meal action. This avoids visual clutter.
3. **Immediate feedback** — computed nutrition updates live, debounced; show partial/estimated states while waiting for compute.
4. **Reversible edits** — allow undo for recent changes and easy reset to recipe defaults.
5. **Predictability + discoverability** — expose quick presets and keyboard shortcuts, surface hidden features gently with microcopy and first-time tooltips.

---

## Page structure (high level)

1. **Top bar**

   - Date selector (default today) + daily macro target summary (calories, protein, carbs, fat) and +/- quick toggles.
   - Quick-add FAB (mobile) / button (desktop): `+ Add food` (opens global add modal). This is the global entry point if user doesn't want to add into a meal.

2. **Meals list** (main column)

   - Horizontally stacked or vertically listed meals for the day. Each meal is a card with header and collapsible body.
   - Default meal presets: Breakfast, Lunch, Dinner, Snack. Each has a small preset button in the `+ Add meal` menu.
   - Option: single-food area at the bottom for loose items not assigned to a meal.

3. **Right rail** (desktop) / bottom sheet (mobile)
   - Live NutritionLabel component (daily totals) — auto-updating debounced.
   - Quick summary: calories consumed / target, progress bars for macros.

---

## Meal card (detailed)

**Header**

- Meal name (editable inline). Show preset tag if created from preset.
- Actions: `Add food` (spawns an input row), `Add from recipe`, `Duplicate meal`, `Remove meal`.
- Totals for that meal (calories / prot / carbs / fat) in small text.

**Body (collapsible)**

- List of food rows (see Food Row component below). Collapsed view shows meal totals + 1-line preview (e.g. `2 items • 560 kcal`).
- When expanded, show full editable rows and an `Add food` input at the bottom.
- For recipe-meal: visually distinguish with a subtle border or different background color and a small `Recipe` badge.

---

## Food Row (core building block)

A Food Row represents one line item: e.g. `50 g Chicken Breast` or `1 Banana`.

**Layout (single-line by default, stacked on mobile)**

- Left: optional thumbnail (from FoodFromDB or product photo).
- Center: parsed preview area with two states:
  1. **Editing** — text input that accepts free text and parses on the fly as your existing `/recipe/new` input does.
  2. **Preview** — parsed rendering: amount, unit, food name (linked), extra. Use varied background / font weights as you already do.
- Right: small action cluster shown only on focus/hover: tiny icons for `scan`, `request`, `recipes`, and `delete`. Keep them compact.
- Under the row or in a hover tooltip: small nutrition mini-line for that row.

**Behavior**

- Typing: parse on the fly, show suggestion dropdown (if ambiguous) with top matches from Foods DB and recipes.
- On blur: convert input to parsed preview representation (as you described), but keep raw text if user focuses again.
- Focus: show contextual actions.
- Pressing Enter while focused: commit row and add a new blank row below.

**Action placement**

- Use a small action popover anchored to the right edge of the input (or inside the input as trailing icons) that appears **only while the input is focused**. This keeps the UI clean and avoids multiple persistent scan icons.
- The popover contains: `Scan barcode`, `Request food`, `Search recipes` and `More (duplicate/notes)`.

_Rationale:_ Hidden until focus keeps screen clean and makes user discoverable via keyboard and first-run hints.

---

## Scanning interaction

Options considered:

- Per-row persistent scan button (too cluttered). ❌
- Single global scanner button that always opens camera and returns a new row appended at the end. ✅
- Focus-anchored scan button inside the row input (small icon shown only on focus), which opens scanner and then inserts the scanned product into the _focused_ input. ✅ (recommended as default)

**Recommended approach (hybrid)**

1. **Focus-anchored scan icon**: inside the input on the right when focused, a small camera/barcode icon appears. If tapped, run scan flow and insert product name into current input (so `50g of` + scan -> `50g of Barilla Spaghetti`).
2. **Global floating scanner**: in the top bar or floating action button as a second option — good for adding an item quickly without opening any meal.
3. **Scan results UI**:
   - If product exists in DB: auto-match to branded product (show brand, size). Insert `FoodFromDB` and update nutrition.
   - If incomplete: offer a two-step completion modal: 1) take photo of nutrition label to auto-fill; 2) match to generic food — user chooses.

**Edge cases**

- If the current input already had text and parser found an ambiguous food, prompt a small confirm popover: "Replace '…' with scanned product?" with `Replace / Add as separate item` choices.

---

## Request-food interaction

**Primary discovery points**

- The `Request` action should be available in the focus-anchored action popover.
- Secondary: allow text selection inside the input — selecting a substring brings up a tiny toolbar with `Request` (like Gmail's toolbar or mobile selection). This covers the "mark some text to request" idea.

**Flow**

1. User highlights text or presses `Request` icon.
2. Show compact modal with suggested matches from `request-food` endpoint (auto-populated from the selected text). Provide short results list with confidence scores and a `Create new` option.
3. If user chooses a match, insert as `FoodFromDB` into the input. If no match, allow quick creation (name + optional category) that will be used as a placeholder.

**Discoverability**

- Offer a hint text in empty inputs: `Type "100g Flour" or highlight a part and Request…`
- On first use, show a one-time micro-tooltip pointing to selection -> request.

---

## Recipes (Add Meal from Recipe)

**How recipes appear**

- From `Add Meal from Recipe` button: search modal with autocomplete search of recipes. Show thumbnail, yield, calories per serving in the search results.
- Adding creates a new meal pre-populated with the recipe. The meal header shows `Recipe: [name]` and a recipe badge.
- By default the recipe is shown collapsed. Expanded view shows ingredient rows (with the same Food Row UI).

**Servings / grams scaling UI**

- On the recipe meal header show a compact control: `Servings: [1] v` (editable) and a small toggle `→ Change to weight`.
- **Two modes**:
  1. **Servings mode** (default): user sets number of servings (float allowed, e.g. 1.5). Ingredients scale by servings factor.
  2. **Total weight mode**: user sets a total grams value for the whole recipe — ingredients scale by `totalWeight / defaultTotalWeight`.

**Ingredient overrides & customizations**

- If the user edits an ingredient amount, mark the recipe meal as `customized` and visually show per-ingredient overrides. Use a small dot or "custom" badge on ingredient rows.
- Internally: maintain both `baseAmount` (from recipe per serving) and `currentAmount`. Scaling uses `currentAmount = baseAmount * scale` unless overridden, in which case the override holds absolute value.
- Provide `Reset` button per ingredient and `Reset recipe to original` for the whole meal.

**UI for scaling**

- When the user edits the `Servings` field, show a small ephemeral tooltip: `Scaled by ×1.5 — 7 ingredients updated` and a preview of new meal totals.
- Allow locking the total calories or total grams — toggling recalculates ingredient ratios (advanced, optional for later).

---

## Data model (client-side) — suggested shape

```js
// simplified
Day { date, meals: Meal[] }
Meal { id, name, type: 'preset'|'custom'|'recipe', recipeId?, foods: FoodRow[], collapsed }
FoodRow { id, amount, unit, food: FoodFromDB|null, extra, source: 'typed'|'scan'|'request'|'recipe', nutrition?, overridden?: boolean }
RecipeMeal { recipeId, servings, totalWeight, ingredients: RecipeIngredient[], customized: boolean }
RecipeIngredient { id, baseAmount, baseUnit, baseGrams, currentAmount, currentUnit, overridden }
```

---

## Implementation details & tips

- **Debounced compute**: debounce 300–600ms after a change to compute/nutrition. While waiting, show shimmer or spinner in the NutritionLabel and a subtle row-level loading indicator.
- **Optimistic updates**: when parsing returns a FoodFromDB, update UI immediately and fetch nutrition; show fallback values if nutrition endpoint fails.
- **Conflict resolution**: when scanning or requesting returns multiple matches, show a compact disambiguation dropdown attached to the row.
- **Unit conversions**: normalize everything to grams for scaling and nutrition calculation. Use your existing parser and DB grams where possible.
- **Keyboard-first**: support `Enter` to accept and create new row, `Ctrl+K`/`/` to open global add modal, `Cmd+S` to save snapshot locally (optional), arrow keys to move between rows.
- **A11y**: ensure inputs have labels, action icons have accessible names, and the scanner modal is keyboard operable.

---

## Visual / microcopy suggestions

- Use subtle background tints to distinguish presets, recipes, and customized meals.
- For parsed preview fonts: amount bold, unit medium, food name semibold, extras italic.
- Microcopy examples: `Found 3 matches — tap to pick one`, `Scaled to 1.5 servings`, `Scanned product not in DB — complete or match to generic`.

---

## Edge cases & concerns

- **Ambiguous text parsing**: show confidence and allow easy override; never auto-replace text without user consent.
- **Large recipes with many ingredients**: collapse long lists and show `Show top 5 ingredients` or `Show full` to avoid overwhelm.
- **Network failures**: allow offline edits and queue nutrition computes, or show explanatory errors.
- **Privacy**: if scanning product photos or labels, mention that images are uploaded only for OCR and not retained (if that's your policy).

---

## Interaction examples (user stories)

1. **Quick add scanned product into focused input**

   - User types `50 g of` then taps the scanner icon inside the input, scans barcode → UI inserts `Barilla Spaghetti` and fetches nutrition.

2. **Requesting unknown substring**

   - User types `2 cups homemade granola`, selects `homemade granola` and clicks `Request` in selection toolbar → the request-food modal shows matches; user selects `Granola (generic)` → inserted as FoodFromDB.

3. **Add recipe and scale**
   - User `Add Meal from Recipe` → chooses `Vegetable Lasagna (4 servings)` → meal added collapsed. User edits servings to `2.5` → all ingredients scale; user edits `cheese` amount to +20g — recipe marked customized.

---

**Recipe Scaling (from design doc)**

- ⬜ Servings control on recipe meal header
- ⬜ Toggle between servings mode and total weight mode
- ⬜ Ingredient overrides & customization tracking
- ⬜ Visual indicator for customized ingredients (dot/badge)
- ⬜ Reset ingredient / Reset entire recipe buttons
- ⬜ Ephemeral tooltip showing scale factor on change

**Meal Summaries**

- ⬜ Per-meal nutrition totals in meal header (kcal/protein/carbs/fat)
- ⬜ Collapsed meal preview: "2 items • 560 kcal"

**Goals & Macros**

- ⬜ Top bar with date selector
- ⬜ Daily macro target summary (calories, protein, carbs, fat)
- ⬜ Quick +/- toggles for targets
- ⬜ Entry page for customizing macro goals
- ⬜ Database storage for goals (profiles table or separate goals table)
- ⬜ Custom component replacing NutritionLabel: in-depth summary comparing daily values to goals
- ⬜ Progress bars for macros (consumed / target)

**Suggestions & Smart Features**

- ⬜ Suggestions under meals to add foods or supplements if not on track for goals
- ⬜ AI-powered meal recommendations based on remaining macros

**Persistence & History**

- ⬜ **Database schema**: `tracked_meals` + `tracked_meal_foods` tables
- ⬜ Save/load meals for specific dates
- ⬜ Date selector to view past/future days
- ⬜ Meal history (calendar view or list)
- ⬜ Graphs for nutrition history (kcal/macros over time)
- ⬜ Week/month summary views

**Saved Meals & Templates**

- ⬜ Make meals saveable as templates
- ⬜ "Save this meal" button → add to user's saved meals library
- ⬜ Repeat/duplicate meals from past days or templates
- ⬜ Manage saved meals section in profile/settings

**Site Integration**

- ⬜ "Add to Today" button on recipe pages → track recipe as meal
- ⬜ "Today's Nutrition" section on home page dashboard
- ⬜ Link to tracking page from main nav
- ⬜ Profile/settings page section for saved meals

**UI/UX Improvements (Nice-to-Haves)**

- ⬜ Better scan button placement (more discoverable)
- ⬜ Barcode scanner styling polish (currently looks wonky)
- ⬜ Recipe overview card on meal expand (thumbnail, yield, source)
- ⬜ Kcal summary badge at bottom of each meal card
- ⬜ Drag-and-drop reordering of meals
- ⬜ Drag-and-drop reordering of ingredients within meals
- ⬜ Copy/duplicate meal button
- ⬜ Meal tags/categories (e.g. "Post-workout", "Cheat meal")
- ⬜ Meal photos (optional upload)
- ⬜ Quick-add FAB (floating action button) for global add
- ⬜ Swipe gestures for delete on mobile
- ⬜ Undo for recent changes
- ⬜ Offline support (local storage queue for nutrition computes)
- ⬜ Dark mode

**Custom Foods & Units**

- ⬜ **User-defined custom foods** (only visible to author)
  - Add custom food form: name, category, nutrition per 100g
  - Stored in separate `custom_foods` table with `user_id`
  - Appears in parser results alongside generic foods
  - Visual badge to distinguish custom from database foods
  - Edit/delete custom foods from profile/settings
- ⬜ **User-defined countable units**
  - Allow users to define custom units for specific foods (e.g., "1 scoop" = 30g)
  - Stored in `custom_units` table: (user_id, food_id, unit_name, grams_per_unit)
  - Parser recognizes custom units when typing
  - Manage custom units from food detail page or settings
  - Export/import custom units for sharing

**Advanced Features (Future)**

- ⬜ Water tracking
- ⬜ Supplement tracking
- ⬜ Meal timing/schedule (IIFYM, intermittent fasting)
- ⬜ Export day/week to PDF or CSV
- ⬜ Share day/meal with friends
- ⬜ Social features (compare with friends, challenges)
- ⬜ Integration with fitness trackers (adjust goals based on activity)
- ⬜ Barcode history (recently scanned products)
- ⬜ Meal notes/comments
- ⬜ Portion size photos (for visual reference)

---

## Next steps (priority order)

### Phase 1: Make it persistent (database)

1. Implement `tracked_meals` and `tracked_meal_foods` tables
2. Save/load functionality for specific dates
3. Date selector to navigate days

### Phase 2: Goals & feedback

1. Macro goals entry page
2. Store goals in database (profiles table)
3. Replace generic NutritionLabel with goals-aware component
4. Progress bars and visual feedback

### Phase 3: Polish & discovera bility

1. UI improvements: scan button, meal summaries, recipe cards
2. Per-meal nutrition totals
3. Meal templates / saved meals

### Phase 4: Site integration

1. "Track this recipe" from recipe pages
2. Home page dashboard widget
3. Profile/settings meal library

### Phase 5: Advanced (if needed)

1. Recipe scaling controls
2. History graphs
3. Suggestions engine

---

### Appendix: Quick UI kit suggestions

- Input height: 44px on mobile, 36–40px on desktop.
- Icon size: 18–20px inline, 24px in action bar.
- Colors: low-contrast tints for presets, 2px dividers, 8–12px radius for meal cards.
- Animations: 120–160ms ease for focus transitions, 200–300ms for collapse/expand.
