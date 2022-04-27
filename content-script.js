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

let loadAndShowLimitedEditionData = function () {
  queryLimitedEditionData()
      .then(data =>  {
        // Find the product box and add to that
        let productBox = document.querySelector(".product-page__product-box")
        if (productBox != null) {
          if (!productBox.classList.contains("added-inv-data")) {
            addInventoryDataToProductBox(productBox, data)

            // Make sure we don't double-add data
            productBox.classList.add("added-inv-data")
          }
        }

        // Find tiles and add to them
        findLimitedEditionTiles().forEach(tile => {
          if (!tile.classList.contains("added-inv-data")) {
            let tileData = findLimitedEditionDataForTile(data, tile)
            reformatTile(tile, tileData)
            addInventoryDataToTile(tile, tileData)

            // Make sure we don't double-add data
            tile.classList.add("added-inv-data")
          }
        })
      })
}

let addInventoryDataToProductBox = function(productBox, data) {
  let title = productBox.querySelector("h3").innerText
  let productData = data.data.find(element => element.title == title)

  let pulsometer = productBox.querySelector(".editions__pulsometer")

  let nameText = document.createElement("h4")
  nameText.className = "mb--15"
  nameText.innerText = formatAvailability(productData)

  productBox.insertBefore(nameText, pulsometer)

  // Remove extra padding from name
  productBox.querySelector("h3").classList.remove("mb--15")
}

let selectedCountryCode = function() {
  return document.getElementById("selectedCountryCode") ? document.getElementById("selectedCountryCode").value : ""
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
            response.data = newData
            return response
          })
      }
      else {
        return response
      }
    })
}

let querySpecificLimitedEdition = function(itemCollectionId) {
  return fetch("https://sapi.displate.com/artworks/limited/" + itemCollectionId + "?miso=" + selectedCountryCode())
    .then(response => response.json())
}

let findLimitedEditionTiles = function() {
  return [...document.querySelectorAll(".displate-tile--limited")]
    .filter(element => !element.classList.contains(".displate-tile--limited-placeholder"))
}

let hasLimitedEditionTiles = function() {
  return findLimitedEditionTiles().length != 0
}

let findLimitedEditionDataForTile = function(data, tile) {
  if (tile.classList.contains("displate-tile--limited-upcoming")) {
    let title = tile.querySelector("h5").innerHTML
    return data.data.find(element => element.title == title)
  }
  else {
    let url = new URL(tile.href)
    let pathnames = url.pathname.split("/")
    let itemCollectionId = parseInt(pathnames[pathnames.length - 1])
    return data.data.find(element => element.itemCollectionId == itemCollectionId)
  }
}

let removeTileBottomPadding = function(tile) {
  // Remove bottom padding (looks better with inventory data)
  tile.querySelector("h5").parentNode.classList.remove("mb--15")
}

// Makes sold out tiles prettier (IMO)
let reformatTile = function(tile, tileData) {
  if (tile.classList.contains("displate-tile--limited-upcoming")) {
    // Make it so that clicking on an upcoming LE displays the image fullscreen
    tile.href = tileData.images.main.url
    tile["style"] = "pointer-events: auto"
    // Need this to avoid router hijacking
    tile.onclick = function() { window.open(tile.href) }

    removeTileBottomPadding(tile)
  }
  if (tile.classList.contains("displate-tile--limited-soldout")) {
    // Remove sold out class
    tile.classList.remove("displate-tile--limited-soldout")

    // Re-add name
    let nameDiv = document.createElement("div")
    nameDiv.className = "text--center mt--20"

    let limitedEditionText = document.createElement("p")
    limitedEditionText.className = "text text--small text--bold"
    limitedEditionText.innerText = "Limited Edition"

    let titleText = document.createElement("h5")
    titleText.className = "heading-5"
    titleText.innerText = tileData.title

    nameDiv.appendChild(limitedEditionText)
    nameDiv.appendChild(titleText)
    tile.appendChild(nameDiv)
  }
  else {
    removeTileBottomPadding(tile)
  }
}

let addInventoryDataToTile = function(tile, tileData) {
  let div = document.createElement("div")
  div.classList.add("text--center")

  let p = document.createElement("p")
  p.className = "text--small text--bold"
  p.innerText = formatAvailability(tileData)

  div.appendChild(p)

  // Insert before pulsometer (if present), otherwise just append to end
  let pulsometer = tile.querySelector(".editions__pulsometer")
  if (pulsometer != null) {
    div.classList.add("mb--15")
    tile.insertBefore(div, pulsometer)
  }
  else {
    tile.appendChild(div)
  }
}

let formatAvailability = function(data) {
  return data.edition.available + " / " + data.edition.size
}

// If the page starts with LE tiles, great!
if (hasLimitedEditionTiles()) {
  loadAndShowLimitedEditionData()
}

// Also, listen to changes to the DOM to find new LE tiles
let targetNode = document.getElementById('d_app')
let config = { childList: true, subtree: true }
let observer = new MutationObserver(function(mutationsList, observer) {
  let addedLimitedEditionTile = mutationsList.some(mutation => 
    [...mutation.addedNodes]
      .filter(node => node instanceof Element)
      .filter(node => node.classList.contains("displate-tile--limited") || node.querySelector(".displate-tile--limited"))
      .length != 0
  )

  if (addedLimitedEditionTile) {
    loadAndShowLimitedEditionData()
  }
})
observer.observe(targetNode, config)