import { isNil } from "lodash";

export function getItemCollectionIdFromTile(tile: Element): number | undefined {
  const href =
    tile.getAttribute("href") ?? tile.querySelector("a")?.getAttribute("href");

  if (isNil(href)) {
    return undefined;
  }

  const pathNames = href.split("/");
  return parseInt(pathNames[pathNames.length - 1], 10);
}
