"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./menu.module.css";
import { X, Flame, Leaf, Award, Phone, Wine, GlassWater } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface MenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Dish {
  num: string;
  name: string;
  desc: string;
  descEn?: string;
  descFr?: string;
  price: string;
  spicy?: boolean;
  verySpicy?: boolean;
  signature?: boolean;
  vegetarian?: boolean;
}

interface MenuCategory {
  id: string;
  title: string;
  titleEn: string;
  titleFr?: string;
  subtitle?: string;
  subtitleEn?: string;
  subtitleFr?: string;
  dishes: Dish[];
}

const menuData: MenuCategory[] = [
  /* ═══════════════════════════════════════
     FOOD MENU
     ═══════════════════════════════════════ */
  {
    id: "thali",
    title: "Mittagsmenü · Thali Lunch",
    titleEn: "Lunch Menu · Thali Lunch",
    titleFr: "Menu du midi · Thali Lunch",
    subtitle: "Mit Naan Brot, Raita (Joghurt-Mix) und Basmati-Reis",
    subtitleEn: "With Naan bread, Raita (yogurt mix) and Basmati rice",
    subtitleFr: "Avec pain naan, raïta (mélange de yaourt) et riz basmati",
    dishes: [
      { num: "", name: "Vegetarisch Thali", desc: "Vegetarisches Thali", descEn: "Vegetarian Thali", descFr: "Thali végétarien", price: "13,90 €", vegetarian: true },
      { num: "", name: "Hähnchen & Gemüse Thali", desc: "Thali mit Hähnchen und Gemüse", descEn: "Thali with chicken and vegetables", descFr: "Thali avec poulet et légumes", price: "15,90 €" },
    ],
  },
  {
    id: "vorspeisen",
    title: "Vorspeisen · Indische Tapas",
    titleEn: "Starters · Indian Tapas",
    titleFr: "Entrées · Tapas indiennes",
    dishes: [
      { num: "65", name: "Papad mit Dip Teller", desc: "Knusprig gebackene Kräcker aus Linsenmehl mit viererlei indischen Chutneys", descEn: "Crispy crackers from lentil flour with four Indian chutneys", descFr: "Crackers croustillants à la farine de lentilles avec quatre chutneys indiens", price: "4,90 €", vegetarian: true },
      { num: "66", name: "Aloo-Paneer-Samosa", desc: "2 gefüllte Teigtaschen mit Kartoffeln, Paneer & Erbsen dazu Minze-Dip", descEn: "2 stuffed pastries with potatoes, paneer & peas with mint dip", descFr: "2 chaussons farcis aux pommes de terre, paneer & petits pois avec sauce à la menthe", price: "7,90 €", vegetarian: true },
      { num: "73", name: "Chat Papadi", desc: "Dünne knusprige Cracker mit Kartoffeln, Tomaten, Kichererbsen, Joghurt-Soße", descEn: "Thin crispy crackers with potatoes, tomatoes, chickpeas, yogurt sauce", descFr: "Fins crackers croustillants avec pommes de terre, tomates, pois chiches, sauce au yaourt", price: "6,90 €", vegetarian: true },
      { num: "69", name: "Gemüse-Pakora", desc: "Kartoffeln, Blumenkohl und Aubergine in Kichererbsenmehl frittiert", descEn: "Potatoes, cauliflower and eggplant fried in chickpea batter", descFr: "Pommes de terre, chou-fleur et aubergine frits en beignets de pois chiches", price: "7,90 €", vegetarian: true },
      { num: "70", name: "Paneer-Pakora", desc: "Hausgemachter Paneer in Kichererbsenmehl frittiert mit Chat Masala", descEn: "Homemade paneer fried in chickpea batter with Chat Masala", descFr: "Paneer maison frit en beignets de pois chiches avec Chat Masala", price: "8,40 €", vegetarian: true },
      { num: "72", name: "Mixed Pakora-Teller", desc: "Gemüse-, Paneer, Hähnchen-Pakora & Samosa (für 2-3 Personen)", descEn: "Vegetable, paneer, chicken pakora & samosa (for 2-3 people)", descFr: "Pakora de légumes, paneer, poulet & samosa (pour 2-3 personnes)", price: "14,90 €" },
    ],
  },
  {
    id: "raita",
    title: "Raita",
    titleEn: "Raita",
    titleFr: "Raïta",
    dishes: [
      { num: "74", name: "Gurken-Tomaten-Raita", desc: "Joghurt mit indischen Gewürzen, Gurken, Tomaten & Zwiebeln", descEn: "Yogurt with Indian spices, cucumbers, tomatoes & onions", descFr: "Yaourt aux épices indiennes, concombres, tomates & oignons", price: "5,60 €", vegetarian: true },
    ],
  },
  {
    id: "tandoor",
    title: "Aus dem Tandoor · Indischer Lehmofen",
    titleEn: "From the Tandoor · Indian Clay Oven",
    titleFr: "Du Tandoor · Four en terre cuite indien",
    subtitle: "Serviert mit Basmati-Reis",
    subtitleEn: "Served with Basmati rice",
    subtitleFr: "Servi avec du riz basmati",
    dishes: [
      { num: "75", name: "Tandoori-Chicken", desc: "Hähnchenschenkel, mariniert in Joghurt und Garam-Masala, im Tandoor gegrillt", descEn: "Chicken legs, marinated in yogurt and Garam Masala, grilled in tandoor", descFr: "Cuisses de poulet marinées au yaourt et Garam Masala, grillées au tandoor", price: "18,90 €", signature: true },
      { num: "76", name: "Chicken Tikka", desc: "Hähnchenbrustfilet mariniert mit Joghurt, Kardamom & Zitrone", descEn: "Chicken breast marinated with yogurt, cardamom & lemon", descFr: "Filet de poulet mariné au yaourt, cardamome & citron", price: "19,90 €" },
      { num: "77", name: "Garlic-Mint Tikka", desc: "Hähnchenbrustfilet mariniert mit Joghurt, Minze, Knoblauch & Kräutern", descEn: "Chicken breast marinated with yogurt, mint, garlic & herbs", descFr: "Filet de poulet mariné au yaourt, menthe, ail & herbes", price: "19,90 €", signature: true },
      { num: "78", name: "Lamm Tikka", desc: "Lamm mariniert in Joghurt, Knoblauch, Ingwer & Kardamom", descEn: "Lamb marinated in yogurt, garlic, ginger & cardamom", descFr: "Agneau mariné au yaourt, ail, gingembre & cardamome", price: "23,90 €", signature: true },
    ],
  },
  {
    id: "chicken",
    title: "Murgh · Hähnchen",
    titleEn: "Murgh · Chicken",
    titleFr: "Murgh · Poulet",
    subtitle: "Serviert mit Basmati-Reis",
    subtitleEn: "Served with Basmati rice",
    subtitleFr: "Servi avec du riz basmati",
    dishes: [
      { num: "84", name: "Karahi Chicken", desc: "Hähnchenbrustfilet mit Tomaten, Paprika, Zwiebeln & Ingwer", descEn: "Chicken breast with tomatoes, peppers, onions & ginger", descFr: "Filet de poulet avec tomates, poivrons, oignons & gingembre", price: "19,90 €" },
      { num: "85", name: "Chicken Curry", desc: "Hähnchenbrustfilet in pikanter Currysoße nach indischer Art", descEn: "Chicken breast in spicy curry sauce, Indian style", descFr: "Filet de poulet en sauce curry épicée à l'indienne", price: "18,90 €", spicy: true },
      { num: "86", name: "Chicken Tikka Masala", desc: "Im Tandoor gegrillt, in würziger Masala-Soße", descEn: "Grilled in tandoor, in spicy masala sauce", descFr: "Grillé au tandoor, en sauce masala épicée", price: "19,90 €", signature: true },
      { num: "87", name: "Murgh Zaffran", desc: "Gegrilltes Hähnchen in milder Cashew-Soße, mit Safran & Kardamom", descEn: "Grilled chicken in mild cashew sauce, with saffron & cardamom", descFr: "Poulet grillé en sauce douce aux noix de cajou, safran & cardamome", price: "19,90 €", signature: true },
      { num: "88", name: "Chili Chicken", desc: "Hähnchenbrustfilet in pikanter Chilisoße mit Zwiebeln & Ingwer", descEn: "Chicken breast in spicy chili sauce with onions & ginger", descFr: "Filet de poulet en sauce chili épicée avec oignons & gingembre", price: "19,90 €", verySpicy: true },
      { num: "90", name: "Murg Vindaloo", desc: "Hähnchen mit Kartoffeln, Ingwer & Kokosraspeln in Vindaloo-Curry-Soße", descEn: "Chicken with potatoes, ginger & coconut in Vindaloo curry sauce", descFr: "Poulet avec pommes de terre, gingembre & noix de coco en sauce curry Vindaloo", price: "18,90 €", spicy: true },
    ],
  },
  {
    id: "lamb",
    title: "Gosht · Lamm aus der Keule",
    titleEn: "Gosht · Leg of Lamb",
    titleFr: "Gosht · Gigot d'agneau",
    subtitle: "Serviert mit Basmati-Reis",
    subtitleEn: "Served with Basmati rice",
    subtitleFr: "Servi avec du riz basmati",
    dishes: [
      { num: "91", name: "Lamm Curry", desc: "Lamm mit Kardamom, Zimt & Ingwer (Rezept aus Kaschmir)", descEn: "Lamb with cardamom, cinnamon & ginger (Kashmir recipe)", descFr: "Agneau au cardamome, cannelle & gingembre (recette du Cachemire)", price: "21,90 €", signature: true },
      { num: "92", name: "Lamm Korma", desc: "Lamm in milder Soße aus Mandeln, Sahne & Cashew (Mogul-Küche)", descEn: "Lamb in mild sauce of almonds, cream & cashew (Mughal cuisine)", descFr: "Agneau en sauce douce aux amandes, crème & noix de cajou (cuisine moghole)", price: "22,90 €", signature: true },
      { num: "93", name: "Lamm Vindaloo", desc: "Lamm mit Kartoffeln, Ingwer & Kokosraspeln in Vindaloo-Soße", descEn: "Lamb with potatoes, ginger & coconut in Vindaloo sauce", descFr: "Agneau avec pommes de terre, gingembre & noix de coco en sauce Vindaloo", price: "21,90 €", spicy: true },
      { num: "94", name: "Gosht Saagwala", desc: "Lamm mit Spinat, Tomaten & Zwiebeln in orientalischer Gewürzmischung", descEn: "Lamb with spinach, tomatoes & onions in oriental spice mix", descFr: "Agneau aux épinards, tomates & oignons en mélange d'épices orientales", price: "21,90 €" },
      { num: "95", name: "Gosht Achari", desc: "Lamm mit Ingwer, Knoblauch, Koriander & Kreuzkümmel in Masala-Soße", descEn: "Lamb with ginger, garlic, coriander & cumin in Masala sauce", descFr: "Agneau au gingembre, ail, coriandre & cumin en sauce Masala", price: "21,90 €" },
      { num: "96", name: "Lamm Karahi", desc: "Lamm mit Champignons, Zwiebeln, Tomaten, Brokkoli & Paprika", descEn: "Lamb with mushrooms, onions, tomatoes, broccoli & peppers", descFr: "Agneau aux champignons, oignons, tomates, brocoli & poivrons", price: "22,90 €", signature: true },
    ],
  },
  {
    id: "seafood",
    title: "Samundari · Aus dem Meer",
    titleEn: "Samundari · From the Sea",
    titleFr: "Samundari · Fruits de mer",
    subtitle: "Serviert mit Basmati-Reis",
    subtitleEn: "Served with Basmati rice",
    subtitleFr: "Servi avec du riz basmati",
    dishes: [
      { num: "97", name: "Prawn Jal Frezi", desc: "Garnelen in würziger Curry-Soße mit Paprika, Tomaten & Ingwer", descEn: "Prawns in spicy curry sauce with peppers, tomatoes & ginger", descFr: "Crevettes en sauce curry épicée avec poivrons, tomates & gingembre", price: "22,90 €" },
      { num: "98", name: "Coconut Prawn", desc: "Garnelen mit Kartoffeln, Ingwer & Kokos, in Kokosmilch nach Goa-Art", descEn: "Prawns with potatoes, ginger & coconut, in coconut milk, Goa style", descFr: "Crevettes avec pommes de terre, gingembre & coco, au lait de coco façon Goa", price: "22,90 €" },
      { num: "99", name: "Chili Prawn", desc: "Garnelen mit Paprika, Chili und Zwiebeln, in scharfer Soße", descEn: "Prawns with peppers, chili and onions, in spicy sauce", descFr: "Crevettes aux poivrons, piment et oignons, en sauce piquante", price: "22,90 €", spicy: true },
      { num: "100", name: "Fish Masala", desc: "Zanderfilet in Masala-Soße mit Tomaten & Ingwer", descEn: "Pike-perch fillet in Masala sauce with tomatoes & ginger", descFr: "Filet de sandre en sauce Masala avec tomates & gingembre", price: "22,90 €" },
      { num: "101", name: "Kerala Fish Curry", desc: "Zanderfilet in südindischer Curry-Soße mit Tamarinde & Kokosmilch", descEn: "Pike-perch fillet in South Indian curry sauce with tamarind & coconut milk", descFr: "Filet de sandre en sauce curry du sud de l'Inde au tamarin & lait de coco", price: "22,90 €", signature: true },
    ],
  },
  {
    id: "vegetarian",
    title: "Vegetarisch · Gemüse & Käse",
    titleEn: "Vegetarian · Vegetables & Cheese",
    titleFr: "Végétarien · Légumes & Fromage",
    subtitle: "Serviert mit Basmati-Reis",
    subtitleEn: "Served with Basmati rice",
    subtitleFr: "Servi avec du riz basmati",
    dishes: [
      { num: "102", name: "Dal Makhni", desc: "Schwarze Linsen in Buttersoße mit indischer Spezial-Gewürzmischung", descEn: "Black lentils in butter sauce with Indian special spice mix", descFr: "Lentilles noires en sauce au beurre avec un mélange d'épices indiennes spécial", price: "14,90 €", vegetarian: true },
      { num: "103", name: "Mix Veg Curry", desc: "Kartoffeln, Bohnen, Paprika, Erbsen, Blumenkohl in Curry-Soße", descEn: "Potatoes, beans, peppers, peas, cauliflower in curry sauce", descFr: "Pommes de terre, haricots, poivrons, petits pois, chou-fleur en sauce curry", price: "15,90 €", vegetarian: true },
      { num: "104", name: "Palak Paneer", desc: "Spinat mit Paneer, Tomaten & Ingwer in Masala-Soße", descEn: "Spinach with paneer, tomatoes & ginger in Masala sauce", descFr: "Épinards avec paneer, tomates & gingembre en sauce Masala", price: "16,90 €", vegetarian: true },
      { num: "105", name: "Karahi Paneer", desc: "Paneer mit Paprika, Tomaten & Ingwer", descEn: "Paneer with peppers, tomatoes & ginger", descFr: "Paneer aux poivrons, tomates & gingembre", price: "16,90 €", vegetarian: true },
      { num: "106", name: "Aloo Chana Masala", desc: "Kichererbsen mit Kartoffeln in würziger Masala-Soße", descEn: "Chickpeas with potatoes in spicy Masala sauce", descFr: "Pois chiches aux pommes de terre en sauce Masala épicée", price: "15,90 €", vegetarian: true },
      { num: "107", name: "Bharta", desc: "Auberginen gegrillt & püriert, mit Zwiebeln, Erbsen & Tomaten", descEn: "Grilled & pureed eggplant with onions, peas & tomatoes", descFr: "Aubergines grillées & réduites en purée, avec oignons, petits pois & tomates", price: "16,90 €", vegetarian: true },
      { num: "108", name: "Malai Kofta", desc: "Gemüse-Käsebällchen mit Kartoffeln, Mandeln & Rosinen in Cashew-Soße", descEn: "Vegetable cheese balls with potatoes, almonds & raisins in cashew sauce", descFr: "Boulettes de légumes et fromage avec pommes de terre, amandes & raisins en sauce aux noix de cajou", price: "17,90 €", vegetarian: true },
      { num: "109", name: "Paneer Tikka Masala", desc: "Im Tandoor gegrillter Paneer in cremiger Masala-Soße", descEn: "Tandoor-grilled paneer in creamy Masala sauce", descFr: "Paneer grillé au tandoor en sauce Masala crémeuse", price: "17,90 €", vegetarian: true, signature: true },
    ],
  },
  {
    id: "biryani",
    title: "Biryani · Reis",
    titleEn: "Biryani · Rice",
    titleFr: "Biryani · Riz",
    subtitle: "Serviert mit Gurken-Raita",
    subtitleEn: "Served with cucumber Raita",
    subtitleFr: "Servi avec raïta au concombre",
    dishes: [
      { num: "110", name: "Chicken Tikka Biryani", desc: "Gegrilltes Hähnchen mit gebratenem Safran-Reis", descEn: "Grilled chicken with fried saffron rice", descFr: "Poulet grillé avec riz safran frit", price: "19,90 €", signature: true },
      { num: "111", name: "Bombay Lamm-Biryani", desc: "Safran-Reis mit Lamm, garniert mit Nüssen & Rosinen", descEn: "Saffron rice with lamb, garnished with nuts & raisins", descFr: "Riz safran avec agneau, garni de noix & raisins secs", price: "21,90 €" },
      { num: "112", name: "Prawn Biryani", desc: "Safran-Reis mit Garnelen, Kardamom, Ingwer & Kräutern", descEn: "Saffron rice with prawns, cardamom, ginger & herbs", descFr: "Riz safran avec crevettes, cardamome, gingembre & herbes", price: "22,90 €" },
      { num: "113", name: "Jaipur Mix Biryani", desc: "Safran-Reis mit Hähnchen, Garnelen & Lamm, garniert mit Mandelflocken", descEn: "Saffron rice with chicken, prawns & lamb, garnished with almond flakes", descFr: "Riz safran avec poulet, crevettes & agneau, garni de flocons d'amandes", price: "24,90 €", signature: true },
      { num: "114", name: "Gemüse-Paneer Biryani", desc: "Frisches Gemüse mit mariniertem Käse in Safran-Reis", descEn: "Fresh vegetables with marinated cheese in saffron rice", descFr: "Légumes frais avec fromage mariné dans du riz safran", price: "15,90 €", vegetarian: true },
    ],
  },
  {
    id: "naan",
    title: "Indisches Fladenbrot · Naan",
    titleEn: "Indian Flatbread · Naan",
    titleFr: "Pain plat indien · Naan",
    dishes: [
      { num: "115", name: "Gemischter Brotkorb", desc: "Dreierlei Fladenbrot: Knoblauch-Naan, Butter-Naan, Tandoori Roti", descEn: "Three flatbreads: garlic naan, butter naan, tandoori roti", descFr: "Trois pains plats : naan à l'ail, naan au beurre, tandoori roti", price: "9,90 €", vegetarian: true },
      { num: "116", name: "Knoblauch Naan", desc: "Fladenbrot mit Knoblauch & Koriander", descEn: "Flatbread with garlic & coriander", descFr: "Pain plat à l'ail & coriandre", price: "4,40 €", vegetarian: true },
      { num: "117", name: "Butter Naan", desc: "Fladenbrot mit Butter", descEn: "Flatbread with butter", descFr: "Pain plat au beurre", price: "4,20 €", vegetarian: true },
      { num: "118", name: "Paneer Naan", desc: "Fladenbrot gefüllt mit Paneer (hausg. Käse)", descEn: "Flatbread filled with paneer (homemade cheese)", descFr: "Pain plat farci au paneer (fromage maison)", price: "6,20 €", vegetarian: true },
      { num: "119", name: "Peshwari Naan", desc: "Spezialität des Hauses — gefüllt mit Nüssen & Rosinen, Kokosnuss & Paneer, dazu Mango-Chutney", descEn: "House specialty — filled with nuts & raisins, coconut & paneer, with mango chutney", descFr: "Spécialité de la maison — farci de noix & raisins, noix de coco & paneer, avec chutney de mangue", price: "6,60 €", vegetarian: true, signature: true },
      { num: "120", name: "Classic Naan", desc: "Fladenbrot aus Weizenmehl", descEn: "Wheat flour flatbread", descFr: "Pain plat à la farine de blé", price: "3,40 €", vegetarian: true },
      { num: "121", name: "Tandoori Roti", desc: "Aus Vollkornmehl", descEn: "Whole wheat", descFr: "Farine complète", price: "2,90 €", vegetarian: true },
      { num: "122", name: "Garlic Roti", desc: "Aus Vollkornmehl mit Knoblauch", descEn: "Whole wheat with garlic", descFr: "Farine complète à l'ail", price: "3,40 €", vegetarian: true },
    ],
  },
  {
    id: "desserts",
    title: "Mithai · Nachspeisen",
    titleEn: "Mithai · Desserts",
    titleFr: "Mithai · Desserts",
    dishes: [
      { num: "123", name: "Kulfi Pista", desc: "Hausgemachte Spezialität — Pistazien, Safran", descEn: "Homemade specialty — pistachio, saffron", descFr: "Spécialité maison — pistache, safran", price: "7,40 €", vegetarian: true, signature: true },
      { num: "124", name: "Gulab Jamun", desc: "2 goldbraun frittierte Bällchen in Rosenwasser-Sirup, garniert mit Mandelflocken", descEn: "2 golden-fried balls in rose water syrup, garnished with almond flakes", descFr: "2 boulettes dorées frites dans un sirop à l'eau de rose, garnies de flocons d'amandes", price: "6,50 €", vegetarian: true },
      { num: "125", name: "Vanille-Eis", desc: "Vanille-Eis garniert mit Rosinen, Mandeln & Mango-Sauce", descEn: "Vanilla ice cream garnished with raisins, almonds & mango sauce", descFr: "Glace vanille garnie de raisins secs, amandes & sauce mangue", price: "6,50 €", vegetarian: true },
    ],
  },

  /* ═══════════════════════════════════════
     DRINKS MENU — from physical menu card
     ═══════════════════════════════════════ */
  {
    id: "aperitifs",
    title: "Aperetifs",
    titleEn: "Aperitifs",
    titleFr: "Apéritifs",
    dishes: [
      { num: "1", name: "Aperol Spritz", desc: "", descEn: "", descFr: "", price: "8,40 €" },
      { num: "2", name: "Gin Tonic", desc: "Roku Gin — Japanese Premium Gin · 5cl", descEn: "Roku Gin — Japanese Premium Gin · 5cl", descFr: "Roku Gin — Gin premium japonais · 5cl", price: "9,90 €" },
      { num: "3", name: "Campari Orange / Soda", desc: "5cl", descEn: "5cl", descFr: "5cl", price: "7,90 €" },
      { num: "4", name: "Martini bianco", desc: "5cl", descEn: "5cl", descFr: "5cl", price: "4,90 €" },
      { num: "5", name: "Martini rosso", desc: "2cl", descEn: "2cl", descFr: "2cl", price: "4,70 €" },
      { num: "6", name: "Sherry Medium Dry", desc: "2cl", descEn: "2cl", descFr: "2cl", price: "4,70 €" },
    ],
  },
  {
    id: "sekt",
    title: "Sekt",
    titleEn: "Sparkling Wine",
    titleFr: "Vin mousseux",
    dishes: [
      { num: "7", name: "Geldermann Carte Blanche", desc: "0,1l", descEn: "0.1l", descFr: "0,1l", price: "5,40 €" },
      { num: "8", name: "Geldermann Picolo", desc: "0,2l", descEn: "0.2l", descFr: "0,2l", price: "7,90 €" },
      { num: "9", name: "Geldermann Carte Blanche", desc: "0,75l · Flasche", descEn: "0.75l · Bottle", descFr: "0,75l · Bouteille", price: "34,00 €" },
    ],
  },
  {
    id: "lassi",
    title: "Lassi · Indisches Joghurtgetränk",
    titleEn: "Lassi · Indian Yogurt Drink",
    titleFr: "Lassi · Boisson indienne au yaourt",
    subtitle: "Hausgemacht — erfrischend & gesund",
    subtitleEn: "Homemade — refreshing & healthy",
    subtitleFr: "Fait maison — rafraîchissant & sain",
    dishes: [
      { num: "10", name: "Mango-Lassi", desc: "Hausgemacht mit Mango & Kardamom · 0,35l / 0,5l", descEn: "Homemade with mango & cardamom · 0.35l / 0.5l", descFr: "Fait maison avec mangue & cardamome · 0,35l / 0,5l", price: "5,90 €", vegetarian: true, signature: true },
      { num: "11", name: "Masala-Lassi", desc: "Hausgemacht mit Kreuzkümmel & Salz · 0,35l", descEn: "Homemade with cumin & salt · 0.35l", descFr: "Fait maison avec cumin & sel · 0,35l", price: "4,40 €", vegetarian: true },
    ],
  },
  {
    id: "spirits",
    title: "Spirituosen",
    titleEn: "Spirits",
    titleFr: "Spiritueux",
    dishes: [
      { num: "12", name: "Old Monk", desc: "Indischer Rum · 4cl", descEn: "Indian Rum · 4cl", descFr: "Rhum indien · 4cl", price: "6,40 €" },
      { num: "13", name: "Whisky Glenfiddich", desc: "4cl", descEn: "4cl", descFr: "4cl", price: "10,90 €" },
      { num: "14", name: "Chivas Regal Scotch", desc: "4cl", descEn: "4cl", descFr: "4cl", price: "9,90 €" },
      { num: "15", name: "Johnny Walker Black Label", desc: "4cl", descEn: "4cl", descFr: "4cl", price: "9,90 €" },
      { num: "16", name: "Vodka / Grey Goose Premium", desc: "4cl", descEn: "4cl", descFr: "4cl", price: "6,90 €" },
      { num: "17", name: "Grappa di Prosecco", desc: "2cl", descEn: "2cl", descFr: "2cl", price: "3,30 €" },
      { num: "18", name: "Fernet Branca", desc: "2cl", descEn: "2cl", descFr: "2cl", price: "3,40 €" },
      { num: "19", name: "Pernod", desc: "5cl", descEn: "5cl", descFr: "5cl", price: "6,90 €" },
    ],
  },
  {
    id: "digestifs",
    title: "Digestifs",
    titleEn: "Digestifs",
    titleFr: "Digestifs",
    dishes: [
      { num: "20", name: "Indischer Mango Schnaps", desc: "Exotisch · 2cl · 38%", descEn: "Exotic · 2cl · 38%", descFr: "Exotique · 2cl · 38%", price: "3,60 €" },
      { num: "21", name: "Schladerer Kirschwasser", desc: "2cl · 42%", descEn: "2cl · 42%", descFr: "Eau-de-vie de cerise · 2cl · 42%", price: "3,40 €" },
      { num: "22", name: "Schladerer Mirabellenschnaps", desc: "2cl · 45%", descEn: "2cl · 45%", descFr: "Eau-de-vie de mirabelle · 2cl · 45%", price: "3,40 €" },
      { num: "23", name: "Schladerer Williams Christ", desc: "2cl · 40%", descEn: "2cl · 40%", descFr: "Eau-de-vie de poire Williams · 2cl · 40%", price: "3,40 €" },
    ],
  },
  {
    id: "softdrinks",
    title: "Alkoholfreie Getränke",
    titleEn: "Non-Alcoholic Drinks",
    titleFr: "Boissons sans alcool",
    dishes: [
      { num: "24", name: "Mineralwasser still", desc: "Gerolsteiner · 0,5l", descEn: "Gerolsteiner · 0.5l", descFr: "Gerolsteiner · 0,5l", price: "4,40 €", vegetarian: true },
      { num: "25", name: "Mineralwasser mit Kohlensäure", desc: "0,5l / 0,7l", descEn: "Sparkling · 0.5l / 0.7l", descFr: "Gazeuse · 0,5l / 0,7l", price: "4,60 €", vegetarian: true },
      { num: "26", name: "Mineralwasser", desc: "0,25l", descEn: "0.25l", descFr: "0,25l", price: "3,20 €", vegetarian: true },
      { num: "27", name: "Schweppes Bitter Lemon", desc: "0,2l", descEn: "0.2l", descFr: "0,2l", price: "3,40 €", vegetarian: true },
      { num: "28", name: "Schweppes Ginger Ale", desc: "0,2l", descEn: "0.2l", descFr: "0,2l", price: "3,40 €", vegetarian: true },
      { num: "29", name: "Coca-Cola", desc: "0,2l", descEn: "0.2l", descFr: "0,2l", price: "3,20 €", vegetarian: true },
      { num: "30", name: "Coca-Cola Light", desc: "0,2l", descEn: "0.2l", descFr: "0,2l", price: "3,20 €", vegetarian: true },
      { num: "31", name: "Fanta", desc: "0,2l", descEn: "0.2l", descFr: "0,2l", price: "3,20 €", vegetarian: true },
      { num: "32", name: "Spezi", desc: "0,2l", descEn: "0.2l", descFr: "0,2l", price: "3,20 €", vegetarian: true },
      { num: "33", name: "Sprite", desc: "0,2l", descEn: "0.2l", descFr: "0,2l", price: "3,20 €", vegetarian: true },
      { num: "34", name: "Saftschorle", desc: "0,2l", descEn: "Juice spritzer · 0.2l", descFr: "Jus pétillant · 0,2l", price: "3,20 €", vegetarian: true },
      { num: "35", name: "Säfte", desc: "Apfel, Orangen, Johannisbeer, Maracuja, Mango · 0,2l", descEn: "Apple, orange, blackcurrant, passion fruit, mango · 0.2l", descFr: "Pomme, orange, cassis, fruit de la passion, mangue · 0,2l", price: "3,70 €", vegetarian: true },
      { num: "36", name: "Pfirsich Eistee", desc: "Fuze · 0,2l", descEn: "Fuze · 0.2l", descFr: "Thé glacé pêche Fuze · 0,2l", price: "3,20 €", vegetarian: true },
    ],
  },
  {
    id: "chai",
    title: "Indischer Masala Chai",
    titleEn: "Indian Masala Chai",
    titleFr: "Chai Masala indien",
    subtitle: "Chai in Indien ist mehr als nur ein Getränk — es ist ein Symbol für\u2019s tägliche Leben und für die Kultur",
    subtitleEn: "Chai in India is more than just a drink — it is a symbol of daily life and culture",
    subtitleFr: "Le chai en Inde est bien plus qu'une boisson — c'est un symbole de la vie quotidienne et de la culture",
    dishes: [
      { num: "", name: "Masala Chai", desc: "Klein / Groß", descEn: "Small / Large", descFr: "Petit / Grand", price: "3,20 / 4,20 €", vegetarian: true, signature: true },
    ],
  },
  {
    id: "warmdrinks",
    title: "Warme Getränke",
    titleEn: "Hot Beverages",
    titleFr: "Boissons chaudes",
    dishes: [
      { num: "37", name: "Indischer Chai Tee", desc: "Schwarztee mit Kardamom, Milch, Ingwer & Zucker", descEn: "Black tea with cardamom, milk, ginger & sugar", descFr: "Thé noir au cardamome, lait, gingembre & sucre", price: "4,40 €", vegetarian: true },
      { num: "38", name: "Kahawa Tee aus Kashmir", desc: "Grüntee mit Safran, Mandel, Kardamom, Zimt & Zucker", descEn: "Green tea with saffron, almond, cardamom, cinnamon & sugar", descFr: "Thé vert au safran, amande, cardamome, cannelle & sucre", price: "4,40 €", vegetarian: true },
      { num: "39", name: "Pfefferminztee / Darjeeling / Kräutertee", desc: "Grüntee, Ingwertee", descEn: "Peppermint, Darjeeling, herbal, green or ginger tea", descFr: "Menthe poivrée, Darjeeling, tisane, thé vert ou gingembre", price: "4,20 €", vegetarian: true },
      { num: "40", name: "Kaffee", desc: "", descEn: "", descFr: "", price: "3,60 €", vegetarian: true },
      { num: "41", name: "Espresso", desc: "", descEn: "", descFr: "", price: "2,60 €", vegetarian: true },
    ],
  },
  {
    id: "beer",
    title: "Biere",
    titleEn: "Beers",
    titleFr: "Bières",
    dishes: [
      { num: "42", name: "Indisches Bier — Kingfisher", desc: "0,33l", descEn: "0.33l", descFr: "Bière indienne · 0,33l", price: "4,80 €" },
      { num: "43", name: "Jever", desc: "0,33l", descEn: "0.33l", descFr: "0,33l", price: "4,20 €" },
      { num: "44", name: "Rothaus Tannenzäpfle", desc: "0,33l", descEn: "0.33l", descFr: "0,33l", price: "4,20 €" },
      { num: "45", name: "Fürstenberg Pils", desc: "0,5l", descEn: "0.5l", descFr: "0,5l", price: "4,80 €" },
      { num: "46", name: "Fürstenberg Pils (alkoholfrei)", desc: "0,5l", descEn: "0.5l (non-alcoholic)", descFr: "0,5l (sans alcool)", price: "4,80 €" },
      { num: "47", name: "Hefeweizen-hell Fürstenberg", desc: "0,5l", descEn: "0.5l", descFr: "0,5l", price: "4,80 €" },
      { num: "48", name: "Hefeweizen-dunkel Fürstenberg", desc: "0,5l", descEn: "0.5l", descFr: "0,5l", price: "4,80 €" },
      { num: "49", name: "Hefeweizen (alkoholfrei) Erdinger", desc: "0,5l", descEn: "0.5l (non-alcoholic)", descFr: "0,5l (sans alcool)", price: "4,80 €" },
      { num: "50", name: "Kristallweizen Fürstenberg", desc: "0,5l", descEn: "0.5l", descFr: "0,5l", price: "4,80 €" },
      { num: "51", name: "Radler", desc: "0,5l", descEn: "0.5l", descFr: "Panaché · 0,5l", price: "4,80 €" },
    ],
  },
  {
    id: "wine",
    title: "Offene Weine",
    titleEn: "Open Wines",
    titleFr: "Vins au verre",
    subtitle: "Alle Weine vom bekannten Weingut Löffler in Staufen — Markgräflerland",
    subtitleEn: "All wines from the renowned Löffler winery in Staufen — Markgräflerland",
    subtitleFr: "Tous les vins du célèbre domaine Löffler à Staufen — Markgräflerland",
    dishes: [
      { num: "52", name: "Müller Thurgau, trocken", desc: "Weißwein · 0,2l", descEn: "White wine · 0.2l", descFr: "Vin blanc · 0,2l", price: "5,80 €" },
      { num: "53", name: "Gutedel, trocken", desc: "Weißwein · 0,2l", descEn: "White wine · 0.2l", descFr: "Vin blanc · 0,2l", price: "5,80 €" },
      { num: "54", name: "Weißer Burgunder, trocken", desc: "Weißwein · 0,2l", descEn: "White wine · 0.2l", descFr: "Vin blanc · 0,2l", price: "6,60 €" },
      { num: "55", name: "Spätburgunder Weißherbst, trocken", desc: "Rosé · 0,2l", descEn: "Rosé · 0.2l", descFr: "Rosé · 0,2l", price: "6,60 €" },
      { num: "56", name: "Weißweinschorle", desc: "0,25l", descEn: "White wine spritzer · 0.25l", descFr: "Spritzer vin blanc · 0,25l", price: "4,60 €" },
      { num: "57", name: "Chianti DOCG", desc: "Rotwein · 0,2l", descEn: "Red wine · 0.2l", descFr: "Vin rouge · 0,2l", price: "7,40 €" },
      { num: "58", name: "Merlot", desc: "Rotwein · 0,2l", descEn: "Red wine · 0.2l", descFr: "Vin rouge · 0,2l", price: "7,40 €" },
      { num: "59", name: "Spätburgunder, trocken", desc: "Rotwein · Weingut Löffler · 0,2l", descEn: "Red wine · Löffler winery · 0.2l", descFr: "Vin rouge · Domaine Löffler · 0,2l", price: "6,80 €" },
      { num: "60", name: "Spätburgunder, halbtrocken", desc: "Rotwein · Weingut Löffler · 0,2l", descEn: "Red wine · Löffler winery · 0.2l", descFr: "Vin rouge · Domaine Löffler · 0,2l", price: "6,80 €" },
      { num: "61", name: "Rotweinschorle", desc: "0,25l", descEn: "Red wine spritzer · 0.25l", descFr: "Spritzer vin rouge · 0,25l", price: "4,60 €" },
    ],
  },
];

