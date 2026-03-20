/**
 * RevenueCat integration stub.
 *
 * To activate:
 *   npx expo install react-native-purchases
 *   Add the RC config plugin to app.json (see RC Expo docs)
 *   Fill in your real API keys below
 *   Replace each stub body with the real SDK call shown in the comment above it
 *
 * Entitlement ID in RC dashboard: "pro"
 *
 * Create these products in App Store Connect:
 *   honesthouse_pro_monthly   → Auto-Renewable Subscription · $2.99/mo
 *   honesthouse_pro_yearly    → Auto-Renewable Subscription · $14.99/yr
 *   honesthouse_pro_lifetime  → Non-Consumable · $49.99 one-time
 *
 * The RC SDK handles:
 *   - Caching entitlements locally (works offline)
 *   - Auto-expiring monthly/yearly when subscription lapses
 *   - Marking lifetime purchases as active forever
 *   - syncProStatus() on launch re-validates everything
 */

export type PlanId = 'monthly' | 'yearly' | 'lifetime';

export const ENTITLEMENT_ID = 'pro';

export const PRODUCT_IDS: Record<PlanId, string> = {
  monthly:  'honesthouse_pro_monthly',
  yearly:   'honesthouse_pro_yearly',
  lifetime: 'honesthouse_pro_lifetime',
};

export const RC_API_KEY_IOS     = 'appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
export const RC_API_KEY_ANDROID = 'goog_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

export interface PurchaseResult {
  success: boolean;
  error?: string;
}

/**
 * Call once at app startup (TabNavigator useEffect).
 *
 * REAL:
 *   import Purchases, { LOG_LEVEL } from 'react-native-purchases';
 *   import { Platform } from 'react-native';
 *   Purchases.setLogLevel(LOG_LEVEL.DEBUG);
 *   await Purchases.configure({
 *     apiKey: Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID,
 *   });
 */
export async function configureRevenueCat(): Promise<void> {
  console.log('[RC] configure (stub)');
}

/**
 * Called on every app launch to validate entitlement status.
 * RC reads from its local cache first — fast and works offline.
 * For subscriptions: returns false if lapsed.
 * For lifetime (non-consumable): returns true forever.
 *
 * REAL:
 *   import Purchases from 'react-native-purchases';
 *   const { customerInfo } = await Purchases.getCustomerInfo();
 *   return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
 */
export async function checkProStatus(): Promise<boolean> {
  // TODO: replace with real RC call
  return false;
}

/**
 * Initiates the purchase flow for the selected plan.
 *
 * REAL:
 *   import Purchases from 'react-native-purchases';
 *   const productId = PRODUCT_IDS[planId];
 *   const offerings = await Purchases.getOfferings();
 *   const pkg = offerings.current?.availablePackages
 *     .find(p => p.product.productIdentifier === productId);
 *   if (!pkg) return { success: false, error: 'Product not found' };
 *   const { customerInfo } = await Purchases.purchasePackage(pkg);
 *   return { success: customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined };
 */
export async function purchasePro(planId: PlanId): Promise<PurchaseResult> {
  console.log(`[RC] purchasePro stub — plan: ${planId} (${PRODUCT_IDS[planId]})`);
  return { success: true };
}

/**
 * Required by App Store guidelines — must be accessible in settings.
 *
 * REAL:
 *   import Purchases from 'react-native-purchases';
 *   const { customerInfo } = await Purchases.restorePurchases();
 *   return { success: customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined };
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  console.log('[RC] restorePurchases (stub)');
  return { success: false, error: 'No previous purchases found' };
}