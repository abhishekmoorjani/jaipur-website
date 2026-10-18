"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./menu.module.css";
import { X, Flame, Leaf, Award, Phone, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
// Artwork cropped from printed page 2 by design/menu-card/extract.py
const ART = `${BASE}/images/menu-card`;

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
    id: "lunch-starters",
    title: "Mittagskarte (Montag bis Freitag)",
    titleEn: "Lunch Menu (Monday to Friday)",
    titleFr: "Menu du midi (du lundi au vendredi)",
    subtitle: "Indian Street Food: Vorspeisen",
    subtitleEn: "Indian street food: starters",
    subtitleFr: "Street food indien : entrées",
    dishes: [
      { num: "", name: "Dip-Teller", desc: "Knusprig gebackene Papad aus Kichererbsenmehl, dazu Minz-Soße, Mango-Chutney & Chili-Dip", descEn: "Crispy baked papad made from chickpea flour, with mint sauce, mango chutney & chili dip", descFr: "Papad croustillants à la farine de pois chiches, avec sauce à la menthe, chutney de mangue & sauce chili", price: "5,50 €", vegetarian: true },
      { num: "", name: "Naan", desc: "Indisches Fladenbrot natur / mit Butter oder Knoblauch", descEn: "Indian flatbread, plain / with butter or garlic", descFr: "Pain plat indien nature / au beurre ou à l'ail", price: "3,60 / 4,70 €", vegetarian: true },
      { num: "", name: "Gemüse-Pakora", desc: "Kartoffeln, Blumenkohl und Aubergine in Kichererbsenmehl frittiert", descEn: "Potatoes, cauliflower and eggplant fried in chickpea batter", descFr: "Pommes de terre, chou-fleur et aubergine frits en beignets de pois chiches", price: "7,90 €", vegetarian: true },
      { num: "", name: "Indischer Beilagensalat", desc: "Grüner Salat, Tomaten, Gurken, Kichererbsen & Oliven mit hausgemachtem Dressing. Nur in Kombination mit einem Thali oder Hauptgericht", descEn: "Green salad, tomatoes, cucumbers, chickpeas & olives with homemade dressing. Only together with a thali or a main course", descFr: "Salade verte, tomates, concombres, pois chiches & olives avec vinaigrette maison. Uniquement avec un thali ou un plat principal", price: "6,20 €" },
    ],
  },
  {
    id: "thali",
    title: "Mittagskarte: Thali",
    titleEn: "Lunch Menu: Thali",
    titleFr: "Menu du midi : Thali",
    subtitle: "Mit Vorspeise, Hauptgericht & Dessert: eine traditionelle Kombination verschiedener indischer Gerichte mit Naan-Brot & Basmati-Reis. „Sharing is caring“: Sie möchten sich ein Thali teilen? Dann berechnen wir 4,90 € pro weitere Person für das Gedeck.",
    subtitleEn: "With starter, main course & dessert: a traditional combination of different Indian dishes with naan bread & Basmati rice. “Sharing is caring”: would you like to share a thali? We charge 4,90 € per additional person for the place setting.",
    subtitleFr: "Avec entrée, plat principal & dessert : une combinaison traditionnelle de différents plats indiens avec pain naan & riz basmati. « Sharing is caring » : vous souhaitez partager un thali ? Nous facturons 4,90 € par personne supplémentaire pour le couvert.",
    dishes: [
      { num: "", name: "Thali Vegetarisch", desc: "", descEn: "Vegetarian thali", descFr: "Thali végétarien", price: "14,90 €", vegetarian: true },
      { num: "", name: "Thali mit Hähnchen und Gemüse", desc: "", descEn: "Thali with chicken and vegetables", descFr: "Thali avec poulet et légumes", price: "16,90 €" },
    ],
  },
  {
    id: "lunch-mains",
    title: "Mittagskarte: Traditionelle Gerichte",
    titleEn: "Lunch Menu: Traditional Dishes",
    titleFr: "Menu du midi : plats traditionnels",
    subtitle: "Serviert mit Basmati-Reis. Lust auf ein indisches Dessert oder einen Espresso? Dann sprechen Sie uns an!",
    subtitleEn: "Served with Basmati rice. Fancy an Indian dessert or an espresso? Just ask us!",
    subtitleFr: "Servi avec du riz basmati. Envie d'un dessert indien ou d'un espresso ? N'hésitez pas à nous le demander !",
    dishes: [
      { num: "", name: "Aloo Chana Masala", desc: "Kichererbsen mit Kartoffeln in einer milden Curry-Soße (vegan)", descEn: "Chickpeas with potatoes in a mild curry sauce (vegan)", descFr: "Pois chiches aux pommes de terre en sauce curry douce (végétalien)", price: "15,90 €", vegetarian: true },
      { num: "", name: "Palak Paneer", desc: "Spinat mit hausgemachtem Käse (Paneer), Tomaten & Ingwer in einer Masala-Soße", descEn: "Spinach with homemade cheese (paneer), tomatoes & ginger in a Masala sauce", descFr: "Épinards avec fromage maison (paneer), tomates & gingembre en sauce Masala", price: "16,90 €", vegetarian: true },
      { num: "", name: "Gemüse-Paneer Biryani", desc: "Frisches Gemüse mit hausgemachtem Käse in gebratenem Safran-Reis", descEn: "Fresh vegetables with homemade cheese in fried saffron rice", descFr: "Légumes frais avec fromage maison dans du riz safran sauté", price: "16,90 €", vegetarian: true },
      { num: "", name: "Chicken Tikka Masala", desc: "Hähnchenbrustfilet im Tandoor gegrillt, in einer Joghurt-Tomaten-Masala-Soße", descEn: "Chicken breast grilled in the tandoor, in a yogurt tomato Masala sauce", descFr: "Filet de poulet grillé au tandoor, en sauce Masala au yaourt et à la tomate", price: "19,90 €", signature: true },
      { num: "", name: "Kerala Fish Curry", desc: "Zanderfilet in einer würzigen Curry-Soße mit Kokosmilch", descEn: "Pike-perch fillet in a spicy curry sauce with coconut milk", descFr: "Filet de sandre en sauce curry épicée au lait de coco", price: "22,90 €" },
      { num: "", name: "Chicken Curry", desc: "Hähnchenbrustfilet in einer pikanten Curry-Soße, scharf!", descEn: "Chicken breast in a spicy curry sauce, hot!", descFr: "Filet de poulet en sauce curry relevée, piquant !", price: "18,90 €", spicy: true },
      { num: "", name: "Lamm Curry", desc: "Lamm mit Ingwer, Tomaten, Kardamom, Zimt & Kreuzkümmel in einer würzigen Curry-Soße. Spezialität aus Kaschmir", descEn: "Lamb with ginger, tomatoes, cardamom, cinnamon & cumin in a spicy curry sauce. A specialty from Kashmir", descFr: "Agneau au gingembre, tomates, cardamome, cannelle & cumin en sauce curry épicée. Spécialité du Cachemire", price: "21,90 €" },
      { num: "", name: "Butter-Chicken", desc: "Das ikonischste Gericht Indiens: gegrilltes Hähnchen in Tomaten-Butter-Soße mit aromatischen Gewürzen, leicht süßlich. Sehr beliebt!", descEn: "India's most iconic dish: grilled chicken in a tomato butter sauce with aromatic spices, slightly sweet. A real favourite!", descFr: "Le plat le plus emblématique de l'Inde : poulet grillé en sauce tomate au beurre et aux épices aromatiques, légèrement sucrée. Très apprécié !", price: "22,90 €" },
    ],
  },
  {
    id: "menu-ganges",
    title: "Taste of India: Vegetarisches Menü",
    titleEn: "Taste of India: Vegetarian Set Menu",
    titleFr: "Taste of India : menu végétarien",
    subtitle: "Ab 2 Personen, Preis pro Person. Mit Vorspeise, Hauptgang & Dessert, dazu Reis & Naan-Brot",
    subtitleEn: "For 2 people or more, price per person. With starter, main course & dessert, served with rice & naan bread",
    subtitleFr: "À partir de 2 personnes, prix par personne. Avec entrée, plat principal & dessert, accompagné de riz & pain naan",
    dishes: [
      { num: "", name: "Ganges", desc: "Vorspeisen: Papad (knusprige Kräcker mit Minze-Chutney) und Gemüse-Pakora (Blumenkohl, Kartoffeln & Auberginen in Kichererbsenmehl frittiert). Hauptgerichte: Shahi Paneer (hausgemachter Käse mit Kardamom, Nelken & Kreuzkümmel in Cashewsoße), Bharta (gegrillte Aubergine mit Erbsen, Zwiebeln, Ingwer, Tomaten & Knoblauch) und Dal Makhni (schwarze Linsen mit Tomaten & Ingwer in Buttersoße). Beilagen: Gurken-Raita, Basmati-Reis & Naan-Brot. Dessert: Gulab Jamun (goldbraun frittierte Bällchen mit Kardamom & Safran in Rosenwasser-Sirup, garniert mit Mandelflocken)", descEn: "Starters: papad (crispy crackers with mint chutney) and vegetable pakora (cauliflower, potatoes & eggplant fried in chickpea batter). Mains: Shahi Paneer (homemade cheese with cardamom, cloves & cumin in cashew sauce), Bharta (grilled eggplant with peas, onions, ginger, tomatoes & garlic) and Dal Makhni (black lentils with tomatoes & ginger in butter sauce). Sides: cucumber raita, Basmati rice & naan bread. Dessert: Gulab Jamun (golden fried balls with cardamom & saffron in rose water syrup, garnished with almond flakes)", descFr: "Entrées : papad (crackers croustillants avec chutney à la menthe) et pakora de légumes (chou-fleur, pommes de terre & aubergines frits en beignets de pois chiches). Plats : Shahi Paneer (fromage maison à la cardamome, aux clous de girofle & au cumin en sauce aux noix de cajou), Bharta (aubergine grillée avec petits pois, oignons, gingembre, tomates & ail) et Dal Makhni (lentilles noires aux tomates & gingembre en sauce au beurre). Accompagnements : raïta au concombre, riz basmati & pain naan. Dessert : Gulab Jamun (boulettes dorées à la cardamome & au safran dans un sirop à l'eau de rose, garnies de flocons d'amandes)", price: "28,00 €", vegetarian: true },
    ],
  },
  {
    id: "vorspeisen",
    title: "Vorspeisen · Indische Tapas",
    titleEn: "Starters · Indian Tapas",
    titleFr: "Entrées · Tapas indiennes",
    dishes: [
      { num: "68", name: "Mixed Pakora-Teller", desc: "Gemüse-Pakora, Paneer-Pakora & Samosa (für 2 Personen)", descEn: "Vegetable pakora, paneer pakora & samosa (for 2 people)", descFr: "Pakora de légumes, pakora de paneer & samosa (pour 2 personnes)", price: "14,90 €", vegetarian: true },
      { num: "69", name: "Aloo Tikki Chaat", desc: "Neu! Kartoffel-Patties und Kichererbsen mit Joghurt & würzigen Chutneys", descEn: "New! Potato patties and chickpeas with yogurt & spicy chutneys", descFr: "Nouveau ! Galettes de pommes de terre et pois chiches avec yaourt & chutneys épicés", price: "9,40 €" },
      { num: "70", name: "Palak Patta-Chaat", desc: "In Kichererbsenmehl frittierte Spinatblätter mit Tamarinden-Minz-Chutney, würzig und leicht süß-sauer", descEn: "Spinach leaves fried in chickpea batter with tamarind mint chutney, spicy and slightly sweet and sour", descFr: "Feuilles d'épinards frites en pâte de pois chiches avec chutney tamarin et menthe, épicé et légèrement aigre-doux", price: "8,90 €" },
      { num: "71", name: "Paneer-Pakora", desc: "Hausgemachter Paneer mit Chat Masala, in Kichererbsenteig frittiert", descEn: "Homemade paneer with Chat Masala, fried in chickpea batter", descFr: "Paneer maison au Chat Masala, frit en pâte de pois chiches", price: "8,60 €", vegetarian: true },
      { num: "72", name: "Gemüse-Pakora", desc: "Kartoffeln, Blumenkohl und Aubergine in Kichererbsenmehl frittiert", descEn: "Potatoes, cauliflower and eggplant fried in chickpea batter", descFr: "Pommes de terre, chou-fleur et aubergine frits en beignets de pois chiches", price: "7,90 €", vegetarian: true },
      { num: "73", name: "Dahi-Puri", desc: "Knusprige Teigkugeln, gefüllt mit Kartoffeln, Tomaten, Zwiebeln & Kichererbsen, mit süß-saurer Joghurtsoße", descEn: "Crispy dough balls filled with potatoes, tomatoes, onions & chickpeas, with sweet and sour yogurt sauce", descFr: "Boules de pâte croustillantes farcies de pommes de terre, tomates, oignons & pois chiches, avec sauce aigre-douce au yaourt", price: "7,90 €", vegetarian: true },
    ],
  },
  {
    id: "raita",
    title: "Raita",
    titleEn: "Raita",
    titleFr: "Raïta",
    dishes: [
      { num: "74", name: "Joghurtmischung mit indischen Gewürzen", desc: "Joghurt mit Tomaten & Gurken, frischen Kräutern & Gewürzen", descEn: "Yogurt with tomatoes & cucumbers, fresh herbs & Indian spices", descFr: "Yaourt aux tomates & concombres, herbes fraîches & épices indiennes", price: "5,90 €", vegetarian: true },
    ],
  },
  {
    id: "tandoor",
    title: "Aus dem Tandoor · Indischer Lehmofen",
    titleEn: "From the Tandoor · Indian Clay Oven",
    titleFr: "Du Tandoor · Four en terre cuite indien",
    subtitle: "Serviert mit Basmati-Reis & hausgemachter Grillsoße",
    subtitleEn: "Served with Basmati rice & homemade grill sauce",
    subtitleFr: "Servi avec du riz basmati & sauce grillade maison",
    dishes: [
      { num: "75", name: "Tandoori-Chicken", desc: "2 Hähnchenkeulen, mariniert mit Knoblauch, Kurkuma, Kardamom & Zimt, am Spieß gegrillt. Spezialität aus Neu-Delhi", descEn: "2 chicken legs marinated with garlic, turmeric, cardamom & cinnamon, grilled on the skewer. A specialty from New Delhi", descFr: "2 cuisses de poulet marinées à l'ail, au curcuma, à la cardamome & à la cannelle, grillées à la broche. Spécialité de New Delhi", price: "20,90 €" },
      { num: "76", name: "Chicken Tikka", desc: "Hähnchen, mariniert mit Kardamom, Ingwer, Joghurt, Zitrone & Garam Masala, am Spieß gegrillt", descEn: "Chicken marinated with cardamom, ginger, yogurt, lemon & Garam Masala, grilled on the skewer", descFr: "Poulet mariné à la cardamome, au gingembre, au yaourt, au citron & au Garam Masala, grillé à la broche", price: "21,90 €" },
      { num: "77", name: "Garlic-Mint Tikka", desc: "Hähnchen, mariniert mit Minze, Knoblauch, Joghurt, Zitrone & Kräutern, am Spieß gegrillt", descEn: "Chicken marinated with mint, garlic, yogurt, lemon & herbs, grilled on the skewer", descFr: "Poulet mariné à la menthe, à l'ail, au yaourt, au citron & aux herbes, grillé à la broche", price: "21,90 €" },
      { num: "78", name: "Lamm Tikka", desc: "Lammhüfte mit Joghurt, Knoblauch, Ingwer, Kardamom & Garam Masala, am Spieß gegrillt", descEn: "Lamb rump with yogurt, garlic, ginger, cardamom & Garam Masala, grilled on the skewer", descFr: "Quasi d'agneau au yaourt, à l'ail, au gingembre, à la cardamome & au Garam Masala, grillé à la broche", price: "24,90 €", signature: true },
      { num: "79", name: "Mixed-Grill-Teller", desc: "Hähnchen, Lamm & Garnelen mit Joghurt, Knoblauch, Ingwer, Kardamom & Garam Masala, am Spieß im Tandoor gegrillt", descEn: "Chicken, lamb & prawns with yogurt, garlic, ginger, cardamom & Garam Masala, grilled on the skewer in the tandoor", descFr: "Poulet, agneau & crevettes au yaourt, à l'ail, au gingembre, à la cardamome & au Garam Masala, grillés à la broche au tandoor", price: "26,90 €", signature: true },
      { num: "80", name: "Jaipur Prawn Tikka", desc: "Garnelen mit Joghurt, Knoblauch, Ingwer, Kardamom & Garam Masala, am Spieß im Tandoor gegrillt", descEn: "Prawns with yogurt, garlic, ginger, cardamom & Garam Masala, grilled on the skewer in the tandoor", descFr: "Crevettes au yaourt, à l'ail, au gingembre, à la cardamome & au Garam Masala, grillées à la broche au tandoor", price: "24,90 €" },
      { num: "81", name: "Seekh Kebab", desc: "Hausgemachtes Hackfleisch aus der Lammhüfte mit Cashewnüssen, Ingwer, Koriander & Tomaten, mariniert und am Spieß gegrillt. Spezialität aus Nordindien", descEn: "Homemade minced lamb rump with cashews, ginger, coriander & tomatoes, marinated and grilled on the skewer. A specialty from North India", descFr: "Viande hachée maison de quasi d'agneau aux noix de cajou, gingembre, coriandre & tomates, marinée et grillée à la broche. Spécialité du nord de l'Inde", price: "20,90 €" },
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
      { num: "82", name: "Butter-Chicken", desc: "Das ikonischste Gericht der Welt: gegrilltes Hähnchen in Tomaten-Butter-Soße mit aromatischen Gewürzen, leicht süßlich. Sehr beliebt!", descEn: "The world's most iconic dish: grilled chicken in a tomato butter sauce with aromatic spices, slightly sweet. A real favourite!", descFr: "Le plat le plus emblématique du monde : poulet grillé en sauce tomate au beurre et aux épices aromatiques, légèrement sucrée. Très apprécié !", price: "21,90 €" },
      { num: "83", name: "Karahi Chicken", desc: "Hähnchen mit Tomaten, Paprika, Ingwer & Kreuzkümmel in Curry-Soße", descEn: "Chicken with tomatoes, peppers, ginger & cumin in curry sauce", descFr: "Poulet aux tomates, poivrons, gingembre & cumin en sauce curry", price: "19,90 €" },
      { num: "84", name: "Chicken Curry", desc: "Hähnchen mit Tomaten, Knoblauch, Ingwer & Zwiebeln in pikanter Currysoße, scharf", descEn: "Chicken with tomatoes, garlic, ginger & onions in spicy curry sauce, hot", descFr: "Poulet aux tomates, ail, gingembre & oignons en sauce curry relevée, piquant", price: "18,90 €", verySpicy: true },
      { num: "85", name: "Chicken Tikka Masala", desc: "Gegrilltes Hähnchen in einer würzigen Tomaten-Masala-Soße", descEn: "Grilled chicken in a spicy tomato Masala sauce", descFr: "Poulet grillé en sauce Masala épicée à la tomate", price: "19,90 €" },
      { num: "86", name: "Murgh Safran", desc: "Hähnchen in Cashewsoße mit Kardamom, Safran & gerösteten Zwiebeln", descEn: "Chicken in cashew sauce with cardamom, saffron & roasted onions", descFr: "Poulet en sauce aux noix de cajou avec cardamome, safran & oignons grillés", price: "20,90 €", signature: true },
      { num: "87", name: "Chili Chicken", desc: "Hähnchen mit Paprika, Zwiebeln, Knoblauch & Ingwer in pikanter Chilisoße, exotisch scharf", descEn: "Chicken with peppers, onions, garlic & ginger in spicy chili sauce, exotically hot", descFr: "Poulet aux poivrons, oignons, ail & gingembre en sauce chili relevée, piquant et exotique", price: "20,90 €", verySpicy: true },
      { num: "88", name: "Kerala Chicken", desc: "Hähnchen mit Ingwer, Knoblauch, Zimt & Garam Masala in würziger Kokosmilch-Soße, nach südindischer Art", descEn: "Chicken with ginger, garlic, cinnamon & Garam Masala in spicy coconut milk sauce, South Indian style", descFr: "Poulet au gingembre, ail, cannelle & Garam Masala en sauce épicée au lait de coco, à la mode du sud de l'Inde", price: "19,90 €" },
      { num: "89", name: "Murg Vindaloo", desc: "Hähnchen mit Kartoffeln, Ingwer, Zimt & Koriander in Vindaloo-Curry-Soße, scharf!", descEn: "Chicken with potatoes, ginger, cinnamon & coriander in Vindaloo curry sauce, hot!", descFr: "Poulet aux pommes de terre, gingembre, cannelle & coriandre en sauce curry Vindaloo, piquant !", price: "19,90 €", verySpicy: true },
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
      { num: "90", name: "Lamm Curry", desc: "Lamm mit Ingwer, Tomaten, Kardamom, Zwiebeln & Knoblauch in würziger Curry-Soße", descEn: "Lamb with ginger, tomatoes, cardamom, onions & garlic in spicy curry sauce", descFr: "Agneau au gingembre, tomates, cardamome, oignons & ail en sauce curry épicée", price: "21,90 €", signature: true },
      { num: "91", name: "Lamm Korma", desc: "Lamm mit Cashewkernen & Garam Masala in Mandelsoße mit Sahne, aus der königlichen Mogul-Küche", descEn: "Lamb with cashews & Garam Masala in almond sauce with cream, from the royal Mughal cuisine", descFr: "Agneau aux noix de cajou & Garam Masala en sauce aux amandes et à la crème, de la cuisine royale moghole", price: "22,90 €" },
      { num: "92", name: "Lamm Vindaloo", desc: "Lamm mit Kartoffeln, Ingwer, Kardamom & Kümmel in Vindaloo-Soße, scharf", descEn: "Lamb with potatoes, ginger, cardamom & caraway in Vindaloo sauce, hot", descFr: "Agneau aux pommes de terre, gingembre, cardamome & carvi en sauce Vindaloo, piquant", price: "21,90 €", verySpicy: true },
      { num: "93", name: "Gosht Saagwala", desc: "Lamm mit Spinat, Tomaten, Nelken, Zimt & Zwiebeln in milder Curry-Sahne-Soße", descEn: "Lamb with spinach, tomatoes, cloves, cinnamon & onions in a mild creamy curry sauce", descFr: "Agneau aux épinards, tomates, clous de girofle, cannelle & oignons en sauce curry douce à la crème", price: "21,90 €" },
      { num: "94", name: "Gosht Achari", desc: "Lamm mit Ingwer, Knoblauch, Koriander & Senfkörnern in Achari-Masala-Soße, scharf", descEn: "Lamb with ginger, garlic, coriander & mustard seeds in Achari Masala sauce, hot", descFr: "Agneau au gingembre, ail, coriandre & graines de moutarde en sauce Achari Masala, piquant", price: "21,90 €", spicy: true },
      { num: "95", name: "Lamm Karahi", desc: "Lamm mit Champignons, Tomaten, Brokkoli, Paprika, Ingwer & Zwiebeln in würziger Soße", descEn: "Lamb with mushrooms, tomatoes, broccoli, peppers, ginger & onions in spicy sauce", descFr: "Agneau aux champignons, tomates, brocoli, poivrons, gingembre & oignons en sauce épicée", price: "22,90 €", signature: true },
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
      { num: "96", name: "Prawn Jal Frezi", desc: "Garnelen mit Paprika, Tomaten, Ingwer, Knoblauch & Zwiebeln in würziger Curry-Soße", descEn: "Prawns with peppers, tomatoes, ginger, garlic & onions in spicy curry sauce", descFr: "Crevettes aux poivrons, tomates, gingembre, ail & oignons en sauce curry épicée", price: "22,90 €" },
      { num: "97", name: "Coconut Prawn", desc: "Garnelen mit Kartoffeln, Ingwer, Knoblauch & Nelken in Kokosmilch und südindischer Curry-Soße, nach Goa-Art", descEn: "Prawns with potatoes, ginger, garlic & cloves in coconut milk and South Indian curry sauce, Goa style", descFr: "Crevettes aux pommes de terre, gingembre, ail & clous de girofle au lait de coco et sauce curry du sud de l'Inde, façon Goa", price: "22,90 €" },
      { num: "98", name: "Chili Prawn", desc: "Garnelen mit Chili, Ingwer, Paprika, Knoblauch & Zwiebeln in scharfer Soße", descEn: "Prawns with chili, ginger, peppers, garlic & onions in hot sauce", descFr: "Crevettes au piment, gingembre, poivrons, ail & oignons en sauce piquante", price: "22,90 €", verySpicy: true },
      { num: "99", name: "Fish Masala", desc: "Zanderfilet mit Kreuzkümmel, Ingwer, Koriander, Kurkuma & Tomaten in Masala-Soße", descEn: "Pike-perch fillet with cumin, ginger, coriander, turmeric & tomatoes in Masala sauce", descFr: "Filet de sandre au cumin, gingembre, coriandre, curcuma & tomates en sauce Masala", price: "22,90 €" },
      { num: "100", name: "Kerala Fish Curry", desc: "Zanderfilet mit Ingwer, Zimt, Knoblauch & Nelken in Kokosmilch und würziger Curry-Soße, nach südindischer Art", descEn: "Pike-perch fillet with ginger, cinnamon, garlic & cloves in coconut milk and spicy curry sauce, South Indian style", descFr: "Filet de sandre au gingembre, cannelle, ail & clous de girofle au lait de coco et sauce curry épicée, à la mode du sud de l'Inde", price: "22,90 €" },
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
      { num: "101", name: "Dal Makhni oder Dal Tadka", desc: "Dal Makhni: schwarze Linsen mit Tomaten, Ingwer & Knoblauch in cremiger Buttersoße. Oder Dal Tadka mit gelben Linsen", descEn: "Dal Makhni: black lentils with tomatoes, ginger & garlic in creamy butter sauce. Or Dal Tadka with yellow lentils", descFr: "Dal Makhni : lentilles noires aux tomates, gingembre & ail en sauce crémeuse au beurre. Ou Dal Tadka aux lentilles jaunes", price: "14,90 €", vegetarian: true },
      { num: "102", name: "Mix Veg Curry", desc: "Gemischtes Gemüse: Kartoffeln, Paprika, Erbsen, Karotten, Blumenkohl & Champignons in Curry-Soße", descEn: "Mixed vegetables: potatoes, peppers, peas, carrots, cauliflower & mushrooms in curry sauce", descFr: "Légumes variés : pommes de terre, poivrons, petits pois, carottes, chou-fleur & champignons en sauce curry", price: "15,90 €", vegetarian: true },
      { num: "103", name: "Palak Paneer", desc: "Paneer mit Spinat, Tomaten, Ingwer & Masala in Sahnesoße", descEn: "Paneer with spinach, tomatoes, ginger & Masala in cream sauce", descFr: "Paneer aux épinards, tomates, gingembre & Masala en sauce à la crème", price: "16,90 €", vegetarian: true },
      { num: "104", name: "Kadahi Paneer", desc: "Paneer mit Paprika, Tomaten, Ingwer & Nelken in Curry-Soße", descEn: "Paneer with peppers, tomatoes, ginger & cloves in curry sauce", descFr: "Paneer aux poivrons, tomates, gingembre & clous de girofle en sauce curry", price: "17,90 €", vegetarian: true },
      { num: "105", name: "Aloo Chana Masala", desc: "Kichererbsen mit Kartoffeln in würziger Masala-Soße (vegan)", descEn: "Chickpeas with potatoes in spicy Masala sauce (vegan)", descFr: "Pois chiches aux pommes de terre en sauce Masala épicée (végétalien)", price: "15,90 €", vegetarian: true },
      { num: "106", name: "Bharta", desc: "Gegrillte Auberginen mit Erbsen, Tomaten, Zwiebeln, Ingwer, Knoblauch & Kreuzkümmel (vegan)", descEn: "Grilled eggplant with peas, tomatoes, onions, ginger, garlic & cumin (vegan)", descFr: "Aubergines grillées avec petits pois, tomates, oignons, gingembre, ail & cumin (végétalien)", price: "16,90 €", vegetarian: true },
      { num: "107", name: "Malai Kofta", desc: "Bällchen aus Paneer, Kartoffeln & Gewürzen in Cashew-Soße, mit Rosinen garniert", descEn: "Paneer, potato & spice balls in cashew sauce, garnished with raisins", descFr: "Boulettes de paneer, pommes de terre & épices en sauce aux noix de cajou, garnies de raisins secs", price: "17,90 €", vegetarian: true },
      { num: "108", name: "Paneer Tikka Masala", desc: "Gegrillter Paneer mit Ingwer & Knoblauch in würziger Tomaten-Masala-Soße", descEn: "Grilled paneer with ginger & garlic in spicy tomato Masala sauce", descFr: "Paneer grillé au gingembre & à l'ail en sauce Masala épicée à la tomate", price: "17,90 €", vegetarian: true, signature: true },
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
      { num: "109", name: "Chicken Biryani", desc: "Hähnchen mit Safran-Basmati-Reis & aromatischen Gewürzen, garniert mit Röstzwiebeln, Mandeln & Rosinen", descEn: "Chicken with saffron Basmati rice & aromatic spices, garnished with crispy fried onions, almonds & raisins", descFr: "Poulet avec riz basmati au safran & épices aromatiques, garni d'oignons frits, d'amandes & de raisins secs", price: "19,90 €", signature: true },
      { num: "110", name: "Bombay Lamm-Biryani", desc: "Lamm mit Safran-Basmati-Reis, Ingwer, Knoblauch & Koriander, garniert mit Mandeln & Rosinen", descEn: "Lamb with saffron Basmati rice, ginger, garlic & coriander, garnished with almonds & raisins", descFr: "Agneau avec riz basmati au safran, gingembre, ail & coriandre, garni d'amandes & de raisins secs", price: "21,90 €" },
      { num: "111", name: "Prawn Biryani", desc: "Garnelen mit Ingwer, Knoblauch, Zimt, Kardamom & Safran-Basmati-Reis, garniert mit Röstzwiebeln, Mandeln & Rosinen", descEn: "Prawns with ginger, garlic, cinnamon, cardamom & saffron Basmati rice, garnished with crispy fried onions, almonds & raisins", descFr: "Crevettes au gingembre, ail, cannelle, cardamome & riz basmati au safran, garnies d'oignons frits, d'amandes & de raisins secs", price: "22,90 €" },
      { num: "112", name: "Jaipur Mix Biryani", desc: "Hähnchen, Lamm & Garnelen in Joghurt-Masala-Marinade mit Safran-Basmati-Reis, garniert mit Mandeln, Rosinen & Zwiebeln", descEn: "Chicken, lamb & prawns in a yogurt Masala marinade with saffron Basmati rice, garnished with almonds, raisins & onions", descFr: "Poulet, agneau & crevettes en marinade Masala au yaourt avec riz basmati au safran, garnis d'amandes, de raisins secs & d'oignons", price: "23,90 €" },
      { num: "113", name: "Gemüse Biryani", desc: "Safran-Basmati-Reis mit Paneer, Tomaten, Blumenkohl, Paprika, Erbsen & Kartoffeln, garniert mit Mandeln, Rosinen & Zwiebeln", descEn: "Saffron Basmati rice with paneer, tomatoes, cauliflower, peppers, peas & potatoes, garnished with almonds, raisins & onions", descFr: "Riz basmati au safran avec paneer, tomates, chou-fleur, poivrons, petits pois & pommes de terre, garni d'amandes, de raisins secs & d'oignons", price: "16,90 €", vegetarian: true },
    ],
  },
  {
    id: "naan",
    title: "Indisches Fladenbrot · Naan",
    titleEn: "Indian Flatbread · Naan",
    titleFr: "Pain plat indien · Naan",
    dishes: [
      { num: "114", name: "Gemischter Brotkorb", desc: "Dreierlei Fladenbrot: Knoblauch-Naan, Butter-Naan, Tandoori Roti", descEn: "Three flatbreads: garlic naan, butter naan, tandoori roti", descFr: "Trois pains plats : naan à l'ail, naan au beurre, tandoori roti", price: "9,90 €", vegetarian: true },
      { num: "115", name: "Knoblauch Naan", desc: "Fladenbrot mit Knoblauch & Koriander", descEn: "Flatbread with garlic & coriander", descFr: "Pain plat à l'ail & coriandre", price: "4,70 €", vegetarian: true },
      { num: "116", name: "Butter Naan", desc: "Fladenbrot mit Butter", descEn: "Flatbread with butter", descFr: "Pain plat au beurre", price: "4,40 €", vegetarian: true },
      { num: "117", name: "Paneer Naan", desc: "Fladenbrot gefüllt mit Paneer (hausg. Käse), Ingwer & Koriander", descEn: "Flatbread filled with paneer (homemade cheese), ginger & coriander", descFr: "Pain plat farci au paneer (fromage maison), gingembre & coriandre", price: "6,60 €", vegetarian: true },
      { num: "118", name: "Peshwari Naan", desc: "Fladenbrot gefüllt mit Nüssen & Rosinen, Kokosnuss & Paneer, dazu Mango-Chutney", descEn: "Flatbread filled with nuts & raisins, coconut & paneer, with mango chutney", descFr: "Pain plat farci de noix & raisins secs, noix de coco & paneer, avec chutney de mangue", price: "6,90 €", vegetarian: true, signature: true },
      { num: "119", name: "Classic Naan", desc: "Fladenbrot aus Weizenmehl", descEn: "Wheat flour flatbread", descFr: "Pain plat à la farine de blé", price: "3,60 €", vegetarian: true },
      { num: "120", name: "Tandoori Roti", desc: "Aus Vollkornmehl", descEn: "Whole wheat", descFr: "Farine complète", price: "2,90 €", vegetarian: true },
      { num: "121", name: "Knoblauch Roti", desc: "Aus Vollkornmehl mit Knoblauch", descEn: "Whole wheat with garlic", descFr: "Farine complète à l'ail", price: "3,60 €", vegetarian: true },
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
];

const filterMap: Record<number, string[]> = {
  1: ["vorspeisen", "raita"],
  2: ["tandoor"],
  3: ["chicken"],
  4: ["lamb"],
  5: ["seafood"],
  6: ["menu-ganges", "vegetarian"],
  7: ["biryani"],
  8: ["naan"],
};

// Inline style so the artwork URLs carry the base path (CSS modules cannot read it).
const artVars = {
  "--mc-paper-img": `url(${ART}/parchment.webp)`,
  "--mc-frame-img": `url(${ART}/frame.webp)`,
  "--mc-divider-img": `url(${ART}/divider.webp)`,
} as CSSProperties;

// The print's dividers differ in length; the short ones are their own crops so the flower keeps its size.
function Divider({ variant }: { variant?: "mid" | "short" | "end" }) {
  const file = variant === "short" ? "divider-short" : variant === "end" ? "divider-end" : "divider";
  const cls = variant ? styles[`coverDivider_${variant}`] : "";
  return <img src={`${ART}/${file}.webp`} alt="" aria-hidden="true" className={`${styles.coverDivider} ${cls}`} />;
}

export default function MenuPopup({ isOpen, onClose }: MenuPopupProps) {
  const [filter, setFilter] = useState(0);
  const [coverInView, setCoverInView] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLElement>(null);
  const menuStartRef = useRef<HTMLDivElement>(null);
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

  // The corner leaves belong to the dishes, so they rest while the cover page is on screen
  useEffect(() => {
    const cover = coverRef.current;
    const root = listRef.current;
    if (!cover || !root) return;
    const io = new IntersectionObserver(([entry]) => setCoverInView(entry.isIntersecting), { root });
    io.observe(cover);
    return () => io.disconnect();
  }, [isOpen, filter]);

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

  const showCover = filter === 0;
  const showCorners = !showCover || !coverInView;

  const goToMenu = () => {
    const list = listRef.current;
    const start = menuStartRef.current;
    if (!list || !start) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ top: start.offsetTop - 14, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.popup} style={artVars}>
        {/* ═══ CARD ARTWORK: printed frame and corner leaves ═══ */}
        <img src={`${ART}/leaf-tl.webp`} alt="" aria-hidden="true" className={`${styles.corner} ${styles.cornerTl} ${showCorners ? styles.cornerOn : ""}`} />
        <img src={`${ART}/leaf-br.webp`} alt="" aria-hidden="true" className={`${styles.corner} ${styles.cornerBr} ${showCorners ? styles.cornerOn : ""}`} />
        <div aria-hidden="true" className={styles.frame} />

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
              className={`${styles.filterBtn} ${filter === i ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter(i)}
            >
              {t(label.de, label.en, label.fr)}
            </button>
          ))}
        </div>

        {/* ═══ LEGEND ═══ */}
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

        {/* ═══ MENU LIST ═══ */}
        <div className={styles.menuList} ref={listRef}>
          {/* ═══ COVER: printed page 2 as live text ═══ */}
          {showCover && (
            <div className={styles.coverWrap}>
              <section ref={coverRef} className={styles.cover} aria-labelledby="menu-cover-heading">
                <img src={`${ART}/cover-tl.webp`} alt="" aria-hidden="true" className={`${styles.coverArt} ${styles.coverTl}`} />
                <img src={`${ART}/cover-tr.webp`} alt="" aria-hidden="true" className={`${styles.coverArt} ${styles.coverTr}`} />
                <img src={`${ART}/cover-bottom.webp`} alt="" aria-hidden="true" className={`${styles.coverArt} ${styles.coverBottom}`} />
                <div className={styles.coverText}>
                  <img src={`${BASE}/images/logo-navbar.png`} alt="Jaipur Indian Heritage" className={styles.coverLogo} width={766} height={500} />
                  <p className={styles.coverTagline}>Authentic Indian Cuisine</p>
                  <p className={styles.coverSince}>For Over 30 years</p>
                  <h3 id="menu-cover-heading" className={styles.coverHeading}>
                    {t("Freiburgs ältestes indisches Restaurant", "Freiburg\u2019s oldest Indian restaurant", "Le plus ancien restaurant indien de Fribourg")}
                  </h3>
                  <Divider />
                  <p className={styles.coverPara}>
                    {t("Namaste und herzlich willkommen im Jaipur!", "Namaste and a warm welcome to Jaipur!", "Namaste et bienvenue chez Jaipur\u00a0!")}
                    <br />
                    {t(
                      "Seit über drei Jahrzehnten verwöhnen wir unsere Gäste mit der Vielfalt der traditionellen indischen Küche. Mit der frischen Zutaten, authentischen Rezepten und aromatischen Gewürzen bereiten wir jedes Gericht mit Leidenschaft zu.",
                      "For more than three decades we have been spoiling our guests with the variety of traditional Indian cooking. With fresh ingredients, authentic recipes and aromatic spices, we prepare every dish with passion.",
                      "Depuis plus de trois décennies, nous régalons nos hôtes de toute la richesse de la cuisine indienne traditionnelle. Avec des ingrédients frais, des recettes authentiques et des épices aromatiques, nous préparons chaque plat avec passion."
                    )}
                  </p>
                  <Divider />
                  <p className={styles.coverPara}>
                    {t(
                      "Ob würzige Currys, duftender Biryani oder frisch gebackenes Naan aus dem Tandoor-Ofen\u00a0\u2013 erleben Sie den echten Geschmack Indiens.",
                      "Whether spicy curries, fragrant biryani or naan freshly baked in the tandoor oven, discover the true taste of India.",
                      "Currys relevés, biryani parfumé ou naan tout juste sorti du four tandoor\u00a0: découvrez le vrai goût de l\u2019Inde."
                    )}
                  </p>
                  <Divider variant="mid" />
                  <p className={styles.coverPara}>
                    {t(
                      "Wir wünschen Ihnen einen angenehmen Aufenthalt und guten Appetit.",
                      "We wish you a pleasant stay and hope you enjoy your meal.",
                      "Nous vous souhaitons un agréable moment parmi nous et bon appétit."
                    )}
                  </p>
                  <Divider variant="short" />
                  <p className={styles.coverThanks}>
                    {t("Vielen Dank für Ihren Besuch.", "Thank you for your visit.", "Merci de votre visite.")}
                  </p>
                  <Divider variant="end" />
                </div>
              </section>
              <button type="button" className={styles.coverCta} onClick={goToMenu}>
                {t("Zur Speisekarte", "View the menu", "Voir la carte")}
                <ChevronDown size={16} aria-hidden="true" />
              </button>
            </div>
          )}

          <div ref={menuStartRef}>
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
                  {category.dishes.map((dish, di) => {
                    // A German name needs no German repeat, but EN and FR still get a gloss (Thali).
                    const desc = t(dish.desc, dish.descEn || dish.desc, dish.descFr || dish.descEn || dish.desc);
                    return (
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
                        {desc && <p className={styles.dishDesc}>{desc}</p>}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ═══ CATERING ═══ */}
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
        </div>
      </div>
    </div>
  );
}
