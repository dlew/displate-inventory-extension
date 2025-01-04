import { LimitedEdition } from "./model/limited-edition";
import {
  findLimitedEditionTiles,
  findProductPageProductBox,
  getItemCollectionIdFromTile,
} from "./dom-query";

// Class that indicates the element we added that contains availability info
const extensionAvailabilityTextClass = "extension-availability-info";

export function reformatPage(document: Document, data: LimitedEdition[]) {
  // Product page: Find the product box and add to that
  const productBox = findProductPageProductBox(document);
  if (productBox !== null) {
    addInventoryDataToProductBox(productBox, data);
  }

  // List page & more slider on PDP: Find tiles and add to them
  const tiles = findLimitedEditionTiles(document);
  tiles.forEach((tile) => {
    const itemCollectionId = getItemCollectionIdFromTile(tile);
    const tileData = data.find((le) => le.itemCollectionId == itemCollectionId);
    if (tileData !== undefined) {
      reformatSoldOutTile(tile);
      addInventoryDataToTile(tile, tileData);
    }
  });
}

// Makes sold-out tiles prettier (IMO)
export function reformatSoldOutTile(tile: Element) {
  // New sold out overlay
  const soldOutElem = tile.querySelector("[class^=SoldOut_container__]");
  if (soldOutElem === null) {
    return;
  }

  soldOutElem.remove();
}

export function addInventoryDataToTile(
  tile: Element,
  tileData: LimitedEdition,
) {
  // Modify pulsometer (if present)
  const pulsometer = findPulsometer(tile);
  if (pulsometer != null) {
    pulsometer.innerText = formatPulsometerText(tileData);
    return;
  }

  // If we didn't find pulsometer, add our own element (but only once)
  let p = tile.querySelector(
    `.${extensionAvailabilityTextClass}`,
  ) as HTMLParagraphElement;
  if (p === null) {
    p = document.createElement("p");
    p.className = extensionAvailabilityTextClass;
    p.style.fontSize = ".875rem";
    p.style.fontWeight = "600";
    p.style.marginTop = "4px";

    const div = document.createElement("div");
    div.style.textAlign = "center";
    div.appendChild(p);

    tile.appendChild(div);
  }
  p.innerText = formatAvailability(tileData);
}

export function addInventoryDataToProductBox(
  productBox: Element,
  data: LimitedEdition[],
) {
  const productBoxHeader = productBox.querySelector("h3")!;

  // Figure out which LE we're looking at
  const title = productBoxHeader.innerText;
  const productData = data.find((element) => element.title == title)!;

  // Modify pulsometer (if present & not showing "sold out")
  const pulsometer = findPulsometer(productBox);
  if (pulsometer != null && productData.edition.available != 0) {
    pulsometer.innerText = formatPulsometerText(productData);
    return;
  }

  // Find or create our custom availability text otherwise
  let availabilityText = productBox.querySelector(
    `.${extensionAvailabilityTextClass}`,
  ) as HTMLHeadingElement;
  if (availabilityText === null) {
    availabilityText = document.createElement("h4");
    availabilityText.className = `mb--15 ${extensionAvailabilityTextClass}`;

    const pulsometer = productBox.querySelector(".editions__pulsometer");
    productBox.insertBefore(availabilityText, pulsometer);

    // Remove extra padding from name
    productBoxHeader.classList.remove("mb--15");
  }

  availabilityText.innerText = formatAvailability(productData);
}

function findPulsometer(inside: Element): HTMLSpanElement | undefined {
  const pulsometer = inside.querySelector(
    "[class^=Pulsometer_container__], .editions__pulsometer",
  );
  if (pulsometer != null) {
    return pulsometer.querySelector(
      "[class^=Pulsometer_pulsometerText__], span.text--bold",
    ) as HTMLSpanElement;
  }
  return undefined;
}

function formatAvailability(data: LimitedEdition) {
  return `${data.edition.available} / ${data.edition.size}`;
}

function formatPulsometerText(data: LimitedEdition) {
  return `${formatAvailability(data)} pieces left`;
}
