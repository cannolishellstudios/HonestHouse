/**
 * reviewPrompt.ts — App Store / Play Store review request
 *
 * RULES (Apple enforces these; violating = rejection):
 *   1. Max 3 prompts per 365 days (iOS enforces this itself, but we track to avoid wasting quota)
 *   2. Never ask after a negative action (error, failed purchase, frustration)
 *   3. Only ask when the user has genuinely gotten value
 *   4. Never ask on first launch or during onboarding
 *   5. Never show a custom "rate us" dialog first — call the native prompt directly
 *   6. System may suppress the prompt (iOS decides) — that's fine, it's expected
 *
 * OUR TRIGGER CONDITIONS (all must be true):
 *   A. User has entered income AND expenses (they've actually used the app)
 *   B. At least 3 app opens have happened
 *   C. Readiness score > 0 (they have real data)
 *   D. Not within 30 days of last prompt
 *   E. We haven't prompted more than 3 times this year
 *
 * GOOD MOMENTS to call maybeRequestReview():
 *   - After marking a game plan step as "done"
 *   - After completing onboarding with real data
 *   - After a purchase succeeds (they're happy)
 *   - After viewing their affordability number for the 3rd+ time
 *
 * BAD MOMENTS (do NOT call):
 *   - After a failed purchase
 *   - During onboarding
 *   - On first open
 *   - After displaying an error
 *
 * SETUP (when you're ready):
 *   npx expo install expo-store-review
 *   Then uncomment the import and requestReview() call below.
 *
 * Until expo-store-review is installed, this is a safe no-op stub.
 */

// import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_LAST_PROMPTED  = 'review:lastPromptedMs';
const KEY_PROMPT_COUNT   = 'review:promptCountThisYear';
const KEY_YEAR_TRACKED   = 'review:yearTracked';
const KEY_APP_OPENS      = 'review:appOpens';

const MS_PER_DAY   = 86_400_000;
const MIN_DAYS_GAP = 30;       // minimum days between prompts
const MAX_PER_YEAR = 3;        // Apple's hard limit
const MIN_OPENS    = 3;        // minimum app opens before we ever ask

export async function incrementAppOpens(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY_APP_OPENS);
    const count = raw ? parseInt(raw, 10) : 0;
    await AsyncStorage.setItem(KEY_APP_OPENS, String(count + 1));
  } catch {}
}

/**
 * Call this at a "happy moment" — see list above.
 * Silently does nothing if conditions aren't met.
 * Safe to call frequently; internally rate-limited.
 */
export async function maybeRequestReview(opts: {
  hasIncome: boolean;
  hasExpenses: boolean;
  readinessScore: number;
}): Promise<void> {
  try {
    const { hasIncome, hasExpenses, readinessScore } = opts;

    // ── A. User must have real data ──────────────────────────────────────────
    if (!hasIncome || !hasExpenses || readinessScore <= 0) return;

    // ── B. Minimum app opens ─────────────────────────────────────────────────
    const opensRaw = await AsyncStorage.getItem(KEY_APP_OPENS);
    const opens = opensRaw ? parseInt(opensRaw, 10) : 0;
    if (opens < MIN_OPENS) return;

    const now = Date.now();
    const currentYear = new Date().getFullYear();

    // ── C. Reset yearly counter if new year ──────────────────────────────────
    const trackedYear = await AsyncStorage.getItem(KEY_YEAR_TRACKED);
    let promptCount = 0;
    if (trackedYear === String(currentYear)) {
      const countRaw = await AsyncStorage.getItem(KEY_PROMPT_COUNT);
      promptCount = countRaw ? parseInt(countRaw, 10) : 0;
    } else {
      // new year — reset
      await AsyncStorage.setItem(KEY_YEAR_TRACKED, String(currentYear));
      await AsyncStorage.setItem(KEY_PROMPT_COUNT, '0');
    }

    // ── D. Max prompts per year ──────────────────────────────────────────────
    if (promptCount >= MAX_PER_YEAR) return;

    // ── E. Min days gap ──────────────────────────────────────────────────────
    const lastRaw = await AsyncStorage.getItem(KEY_LAST_PROMPTED);
    if (lastRaw) {
      const lastMs = parseInt(lastRaw, 10);
      const daysSince = (now - lastMs) / MS_PER_DAY;
      if (daysSince < MIN_DAYS_GAP) return;
    }

    // ── All conditions met — fire the native review prompt ───────────────────
    await AsyncStorage.setItem(KEY_LAST_PROMPTED, String(now));
    await AsyncStorage.setItem(KEY_PROMPT_COUNT, String(promptCount + 1));

    // UNCOMMENT WHEN expo-store-review IS INSTALLED:
    // const isAvailable = await StoreReview.isAvailableAsync();
    // if (isAvailable) {
    //   await StoreReview.requestReview();
    // }

    // stub: does nothing until SDK is installed
    if (__DEV__) {
      console.log('[ReviewPrompt] Would have shown review prompt');
    }
  } catch (err) {
    // never let review logic crash the app
    if (__DEV__) console.warn('[ReviewPrompt] error:', err);
  }
}