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

const swiperReleasedLimitedEditionTile =
  '<div class="swiper-slide swiper-slide-next" style="margin-right: 32px;"><a class="displate-tile--limited d__relative" href="/limited-edition/displate/7376515"><span class=" lazy-load-image-background opacity lazy-load-image-loaded" style="color: transparent; display: inline-block;"><img alt="" class="img--responsive slider-image" draggable="false" src="https://static.displate.com/560x784/limited/2024-06-24/ed7240961425e3924e7a1d614586f4e1_519e89108273735e400c205309344000.jpg"></span><div class="price-wrapper"><div class="price">$299</div></div><div class="limited-edition-tile-label"><p>Ultra Limited Edition</p><h5>Nocturnal Messenger</h5></div><div style="text-align: center;"><p style="font-size: 0.875rem; font-weight: 600; margin-top: 4px;">432 / 600</p></div><div class="editions__pulsometer  editions__pulsometer--landing"><p class="text text--small"><span class="text--bold">24 days left</span><br> <span class="text--tiny">or until 600 pieces are sold</span></p></div></a></div>';

const swiperUnreleasedLimitedEditionTile =
  '<div class="swiper-slide swiper-slide-active" style="margin-right: 32px;"><a class="displate-tile--limited d__relative displate-tile--limited-upcoming" href="/limited-edition/displate/7376541"><span class=" lazy-load-image-background opacity lazy-load-image-loaded" style="color: transparent; display: inline-block;"><img alt="" class="img--responsive slider-image" draggable="false" src="https://static.displate.com/560x784/limited/2024-07-03/885edb11241ee5cfb91c3ca698c08eaa_fe5c27c7479ca9de26bc2f2703f723c8.jpg"></span><div class="displate-tile--limited-upcoming-counter"><span>0d</span><span>2h</span><span>8m</span><span>50s</span></div><div class="price-wrapper"><div class="price">$149</div></div><div class="limited-edition-tile-label"><p>Limited Edition</p><h5>London Skyline</h5></div><div style="text-align: center;"><p style="font-size: 0.875rem; font-weight: 600; margin-top: 4px;">700 / 700</p></div></a></div>';

const oldReleasedLimitedEditionTile =
  '<a class="displate-tile--limited d__relative" href="/limited-edition/displate/7376541"><span class=" lazy-load-image-background opacity lazy-load-image-loaded" style="color: transparent; display: inline-block;"><img alt="" class="img--responsive slider-image" draggable="false" src="https://static.displate.com/560x784/limited/2024-07-03/885edb11241ee5cfb91c3ca698c08eaa_fe5c27c7479ca9de26bc2f2703f723c8.jpg"></span><div class="limited-edition-tile-label"><p>Limited Edition</p><h5>London Skyline</h5></div><div class="editions__pulsometer  editions__pulsometer--landing"><p class="text text--small"><span class="text--bold">29 days left</span><br> <span class="text--tiny">or until 700 pieces are sold</span></p></div></a>';

const oldUnreleasedLimitedEditionTile =
  '<a class="displate-tile--limited d__relative displate-tile--limited-upcoming" href="/limited-edition/displate/7398528"><span class=" lazy-load-image-background opacity lazy-load-image-loaded" style="color: transparent; display: inline-block;"><img alt="" class="img--responsive slider-image" draggable="false" src="https://static.displate.com/560x784/limited/2024-07-11/214203d8a6571817b664c928531145c3_f99292da24ee4bf0342dfd3c90c5a213.jpg"></span><div class="displate-tile--limited-upcoming-counter"><span>5d</span><span>2h</span><span>22m</span><span>10s</span></div><div class="limited-edition-tile-label"><p>Limited Edition</p><h5>Silver Bamboo Forest</h5></div></a>';

