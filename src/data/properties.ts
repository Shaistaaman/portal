export interface PropertyDetailData {
  id: string;
  title: string;
  location: string;
  region: string;
  beds: number;
  baths: number;
  guests: number;
  size: string;
  images: string[];
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  description: string;
  insideDetails: string;
  terraceDetails: string;
  neighborhoodDetails: string;
}

import { IMG } from "./imageMap";

export const DEFAULT_PROPERTY: PropertyDetailData = {
  id: "tiber-luxury-penthouse",
  title: "Tiber Luxury Penthouse",
  location: "Rome, Italy",
  region: "Rome",
  beds: 2,
  baths: 2,
  guests: 2,
  size: "90x300 Sqm",
  pricePerNight: 120,
  cleaningFee: 100,
  serviceFee: 50,
  taxes: 25,
  images: [
    IMG.romePenthouse,
    IMG.romeRoof,
    IMG.curatedInterior,
    IMG.palazzoBath,
    IMG.italyProperty,
  ],
  description:
    "Step into the heart of Rome's grandeur at Tiber Penthouse, a luxurious sanctuary in the prestigious Prati neighborhood. With breathtaking 360-degree views of the Tiber River and the city's iconic monuments, this penthouse offers an exclusive experience of the Eternal City.",
  insideDetails:
    "Tompit, our brilliant artist and interior designer, masterfully renovated the interior with Kartell, Zara Home, Maison Du Monde, designer furniture and Knoll coffee tables, creating a unique atmosphere.",
  terraceDetails:
    "Experience unparalleled luxury on a spacious outdoor terrace designed for dining under the stars. Comfortably accommodating six guests, perched above the Eternal City this setting offers a breathtaking panoramic view of the cityscape.",
  neighborhoodDetails:
    "In the heart of Prati, a 20-minute walk from the Vatican, our penthouse offers panoramic views of the Lungotevere. From the terrace, admire the ancient waters of the Tiber River, St. Peter's Dome and the Altar of the Fatherland.",
};

