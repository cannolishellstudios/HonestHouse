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
const MIN_DAYS_GAP = 30;       
const MAX_PER_YEAR = 3;        
const MIN_OPENS    = 3;        

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
      // It's a new year — reset the local tracking
      await AsyncStorage.setItem(KEY_YEAR_TRACKED, String(currentYear));
      await AsyncStorage.setItem(KEY_PROMPT_COUNT, '0');
      promptCount = 0;
    }

    // ── D. Max prompts per year (Apple/Google hard limit is 3) ───────────────
    if (promptCount >= MAX_PER_YEAR) return;

    // ── E. Min days gap (don't annoy the user) ───────────────────────────────
    const lastRaw = await AsyncStorage.getItem(KEY_LAST_PROMPTED);
    if (lastRaw) {
      const lastMs = parseInt(lastRaw, 10);
      const daysSince = (now - lastMs) / MS_PER_DAY;
      if (daysSince < MIN_DAYS_GAP) return;
    }

    // ── All conditions met — trigger the request ─────────────────────────────
    
    // 1. Check if the store review is available on this device
    const isAvailable = await StoreReview.isAvailableAsync();
    
    if (isAvailable) {
      // 2. Request the review
      await StoreReview.requestReview();
      
      // 3. Log the prompt so we don't ask again too soon
      await AsyncStorage.setItem(KEY_LAST_PROMPTED, String(now));
      await AsyncStorage.setItem(KEY_PROMPT_COUNT, String(promptCount + 1));
      
      if (__DEV__) console.log('[ReviewPrompt] Native review prompt requested');
    }

  } catch (err) {
    if (__DEV__) console.warn('[ReviewPrompt] Error in review logic:', err);
  }
}