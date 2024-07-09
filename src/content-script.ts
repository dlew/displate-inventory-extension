// @ts-nocheck
// (Going to refactor all of this to be TypeScript eventually, but no need to fix anything yet)

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
  return queryLimitedEditionData()
      .then(data => {
        // Product page: Find the product box and add to that
        let productBox = getProductPageProductBox()
        if (productBox != null) {
          if (!productBox.classList.contains("added-inv-data")) {
            addInventoryDataToProductBox(productBox, data)

            // Make sure we don't double-add data
            productBox.classList.add("added-inv-data")

            return true;
          }
        }
        // List page & more slider on PDP: Find tiles and add to them
        let tiles = findLimitedEditionTiles();
        tiles.forEach(tile => {
          // Do not update a tile twice since all tiles will be looped over every time more are added
          if(updatedTiles.filter(elem => elem === tile).length) {
            return;
          }

          let tileData = findLimitedEditionDataForTile(data, tile)
          reformatSoldOutTile(tile, tileData)
          addInventoryDataToTile(tile, tileData)

          updatedTiles.push(tile);
        })
        return true;
      })
}

let addInventoryDataToProductBox = function(productBox, data) {
  let title = productBox.querySelector("h3").innerText
  let productData = data.find(element => element.title == title)

  let pulsometer = productBox.querySelector(".editions__pulsometer")

  let nameText = document.createElement("h4")
  // Adding 'units' class to nameText for handling removal during forward navigation.
  nameText.className = "mb--15 units"
  nameText.innerText = formatAvailability(productData)

  productBox.insertBefore(nameText, pulsometer)

  // Remove extra padding from name
  productBox.querySelector("h3").classList.remove("mb--15")
}

let selectedCountryCode = function() {
  // TODO: An element with the selectedCountryCode as ID no longer exists and country code is no longer in the source. Seems US is good enough.
  return "us";
}

let queryLimitedEditionData = function() {
  // Try to match the URL exactly so we can just reuse cache
  return fetch("https://sapi.displate.com/artworks/limited?miso=" + selectedCountryCode())
    .then(response => response.json())
    .then(response => {
      // If this is a specific Displate we're viewing, query that Displate's data directly
      // (it may be more accurate if unreleased publicly)
      let path = window.location.pathname
      if (path.startsWith("/limited-edition/displate/")) {
        let itemCollectionId = parseInt(path.substring(path.lastIndexOf('/') + 1))
        return querySpecificLimitedEdition(itemCollectionId)
          .then(leResponse => {
            // Have to filter on title since the itemCollectionId might not be present in upcoming LEs
            let newData = response.data.filter(item => item.title != leResponse.data.title)
            newData.push(leResponse.data)
            return newData
          })
      }
      else {
        return response.data
      }
    })
}

let querySpecificLimitedEdition = function(itemCollectionId) {
  return fetch("https://sapi.displate.com/artworks/limited/" + itemCollectionId + "?miso=" + selectedCountryCode())
    .then(response => response.json())
}

let getProductPageProductBox = function() {
  return document.querySelector(PRODUCT_PAGE_BOX_SELECT)
}

let findLimitedEditionTiles = function() {
  return [...document.querySelectorAll(`${LE_LIST_SELECT} > div , ${PRODUCT_SLIDER_MORE_TILES}`)]
}

let hasLimitedEditionTiles = function() {
  return findLimitedEditionTiles().length
}

let findLimitedEditionDataForTile = function(data, tile) {
  // Unreleased LEs
  if (tile.querySelector('[class^=LimitedCountdown]') || tile.classList.contains('displate-tile--limited-upcoming')) {
    let title = tile.querySelector("h5").innerHTML
    return data.find(element => element.title == title)
  }
  // Current or past LEs
  else {
    // Bug: sometimes this querySelector returns null and then throws an error. But on page refresh, it does not happen. Race condition?
    let url = new URL(tile.href || tile.querySelector('a').href)
    let pathnames = url.pathname.split("/")
    let itemCollectionId = parseInt(pathnames[pathnames.length - 1])
    return data.find(element => element.itemCollectionId == itemCollectionId)
  }
}

// Makes sold out tiles prettier (IMO)
let reformatSoldOutTile = function(tile, tileData) {
  let soldOutElem = tile.querySelector('[class^=SoldOut_container__]')
  if (soldOutElem) {
    // Remove sold out overlay
    soldOutElem.remove()

    // Re-add name
    let nameDiv = document.createElement("div")
    nameDiv.style.textAlign = 'center'
    nameDiv.style.marginTop = '12px'
    nameDiv.style.fontWeight = '600';

    let limitedEditionText = document.createElement("p")
    limitedEditionText.style.fontSize = '.875rem';
    limitedEditionText.style.lineHeight = '20px';
    limitedEditionText.innerText = (tileData.edition.type === "ultra" ? 'Ultra ' : '') + "Limited Edition"

    let titleText = document.createElement("h5")
    fontSize = '1.125rem';
    lineHeight = '24px';
    titleText.innerText = tileData.title

    nameDiv.appendChild(limitedEditionText)
    nameDiv.appendChild(titleText)
    tile.appendChild(nameDiv)
  }
}

let addInventoryDataToTile = function(tile, tileData) {
  let div = document.createElement("div")
  div.style.textAlign = 'center'

  let p = document.createElement("p")
  p.style.fontSize = '.875rem';
  p.style.fontWeight = '600';
  p.style.marginTop = '4px';
  p.innerText = formatAvailability(tileData)

  div.appendChild(p)

  // Insert before pulsometer (if present), otherwise just append to end
  let pulsometer = tile.querySelector("[class^=Pulsometer_container__], .editions__pulsometer")
  if (pulsometer != null) {
    tile.insertBefore(div, pulsometer)
  }
  else {
    tile.appendChild(div)
  }
}

let formatAvailability = function(data) {
  return data.edition.available + " / " + data.edition.size
}

let waitForElement = (selector) => {
  return new Promise(resolve => {
    // Does it already exist?
    const targetElem = document.querySelector(selector);
    if (targetElem) {
      return resolve(targetElem);
    }

    // Wait for it to be added (eg by react)
    const observer = new MutationObserver(mutations => {
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
      subtree: true
    });
  });
}

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
      loadAndShowLimitedEditionData()
    })
    observer.observe(
      leListElem,
      // All tiles are direct children of leListElem so setting subtree to false ensures only these are selected
      { childList: true, subtree: false }
    )
  });
}
// LE product page
else if (currentPath.startsWith("/limited-edition/displate")) {
  waitForElement(PRODUCT_PAGE_BOX_SELECT).then(() => {
    loadAndShowLimitedEditionData()
  })
  waitForElement(PRODUCT_SLIDER_MORE_TILES).then(() => {
    loadAndShowLimitedEditionData()
  })
}