const oldSoldOutLimitedEditionTile =
  '<a class="displate-tile--limited d__relative displate-tile--limited-soldout" href="/limited-edition/displate/7313087"><span class=" lazy-load-image-background opacity lazy-load-image-loaded" style="color: transparent; display: inline-block;"><img alt="" class="img--responsive slider-image" draggable="false" src="https://static.displate.com/560x784/limited/2024-05-08/edfc590805364938b4cc13da4f7b2c74_b29185775055cab09c5828491a107ad3.jpg"></span></a>';

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

  test("findLimitedEditionTiles() on all LEs page (old)", () => {
    const document = getFileAsDocument("test/limited-editions-old.html");
    const tiles = findLimitedEditionTiles(document);
    expect(tiles.length).toEqual(230);
    const itemCollectionIds = tiles.map((tile) =>
      getItemCollectionIdFromTile(tile),
    );
    expect(itemCollectionIds).toStrictEqual([
      7376541, 7376515, 7368056, 7398528, 7376546, 7376525, 7108428, 7344305,
      7344298, 7331808, 7292064, 7292072, 7289671, 7313087, 7292079, 7282997,
      7292026, 7282927, 7282918, 7235059, 7235082, 7274760, 7235067, 7222278,
      7108438, 7222270, 6846361, 7154557, 7213144, 7154426, 7108407, 7154560,
      7108421, 7154555, 7154552, 7108402, 7047609, 7108331, 7047576, 7047598,
      6648780, 6961892, 6874066, 6846370, 6958834, 6874053, 6501140, 6846292,
      6846331, 6648844, 6846335, 6895493, 6874041, 6267149, 6846326, 6846294,
      6846353, 6846357, 6839806, 6648745, 6648750, 6780094, 6646500, 6771437,
      6797271, 6648787, 6771451, 6751350, 6751359, 6323099, 6751343, 6596003,
      6698803, 6646487, 6382260, 6596006, 6633079, 6596004, 6596019, 6501186,
      6299156, 6196000, 6486185, 6407792, 6398010, 6398013, 6397983, 6308357,
      6227033, 6252666, 6227021, 6181143, 6120268, 6120241, 6120252, 6011333,
      6077956, 5930289, 6096734, 6050008, 5991520, 5987497, 5987488, 5987627,
      5854361, 5902920, 5903041, 5921079, 5928891, 5884443, 5781908, 5832319,
      5710685, 5473040, 5852812, 5821364, 5805014, 5812751, 5739805, 5553169,
      5760274, 5638147, 5737886, 5638144, 5619336, 5683373, 5655756, 5619334,
      5404133, 5473001, 5473037, 5404130, 5473017, 5495542, 5472936, 5447031,
      5472859, 5447039, 5404124, 5445065, 5404117, 5409167, 5409166, 5409162,
      5404116, 5391476, 5389905, 5377710, 5365047, 5352811, 5340677, 5328572,
      5318270, 5277967, 5264365, 5254832, 5241937, 5225550, 4992065, 5144160,
      4974133, 5098826, 4992003, 4974109, 5042861, 5026103, 5009350, 4991931,
      4974008, 4805389, 4925462, 4909641, 4805465, 4848333, 4825368, 4805416,
      4755849, 4734406, 4713436, 4690241, 4662130, 4634404, 4591243, 4570400,
      4549905, 4531608, 4511091, 4489153, 4464767, 4439252, 4418571, 4395752,
      4356782, 4333009, 4303905, 4209042, 4181831, 4153053, 4119373, 4073136,
      4040690, 3989646, 3997435, 3967492, 3950812, 3919033, 3888050, 3841442,
      3809589, 3768172, 3729716, 3671408, 3551861, 3466976, 3382563, 3281914,
      2908206, 2908108, 2895577, 2801764, 2716196, 2663620, 2519487, 2458633,
      2388976, 2344052, 2295351, 2175915, 2152065, 2145185,
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
        getHtmlAsDomElement(swiperReleasedLimitedEditionTile),
      ),
    ).toEqual(7376515);

    expect(
      getItemCollectionIdFromTile(
        getHtmlAsDomElement(swiperUnreleasedLimitedEditionTile),
      ),
    ).toEqual(7376541);

    expect(
      getItemCollectionIdFromTile(
        getHtmlAsDomElement(oldReleasedLimitedEditionTile),
      ),
    ).toEqual(7376541);

    expect(
      getItemCollectionIdFromTile(
        getHtmlAsDomElement(oldUnreleasedLimitedEditionTile),
      ),
    ).toEqual(7398528);

    expect(
      getItemCollectionIdFromTile(
        getHtmlAsDomElement(oldSoldOutLimitedEditionTile),
      ),
    ).toEqual(7313087);
  });
});
