import { PageElement } from "./model/page-element";

function selectorForPageElement(pageElement: PageElement): string {
  switch (pageElement) {
    case PageElement.LimitedEditionList:
      return "[class^=LimitedEditionListSection_list__]";
    case PageElement.ProductSliderTiles:
      return ".product-slider--more .displate-tile--limited";
    case PageElement.ProductPageBox:
      return ".product-page__product-box";
  }
}

export function waitForPageElement(pageElement: PageElement): Promise<Element> {
  return new Promise((resolve) => {
    const selector = selectorForPageElement(pageElement);

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

export function findLimitedEditionTiles(document: Document) {
  return Array.from(
    document.querySelectorAll(
      `${selectorForPageElement(PageElement.LimitedEditionList)} > div , ${selectorForPageElement(PageElement.ProductSliderTiles)}`,
    ),
  );
}

export function findProductPageProductBox(document: Document) {
  return document.querySelector(
    selectorForPageElement(PageElement.ProductPageBox),
  );
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
