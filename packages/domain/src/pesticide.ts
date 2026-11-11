export interface PesticideItem {
  pesticide_id: string;
  trade_name: string;
  active_ingredient: string;
  is_registered: boolean;
  registration_expiry?: string | null;
  target_pest_ids?: string[] | null;
  target_crop_ids?: string[] | null;
  rain_free_hours?: number | null;
  safety_notes?: string | null;
  is_banned?: boolean;
}

export interface PesticideFilterCriteria {
  pestId: string;
  cropId: string;
  forecastHoursUntilRain?: number;
  excludeBannedIngredients?: string[];
}

export interface PesticideFilterResult {
  recommended: PesticideItem[];
  rejected: Array<{
    pesticide: PesticideItem;
    reason: string;
  }>;
}

/**
 * Pure function: Filters pesticides based on registration, crop/pest compatibility,
 * banned ingredient policies, and upcoming rain/washoff windows.
 */
export function filterSafePesticides(
  candidates: PesticideItem[],
  criteria: PesticideFilterCriteria
): PesticideFilterResult {
  const recommended: PesticideItem[] = [];
  const rejected: Array<{ pesticide: PesticideItem; reason: string }> = [];

  const bannedSet = new Set((criteria.excludeBannedIngredients ?? []).map((s) => s.toLowerCase()));

  for (const item of candidates) {
    if (!item.is_registered) {
      rejected.push({ pesticide: item, reason: 'Pesticide is not registered in national database' });
      continue;
    }

    if (item.is_banned) {
      rejected.push({ pesticide: item, reason: 'Pesticide is banned or restricted by national regulatory authority' });
      continue;
    }

    if (item.active_ingredient && bannedSet.has(item.active_ingredient.toLowerCase())) {
      rejected.push({ pesticide: item, reason: `Active ingredient ${item.active_ingredient} is restricted` });
      continue;
    }

    if (item.registration_expiry && new Date(item.registration_expiry).getTime() < Date.now()) {
      rejected.push({ pesticide: item, reason: 'Registration has expired' });
      continue;
    }

    if (item.target_pest_ids && item.target_pest_ids.length > 0 && !item.target_pest_ids.includes(criteria.pestId)) {
      rejected.push({ pesticide: item, reason: 'Pesticide is not indicated for the target pest' });
      continue;
    }

    if (item.target_crop_ids && item.target_crop_ids.length > 0 && !item.target_crop_ids.includes(criteria.cropId)) {
      rejected.push({ pesticide: item, reason: 'Pesticide is not approved for this specific crop' });
      continue;
    }

    if (
      criteria.forecastHoursUntilRain !== undefined &&
      item.rain_free_hours &&
      criteria.forecastHoursUntilRain < item.rain_free_hours
    ) {
      rejected.push({
        pesticide: item,
        reason: `Requires ${item.rain_free_hours}h rain-free window, but rain forecast is in ${criteria.forecastHoursUntilRain}h`,
      });
      continue;
    }

    recommended.push(item);
  }

  return { recommended, rejected };
}

