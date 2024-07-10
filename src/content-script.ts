import { fetchAllLimitedEditionData } from "./api";
import { reformatPage } from "./dom-manipulators";

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

const LE_LIST_SELECT = "[class^=LimitedEditionListSection_list__]";
const PRODUCT_SLIDER_MORE_TILES =
  ".product-slider--more .displate-tile--limited";
const PRODUCT_PAGE_BOX_SELECT = ".product-page__product-box";

async function loadAndShowLimitedEditionData() {
  const data = await fetchAllLimitedEditionData();
  reformatPage(document, data);
}

function waitForElement(selector: string): Promise<Element> {
  return new Promise((resolve) => {
    // Does it already exist?
    const targetElem = document.querySelector(selector);
    if (targetElem) {
      return resolve(targetElem);
    }

    // Wait for it to be added (e.g. by react)
    const observer = new MutationObserver(() => {
      const targetElem = document.querySelector(selector);
      if (targetElem) {
        // Clean up observer
        observer.disconnect();
        resolve(targetElem);
      }
    });

    // Observe the body for all new elements
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

// Event listener to handle back or forward navigation:
// - Removes the 'added-inv-data' class to allow re-adding inventory data.
// - Removes all elements with the 'units' class.
window.addEventListener("popstate", function () {
  const elements = document.querySelectorAll(".added-inv-data");
  elements.forEach((element) => element.classList.remove("added-inv-data"));

  const unitsElements = document.querySelectorAll(".units");
  unitsElements.forEach((element) => element.parentNode?.removeChild(element));
});

const currentPath = new URL(window.location.href).pathname;
const isListPage = currentPath == "/limited-edition";

async function main() {
  // LE list page
  if (isListPage) {
    const leListElem = await waitForElement(LE_LIST_SELECT);

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
      waitForElement(PRODUCT_PAGE_BOX_SELECT),
      waitForElement(PRODUCT_SLIDER_MORE_TILES),
    ]);
    await loadAndShowLimitedEditionData();
  }
}

(async () => {
  await main();
})();
