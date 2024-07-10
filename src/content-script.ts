import { fetchAllLimitedEditionData } from "./api";
import { clearFormatting, reformatPage } from "./dom-manipulators";
import { waitForPageElement } from "./dom-query";
import { PageElement } from "./model/page-element";

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
  const currentPath = new URL(window.location.href).pathname;

  // LE list page
  if (currentPath == "/limited-edition") {
    const leListElem = await waitForPageElement(PageElement.LimitedEditionList);

    // Initial content edit
    await loadAndShowLimitedEditionData();

    // Edit all content added later too
    // Also, listen to changes to the DOM to find new LE tiles
    const observer = new MutationObserver(async () => {
      await loadAndShowLimitedEditionData();
    });

    observer.observe(
      leListElem,
      // All tiles are direct children of leListElem so setting subtree to false ensures only these are selected
      { childList: true, subtree: false },
    );
  }
  // LE product page
  else if (currentPath.startsWith("/limited-edition/displate")) {
    await Promise.all([
      waitForPageElement(PageElement.ProductPageBox),
      waitForPageElement(PageElement.ProductSliderTiles),
    ]);
    await loadAndShowLimitedEditionData();
  }
}

async function loadAndShowLimitedEditionData() {
  const data = await fetchAllLimitedEditionData();
  reformatPage(document, data);
}

// Event listener to handle back or forward navigation:
// - Removes the 'added-inv-data' class to allow re-adding inventory data.
// - Removes all elements with the 'units' class.
window.addEventListener("popstate", function () {
  clearFormatting(document);
});

// Start the script
(async () => {
  await main();
})();
