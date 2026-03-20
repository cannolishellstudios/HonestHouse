/**
 * reviewPrompt.ts — App Store / Play Store review request
 */

import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_LAST_PROMPTED  = 'review:lastPromptedMs';
const KEY_PROMPT_COUNT   = 'review:promptCountThisYear';
const KEY_YEAR_TRACKED   = 'review:yearTracked';
const KEY_APP_OPENS      = 'review:appOpens';

const MS_PER_DAY   = 86_400_000;
const MIN_DAYS_GAP = 30;       // minimum days between prompts
const MAX_PER_YEAR = 3;        // Apple's hard limit
const MIN_OPENS    = 3;        // minimum app opens before we ever ask

/**
 * Tracks the number of times the app has been launched.
 */
export async function incrementAppOpens(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY_APP_OPENS);
    const count = raw ? parseInt(raw, 10) : 0;
    await AsyncStorage.setItem(KEY_APP_OPENS, String(count + 1));
  } catch (err) {
    if (__DEV__) console.warn('[ReviewPrompt] Failed to increment opens:', err);
  }
}

/**
 * Call this at a "happy moment".
 * Silently does nothing if conditions aren't met.
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
      // New year — reset tracking
      await AsyncStorage.setItem(KEY_YEAR_TRACKED, String(currentYear));
      await AsyncStorage.setItem(KEY_PROMPT_COUNT, '0');
      promptCount = 0;
    }

    // ── D. Max prompts per year (Hard limit is 3) ────────────────────────────
    if (promptCount >= MAX_PER_YEAR) return;

    // ── E. Min days gap ──────────────────────────────────────────────────────
    const lastRaw = await AsyncStorage.getItem(KEY_LAST_PROMPTED);
    if (lastRaw) {
      const lastMs = parseInt(lastRaw, 10);
      const daysSince = (now - lastMs) / MS_PER_DAY;
      if (daysSince < MIN_DAYS_GAP) return;
    }

    // ── All conditions met — trigger the request ─────────────────────────────
    
    // Check if the store review is available on this platform/device
    const isAvailable = await StoreReview.isAvailableAsync();
    
    if (isAvailable) {
      // Fire the native OS prompt
      await StoreReview.requestReview();
      
      // Log the success so we don't over-prompt
      await AsyncStorage.setItem(KEY_LAST_PROMPTED, String(now));
      await AsyncStorage.setItem(KEY_PROMPT_COUNT, String(promptCount + 1));
      
      if (__DEV__) console.log('[ReviewPrompt] Native review prompt requested');
    }

  } catch (err) {
    // Never let review logic crash the main app flow
    if (__DEV__) console.warn('[ReviewPrompt] Error in review logic:', err);
  }
}