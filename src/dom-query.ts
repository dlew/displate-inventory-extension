const limitedEditionTilesSelector = [
  "[class^=LimitedEdtionItem_container__]", // New limited edition tile selector (typo included)
  ".displate-tile--limited", // Old limited edition tile selector (some pages still use it)
].join(", ");

const productPageProductBoxSelector = ".product-page__product-box";

const allLimitedEditionElementsSelector = [
  limitedEditionTilesSelector,
  productPageProductBoxSelector,
].join(", ");

export function hasLimitedEditionElements(document: Document): boolean {
  return document.querySelector(allLimitedEditionElementsSelector) !== null;
}

export function observeNewLimitedEditions(
  document: Document,
  callback: () => Promise<void>,
) {
  const observer = new MutationObserver(async (mutations) => {
    const addedTiles = mutations.some((mutation) => {
      return Array.from(mutation.addedNodes).some((node) => {
        return isNodeALimitedEditionElement(node);
      });
    });

    if (addedTiles) {
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

  return node.querySelector(allLimitedEditionElementsSelector) !== null;
}

export function findLimitedEditionTiles(document: Document) {
  return Array.from(document.querySelectorAll(limitedEditionTilesSelector));
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
