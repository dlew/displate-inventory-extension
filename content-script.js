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
          addInventoryDataToProductBox(productBox, data)
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

  let rule = productBox.querySelector("hr")

  let nameText = document.createElement("h4")
  nameText.className = "text--center mt--15"
  nameText.innerText = formatAvailability(productData)

  productBox.insertBefore(nameText, rule)
}

let queryLimitedEditionData = function() {
  // Try to match the URL exactly so we can just reuse cache
  let miso = document.getElementById("selectedCountryCode") ? document.getElementById("selectedCountryCode").value : ""
  return fetch("https://sapi.displate.com/artworks/limited?miso=" + miso)
    .then(response => response.json())
}

let findLimitedEditionTiles = function() {
  return [...document.querySelectorAll(".displate-tile--limited")]
    .filter(element => !element.classList.contains(".displate-tile--limited-placeholder"))
}

let hasLimitedEditionTiles = function() {
  findLimitedEditionTiles().length != 0
}

let findLimitedEditionDataForTile = function(data, tile) {
  if (tile.classList.contains("displate-tile--limited-upcoming")) {
    let title = tile.querySelector("h5").innerText
    return data.data.find(element => element.title == title)
  }
  else {
    let url = new URL(tile.href)
    let pathnames = url.pathname.split("/")
    let itemCollectionId = parseInt(pathnames[pathnames.length - 1])
    return data.data.find(element => element.itemCollectionId == itemCollectionId)
  }
}

// Makes sold out tiles prettier (IMO)
let reformatTile = function(tile, tileData) {
  if (tile.classList.contains("displate-tile--limited-upcoming")) {
    // Make it so that clicking on an upcoming LE displays the image fullscreen
    tile.href = tileData.images.main.url
    tile["style"] = "pointer-events: auto"
    // Need this to avoid router hijacking
    tile.onclick = function() { window.open(tile.href) }
  }
  if (tile.classList.contains("displate-tile--limited-soldout")) {
    // Remove sold out class
    tile.classList.remove("displate-tile--limited-soldout")

    // Re-add name
    let nameDiv = document.createElement("div")
    nameDiv.className = "text--center mt--20 mb--15"

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
}

let addInventoryDataToTile = function(tile, tileData) {
  let div = document.createElement("div")
  div.classList.add("text--center")

  // Need a bit of extra padding on available LEs
  if (tile.querySelector(".editions__pulsometer") != null) {
    div.classList.add("mt--20")
  }

  let p = document.createElement("h5")
  p.innerText = formatAvailability(tileData)

  div.appendChild(p)
  tile.appendChild(div)
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
      .filter(node => node instanceof Element 
        && (node.classList.contains("displate-tile--limited")) || node.querySelector(".displate-tile--limited") != null)
      .length != 0
  )

  if (addedLimitedEditionTile) {
    loadAndShowLimitedEditionData()
  }
})
observer.observe(targetNode, config)