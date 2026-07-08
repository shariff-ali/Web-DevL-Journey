/* ===========================================================
   THE LANDS BETWEEN COLLECTIBLES — Product Catalogue
   =========================================================== */

const PRODUCTS = [
  {
    id: "p01",
    name: "Malenia, Blade of Miquella",
    game: "Elden Ring",
    scale: "1/6",
    price: 18500,
    popularity: 98,
    stock: 4,
    rating: 4.9,
    images: [
      "assets/images/malenia_statue.png"
    ],
    desc: "A hand-painted resin statue of the Goddess of Rot, captured mid-Waterfowl Dance. Cast in cold-resin with a hand-aged bronze finish and individually petalled scarlet rot effects.",
    lore: "“I am Malenia, Blade of Miquella. And I have never known defeat.” — cast in resin, her body still seems to bloom with the rot she was born to carry."
  },
  {
    id: "p02",
    name: "The Nameless King, Storm Atop the Throne",
    game: "Dark Souls",
    scale: "1/4",
    price: 24900,
    popularity: 91,
    stock: 2,
    rating: 4.8,
    images: [
      "assets/images/nameless_king_statue.png"
    ],
    desc: "An immense diorama piece depicting the forgotten god astride his storm drake, lightning sculpted in clear resin and lit by an internal LED core (battery included).",
    lore: "Stricken from the annals of the gods, he stands forever atop a throne no one remembers — a storm given a name no one will speak."
  },
  {
    id: "p03",
    name: "Lady Maria of the Astral Clocktower",
    game: "Bloodborne",
    scale: "1/6",
    price: 16200,
    popularity: 88,
    stock: 6,
    rating: 4.7,
    images: [
      "assets/images/lady_maria_statue.png"
    ],
    desc: "Captured in her iconic dual-blade stance, this museum-grade statue recreates the silk and steel of the Astral Clocktower's final guardian down to individual thread weave.",
    lore: "Her blades remember every hunter who fell before them. Some say the resin still hums faintly with old blood echoes."
  },
  {
    id: "p04",
    name: "Margit, the Fell Omen",
    game: "Elden Ring",
    scale: "1/7",
    price: 9800,
    popularity: 76,
    stock: 9,
    rating: 4.5,
    images: [
      "assets/images/margit_statue.png"
    ],
    desc: "The gatekeeper of Stormveil rendered in dynamic combat pose, hammer mid-swing, cloak frozen in tattered motion. Includes interchangeable hand for dagger variant.",
    lore: "A mere obstacle, they call him. Yet none who met his hammer at the gate ever spoke of him so lightly again."
  },
  {
    id: "p05",
    name: "Artorias of the Abyss",
    game: "Dark Souls",
    scale: "1/6",
    price: 21000,
    popularity: 94,
    stock: 3,
    rating: 5.0,
    images: [
      "assets/images/artorias_statue.png"
    ],
    desc: "The legendary Abysswalker, Greatsword raised and Greatshield braced, sculpted with corrupted abyssal tendrils creeping along the base.",
    lore: "He once stood against the Abyss alone, and the Abyss remembers. Faint black mist coils permanently around the statue's display base."
  },
  {
    id: "p06",
    name: "Ebrietas, Daughter of the Cosmos",
    game: "Bloodborne",
    scale: "1/8",
    price: 14300,
    popularity: 81,
    stock: 5,
    rating: 4.6,
    images: [
      "assets/images/ebrietas_statue.png"
    ],
    desc: "A translucent-resin nightmare from the Altar of Despair, internally backlit to evoke the glow of insight made manifest.",
    lore: "Born of a Great One who pitied man's plight — and was devoured by it. Tentacles cast in semi-translucent violet resin."
  },
  {
    id: "p07",
    name: "Radahn, Starscourge",
    game: "Elden Ring",
    scale: "1/4",
    price: 27500,
    popularity: 89,
    stock: 2,
    rating: 4.9,
    images: [
      "assets/images/radahn_starscourge.jpg"
    ],
    desc: "A monumental two-figure diorama of the General astride Lambert, twin swords drawn against the falling stars of his own gravity magic.",
    lore: "Even gravity itself once bent to his will — now bound in resin, forever holding back the stars he gathered."
  },
  {
    id: "p08",
    name: "Gwyn, Lord of Cinder",
    game: "Dark Souls",
    scale: "1/6",
    price: 19900,
    popularity: 85,
    stock: 4,
    rating: 4.7,
    images: [
      "assets/images/gwyn_lord_of_cinder.jpg"
    ],
    desc: "The First Lord, hollowed and ablaze, sculpted at the very moment he links the fire. Hand-applied flame gradient with metallic gold leafing.",
    lore: "A lord who chose to burn rather than fade — his statue's flame coat is hand-torched by the studio's master painter."
  },
  {
    id: "p09",
    name: "The Doll, Hunter's Dream",
    game: "Bloodborne",
    scale: "1/7",
    price: 7200,
    popularity: 72,
    stock: 11,
    rating: 4.4,
    images: [
      "assets/images/Bloodborne The Doll, Hunter's Dream.png"
    ],
    desc: "A serene, porcelain-finish rendition of the silent caretaker of the Hunter's Dream, displayed seated upon the workshop's stone steps.",
    lore: "She waits, unaging, for hunters who may never return. Her porcelain face is hand-glazed to a soft matte sheen."
  },
  {
    id: "p10",
    name: "Elden Ring — Official Banner (Scarlet Rot Standard)",
    game: "Elden Ring",
    scale: "120x60cm",
    price: 2499,
    popularity: 68,
    stock: 14,
    rating: 4.5,
    images: [
      "assets/images/Elden Ring — Official Banner Scarlet Rot Standard.png"
    ],
    desc: "A woven wall banner printed on heavy cotton, edged with gold threads and a wooden rod for hanging.",
    lore: "A banner inspired by the rot-tinged heraldry seen across the scarred plains."
  },
  {
    id: "p11",
    name: "Elden Ring — Malenia Controller Skin (Limited)",
    game: "Elden Ring",
    scale: "Accessory",
    price: 899,
    popularity: 74,
    stock: 25,
    rating: 4.6,
    images: [
      "assets/images/malenia_controller_skin.png"
    ],
    desc: "Durable vinyl skin for dual analog controllers with high-res art and a non-slip matte finish.",
    lore: "Skins forged for those who duel beneath the rot-swept sun."
  },
  {
    id: "p12",
    name: "Elden Ring — Golden Seed Keychain",
    game: "Elden Ring",
    scale: "4cm",
    price: 499,
    popularity: 80,
    stock: 50,
    rating: 4.4,
    images: [
      "assets/images/Elden Ring — Golden Seed Keychain.png"
    ],
    desc: "A metal enamel keychain modeled after the Golden Seed. Polished and plated with antique bronze.",
    lore: "Carry a sliver of grace with you — a charm against the darkness."
  },
  {
    id: "p13",
    name: "Elden Ring — Rivers of Blood (Replica Katana)",
    game: "Elden Ring",
    scale: "Full-size Replica",
    price: 12999,
    popularity: 93,
    stock: 6,
    rating: 4.9,
    images: [
      "assets/images/rivers_of_blood_katana.png"
    ],
    desc: "A decorative full-size katana replica with painted blood-vein effects and display stand included.",
    lore: "A blade whispered about in taverns; its edge remembers the path of crimson rivers."
  },
  {
    id: "p14",
    name: "Elden Ring — Grafted Blade (Replica Greatsword)",
    game: "Elden Ring",
    scale: "Full-size Replica",
    price: 14900,
    popularity: 90,
    stock: 4,
    rating: 4.8,
    images: [
      "assets/images/grafted_blade_greatsword.png"
    ],
    desc: "A heavy greatsword replica cast in resin and finished with a faux-forged patina for display purposes.",
    lore: "Forged from grafted remnant steels and old prayer, this display piece hums faintly when touched."
  },
  {
    id: "p15",
    name: "Dark Souls — Castle Banner (Baneful Crest)",
    game: "Dark Souls",
    scale: "100x50cm",
    price: 2199,
    popularity: 64,
    stock: 12,
    rating: 4.3,
    images: [
      "assets/images/Dark Souls — Castle Banner.png"
    ],
    desc: "A heavyweight tapestry-style banner featuring the Baneful Crest with sewn edging and hanging rod.",
    lore: "Remnants of old banners still hang in ruined keeps — now reproduced for your hall."
  },
  {
    id: "p16",
    name: "Dark Souls — Ornstein Controller Skin (Gold Pike)",
    game: "Dark Souls",
    scale: "Accessory",
    price: 949,
    popularity: 70,
    stock: 20,
    rating: 4.5,
    images: [
      "assets/images/Dark Souls — Ornstein Controller Skin.png"
    ],
    desc: "A premium vinyl controller skin with metallic gold accents inspired by Ornstein's armor.",
    lore: "For those who hunt dragons in gilt and brass."
  },
  {
    id: "p17",
    name: "Dark Souls — Crest Shield Keychain",
    game: "Dark Souls",
    scale: "3.5cm",
    price: 399,
    popularity: 66,
    stock: 60,
    rating: 4.2,
    images: [
      "assets/images/Dark Souls — Crest Shield Keychain.png"
    ],
    desc: "A miniature shield keychain with enamel crest and stainless split ring.",
    lore: "A tiny ward for those who cross fog gates and cursed bridges."
  },
  {
    id: "p18",
    name: "Dark Souls — Artorias Greatsword (Replica)",
    game: "Dark Souls",
    scale: "Full-size Replica",
    price: 13999,
    popularity: 92,
    stock: 3,
    rating: 4.9,
    images: [
      "assets/images/artorias_greatsword_replica.png"
    ],
    desc: "A museum-quality replica of Artorias's greatsword, finished with a distressed edge and display plinth.",
    lore: "A blade that once walked the Abyss — its replica keeps the memory alive on pedestals."
  },
  {
    id: "p19",
    name: "Dark Souls — Black Knight Sword (Replica)",
    game: "Dark Souls",
    scale: "Full-size Replica",
    price: 11900,
    popularity: 86,
    stock: 5,
    rating: 4.7,
    images: [
      "assets/images/black_knight_sword_replica.jpg"
    ],
    desc: "A decorative replica of the Black Knight Sword with darkened steel finish and display stand.",
    lore: "Wrought in the burning fields, this blade's replica carries a hint of smoke in its grain."
  },
  {
    id: "p20",
    name: "Bloodborne — Hunter's Banner (Workshop Sigil)",
    game: "Bloodborne",
    scale: "110x55cm",
    price: 2399,
    popularity: 65,
    stock: 10,
    rating: 4.4,
    images: [
      "assets/images/Bloodborne — Hunter's Banner.png"
    ],
    desc: "A moody, gothic banner printed on heavy canvas — perfect for cloak-and-knife decor.",
    lore: "The Workshop's mark hangs where the fog is thickest; now it may hang in your study."
  },
  {
    id: "p21",
    name: "Bloodborne — Hunter's Mark Controller Skin",
    game: "Bloodborne",
    scale: "Accessory",
    price: 949,
    popularity: 72,
    stock: 22,
    rating: 4.6,
    images: [
      "assets/images/hunter-mark-controller.png"
    ],
    desc: "Matte-finish vinyl skin depicting arcane sigils and worn leather textures for comfortable grip.",
    lore: "A mark for those who hunt by moonlight and keep trophies of the old blood."
  },
  {
    id: "p22",
    name: "Bloodborne — Hunter's Keychain (Tiny Hunter)",
    game: "Bloodborne",
    scale: "3.8cm",
    price: 449,
    popularity: 69,
    stock: 55,
    rating: 4.3,
    images: [
      "assets/images/Hunter's Keychain Tiny Hunter.png"
    ],
    desc: "A small pewter keychain shaped like a hunter's saw cleaver — weathered finish for character.",
    lore: "Tiny but teeth-bearing, a reminder that monsters can be kept close."
  },
  {
    id: "p23",
    name: "Bloodborne — Ludwig's Holy Blade (Replica)",
    game: "Bloodborne",
    scale: "Full-size Replica",
    price: 12900,
    popularity: 91,
    stock: 4,
    rating: 4.8,
    images: [
      "assets/images/Ludwig's Holy Blade.png"
    ],
    desc: "A finely detailed replica of Ludwig's weapon with articulated crossguard and display mount.",
    lore: "A holy blade standing silent in the memory of old cathedral fights."
  },
  {
    id: "p24",
    name: "Bloodborne — Kirkhammer (Replica)",
    game: "Bloodborne",
    scale: "Full-size Replica",
    price: 11950,
    popularity: 88,
    stock: 3,
    rating: 4.7,
    images: [
      "assets/images/kirkhammer_replica.jpg"
    ],
    desc: "A weighty replica of a transforming hammer-sword with a display stand that locks into place.",
    lore: "A hammer once swung in frightful double-time; its echo lingers in crafted displays."
  }
];

function formatINR(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
