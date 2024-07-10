import {
  findLimitedEditionTiles,
  findProductPageProductBox,
  getItemCollectionIdFromTile,
} from "../src/dom-query";
import { JSDOM } from "jsdom";
import * as fs from "node:fs";

const releasedLimitedEditionTile =
  '<div class="LimitedEdtionItem_container__u5Hys"><a class="LimitedEdtionItem_link__fvSlp" href="/limited-edition/displate/7376525"></a><div class="LimitedEdtionItem_container__u5Hys"><img alt="Purring Fantasy" class="LimitedEdtionItem_limitedImage__lhLmN" src="https://static.displate.com/560x784/limited/2024-06-26/3886aae9337ced2664b7df2a5e285f33_3afbd87579cb9d16fdd6e3e642ddf33c.jpg"></div><div class="LimitedEditionDescription_container__x8KSI"><p class="LimitedEditionDescription_text___laaJ"> Limited Edition</p><h5 class="LimitedEditionDescription_title___zsBy">Purring Fantasy</h5></div><div class="Pulsometer_container__YNKll"><div><span class="Pulsometer_pulsometerText__Rh1pM">24 days left</span><br> <span class="Pulsometer_pulsometerTextTiny__rZtIW">or until 1000 pieces are sold</span></div></div></div>';

const unreleasedLimitedEditionTile =
  '<div class="LimitedEdtionItem_container__u5Hys"><a class="LimitedEdtionItem_link__fvSlp" href="/limited-edition/displate/7376541"></a><div class="LimitedEdtionItem_container__u5Hys undefined"><img alt="London Skyline" class="LimitedEdtionItem_limitedImage__lhLmN" src="https://static.displate.com/560x784/limited/2024-07-03/885edb11241ee5cfb91c3ca698c08eaa_fe5c27c7479ca9de26bc2f2703f723c8.jpg"><div class="LimitedCountdown_container__QEQgY"><img alt="counter" class="LimitedCountdown_image__0PtLv" src="https://assets-static-prod.displate.com/next-assets/public/images/limited-edition/upcoming.svg"><div class="LimitedCountdown_counterContainer__F0qhY"><span class="LimitedCountdown_counterItem__fN7Yn">00d</span><span class="LimitedCountdown_counterItem__fN7Yn">02h</span><span class="LimitedCountdown_counterItem__fN7Yn">07m</span><span class="LimitedCountdown_counterItem__fN7Yn">07s</span></div></div></div><div class="LimitedEditionDescription_container__x8KSI"><p class="LimitedEditionDescription_text___laaJ"> Limited Edition</p><h5 class="LimitedEditionDescription_title___zsBy">London Skyline</h5></div></div>';

const soldOutLimitedEditionTile =
  '<div class="LimitedEdtionItem_container__u5Hys"><a class="LimitedEdtionItem_link__fvSlp" href="/limited-edition/displate/7292064"></a><div class="LimitedEdtionItem_container__u5Hys"><img alt="Incendium" class="LimitedEdtionItem_limitedImage__lhLmN" src="https://static.displate.com/560x784/limited/2024-05-22/3501402d04dbd84e8d2ef579f821a5c2_142281a31f871fb5f86c9e42f8c6cbad.jpg"><div class="SoldOut_container__Rmhv8"><img alt="sold-out" class="SoldOut_image__jA67m" src="https://assets-static-prod.displate.com/next-assets/public/images/limited-edition/soldout.svg"></div></div></div>';

const oldReleasedLimitedEditionTile =
  '<div class="swiper-slide swiper-slide-next" style="margin-right: 32px;"><a class="displate-tile--limited d__relative" href="/limited-edition/displate/7376515"><span class=" lazy-load-image-background opacity lazy-load-image-loaded" style="color: transparent; display: inline-block;"><img alt="" class="img--responsive slider-image" draggable="false" src="https://static.displate.com/560x784/limited/2024-06-24/ed7240961425e3924e7a1d614586f4e1_519e89108273735e400c205309344000.jpg"></span><div class="price-wrapper"><div class="price">$299</div></div><div class="limited-edition-tile-label"><p>Ultra Limited Edition</p><h5>Nocturnal Messenger</h5></div><div style="text-align: center;"><p style="font-size: 0.875rem; font-weight: 600; margin-top: 4px;">432 / 600</p></div><div class="editions__pulsometer  editions__pulsometer--landing"><p class="text text--small"><span class="text--bold">24 days left</span><br> <span class="text--tiny">or until 600 pieces are sold</span></p></div></a></div>';

