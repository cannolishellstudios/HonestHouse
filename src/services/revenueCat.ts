import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

export type PlanId = 'monthly' | 'yearly' | 'lifetime';

export const ENTITLEMENT_ID = 'pro';

export const PRODUCT_IDS: Record<PlanId, string> = {
  monthly:  'honesthouse_pro_monthly',
  yearly:   'honesthouse_pro_yearly',
  lifetime: 'honesthouse_pro_lifetime',
};

// Paste your actual API keys from the RevenueCat Dashboard here
export const RC_API_KEY_IOS     = 'appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
export const RC_API_KEY_ANDROID = 'goog_HiFntBbShVfzlVpRQEQsmDlsXZd';

export interface PurchaseResult {
  success: boolean;
  error?: string;
}

export async function configureRevenueCat(): Promise<void> {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  if (Platform.OS === 'ios') {
    Purchases.configure({ apiKey: RC_API_KEY_IOS });
  } else if (Platform.OS === 'android') {
    Purchases.configure({ apiKey: RC_API_KEY_ANDROID });
  }
}

export async function checkProStatus(): Promise<boolean> {
  try {
    // getCustomerInfo returns the info object directly
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e) {
    console.error('[RC] Error checking status:', e);
    return false;
  }
}

export async function purchasePro(planId: PlanId): Promise<PurchaseResult> {
  try {
    const productId = PRODUCT_IDS[planId];
    const offerings = await Purchases.getOfferings();
    
    const pkg = offerings.current?.availablePackages.find(
      p => p.product.identifier === productId
    );
    
    if (!pkg) return { success: false, error: 'Product not found' };
    
    // purchasePackage returns a MakePurchaseResult object, 
    // so we must destructure { customerInfo } from it
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined };
  } catch (e: any) {
    if (!e.userCancelled) {
      console.error('[RC] Purchase error:', e);
    }
    return { success: false, error: e.message };
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    // restorePurchases returns the info object directly
    const customerInfo = await Purchases.restorePurchases();
    return { success: customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined };
  } catch (e: any) {
    console.error('[RC] Restore error:', e);
    return { success: false, error: e.message };
  }
}