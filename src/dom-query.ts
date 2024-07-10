import { isNil } from "lodash";

const LE_LIST_SELECT = "[class^=LimitedEditionListSection_list__]";
const PRODUCT_SLIDER_MORE_TILES =
  ".product-slider--more .displate-tile--limited";

export function findLimitedEditionTiles(document: Document) {
  return Array.from(
    document.querySelectorAll(
      `${LE_LIST_SELECT} > div , ${PRODUCT_SLIDER_MORE_TILES}`,
    ),
  );
}

export function getItemCollectionIdFromTile(tile: Element): number | undefined {
  const href =
    tile.getAttribute("href") ?? tile.querySelector("a")?.getAttribute("href");

  if (isNil(href)) {
    return undefined;
  }

  const pathNames = href.split("/");
  return parseInt(pathNames[pathNames.length - 1], 10);
}