const oldUnreleasedLimitedEditionTile =
  '<div class="swiper-slide swiper-slide-active" style="margin-right: 32px;"><a class="displate-tile--limited d__relative displate-tile--limited-upcoming" href="/limited-edition/displate/7376541"><span class=" lazy-load-image-background opacity lazy-load-image-loaded" style="color: transparent; display: inline-block;"><img alt="" class="img--responsive slider-image" draggable="false" src="https://static.displate.com/560x784/limited/2024-07-03/885edb11241ee5cfb91c3ca698c08eaa_fe5c27c7479ca9de26bc2f2703f723c8.jpg"></span><div class="displate-tile--limited-upcoming-counter"><span>0d</span><span>2h</span><span>8m</span><span>50s</span></div><div class="price-wrapper"><div class="price">$149</div></div><div class="limited-edition-tile-label"><p>Limited Edition</p><h5>London Skyline</h5></div><div style="text-align: center;"><p style="font-size: 0.875rem; font-weight: 600; margin-top: 4px;">700 / 700</p></div></a></div>';

function getHtmlAsDomElement(text: string): Element {
  const dom = new JSDOM(text);
  return dom.window.document.documentElement;
}

function getFileAsDocument(path: string): Document {
  const text = fs.readFileSync(path);
  const dom = new JSDOM(text);
  return dom.window.document;
}

describe("DOM query", () => {
  test("findLimitedEditionTiles() on all LEs page", () => {
    const document = getFileAsDocument("test/limited-editions.html");
    const tiles = findLimitedEditionTiles(document);
    expect(tiles.length).toEqual(37);
    const itemCollectionIds = tiles.map((tile) =>
      getItemCollectionIdFromTile(tile),
    );
    expect(itemCollectionIds).toStrictEqual([
      7376525, 7376515, 7368056, 7376546, 7376541, 7108428, 7344305, 7344298,
      7331808, 7292064, 7292072, 7289671, 7313087, 7292079, 7282997, 7292026,
      7282927, 7282918, 7274760, 7235082, 7235059, 7235067, 7222278, 7108438,
      7222270, 6846361, 7154557, 7213144, 7154426, 7108407, 7154560, 7108421,
      7154555, 7154552, 7108402, 7108331, 7047609,
    ]);
  });

  test("findLimitedEditionTiles() on PDP page", () => {
    const document = getFileAsDocument("test/limited-edition-pdp.html");
    const tiles = findLimitedEditionTiles(document);
    expect(tiles.length).toEqual(4);
    const itemCollectionIds = tiles.map((tile) =>
      getItemCollectionIdFromTile(tile),
    );
    expect(itemCollectionIds).toStrictEqual([
      7376541, 7376546, 7376525, 7376515,
    ]);
  });

  test("findProductPageProductBox()", () => {
    const document = getFileAsDocument("test/limited-edition-pdp.html");
    const pdpBox = findProductPageProductBox(document);
    expect(pdpBox).toBeDefined();

    const documentMissingPdpBox = getFileAsDocument(
      "test/limited-editions.html",
    );
    const missingPdpBox = findProductPageProductBox(documentMissingPdpBox);
    expect(missingPdpBox).toBeNull();
  });

  test("getItemCollectionIdFromTile()", () => {
    expect(
      getItemCollectionIdFromTile(
        getHtmlAsDomElement(releasedLimitedEditionTile),
      ),
    ).toEqual(7376525);

    expect(
      getItemCollectionIdFromTile(
        getHtmlAsDomElement(unreleasedLimitedEditionTile),
      ),
    ).toEqual(7376541);

    expect(
      getItemCollectionIdFromTile(
        getHtmlAsDomElement(soldOutLimitedEditionTile),
      ),
    ).toEqual(7292064);

    expect(
      getItemCollectionIdFromTile(
        getHtmlAsDomElement(oldReleasedLimitedEditionTile),
      ),
    ).toEqual(7376515);

    expect(
      getItemCollectionIdFromTile(
        getHtmlAsDomElement(oldUnreleasedLimitedEditionTile),
      ),
    ).toEqual(7376541);
  });
});