const filterLabels = [
  { de: "Alle", en: "All", fr: "Tout" },
  { de: "Vorspeisen", en: "Starters", fr: "Entrées" },
  { de: "Tandoor", en: "Tandoor", fr: "Tandoor" },
  { de: "Hähnchen", en: "Chicken", fr: "Poulet" },
  { de: "Lamm", en: "Lamb", fr: "Agneau" },
  { de: "Meeresfrüchte", en: "Seafood", fr: "Fruits de mer" },
  { de: "Vegetarisch", en: "Vegetarian", fr: "Végétarien" },
  { de: "Biryani", en: "Biryani", fr: "Biryani" },
  { de: "Naan", en: "Naan", fr: "Naan" },
  { de: "Nachspeisen", en: "Desserts", fr: "Desserts" },
  { de: "Getränke", en: "Drinks", fr: "Boissons" },
];

const filterMap: Record<number, string[]> = {
  1: ["vorspeisen", "raita"],
  2: ["tandoor"],
  3: ["chicken"],
  4: ["lamb"],
  5: ["seafood"],
  6: ["vegetarian"],
  7: ["biryani"],
  8: ["naan"],
  9: ["desserts"],
  10: ["aperitifs", "sekt", "lassi", "spirits", "digestifs", "softdrinks", "chai", "warmdrinks", "beer", "wine"],
};

