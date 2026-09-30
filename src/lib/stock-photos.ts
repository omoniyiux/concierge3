import type { PageDocument, PageImage, PageSection } from "./types";

/* ============================================================================
   STOCK PHOTOGRAPHY FOR THE TEMPLATES
   ----------------------------------------------------------------------------
   Every photo here is from Unsplash under the Unsplash License, which allows
   free commercial use without attribution, and was found with the free-licence
   filter on (no Unsplash+ images). They are hotlinked from images.unsplash.com,
   which is what Unsplash asks for rather than re-hosting.

   They are stand-ins. A template looks like a finished site because of them,
   but a stranger's garden is not the owner's work, so the launch checklist
   counts them and asks the owner to swap in their own before going live —
   see `isStockImage`.
   ========================================================================== */

export interface PhotoRef {
  /** Unsplash's photo key, `photo-<timestamp>-<hash>`. */
  id: string;
  alt: string;
}

export interface TemplatePhotos {
  hero: PhotoRef;
  /** The second picture some hero layouts use — an inset, or the other half. */
  secondary: PhotoRef;
  services: PhotoRef[];
  gallery: PhotoRef[];
  about: PhotoRef;
  /** Behind the closing call to action. */
  cta: PhotoRef;
}

const HOST = "https://images.unsplash.com";

/** A sized, cropped URL. Width is what the layout needs, never the original. */
export const photoUrl = (ref: PhotoRef, width: number, height?: number): string =>
  `${HOST}/${ref.id}?auto=format&fit=crop&w=${width}${height ? `&h=${height}` : ""}&q=80`;

export const photo = (ref: PhotoRef, width: number, height?: number): PageImage => ({
  src: photoUrl(ref, width, height),
  alt: ref.alt,
});

/** True for a template stand-in, so the owner can be asked to replace it. */
export const isStockImage = (src: string | undefined): boolean => Boolean(src?.startsWith(`${HOST}/`));

/**
 * Stand-ins a visitor would actually see: enabled sections only, and only the
 * pictures the chosen layout draws — a services list shows no photographs, and
 * only the editorial hero shows its inset.
 */
export function stockImageCount(doc: PageDocument): number {
  const shown = (section: PageSection): unknown => {
    switch (section.kind) {
      case "hero":
        return section.content.layout === "editorial" ? section.content : { ...section.content, secondaryImage: undefined };
      case "services":
        return section.content.layout === "list" ? null : section.content;
      default:
        return section.content;
    }
  };
  return doc.pages
    .flatMap((p) => p.sections.filter((s) => s.enabled))
    .reduce((n, s) => n + (JSON.stringify(shown(s)) ?? "").split(`${HOST}/`).length - 1, 0);
}

