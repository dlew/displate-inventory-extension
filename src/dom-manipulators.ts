import { LimitedEdition } from "./model/limited-edition";
import {
  findLimitedEditionTiles,
  findProductPageProductBox,
  getItemCollectionIdFromTile,
} from "./dom-query";
import { isNil } from "lodash";

const updatedTiles: Element[] = [];

export function reformatPage(document: Document, data: LimitedEdition[]) {
  // Product page: Find the product box and add to that
  const productBox = findProductPageProductBox(document);
  if (!isNil(productBox)) {
    if (!productBox.classList.contains("added-inv-data")) {
      addInventoryDataToProductBox(productBox, data);

      // Make sure we don't double-add data
      productBox.classList.add("added-inv-data");
    }
  }

  // List page & more slider on PDP: Find tiles and add to them
  const tiles = findLimitedEditionTiles(document);
  tiles.forEach((tile) => {
    // Do not update a tile twice since all tiles will be looped over every time more are added
    if (updatedTiles.includes(tile)) {
      return;
    }

    const itemCollectionId = getItemCollectionIdFromTile(tile);
    const tileData = data.find((le) => le.itemCollectionId == itemCollectionId);
    if (!isNil(tileData)) {
      reformatSoldOutTile(tile, tileData);
      addInventoryDataToTile(tile, tileData);
      updatedTiles.push(tile);
    }
  });
}

// Makes sold-out tiles prettier (IMO)
export function reformatSoldOutTile(tile: Element, tileData: LimitedEdition) {
  const soldOutElem = tile.querySelector("[class^=SoldOut_container__]");
  if (soldOutElem) {
    // Remove sold out overlay
    soldOutElem.remove();

    // Re-add name
    const nameDiv = document.createElement("div");
    nameDiv.style.textAlign = "center";
    nameDiv.style.marginTop = "12px";
    nameDiv.style.fontWeight = "600";

    const limitedEditionText = document.createElement("p");
    limitedEditionText.style.fontSize = ".875rem";
    limitedEditionText.style.lineHeight = "20px";
    limitedEditionText.innerText =
      (tileData.edition.type === "ultra" ? "Ultra " : "") + "Limited Edition";

    const titleText = document.createElement("h5");
    titleText.style.fontSize = "1.125rem";
    titleText.style.lineHeight = "24px";
    titleText.innerText = tileData.title;

    nameDiv.appendChild(limitedEditionText);
    nameDiv.appendChild(titleText);
    tile.appendChild(nameDiv);
  }
}

export function addInventoryDataToTile(
  tile: Element,
  tileData: LimitedEdition,
) {
  const div = document.createElement("div");
  div.style.textAlign = "center";

  const p = document.createElement("p");
  p.style.fontSize = ".875rem";
  p.style.fontWeight = "600";
  p.style.marginTop = "4px";
  p.innerText = formatAvailability(tileData);

  div.appendChild(p);

  // Insert before pulsometer (if present), otherwise just append to end
  const pulsometer = tile.querySelector(
    "[class^=Pulsometer_container__], .editions__pulsometer",
  );
  if (pulsometer != null) {
    tile.insertBefore(div, pulsometer);
  } else {
    tile.appendChild(div);
  }
}

export function addInventoryDataToProductBox(
  productBox: Element,
  data: LimitedEdition[],
) {
  const productBoxHeader = productBox.querySelector("h3")!;

  const title = productBoxHeader.innerText;
  const productData = data.find((element) => element.title == title)!;

  const pulsometer = productBox.querySelector(".editions__pulsometer");

  const nameText = document.createElement("h4");
  // Adding 'units' class to nameText for handling removal during forward navigation.
  nameText.className = "mb--15 units";
  nameText.innerText = formatAvailability(productData);

  productBox.insertBefore(nameText, pulsometer);

  // Remove extra padding from name
  productBoxHeader.classList.remove("mb--15");
}

function formatAvailability(data: LimitedEdition) {
  return `${data.edition.available} / ${data.edition.size}`;
}
