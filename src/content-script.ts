import { fetchAllLimitedEditionData } from "./api";
import { reformatPage } from "./dom-manipulators";
import {
  hasLimitedEditionElements,
  observeLimitedEditionElementChanges,
} from "./dom-query";

/**
 * This script improves the data shown for Displate Limited Editions.
 *
 * It displays stock data, as well as all titles and makes images easier to see.
 *
 * --------
 *
 * The basic flow for this script is:
 *
 * 1. Listen for Limited Edition DOM elements to be added.
 * 2. Upon detection, fetch the latest Limited Edition data.
 * 3. Once we have that, find all tiles and improve them.
 */
async function main() {
  // Check if page already has LE elements, if so then show LE data
  if (hasLimitedEditionElements(document)) {
    await loadAndShowLimitedEditionData();
  }

  // Displate's site dynamically loads content as pages load & during navigation
  observeLimitedEditionElementChanges(document, async () => {
    await loadAndShowLimitedEditionData();
  });
}

async function loadAndShowLimitedEditionData() {
  const data = await fetchAllLimitedEditionData();
  reformatPage(document, data);
}

// Start the script
(async () => {
  await main();
})();