export const TEMPLATE_PHOTOS: Record<string, TemplatePhotos> = {
  agency: {
    hero: { id: "photo-1787647559700-529fab8e431c", alt: "A diverse group of four people collaborating in a colorful modern workspace" },
    secondary: { id: "photo-1572021335469-31706a17aaef", alt: "Four coworkers smiling around laptop at table" },
    services: [{ id: "photo-1625232480886-f0c38e7a6a5e", alt: "A book sitting on top of a wooden table" }, { id: "photo-1582005450386-52b25f82d9bb", alt: "3 women sitting on chair in front of table with laptop computers" }, { id: "photo-1504868584819-f8e8b4b6d7e3", alt: "Turned on black and grey laptop computer" }],
    gallery: [{ id: "photo-1716703432522-d6d2aab1c993", alt: "A room with a wooden wall and a bench" }, { id: "photo-1715593949273-09009558300a", alt: "A room with a desk and a chair" }, { id: "photo-1519389950473-47ba0277781c", alt: "People sitting down near table with assorted laptop computers" }],
    about: { id: "photo-1758873268663-5a362616b5a7", alt: "Four diverse colleagues standing together in an office" },
    cta: { id: "photo-1716703435551-4326ab111ae2", alt: "A room with a bunch of stairs in it" },
  },
  coach: {
    hero: { id: "photo-1745434159123-5b99b94206ca", alt: "A smiling woman poses for a portrait" },
    secondary: { id: "photo-1517971129774-8a2b38fa128e", alt: "Woman sitting in front of black table writing on white book near window" },
    services: [{ id: "photo-1573497620053-ea5300f94f21", alt: "Two women sitting on chair" }, { id: "photo-1522202176988-66273c2fd55f", alt: "Three people sitting in front of table laughing together" }, { id: "photo-1569360556894-15dca0c6ff1a", alt: "Person writing on book" }],
    gallery: [{ id: "photo-1550592704-6c76defa9985", alt: "Person holding on red pen while writing on book" }, { id: "photo-1604762524889-3e2fcc145683", alt: "Green plant on white ceramic pot" }, { id: "photo-1538045698727-ac45d4365100", alt: "Selective focus photography of pen" }],
    about: { id: "photo-1619539465730-fea9ebf950f8", alt: "Woman in brown long sleeve shirt" },
    cta: { id: "photo-1643148636630-0b0fb138fc74", alt: "A person writing on a notebook with a pen" },
  },
  realestate: {
    hero: { id: "photo-1580587771525-78b9dba3b914", alt: "White and brown concrete building under blue sky during daytime" },
    secondary: { id: "photo-1666585958641-4f70887372a1", alt: "A living room with a couch and a coffee table" },
    services: [{ id: "photo-1666585958641-4f70887372a1", alt: "A living room with a couch and a coffee table" }, { id: "photo-1698994705178-d244d73ea573", alt: "A house on a hill surrounded by trees and rocks" }, { id: "photo-1632829882891-5047ccc421bc", alt: "A living room filled with furniture and a fire place" }],
    gallery: [{ id: "photo-1635006459494-c9b9665a666e", alt: "A modern house with a walkway leading to it" }, { id: "photo-1707299231603-6c0a93e0f7fa", alt: "A living room with a chair and a vase of flowers" }, { id: "photo-1719887805632-de5be825f72b", alt: "A house with a lot of windows and palm trees" }],
    about: { id: "photo-1615800002234-05c4d488696c", alt: "Green throw pillow on white sofa" },
    cta: { id: "photo-1721815693498-cc28507c0ba2", alt: "A two story house with a lot of windows and balconies" },
  },
  restaurant: {
    hero: { id: "photo-1667388969250-1c7220bf3f37", alt: "A room with tables and chairs" },
    secondary: { id: "photo-1579751626657-72bc17010498", alt: "Pizza on brown wooden table" },
    services: [{ id: "photo-1653611540493-b3a896319fbf", alt: "A wooden table topped with bowls of food" }, { id: "photo-1748540459503-19efc015143b", alt: "A delicious spread of food ready for eating" }, { id: "photo-1636405189493-181ecf851006", alt: "A restaurant with a tree in the middle of the room" }],
    gallery: [{ id: "photo-1622880833523-7cf1c0bd4296", alt: "A pizza with melted cheese and tomato sauce baking in a wood-fired oven" }, { id: "photo-1607430986088-a51ddbc7cc6e", alt: "Cooked food on black bowl" }, { id: "photo-1467003909585-2f8a72700288", alt: "Salmon fillet with salsa and red wine" }],
    about: { id: "photo-1622140739492-f82f386260b5", alt: "Brown wooden table and chairs" },
    cta: { id: "photo-1489564239502-7a532064e1c2", alt: "Man standing beside fireplace facing backwards" },
  },
  wellness: {
    hero: { id: "photo-1693578538512-fc66f318c833", alt: "A couple of chairs sitting next to each other in a room" },
    secondary: { id: "photo-1745327883508-b6cd32e5dde5", alt: "Massage therapist giving a back massage" },
    services: [{ id: "photo-1639162906614-0603b0ae95fd", alt: "A woman getting a back massage at a spa" }, { id: "photo-1761718210089-ba3bb5ccb54f", alt: "A person receiving a facial treatment" }, { id: "photo-1583417657209-d3dd44dc9c09", alt: "Brown wooden round table near gray concrete wall" }],
    gallery: [{ id: "photo-1729003702131-51807464dcec", alt: "A large swimming pool with a lounge chair next to it" }, { id: "photo-1630835425197-50feeba99ecd", alt: "White and black round table near white wall" }, { id: "photo-1741522509438-a120c0bb5e88", alt: "Massage is being administered to a person's back" }],
    about: { id: "photo-1683408640631-2c99fff964d7", alt: "A woman is laying down with her eyes closed" },
    cta: { id: "photo-1776763255459-99ddd8eebbfc", alt: "Indoor swimming pool with wooden walls and lounge chairs" },
  },
  saas: {
    hero: { id: "photo-1568658176307-bfbd2873abda", alt: "Two smiling men looking at MacBook" },
    secondary: { id: "photo-1608222351212-18fe0ec7b13b", alt: "Black and silver laptop computer" },
    services: [{ id: "photo-1608222351212-18fe0ec7b13b", alt: "Black and silver laptop computer" }, { id: "photo-1522202176988-66273c2fd55f", alt: "Three people sitting in front of table laughing together" }, { id: "photo-1460925895917-afdab827c52f", alt: "Laptop computer on glass-top table" }],
    gallery: [{ id: "photo-1522071820081-009f0129c71c", alt: "Group of people using laptop computer" }, { id: "photo-1613347761493-4060c969cd28", alt: "Person using macbook pro on table" }, { id: "photo-1531538606174-0f90ff5dce83", alt: "Person touching and pointing MacBook Pro" }],
    about: { id: "photo-1543269865-0a740d43b90c", alt: "Two woman sitting near table using Samsung laptop" },
    cta: { id: "photo-1690378820474-b468b8ee64d3", alt: "A group of people sitting around a table with laptops" },
  },
  event: {
    hero: { id: "photo-1470229722913-7c0e2dbbafd3", alt: "Stage light front of audience" },
    secondary: { id: "photo-1535898331935-2d274aff0fbc", alt: "People eat on street foods" },
    services: [{ id: "photo-1722332998970-f2335db8ab6d", alt: "A crowd of people watching a concert on stage" }, { id: "photo-1552912470-ee2e96439539", alt: "Woman cooking street foods" }, { id: "photo-1501386761578-eac5c94b800a", alt: "Excited crowd cheering at concert or event" }],
    gallery: [{ id: "photo-1526139334526-f591a54b477c", alt: "People walking between food stalls under chinese lanterns" }, { id: "photo-1704908325720-1f8b2abb99b7", alt: "A group of people sitting around tables under tents" }, { id: "photo-1524368535928-5b5e00ddc76b", alt: "Band performing on stage in front of people" }],
    about: { id: "photo-1616658589225-aa7e64e59c13", alt: "People walking on street during night time" },
    cta: { id: "photo-1608479709386-98826dbb642b", alt: "Bokeh photography of city lights during night time" },
  },
  local: {
    hero: { id: "photo-1594498653385-d5172c532c00", alt: "Green grass field with trees" },
    secondary: { id: "photo-1622383563227-04401ab4e5ea", alt: "Gloved hands planting seedling in soil" },
    services: [{ id: "photo-1597201278257-3687be27d954", alt: "Lush flower beds and manicured shrubs in The Butchart Gardens in Victoria, Canada" }, { id: "photo-1728881652462-5984859ec3fb", alt: "A woman holding a bouquet of flowers in a garden" }, { id: "photo-1715090576114-c07384af2069", alt: "A patio with a table and chairs and a couch" }],
    gallery: [{ id: "photo-1778683326192-898fc982e6a6", alt: "A black cat walks through a lush garden" }, { id: "photo-1695616827909-6f147f22d40f", alt: "A garden filled with lots of different types of flowers" }, { id: "photo-1613544723371-23b514a78c85", alt: "White wooden bench on wooden deck" }],
    about: { id: "photo-1599778150914-88e98e0c3a3e", alt: "Brown and green sock on gray wooden surface" },
    cta: { id: "photo-1731336250733-d2996a1cd4f4", alt: "Tables and chairs are lined up on the outside patio" },
  },
  launch: {
    hero: { id: "photo-1622398285334-cad8e4052638", alt: "White and gray bottle on black rock near sea during daytime" },
    secondary: { id: "photo-1624469786827-13be4e09a992", alt: "Black bottle beside clear drinking glass on brown wooden table" },
    services: [{ id: "photo-1664714628878-9d2aa898b9e3", alt: "A white bottle with a black cap" }, { id: "photo-1568395216634-ab1b1e848751", alt: "Blue tumbler" }, { id: "photo-1544003484-3cd181d17917", alt: "Black Mizu stainless steel tumbler" }],
    gallery: [{ id: "photo-1598410924570-6e37b6c54fe6", alt: "Black and gray sports bottle on brown sand near body of water during daytime" }, { id: "photo-1559839914-17aae19cec71", alt: "Rocks glass beside half empty bottle on white surface" }, { id: "photo-1624469786827-13be4e09a992", alt: "Black bottle beside clear drinking glass on brown wooden table" }],
    about: { id: "photo-1598410924570-6e37b6c54fe6", alt: "Black and gray sports bottle on brown sand near body of water during daytime" },
    cta: { id: "photo-1559839914-17aae19cec71", alt: "Rocks glass beside half empty bottle on white surface" },
  },
  atelier: {
    hero: { id: "photo-1626111584217-3bbb017216d1", alt: "Woman in silver hoop earrings" },
    secondary: { id: "photo-1709477542170-f11ee7d471a0", alt: "A woman is putting makeup on her face" },
    services: [{ id: "photo-1551392505-f4056032826e", alt: "Woman with pink and gold eyeshadow makeup" }, { id: "photo-1613966802194-d46a163af70d", alt: "Woman with pink lipstick holding white and purple toothbrush" }, { id: "photo-1563170446-9c3c0622d8a9", alt: "A woman with blue eyes and a white top" }],
    gallery: [{ id: "photo-1618068291962-bb16bfca7f0f", alt: "Woman with red lipstick holding yellow flower" }, { id: "photo-1709477542149-f4e0e21d590b", alt: "A woman getting her make up done with a brush" }, { id: "photo-1637325262485-5cf1abb98c05", alt: "A woman in a turtle neck sweater posing for a picture" }, { id: "photo-1600634999623-864991678406", alt: "White and gold perfume bottle" }],
    about: { id: "photo-1636023730877-233b9237d4ec", alt: "A woman getting her makeup done by another woman" },
    cta: { id: "photo-1533562389935-457b1ae48a39", alt: "Macro photograph of eyeshadow palette" },
  },
  florist: {
    hero: { id: "photo-1560453497-fdcb351a0c55", alt: "Woman wearing gray cardigan holding flower bouquet" },
    secondary: { id: "photo-1572454591674-2739f30d8c40", alt: "Pink, beige, and red flower bouquet in clear glass vase" },
    services: [{ id: "photo-1497276236755-0f85ba99a126", alt: "Bouquet of pink carnation in glass vase" }, { id: "photo-1709294728779-6be509d45255", alt: "A woman arranging flowers in a flower shop" }, { id: "photo-1523694576729-dc99e9c0f9b4", alt: "Person holding beige and white flower bouquet" }],
    gallery: [{ id: "photo-1561334251-b306baba437a", alt: "White building with baskets of plants at the front" }, { id: "photo-1531120364508-a6b656c3e78d", alt: "Assorted-color flowers on brown wood" }, { id: "photo-1487070183336-b863922373d4", alt: "Assorted flower bouquet near flower shop" }, { id: "photo-1599791095997-5cf38bb5ff69", alt: "Bouquet of red and white roses" }],
    about: { id: "photo-1586973698216-0c4c285d7afd", alt: "Woman in black long sleeve shirt holding red and white flower bouquet" },
    cta: { id: "photo-1491994336086-44f5d76dd8f2", alt: "Bouquet of assorted-color tulip lot" },
  },
  smokehouse: {
    hero: { id: "photo-1679711246825-1f2bd51b16d0", alt: "A rack of ribs cooking on a grill" },
    secondary: { id: "photo-1627947063935-55577ec3c2e1", alt: "Person cooking on grill with fire" },
    services: [{ id: "photo-1544025162-d76694265947", alt: "Roasted ribs with sliced tomatoes and potatoes" }, { id: "photo-1586058584825-c1e87ed735b4", alt: "Grilled meat on charcoal grill" }, { id: "photo-1629600928749-31db73b70a28", alt: "Brown and black bread on white table" }],
    gallery: [{ id: "photo-1629976628882-08f25d952f09", alt: "Burning fire on charcoal grill" }, { id: "photo-1529193591184-b1d58069ecdd", alt: "Board of grilled meats" }, { id: "photo-1503220178855-e31ec372b8ad", alt: "Steak on charcoal grill with fire" }],
    about: { id: "photo-1495988840227-a5986a3be9fc", alt: "Six sausages on black charcoal grill" },
    cta: { id: "photo-1558030137-a56c1b004fa3", alt: "Meat on grill" },
  },
  athletics: {
    hero: { id: "photo-1526676317768-d9b14f15615a", alt: "A runner pushing off starting blocks on a red track during a race" },
    secondary: { id: "photo-1548690312-e3b507d8c110", alt: "Woman holding black rope" },
    services: [{ id: "photo-1618688862225-ac941a9da58f", alt: "Man in black t-shirt and black shorts standing on black and white basketball hoop" }, { id: "photo-1617085606193-6b17105cff2a", alt: "Woman in pink sports bra and black leggings doing yoga during daytime" }, { id: "photo-1556817411-31ae72fa3ea0", alt: "A person lifting a heavy barbell from a black rubber gym floor" }],
    gallery: [{ id: "photo-1583051663501-de1f00bd6ad4", alt: "Brown and white chess board" }, { id: "photo-1632077804406-188472f1a810", alt: "A row of kettles lined up in a gym" }, { id: "photo-1541534741688-6078c6bfb5c5", alt: "Woman doing weight lifting" }],
    about: { id: "photo-1526506118085-60ce8714f8c5", alt: "Grayscale photo of man working out" },
    cta: { id: "photo-1584415942461-0b87dda9cc2b", alt: "A blue running track with white lane markings and a large number seven" },
  },
  therapy: {
    hero: { id: "photo-1680676960765-f18115aa7390", alt: "A living room filled with furniture and a plant" },
    secondary: { id: "photo-1579017308347-e53e0d2fc5e9", alt: "Woman writing in notebook with pen" },
    services: [{ id: "photo-1714976694867-bc0e012fab70", alt: "A woman sitting on a couch talking to another woman" }, { id: "photo-1573495804664-b1c0849525af", alt: "Shallow focus photo of woman in beige open cardigan" }, { id: "photo-1594997652537-2e2dce4ebf28", alt: "Woman in white button up shirt holding white braille paper" }],
    gallery: [{ id: "photo-1604762525953-2c80447cc4a6", alt: "Green plant in white pot" }, { id: "photo-1550592704-6c76defa9985", alt: "Person holding on red pen while writing on book" }, { id: "photo-1567225557594-88d73e55f2cb", alt: "Snake plant in vase" }, { id: "photo-1643148636630-0b0fb138fc74", alt: "A person writing on a notebook with a pen" }],
    about: { id: "photo-1758273241078-8eec353836be", alt: "Two women talking in a therapy session" },
    cta: { id: "photo-1680983468499-7e6690652f83", alt: "A bunch of plants that are on a shelf" },
  },
  salon: {
    hero: { id: "photo-1629397685944-7073f5589754", alt: "A hairstylist using a curling iron on a client in a salon" },
    secondary: { id: "photo-1560869713-7d0a29430803", alt: "Person holding gray hair curler" },
    services: [{ id: "photo-1580618672591-eb180b1a973f", alt: "A hairstylist using a blow dryer and round brush on a client's hair" }, { id: "photo-1554519934-e32b1629d9ee", alt: "Person wearing black top" }, { id: "photo-1635273051937-a0ddef9573b6", alt: "A man getting his hair cut by a barber" }],
    gallery: [{ id: "photo-1560066984-138dadb4c035", alt: "Grayscale photo of woman using laptop near three salon chairs" }, { id: "photo-1559599101-f09722fb4948", alt: "Three women holding scissors and brush" }, { id: "photo-1600948836101-f9ffda59d250", alt: "Three black salon chairs facing circular mirrors on a dark wall in a salon" }],
    about: { id: "photo-1562322140-8baeececf3df", alt: "Woman holding hair dryer" },
    cta: { id: "photo-1536520002442-39764a41e987", alt: "Salon interior with lighted pendant lamps" },
  },
  photographer: {
    hero: { id: "photo-1721956514577-f6c15d73e585", alt: "A woman with red hair is sitting down" },
    secondary: { id: "photo-1491796014055-e6835cdcd4c6", alt: "Black and gray Canon AE-1 camera on gray sand under brown dock near body of water at daytime" },
    services: [{ id: "photo-1667053508464-eb11b394df83", alt: "A woman with a straight face" }, { id: "photo-1606216836537-eea72a939072", alt: "Man in black suit kissing woman in white wedding dress" }, { id: "photo-1543785832-0781599790c2", alt: "Black cameras on white surface" }],
    gallery: [{ id: "photo-1581841064838-a470c740e8ee", alt: "Woman in black hat and green shirt" }, { id: "photo-1654765437547-6b572f52ee1a", alt: "A woman in a black dress posing for a picture" }, { id: "photo-1506863530036-1efeddceb993", alt: "Grayscale photo of woman wearing necklace and top" }, { id: "photo-1512813498716-3e640fed3f39", alt: "Woman sitting on brown wooden floor while holding black DSLR camera in room" }],
    about: { id: "photo-1549981832-2ba2ee913334", alt: "Woman holding black DSLR camera" },
    cta: { id: "photo-1668414312535-1da51e4f81c3", alt: "Logo" },
  },
  weddings: {
    hero: { id: "photo-1606216836537-eea72a939072", alt: "Man in black suit kissing woman in white wedding dress" },
    secondary: { id: "photo-1519225421980-715cb0215aed", alt: "Clear wine glass lot on table" },
    services: [{ id: "photo-1561593367-66c79c2294e6", alt: "Dining table setting" }, { id: "photo-1618566864264-fb013f791da4", alt: "Man and woman holding hands" }, { id: "photo-1562050344-f7ad946cee35", alt: "A long dining table set with white plates, candles, and glass bottles" }],
    gallery: [{ id: "photo-1606216794079-73f85bbd57d5", alt: "Woman in white wedding dress" }, { id: "photo-1550005809-91ad75fb315f", alt: "Woman holding beige-petaled flower bouquet" }, { id: "photo-1511795409834-ef04bbd61622", alt: "Elegant table setting with floral centerpiece" }, { id: "photo-1519379169146-d4b170447caa", alt: "Bride and groom on green grass field" }],
    about: { id: "photo-1583254211338-57f4b21ed0f5", alt: "Woman in black blazer holding bouquet of flowers" },
    cta: { id: "photo-1532712938310-34cb3982ef74", alt: "A bride and groom walking on a hill" },
  },
  builders: {
    hero: { id: "photo-1626385785701-a0d3b879de2c", alt: "Gray concrete building under blue sky during daytime" },
    secondary: { id: "photo-1694521787193-9293daeddbaa", alt: "Three construction workers in high-visibility vests and hard hats measuring a concrete block wall" },
    services: [{ id: "photo-1656733911001-16912b79d2bf", alt: "A room with a wood floor and a bench" }, { id: "photo-1635424709845-3a85ad5e1f5e", alt: "A couple of people that are on a roof" }, { id: "photo-1626885930974-4b69aa21bbf9", alt: "Two construction workers in safety vests at site" }],
    gallery: [{ id: "photo-1587582423116-ec07293f0395", alt: "Construction worker in hard hat on building frame" }, { id: "photo-1726589004565-bedfba94d3a2", alt: "A man on a roof working on a roof" }, { id: "photo-1785585508559-53a645d498f4", alt: "Building construction with exposed wooden beams and scaffolding" }],
    about: { id: "photo-1558227691-41ea78d1f631", alt: "Construction worker men holding hammer" },
    cta: { id: "photo-1603439810849-5e013dc3ce73", alt: "Brown wooden frame under blue sky during daytime" },
  },
  retreat: {
    hero: { id: "photo-1628620801061-51e05d0ad917", alt: "Brown wooden house near lake surrounded by green trees during daytime" },
    secondary: { id: "photo-1680703486830-1b5af60635d7", alt: "A living room filled with furniture and a fire place" },
    services: [{ id: "photo-1631630259742-c0f0b17c6c10", alt: "A room with a stove and a chair in it" }, { id: "photo-1591825729269-caeb344f6df2", alt: "White sofa set near window" }, { id: "photo-1669695507840-348e90efd5e4", alt: "A bench on a deck" }],
    gallery: [{ id: "photo-1583878594798-c31409c8ab4a", alt: "Brown wooden house near green trees and mountain under white clouds and blue sky during daytime" }, { id: "photo-1698933787104-3f91cf25909c", alt: "A wood burning stove inside of a wooden cabin" }, { id: "photo-1570793005386-840846445fed", alt: "Brown wooden cabin near trees during day" }],
    about: { id: "photo-1551927411-95e412943b58", alt: "Woman sitting on bed watching by the window during winter" },
    cta: { id: "photo-1610048899906-d8f64bc45464", alt: "Brown wooden house on lake near mountain" },
  },
  skincare: {
    hero: { id: "photo-1646457417455-77a66a9fcf34", alt: "A woman is smiling and holding a piece of white powder on her face" },
    secondary: { id: "photo-1580870069867-74c57ee1bb07", alt: "Four skincare products from The Ordinary arranged with pink flower petals on a table" },
    services: [{ id: "photo-1620916566398-39f1143ab7be", alt: "A white tube of body lotion on a soft white fabric surface" }, { id: "photo-1598440947619-2c35fc9aa908", alt: "Assorted skincare products and a green jade roller on a white striped towel" }, { id: "photo-1748543668676-ea8241cb3886", alt: "Skincare products with leaves on a light background" }],
    gallery: [{ id: "photo-1643379855542-82c0c7483f3a", alt: "A woman with a white spot on her face" }, { id: "photo-1612817288484-6f916006741a", alt: "Skincare products with smooth river stones and evergreen sprigs on a light surface" }, { id: "photo-1648203276014-20f97ba1f817", alt: "A woman with a towel on her head and a jar of cream on her face" }],
    about: { id: "photo-1620916297397-a4a5402a3c6c", alt: "Person holding black glass bottle" },
    cta: { id: "photo-1728727217834-b190862837a3", alt: "A woman in a white shirt is smiling and touching her face" },
  },
  grooming: {
    hero: { id: "photo-1719464454959-9cf304ef4774", alt: "A small white dog being cut with a pair of scissors" },
    secondary: { id: "photo-1611173622933-91942d394b04", alt: "Brown pomeranian wearing pink towel" },
    services: [{ id: "photo-1597595735781-6a57fb8e3e3d", alt: "Brown and white short coated dog" }, { id: "photo-1625321171045-1fea4ac688e9", alt: "Woman in white robe holding hair blower" }, { id: "photo-1537151608828-ea2b11777ee8", alt: "Short-coated brown and white puppy" }],
    gallery: [{ id: "photo-1591160690555-5debfba289f0", alt: "Golden retriever puppy on focus photo" }, { id: "photo-1678153188688-0dc45722708a", alt: "A small brown and white dog wearing a green bandana" }, { id: "photo-1503256207526-0d5d80fa2f47", alt: "Long-coated black and white dog during daytime" }, { id: "photo-1709771818873-57feeea88f41", alt: "A small dog wearing a bandana on a pink background" }],
    about: { id: "photo-1528846104175-4fd300ee59da", alt: "Man brushing dog hair" },
    cta: { id: "photo-1548199973-03cce0bbc87b", alt: "Two brown and white dogs running dirt road during daytime" },
  },
};
