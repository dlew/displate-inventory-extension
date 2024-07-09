/* eslint-disable */
// @ts-nocheck
// (Going to refactor all of this to be TypeScript eventually, but no need to fix anything yet)

import { fetchAllLimitedEditionData } from "./api";
import {
  addInventoryDataToProductBox,
  addInventoryDataToTile,
  reformatSoldOutTile,
} from "./dom-manipulators";

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

let LE_LIST_SELECT = "[class^=LimitedEditionListSection_list__]";
let PRODUCT_SLIDER_MORE_TILES = ".product-slider--more .displate-tile--limited";
let PRODUCT_PAGE_BOX_SELECT = ".product-page__product-box";

let loadAndShowLimitedEditionData = function () {
  return fetchAllLimitedEditionData().then((data) => {
    // Product page: Find the product box and add to that
    let productBox = getProductPageProductBox();
    if (productBox != null) {
      if (!productBox.classList.contains("added-inv-data")) {
        addInventoryDataToProductBox(productBox, data);

        // Make sure we don't double-add data
        productBox.classList.add("added-inv-data");

        return true;
      }
    }
    // List page & more slider on PDP: Find tiles and add to them
    let tiles = findLimitedEditionTiles();
    tiles.forEach((tile) => {
      // Do not update a tile twice since all tiles will be looped over every time more are added
      if (updatedTiles.filter((elem) => elem === tile).length) {
        return;
      }

      let tileData = findLimitedEditionDataForTile(data, tile);
      reformatSoldOutTile(tile, tileData);
      addInventoryDataToTile(tile, tileData);

      updatedTiles.push(tile);
    });
    return true;
  });
};

let getProductPageProductBox = function () {
  return document.querySelector(PRODUCT_PAGE_BOX_SELECT);
};

let findLimitedEditionTiles = function () {
  return [
    ...document.querySelectorAll(
      `${LE_LIST_SELECT} > div , ${PRODUCT_SLIDER_MORE_TILES}`,
    ),
  ];
};

let hasLimitedEditionTiles = function () {
  return findLimitedEditionTiles().length;
};

let findLimitedEditionDataForTile = function (data, tile) {
  // Unreleased LEs
  if (
    tile.querySelector("[class^=LimitedCountdown]") ||
    tile.classList.contains("displate-tile--limited-upcoming")
  ) {
    let title = tile.querySelector("h5").innerHTML;
    return data.find((element) => element.title == title);
  }
  // Current or past LEs
  else {
    // Bug: sometimes this querySelector returns null and then throws an error. But on page refresh, it does not happen. Race condition?
    let url = new URL(tile.href || tile.querySelector("a").href);
    let pathnames = url.pathname.split("/");
    let itemCollectionId = parseInt(pathnames[pathnames.length - 1]);
    return data.find((element) => element.itemCollectionId == itemCollectionId);
  }
};

let waitForElement = (selector) => {
  return new Promise((resolve) => {
    // Does it already exist?
    const targetElem = document.querySelector(selector);
    if (targetElem) {
      return resolve(targetElem);
    }

    // Wait for it to be added (eg by react)
    const observer = new MutationObserver((mutations) => {
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
};

let updatedTiles = [];

// Event listener to handle back or forward navigation:
// - Removes the 'added-inv-data' class to allow re-adding inventory data.
// - Removes all elements with the 'units' class.
window.addEventListener("popstate", function (event) {
  let elements = document.querySelectorAll(".added-inv-data");
  elements.forEach((element) => element.classList.remove("added-inv-data"));

  let unitsElements = document.querySelectorAll(".units");
  unitsElements.forEach((element) => element.parentNode.removeChild(element));
});

let currentPath = new URL(window.location.href).pathname;
let isListPage = currentPath == "/limited-edition";
let isProductPage = currentPath.startsWith("/limited-edition/displate");

// LE list page
if (isListPage) {
  waitForElement(LE_LIST_SELECT).then((leListElem) => {
    // Initial content edit
    loadAndShowLimitedEditionData();
    // Edit all content added later too
    // Also, listen to changes to the DOM to find new LE tiles
    let observer = new MutationObserver(() => {
      loadAndShowLimitedEditionData();
    });
    observer.observe(
      leListElem,
      // All tiles are direct children of leListElem so setting subtree to false ensures only these are selected
      { childList: true, subtree: false },
    );
  });
}
// LE product page
else if (currentPath.startsWith("/limited-edition/displate")) {
  waitForElement(PRODUCT_PAGE_BOX_SELECT).then(() => {
    loadAndShowLimitedEditionData();
  });
  waitForElement(PRODUCT_SLIDER_MORE_TILES).then(() => {
    loadAndShowLimitedEditionData();
  });
}
