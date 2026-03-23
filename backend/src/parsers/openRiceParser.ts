import { load } from "cheerio";
import type { RestaurantCandidate } from "../models/restaurant";

function textOrUndefined(value: string): string | undefined {
  const t = value.trim();
  return t ? t : undefined;
}

function parseCuisine(raw?: string): string[] | undefined {
  if (!raw) return undefined;
  const items = raw
    .split(/[,/]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

export function parseOpenRiceListing(html: string, sourceBase: string): RestaurantCandidate[] {
  const $ = load(html);
  const cards = $("[data-poi-id], .poi-list-cell, .restaurant");
  const results: RestaurantCandidate[] = [];

  cards.each((_, card) => {
    const element = $(card);
    const urlPath = element.find("a[href*='/restaurant']").first().attr("href") || "";
    if (!urlPath) return;

    const sourceUrl = new URL(urlPath, sourceBase).toString();
    const name = textOrUndefined(element.find("a[href*='/restaurant']").first().text());
    const address = textOrUndefined(element.find(".address, [itemprop='streetAddress']").first().text());
    const cuisine = parseCuisine(textOrUndefined(element.find(".cuisine, .category").first().text()));
    const priceRange = textOrUndefined(element.find(".price-range, .price").first().text());
    const photo = element.find("img").first().attr("src") || element.find("img").first().attr("data-src");

    results.push({
      sourceUrl,
      name,
      address,
      cuisine,
      priceRange,
      photos: photo ? [photo] : [],
    });
  });

  return results;
}
