import { useMemo } from "react";
import type { Product } from "../types";
import { sortByTrending } from "../utils/trending";

export type SortKey = "relevance" | "newest" | "views" | "clicks" | "rating" | "reviews" | "trending";

export function useSortedProducts(products: Product[], sort: SortKey): Product[] {
  return useMemo(() => {
    switch (sort) {
      case "newest":
        return [...products].sort((a, b) => b.createdAt - a.createdAt);
      case "views":
        return [...products].sort((a, b) => b.views - a.views);
      case "clicks":
        return [...products].sort((a, b) => b.clicks - a.clicks);
      case "rating":
        return [...products].sort((a, b) => b.ratingAvg - a.ratingAvg);
      case "reviews":
        return [...products].sort((a, b) => b.reviewCount - a.reviewCount);
      case "trending":
        return sortByTrending(products);
      default:
        return products;
    }
  }, [products, sort]);
}
