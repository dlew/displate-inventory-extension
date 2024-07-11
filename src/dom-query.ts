const newLimitedEditionListSelector =
  "[class^=LimitedEditionListSection_list__]";

// There are multiple nested containers, so this will not uniquely identify tiles at their top level
const newLimitedEditionTileDetector = "[class^=LimitedEdtionItem_container__]"; // Typo intended

const oldLimitedEditionTileSelector = ".displate-tile--limited"; // Some pages still use this

const productPageProductBoxSelector = ".product-page__product-box";

const limitedEditionTileSelector = [
  `${newLimitedEditionListSelector} > ${newLimitedEditionTileDetector}`,
  oldLimitedEditionTileSelector,
].join(", ");

const allLimitedEditionElementsDetector = [
  newLimitedEditionTileDetector,
  oldLimitedEditionTileSelector,
  productPageProductBoxSelector,
].join(", ");

export function hasLimitedEditionElements(document: Document): boolean {
  return document.querySelector(allLimitedEditionElementsDetector) !== null;
}

export function observeLimitedEditionElementChanges(
  document: Document,
  callback: () => Promise<void>,
) {
  const observer = new MutationObserver(async (mutations) => {
    // If any LE elements were added OR removed, then execute the callback
    const changedElements = mutations.some((mutation) =>
      Array.from(mutation.addedNodes)
        .concat(Array.from(mutation.removedNodes))
        .some((node) => isNodeALimitedEditionElement(node)),
    );

    if (changedElements) {
      await callback();
    }
  });

  // Observe the body for all new elements
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function isNodeALimitedEditionElement(node: Node) {
  if (!(node instanceof Element)) {
    return false;
  }

  return (
    node.classList.contains("displate-tile--limited") || // Need this to support old LE page
    node.querySelector(allLimitedEditionElementsDetector) !== null
  );
}

export function findLimitedEditionTiles(document: Document) {
  return Array.from(document.querySelectorAll(limitedEditionTileSelector));
}

export function findProductPageProductBox(document: Document) {
  return document.querySelector(productPageProductBoxSelector);
}

export function getItemCollectionIdFromTile(tile: Element): number | undefined {
  const href =
    tile.getAttribute("href") ?? tile.querySelector("a")?.getAttribute("href");

  if (href === null || href === undefined) {
    return undefined;
  }

  const pathNames = href.split("/");
  return parseInt(pathNames[pathNames.length - 1], 10);
}