export default function MenuPopup({ isOpen, onClose }: MenuPopupProps) {
  const [filter, setFilter] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setFilter(0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [filter]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMenu =
    filter === 0
      ? menuData
      : menuData.filter((cat) => filterMap[filter]?.includes(cat.id));

  // Check if we're showing drinks
  const isDrinksFilter = filter === 10;

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.popup}>
        {/* ═══ HEADER ═══ */}
        <div className={styles.popupHeader}>
          <div>
            <h2 className={styles.popupTitle}>{t("Unsere Speisekarte", "Our Menu", "Notre carte")}</h2>
            <p className={styles.popupSubtitle}>JAIPUR · Indian Heritage</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* ═══ FILTER BAR ═══ */}
        <div className={styles.filterBar}>
          {filterLabels.map((label, i) => (
            <button
              key={i}
              className={`${styles.filterBtn} ${filter === i ? styles.filterBtnActive : ""} ${i === 10 ? styles.filterBtnDrinks : ""}`}
              onClick={() => setFilter(i)}
            >
              {i === 10 && <Wine size={12} style={{ marginRight: 4 }} />}
              {t(label.de, label.en, label.fr)}
            </button>
          ))}
        </div>

        {/* ═══ LEGEND ═══ */}
        {!isDrinksFilter && (
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <Award size={13} className={styles.legendGold} /> {t("Spezialität", "Signature", "Spécialité")}
            </span>
            <span className={styles.legendItem}>
              <Leaf size={13} className={styles.legendGreen} /> {t("Vegetarisch", "Vegetarian", "Végétarien")}
            </span>
            <span className={styles.legendItem}>
              <Flame size={13} className={styles.legendOrange} /> {t("Scharf", "Spicy", "Épicé")}
            </span>
            <span className={styles.legendItem}>
              <Flame size={13} className={styles.legendRed} /> {t("Sehr scharf", "Very spicy", "Très épicé")}
            </span>
          </div>
        )}

        {/* ═══ MENU LIST ═══ */}
        <div className={styles.menuList} ref={listRef}>
          {filteredMenu.map((category) => (
            <div key={category.id} className={styles.categoryBlock}>
              <div className={styles.categoryHeader}>
                <h3 className={styles.categoryTitle}>
                  {t(category.title, category.titleEn, category.titleFr)}
                </h3>
                {category.subtitle && (
                  <p className={styles.categorySubtitle}>
                    {t(category.subtitle, category.subtitleEn || category.subtitle, category.subtitleFr || category.subtitleEn || category.subtitle)}
                  </p>
                )}
              </div>
              <div className={styles.dishList}>
                {category.dishes.map((dish, di) => (
                  <div key={di} className={styles.dishRow}>
                    {dish.num && <span className={styles.dishNum}>{dish.num}</span>}
                    <div className={styles.dishContent}>
                      <div className={styles.dishNameRow}>
                        <span className={styles.dishName}>{dish.name}</span>
                        <div className={styles.badges}>
                          {dish.signature && <Award size={13} className={styles.legendGold} />}
                          {dish.vegetarian && <Leaf size={13} className={styles.legendGreen} />}
                          {dish.verySpicy && <Flame size={13} className={styles.legendRed} />}
                          {dish.spicy && !dish.verySpicy && <Flame size={13} className={styles.legendOrange} />}
                        </div>
                        <span className={styles.dishDots} />
                        <span className={styles.dishPrice}>{dish.price}</span>
                      </div>
                      {dish.desc && (
                        <p className={styles.dishDesc}>{t(dish.desc, dish.descEn || dish.desc, dish.descFr || dish.descEn || dish.desc)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ═══ CATERING ═══ */}
          {(filter === 0 || filter <= 9) && (
            <div className={styles.cateringBlock}>
              <h3 className={styles.cateringTitle}>{t("Catering", "Catering", "Traiteur")}</h3>
              <p className={styles.cateringDesc}>
                {t(
                  'Für Hochzeiten, Geburtstage, Firmen oder sonstige Feiern liefern wir ein "Indisches Buffet" nach Ihren Wünschen!',
                  'For weddings, birthdays, corporate events or other celebrations we deliver an "Indian Buffet" to your wishes!',
                  'Pour mariages, anniversaires, événements d\'entreprise ou autres célébrations, nous livrons un « Buffet Indien » selon vos souhaits !'
                )}
              </p>
              <a href="tel:0761272082" className={styles.cateringPhone}>
                <Phone size={16} /> 0761 / 27 20 82
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
