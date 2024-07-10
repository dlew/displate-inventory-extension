import { LimitedEdition } from "./model/limited-edition";

// Let's not reload the data unless the user refreshes the page
let cache: LimitedEdition[] = [];

export async function fetchAllLimitedEditionData(): Promise<LimitedEdition[]> {
  if (cache.length === 0) {
    const response = await fetch("https://sapi.displate.com/artworks/limited");
    const json = await response.json();
    cache = json.data;
  }
  return cache;
}