export const PROPERTIES_DATA: PropertyDetailData[] = [
  // ——— Rome ———
  {
    id: "tiber-luxury",
    title: "Tiber Luxury Penthouse",
    location: "Rome, Italy",
    region: "Rome",
    beds: 4,
    baths: 2,
    guests: 5,
    size: "400sqm",
    pricePerNight: 120,
    cleaningFee: 100,
    serviceFee: 50,
    taxes: 25,
    images: [IMG.go, IMG.great, IMG.rome, IMG.romePenthouse, IMG.romeRoof],
    description:
      "Step into the heart of Rome's grandeur at Tiber Penthouse, a luxurious sanctuary in the prestigious Prati neighborhood. With breathtaking 360-degree views of the Tiber River and the city's iconic monuments.",
    insideDetails:
      "Masterfully renovated interior with Kartell, Zara Home, and designer furniture, creating a unique atmosphere of modern Italian elegance.",
    terraceDetails:
      "Experience unparalleled luxury on a spacious outdoor terrace designed for dining under the stars with panoramic views of the cityscape.",
    neighborhoodDetails:
      "In the heart of Prati, a 20-minute walk from the Vatican. From the terrace, admire St. Peter's Dome and the Altar of the Fatherland.",
  },
  {
    id: "art-gallery-penthouse",
    title: "Art Gallery Penthouse",
    location: "Rome, Italy",
    region: "Rome",
    beds: 4,
    baths: 2,
    guests: 5,
    size: "400sqm",
    pricePerNight: 150,
    cleaningFee: 100,
    serviceFee: 50,
    taxes: 25,
    images: [
      IMG.great,
      IMG.go,
      IMG.rome,
      IMG.curatedInterior,
      IMG.romePenthouse,
    ],
    description:
      "An exquisite art-filled penthouse featuring curated contemporary Italian artwork and stunning rooftop views. Perfect for art lovers seeking luxury in Rome's historic center.",
    insideDetails:
      "Gallery-quality lighting showcases rotating contemporary art exhibitions. Designer furniture complements the artistic atmosphere.",
    terraceDetails:
      "Private rooftop terrace with sunset views over Roman monuments. Ideal for intimate gatherings and alfresco dining.",
    neighborhoodDetails:
      "Located in Rome's historic center, walking distance to Trevi Fountain, Spanish Steps, and world-class dining.",
  },
  {
    id: "art-gallery-penthouse1",
    title: "Art Gallery Penthouse",
    location: "Rome, Italy",
    region: "Rome",
    beds: 4,
    baths: 2,
    guests: 5,
    size: "400sqm",
    pricePerNight: 150,
    cleaningFee: 100,
    serviceFee: 50,
    taxes: 25,
    images: [
      IMG.great,
      IMG.go,
      IMG.rome,
      IMG.curatedInterior,
      IMG.romePenthouse,
    ],
    description:
      "An exquisite art-filled penthouse featuring curated contemporary Italian artwork and stunning rooftop views.",
    insideDetails:
      "Gallery-quality lighting showcases rotating contemporary art exhibitions. Designer furniture complements the artistic atmosphere.",
    terraceDetails:
      "Private rooftop terrace with sunset views over Roman monuments. Ideal for intimate gatherings and alfresco dining.",
    neighborhoodDetails:
      "Located in Rome's historic center, walking distance to Trevi Fountain, Spanish Steps, and world-class dining.",
  },
  {
    id: "skylife-monti-1",
    title: "Skylife Monti's Wonder",
    location: "Rome, Italy",
    region: "Rome",
    beds: 4,
    baths: 2,
    guests: 5,
    size: "400sqm",
    pricePerNight: 130,
    cleaningFee: 100,
    serviceFee: 50,
    taxes: 25,
    images: [
      IMG.rome,
      IMG.go,
      IMG.great,
      IMG.florenceSuite,
      IMG.curatedInterior,
    ],
    description:
      "Experience authentic Rome in the vibrant Monti neighborhood. This beautifully restored apartment combines historic charm with modern luxury amenities.",
    insideDetails:
      "Original exposed brick walls blend with contemporary design. High ceilings and carefully selected Italian furnishings create warmth.",
    terraceDetails:
      "Charming balcony overlooking Monti's cobblestone streets. Perfect spot for morning espresso and people-watching.",
    neighborhoodDetails:
      "Monti is Rome's hippest neighborhood, filled with boutiques, trattorias, and artisan shops. Minutes from the Colosseum.",
  },
  {
    id: "skylife-monti-2",
    title: "Skylife Monti's Wonder",
    location: "Rome, Italy",
    region: "Rome",
    beds: 4,
    baths: 2,
    guests: 5,
    size: "400sqm",
    pricePerNight: 130,
    cleaningFee: 100,
    serviceFee: 50,
    taxes: 25,
    images: [
      IMG.rome,
      IMG.go,
      IMG.great,
      IMG.florenceSuite,
      IMG.curatedInterior,
    ],
    description:
      "Experience authentic Rome in the vibrant Monti neighborhood, combining historic charm with modern luxury amenities.",
    insideDetails:
      "Original exposed brick walls blend with contemporary design. High ceilings and carefully selected Italian furnishings create warmth.",
    terraceDetails:
      "Charming balcony overlooking Monti's cobblestone streets. Perfect spot for morning espresso and people-watching.",
    neighborhoodDetails:
      "Monti is Rome's hippest neighborhood, filled with boutiques, trattorias, and artisan shops. Minutes from the Colosseum.",
  },
  {
    id: "skylife-monti-11",
    title: "Skylife Monti's Wonder",
    location: "Rome, Italy",
    region: "Rome",
    beds: 4,
    baths: 2,
    guests: 5,
    size: "400sqm",
    pricePerNight: 130,
    cleaningFee: 100,
    serviceFee: 50,
    taxes: 25,
    images: [
      IMG.rome,
      IMG.go,
      IMG.great,
      IMG.florenceSuite,
      IMG.curatedInterior,
    ],
    description:
      "Experience authentic Rome in the vibrant Monti neighborhood, combining historic charm with modern luxury amenities.",
    insideDetails:
      "Original exposed brick walls blend with contemporary design. High ceilings and carefully selected Italian furnishings create warmth.",
    terraceDetails:
      "Charming balcony overlooking Monti's cobblestone streets. Perfect spot for morning espresso and people-watching.",
    neighborhoodDetails:
      "Monti is Rome's hippest neighborhood, filled with boutiques, trattorias, and artisan shops. Minutes from the Colosseum.",
  },
  {
    id: "rome-penthouse1",
    title: "Art Gallery Penthouse",
    location: "Rome, Italy",
    region: "Rome",
    beds: 4,
    baths: 2,
    guests: 5,
    size: "400sqm",
    pricePerNight: 140,
    cleaningFee: 100,
    serviceFee: 50,
    taxes: 25,
    images: [IMG.great, IMG.go, IMG.rome, IMG.romePenthouse, IMG.romeRoof],
    description:
      "Stunning penthouse apartment with gallery-quality interiors and breathtaking rooftop terrace overlooking Rome's most famous landmarks.",
    insideDetails:
      "High-end finishes throughout with curated art collection. Open-plan living spaces flooded with natural light.",
    terraceDetails:
      "Expansive rooftop terrace with 360-degree views. Outdoor kitchen and lounge seating for entertaining.",
    neighborhoodDetails:
      "Prime location near Villa Borghese gardens and Spanish Steps. Walking distance to luxury shopping and dining.",
  },
  {
    id: "rome-penthouse",
    title: "Art Gallery Penthouse",
    location: "Rome, Italy",
    region: "Rome",
    beds: 4,
    baths: 2,
    guests: 5,
    size: "400sqm",
    pricePerNight: 140,
    cleaningFee: 100,
    serviceFee: 50,
    taxes: 25,
    images: [IMG.go, IMG.great, IMG.rome, IMG.romePenthouse, IMG.romeRoof],
    description:
      "Stunning penthouse apartment with gallery-quality interiors and breathtaking rooftop terrace overlooking Rome's most famous landmarks.",
    insideDetails:
      "High-end finishes throughout with curated art collection. Open-plan living spaces flooded with natural light.",
    terraceDetails:
      "Expansive rooftop terrace with 360-degree views. Outdoor kitchen and lounge seating for entertaining.",
    neighborhoodDetails:
      "Prime location near Villa Borghese gardens and Spanish Steps. Walking distance to luxury shopping and dining.",
  },
  {
    id: "rome-atelier",
    title: "Trastevere Historic Atelier",
    location: "Rome, Italy",
    region: "Rome",
    beds: 2,
    baths: 2,
    guests: 4,
    size: "180sqm",
    pricePerNight: 125,
    cleaningFee: 100,
    serviceFee: 50,
    taxes: 25,
    images: [
      IMG.rome,
      IMG.great,
      IMG.go,
      IMG.curatedInterior,
      IMG.florenceSuite,
    ],
    description:
      "A historic atelier in the heart of Trastevere, Rome's most atmospheric quarter, blending artisan heritage with contemporary comfort.",
    insideDetails:
      "Original artist's studio proportions with double-height ceilings and restored beams. Curated mid-century Italian furniture.",
    terraceDetails:
      "Secluded courtyard terrace shaded by citrus trees — a quiet retreat from the lively streets beyond.",
    neighborhoodDetails:
      "Trastevere's cobbled lanes, trattorias and nightlife are on the doorstep, with Villa Farnesina a short stroll away.",
  },
  {
    id: "rooftop-360",
    title: "360° Rooftop Penthouse",
    location: "Rome, Italy",
    region: "Rome",
    beds: 4,
    baths: 2,
    guests: 5,
    size: "400sqm",
    pricePerNight: 160,
    cleaningFee: 100,
    serviceFee: 50,
    taxes: 25,
    images: [IMG.go, IMG.great, IMG.rome, IMG.romeRoof, IMG.romePenthouse],
    description:
      "Unparalleled 360-degree panoramic views from this exclusive rooftop penthouse. Experience Rome from above with views of all major landmarks.",
    insideDetails:
      "Ultra-modern design with floor-to-ceiling windows maximizing natural light. State-of-the-art smart home technology.",
    terraceDetails:
      "Wraparound rooftop terrace with unobstructed views in every direction. Hot tub and outdoor cinema setup.",
    neighborhoodDetails:
      "Centrally located with easy access to all of Rome's attractions. Quiet residential building with exceptional privacy.",
  },
  {
    id: "skylife-modern-4",
    title: "Skylife Modern 4-Bedroom",
    location: "Rome, Italy",
    region: "Rome",
    beds: 4,
    baths: 2,
    guests: 5,
    size: "400sqm",
    pricePerNight: 135,
    cleaningFee: 100,
    serviceFee: 50,
    taxes: 25,
    images: [
      IMG.great,
      IMG.go,
      IMG.rome,
      IMG.curatedInterior,
      IMG.romePenthouse,
    ],
    description:
      "A generous four-bedroom residence with clean contemporary lines, designed for families and groups exploring Rome together.",
    insideDetails:
      "Open-plan living with a chef's kitchen, four en-suite bedrooms and a dedicated media room.",
    terraceDetails:
      "Wide south-facing balcony with lounge seating and dining for eight.",
    neighborhoodDetails:
      "A calm residential street minutes from the metro, putting the whole city within easy reach.",
  },

  // ——— Amalfi Coast ———
  {
    id: "villa-bella-vista",
    title: "Villa Bella Vista",
    location: "Amalfi Coast, Italy",
    region: "Amalfi Coast",
    beds: 5,
    baths: 4,
    guests: 8,
    size: "450sqm",
    pricePerNight: 300,
    cleaningFee: 150,
    serviceFee: 75,
    taxes: 50,
    images: [IMG.go, IMG.great, IMG.rome, IMG.coastalTown, IMG.italyProperty],
    description:
      "Spectacular cliffside villa with infinity pool overlooking the Mediterranean. Private beach access and breathtaking sunset views over Positano.",
    insideDetails:
      "Elegant Mediterranean interiors with hand-painted tiles and vaulted ceilings. Every room captures sea views.",
    terraceDetails:
      "Multiple terraces cascading down the cliffside. Infinity pool, outdoor dining area, and private sun decks.",
    neighborhoodDetails:
      "Perched above Positano's colorful cascade of houses. Walking distance to town center and private beach club access.",
  },
  {
    id: "amalfi-bella-vista",
    title: "Villa Bella Vista",
    location: "Amalfi Coast, Italy",
    region: "Amalfi Coast",
    beds: 5,
    baths: 4,
    guests: 8,
    size: "450sqm",
    pricePerNight: 290,
    cleaningFee: 150,
    serviceFee: 75,
    taxes: 50,
    images: [IMG.great, IMG.go, IMG.rome, IMG.coastalTown, IMG.nightWaterfront],
    description:
      "Luxurious villa with stunning Mediterranean views and private access to the sea. Perfect for families seeking coastal elegance.",
    insideDetails:
      "Bright, airy interiors with Italian marble and handcrafted details. Modern amenities blend with traditional charm.",
    terraceDetails:
      "Expansive terraces with outdoor kitchen, dining for 12, and infinity pool overlooking the coast.",
    neighborhoodDetails:
      "Exclusive hillside location minutes from Amalfi's piazza. Private shuttle service to nearby beaches and towns.",
  },
  {
    id: "amalfi-cliffside",
    title: "Positano Dream Palazzo",
    location: "Amalfi Coast, Italy",
    region: "Amalfi Coast",
    beds: 4,
    baths: 3,
    guests: 6,
    size: "340sqm",
    pricePerNight: 250,
    cleaningFee: 120,
    serviceFee: 60,
    taxes: 40,
    images: [IMG.go, IMG.great, IMG.rome, IMG.italyProperty, IMG.coastalTown],
    description:
      "Dream palazzo built into Positano's cliffside. Wake up to breathtaking sea views and the sound of waves below.",
    insideDetails:
      "Authentic Amalfi architecture with modern luxury touches. Majolica-tiled floors and hand-painted ceramics throughout.",
    terraceDetails:
      "Private terrace with plunge pool and panoramic Mediterranean views. Perfect for sunset aperitivos.",
    neighborhoodDetails:
      "Heart of Positano's most exclusive area. Steps from designer boutiques and the town's best restaurants.",
  },

  // ——— Venice ———
  {
    id: "palazzo-san-marco",
    title: "Palazzo San Marco",
    location: "Venice, Italy",
    region: "Venice",
    beds: 3,
    baths: 3,
    guests: 6,
    size: "320sqm",
    pricePerNight: 280,
    cleaningFee: 130,
    serviceFee: 65,
    taxes: 45,
    images: [IMG.great, IMG.go, IMG.rome, IMG.nightWaterfront, IMG.palazzoBath],
    description:
      "Historic palazzo steps from St. Mark's Square. Experience Venetian grandeur with original frescoes and canal views.",
    insideDetails:
      "16th-century palazzo restored to perfection. Murano glass chandeliers, terrazzo floors, and period furnishings.",
    terraceDetails:
      "Private canal-side terrace with direct water access. Watch gondolas glide by from your exclusive perch.",
    neighborhoodDetails:
      "Prime San Marco location. Walk to St. Mark's Basilica, Doge's Palace, and Rialto Bridge in minutes.",
  },
  {
    id: "venice-san-marco",
    title: "Palazzo San Marco",
    location: "Venice, Italy",
    region: "Venice",
    beds: 3,
    baths: 3,
    guests: 6,
    size: "320sqm",
    pricePerNight: 275,
    cleaningFee: 130,
    serviceFee: 65,
    taxes: 45,
    images: [IMG.rome, IMG.great, IMG.go, IMG.nightWaterfront, IMG.palazzoBath],
    description:
      "Elegant Venetian palazzo in the heart of San Marco. Original architectural details meet modern luxury.",
    insideDetails:
      "Restored Renaissance interiors with contemporary comforts. Every detail honors Venetian craftsmanship.",
    terraceDetails:
      "Rooftop altana with panoramic views over Venice's red rooftops and St. Mark's Campanile.",
    neighborhoodDetails:
      "Steps from Piazza San Marco. Private water taxi dock for easy transportation throughout the lagoon.",
  },

  // ——— Lake Como ———
  {
    id: "lake-como-sola",
    title: "Villa Sola Cabiati Vista",
    location: "Lake Como, Italy",
    region: "Lake Como",
    beds: 6,
    baths: 5,
    guests: 10,
    size: "650sqm",
    pricePerNight: 400,
    cleaningFee: 200,
    serviceFee: 100,
    taxes: 75,
    images: [IMG.rome, IMG.go, IMG.great, IMG.lakeComo, IMG.italyProperty],
    description:
      "Magnificent lakefront villa with private dock and stunning mountain views. The epitome of Lake Como elegance and sophistication.",
    insideDetails:
      "Grand neoclassical interiors with original frescoes. Modern luxury seamlessly integrated with historic grandeur.",
    terraceDetails:
      "Expansive waterfront terrace with private dock and boat. Manicured Italian gardens cascade to the lake.",
    neighborhoodDetails:
      "Exclusive Tremezzo location. Private boat access to Bellagio, Varenna, and the lake's most storied shores.",
  },
  {
    id: "como-sola",
    title: "Villa Sola Cabiati Vista",
    location: "Lake Como, Italy",
    region: "Lake Como",
    beds: 5,
    baths: 5,
    guests: 9,
    size: "650sqm",
    pricePerNight: 380,
    cleaningFee: 200,
    serviceFee: 100,
    taxes: 75,
    images: [IMG.great, IMG.go, IMG.rome, IMG.lakeComo, IMG.palazzoBath],
    description:
      "Luxurious villa on Lake Como's shores with private beach and dock. Surrounded by manicured gardens and mountain vistas.",
    insideDetails:
      "Elegant period interiors updated with all modern conveniences. Spa facilities and home cinema.",
    terraceDetails:
      "Multiple lakefront terraces and balconies. Private swimming area and vintage wooden boat included.",
    neighborhoodDetails:
      "Tranquil lakeside setting minutes from charming villages. Helicopter pad available for ultimate convenience.",
  },
  {
    id: "como-bellagio",
    title: "Bellagio Waterfront Villa",
    location: "Lake Como, Italy",
    region: "Lake Como",
    beds: 3,
    baths: 2,
    guests: 6,
    size: "240sqm",
    pricePerNight: 220,
    cleaningFee: 110,
    serviceFee: 55,
    taxes: 35,
    images: [IMG.go, IMG.great, IMG.rome, IMG.lakeComo, IMG.italyProperty],
    description:
      "Charming waterfront villa in the heart of Bellagio. Direct lake access and panoramic views of the three lake branches.",
    insideDetails:
      "Cozy yet sophisticated interiors with lake views from every room. Traditional Como architecture with modern updates.",
    terraceDetails:
      "Intimate lakefront terrace with private dock. Perfect for morning coffee watching the sunrise over the mountains.",
    neighborhoodDetails:
      "Steps from Bellagio's piazza and waterfront promenade. Easy ferry access to all lake destinations.",
  },

  // ——— Other regions (from the Landing collection) ———
  {
    id: "ischia-pietra",
    title: "Santuario di Pietra",
    location: "Ischia, Italy",
    region: "Ischia",
    beds: 3,
    baths: 2,
    guests: 4,
    size: "280sqm",
    pricePerNight: 210,
    cleaningFee: 110,
    serviceFee: 55,
    taxes: 35,
    images: [IMG.great, IMG.go, IMG.rome, IMG.coastalTown, IMG.palazzoBath],
    description:
      "A stone sanctuary above Ischia's thermal coastline, built for slow mornings and long, salt-air evenings.",
    insideDetails:
      "Local volcanic stone and lime-washed walls, paired with linen textiles and handmade ceramics.",
    terraceDetails:
      "Stepped terrace with a natural thermal plunge pool and uninterrupted views to the Tyrrhenian Sea.",
    neighborhoodDetails:
      "Minutes from Sant'Angelo's fishing harbour and the island's celebrated thermal gardens.",
  },
  {
    id: "sabaudia-dune",
    title: "Dune Horizon Villa",
    location: "Sabaudia, Italy",
    region: "Sabaudia",
    beds: 4,
    baths: 3,
    guests: 6,
    size: "310sqm",
    pricePerNight: 230,
    cleaningFee: 120,
    serviceFee: 60,
    taxes: 40,
    images: [IMG.go, IMG.great, IMG.rome, IMG.coastalTown, IMG.italyProperty],
    description:
      "A modernist villa set among the protected dunes of Sabaudia, with the lake behind and the sea in front.",
    insideDetails:
      "Rationalist architecture with full-height glazing, pale terrazzo floors and a double-aspect living room.",
    terraceDetails:
      "Boardwalk terrace leading directly onto the dunes, with an outdoor shower and shaded dining pergola.",
    neighborhoodDetails:
      "Within the Circeo National Park, a favourite weekend retreat for Romans since the 1930s.",
  },
  {
    id: "argentario-fortezza",
    title: "Fortezza di Cala Galera",
    location: "Argentario, Italy",
    region: "Argentario",
    beds: 6,
    baths: 5,
    guests: 10,
    size: "580sqm",
    pricePerNight: 360,
    cleaningFee: 180,
    serviceFee: 90,
    taxes: 65,
    images: [IMG.rome, IMG.great, IMG.go, IMG.italyProperty, IMG.coastalTown],
    description:
      "A converted coastal fortress above Cala Galera marina, combining defensive stonework with resort-scale comfort.",
    insideDetails:
      "Vaulted stone halls, a wine cellar cut into the rock, and six generous en-suite bedrooms.",
    terraceDetails:
      "Ramparts converted into sun terraces, with a saltwater pool overlooking the marina and Giglio beyond.",
    neighborhoodDetails:
      "Porto Ercole's harbour restaurants and the Argentario's hidden coves are a short drive away.",
  },
  {
    id: "puglia-masseria",
    title: "Masseria dei Trulli",
    location: "Puglia, Italy",
    region: "Puglia",
    beds: 4,
    baths: 4,
    guests: 8,
    size: "390sqm",
    pricePerNight: 240,
    cleaningFee: 130,
    serviceFee: 65,
    taxes: 45,
    images: [IMG.great, IMG.go, IMG.rome, IMG.tuscanDining, IMG.italyProperty],
    description:
      "A restored masseria with adjoining trulli, set in olive groves between Ostuni and the Adriatic.",
    insideDetails:
      "Whitewashed vaults, original conical trullo roofs and a vast farmhouse kitchen built around a stone hearth.",
    terraceDetails:
      "Courtyard with a long refectory table beneath fig trees, plus a stone-edged pool in the grove.",
    neighborhoodDetails:
      "Twenty minutes from Ostuni's white old town and the beaches of the Valle d'Itria coast.",
  },
  {
    id: "pontine-retreat",
    title: "Isola Ventotene Retreat",
    location: "Pontine Island, Italy",
    region: "Pontine Island",
    beds: 2,
    baths: 2,
    guests: 4,
    size: "190sqm",
    pricePerNight: 195,
    cleaningFee: 100,
    serviceFee: 50,
    taxes: 30,
    images: [IMG.go, IMG.great, IMG.rome, IMG.nightWaterfront, IMG.coastalTown],
    description:
      "An intimate island retreat carved into Ventotene's tufa cliffs, reached by ferry and forgotten by crowds.",
    insideDetails:
      "Two cave-cool bedrooms, a compact galley kitchen and a living room framing a single vast sea window.",
    terraceDetails:
      "Private clifftop terrace with steps down to a swimming platform on the Roman harbour.",
    neighborhoodDetails:
      "The island's only village is a ten-minute walk; the Roman port and nature reserve are on the doorstep.",
  },
  {
    id: "milan-duplex",
    title: "Quadrilatero Luxury Duplex",
    location: "Milan, Italy",
    region: "Milan",
    beds: 3,
    baths: 3,
    guests: 5,
    size: "260sqm",
    pricePerNight: 265,
    cleaningFee: 130,
    serviceFee: 65,
    taxes: 45,
    images: [IMG.rome, IMG.great, IMG.go, IMG.curatedInterior, IMG.palazzoBath],
    description:
      "A two-floor residence in the Quadrilatero della Moda, steps from Via Montenapoleone.",
    insideDetails:
      "Sculptural staircase, Boffi kitchen and a collection of Italian design classics throughout.",
    terraceDetails:
      "Upper-floor loggia with planted screening — a quiet pause above the shopping district.",
    neighborhoodDetails:
      "Milan's fashion quarter, with the Duomo and Teatro alla Scala within a short walk.",
  },
  {
    id: "sardinia-sanctuary",
    title: "Costa Smeralda Sanctuary",
    location: "Sardinia, Italy",
    region: "Sardinia",
    beds: 5,
    baths: 6,
    guests: 10,
    size: "620sqm",
    pricePerNight: 420,
    cleaningFee: 200,
    serviceFee: 100,
    taxes: 80,
    images: [IMG.great, IMG.go, IMG.rome, IMG.coastalTown, IMG.italyProperty],
    description:
      "A low-slung granite villa on the Costa Smeralda, opening entirely to the sea and the maquis.",
    insideDetails:
      "Juniper beams, polished concrete and deep shaded loggias keep the interior cool through summer.",
    terraceDetails:
      "Infinity pool cut into the granite, with a shaded dining pavilion and a path down to a private cove.",
    neighborhoodDetails:
      "Between Porto Cervo and Romazzino, close to the Costa Smeralda's beach clubs and marinas.",
  },
  {
    id: "tuscany-san-gimignano",
    title: "Tenuta di San Gimignano",
    location: "Tuscany, Italy",
    region: "Tuscany",
    beds: 6,
    baths: 6,
    guests: 12,
    size: "720sqm",
    pricePerNight: 390,
    cleaningFee: 190,
    serviceFee: 95,
    taxes: 70,
    images: [IMG.go, IMG.great, IMG.rome, IMG.tuscanDining, IMG.florenceSuite],
    description:
      "A working wine estate below San Gimignano's towers, with cypress avenues and a vaulted cantina.",
    insideDetails:
      "Beamed reception rooms, six en-suite bedrooms and a kitchen built for long communal cooking.",
    terraceDetails:
      "Loggia overlooking the vineyards, with a stone pool set apart among the olives.",
    neighborhoodDetails:
      "Fifteen minutes from San Gimignano, an hour from both Florence and Siena.",
  },
  {
    id: "tuscany-orcia",
    title: "Val d'Orcia Country Estate",
    location: "Tuscany, Italy",
    region: "Tuscany",
    beds: 4,
    baths: 3,
    guests: 8,
    size: "350sqm",
    pricePerNight: 300,
    cleaningFee: 150,
    serviceFee: 75,
    taxes: 55,
    images: [IMG.rome, IMG.great, IMG.go, IMG.tuscanDining, IMG.florenceSuite],
    description:
      "A stone farmhouse in the Val d'Orcia, surrounded by the rolling wheat fields that define the valley.",
    insideDetails:
      "Terracotta floors, chestnut beams and a broad open fireplace at the heart of the living room.",
    terraceDetails:
      "Pergola-shaded terrace and a pool positioned to catch the valley's long evening light.",
    neighborhoodDetails:
      "Close to Pienza and Montalcino, at the centre of the Brunello wine country.",
  },
];

/** Look up a property by id, falling back to the default record. */
export function findPropertyData(
  propertyId: string | undefined,
): PropertyDetailData {
  if (!propertyId) return DEFAULT_PROPERTY;
  return (
    PROPERTIES_DATA.find((prop) => prop.id === propertyId) ?? DEFAULT_PROPERTY
  );
}
