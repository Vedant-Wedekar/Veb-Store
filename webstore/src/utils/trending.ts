import type { Product } from "../types";

/**
 * Deterministic trending score.
 *
 * score = (views * 1) + (clicks * 3) + (ratingAvg * ratingCount * 2) + (reviewCount * 4)
 *         all divided by a recency-decay factor.
 *
 * Recency decay: products launched more recently get a boost so new, well-performing
 * products can surface over older ones with a larger raw total. Decay halves the
 * weight roughly every 14 days since launch.
 */
export function trendingScore(product: Product): number {
  const engagement =
    product.views * 1 +
    product.clicks * 3 +
    product.ratingAvg * product.ratingCount * 2 +
    product.reviewCount * 4;

  const daysSinceLaunch = Math.max(0, (Date.now() - product.launchDate) / (1000 * 60 * 60 * 24));
  const halfLifeDays = 14;
  const decay = Math.pow(0.5, daysSinceLaunch / halfLifeDays);

  // Base engagement always counts a little, recency decay amplifies fresh momentum.
  return engagement * (0.4 + 0.6 * decay);
}

export function sortByTrending(products: Product[]): Product[] {
  return [...products].sort((a, b) => trendingScore(b) - trendingScore(a));
}
