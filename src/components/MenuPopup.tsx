"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./menu.module.css";
import { X, Flame, Leaf, Award, Phone } from "lucide-react";
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
  subtitle?: string;
  subtitleEn?: string;
  dishes: Dish[];
}

const menuData: MenuCategory[] = [
  {
    id: "thali",
    title: "Mittagsmenü — Thali Lunch",
    titleEn: "Lunch Menu — Thali Lunch",
    subtitle: "Mit Naan Brot, Raita (Joghurt-Mix) und Basmati-Reis",
    subtitleEn: "With Naan bread, Raita (yogurt mix) and Basmati rice",
    dishes: [
      { num: "", name: "Vegetarisch Thali", desc: "Vegetarisches Thali", descEn: "Vegetarian Thali", price: "13,90 €", vegetarian: true },
      { num: "", name: "Hähnchen & Gemüse Thali", desc: "Thali mit Hähnchen und Gemüse", descEn: "Thali with chicken and vegetables", price: "15,90 €" },
    ],
  },
  {
    id: "vorspeisen",
    title: "Vorspeisen — Indische Tapas",
    titleEn: "Starters — Indian Tapas",
    dishes: [
      { num: "65", name: "Papad mit Dip Teller", desc: "Knusprig gebackene Kräcker aus Linsenmehl mit viererlei indischen Chutneys", descEn: "Crispy crackers from lentil flour with four Indian chutneys", price: "4,90 €", vegetarian: true },
      { num: "66", name: "Aloo-Paneer-Samosa", desc: "2 gefüllte Teigtaschen mit Kartoffeln, Paneer & Erbsen dazu Minze-Dip", descEn: "2 stuffed pastries with potatoes, paneer & peas with mint dip", price: "7,90 €", vegetarian: true },
      { num: "73", name: "Chat Papadi", desc: "Dünne knusprige Cracker mit Kartoffeln, Tomaten, Kichererbsen, Joghurt-Soße", descEn: "Thin crispy crackers with potatoes, tomatoes, chickpeas, yogurt sauce", price: "6,90 €", vegetarian: true },
      { num: "69", name: "Gemüse-Pakora", desc: "Kartoffeln, Blumenkohl und Aubergine in Kichererbsenmehl frittiert", descEn: "Potatoes, cauliflower and eggplant fried in chickpea batter", price: "7,90 €", vegetarian: true },
      { num: "70", name: "Paneer-Pakora", desc: "Hausgemachter Paneer in Kichererbsenmehl frittiert mit Chat Masala", descEn: "Homemade paneer fried in chickpea batter with Chat Masala", price: "8,40 €", vegetarian: true },
      { num: "72", name: "Mixed Pakora-Teller", desc: "Gemüse-, Paneer, Hähnchen-Pakora & Samosa (für 2-3 Personen)", descEn: "Vegetable, paneer, chicken pakora & samosa (for 2-3 people)", price: "14,90 €" },
    ],
  },
  {
    id: "raita",
    title: "Raita",
    titleEn: "Raita",
    dishes: [
      { num: "74", name: "Gurken-Tomaten-Raita", desc: "Joghurt mit indischen Gewürzen, Gurken, Tomaten & Zwiebeln", descEn: "Yogurt with Indian spices, cucumbers, tomatoes & onions", price: "5,60 €", vegetarian: true },
    ],
  },
  {
    id: "tandoor",
    title: "Aus dem Tandoor — Indischer Lehmofen",
    titleEn: "From the Tandoor — Indian Clay Oven",
    subtitle: "Serviert mit Basmati-Reis",
    subtitleEn: "Served with Basmati rice",
    dishes: [
      { num: "75", name: "Tandoori-Chicken", desc: "Hähnchenschenkel, mariniert in Joghurt und Garam-Masala, im Tandoor gegrillt", descEn: "Chicken legs, marinated in yogurt and Garam Masala, grilled in tandoor", price: "18,90 €", signature: true },
      { num: "76", name: "Chicken Tikka", desc: "Hähnchenbrustfilet mariniert mit Joghurt, Kardamom & Zitrone", descEn: "Chicken breast marinated with yogurt, cardamom & lemon", price: "19,90 €" },
      { num: "77", name: "Garlic-Mint Tikka", desc: "Hähnchenbrustfilet mariniert mit Joghurt, Minze, Knoblauch & Kräutern — Spezialität", descEn: "Chicken breast marinated with yogurt, mint, garlic & herbs — specialty", price: "19,90 €", signature: true },
      { num: "78", name: "Lamm Tikka", desc: "Lamm mariniert in Joghurt, Knoblauch, Ingwer & Kardamom — Chef Spezial", descEn: "Lamb marinated in yogurt, garlic, ginger & cardamom — Chef's special", price: "23,90 €", signature: true },
    ],
  },
  {
    id: "chicken",
    title: "Murgh — Hähnchen",
    titleEn: "Murgh — Chicken",
    subtitle: "Serviert mit Basmati-Reis",
    subtitleEn: "Served with Basmati rice",
    dishes: [
      { num: "84", name: "Karahi Chicken", desc: "Hähnchenbrustfilet mit Tomaten, Paprika, Zwiebeln & Ingwer", descEn: "Chicken breast with tomatoes, peppers, onions & ginger", price: "19,90 €" },
      { num: "85", name: "Chicken Curry", desc: "Hähnchenbrustfilet in pikanter Currysoße nach indischer Art", descEn: "Chicken breast in spicy curry sauce, Indian style", price: "18,90 €", spicy: true },
      { num: "86", name: "Chicken Tikka Masala", desc: "Im Tandoor gegrillt, in würziger Masala-Soße — Spezialität des Hauses", descEn: "Grilled in tandoor, in spicy masala sauce — house specialty", price: "19,90 €", signature: true },
      { num: "87", name: "Murgh Zaffran", desc: "Gegrilltes Hähnchen in milder Cashew-Soße, mit Safran & Kardamom", descEn: "Grilled chicken in mild cashew sauce, with saffron & cardamom", price: "19,90 €", signature: true },
      { num: "88", name: "Chili Chicken", desc: "Hähnchenbrustfilet in pikanter Chilisoße mit Zwiebeln & Ingwer", descEn: "Chicken breast in spicy chili sauce with onions & ginger", price: "19,90 €", verySpicy: true },
      { num: "90", name: "Murg Vindaloo", desc: "Hähnchen mit Kartoffeln, Ingwer & Kokosraspeln in Vindaloo-Curry-Soße", descEn: "Chicken with potatoes, ginger & coconut in Vindaloo curry sauce", price: "18,90 €", spicy: true },
    ],
  },
  {
    id: "lamb",
    title: "Gosht — Lamm aus der Keule",
    titleEn: "Gosht — Leg of Lamb",
    subtitle: "Serviert mit Basmati-Reis",
    subtitleEn: "Served with Basmati rice",
    dishes: [
      { num: "91", name: "Lamm Curry", desc: "Lamm mit Kardamom, Zimt & Ingwer — Rezept aus Kaschmir", descEn: "Lamb with cardamom, cinnamon & ginger — Kashmir recipe", price: "21,90 €", signature: true },
      { num: "92", name: "Lamm Korma", desc: "Lamm in milder Soße aus Mandeln, Sahne & Cashew — Mogul-Küche", descEn: "Lamb in mild sauce of almonds, cream & cashew — Mughal cuisine", price: "22,90 €", signature: true },
      { num: "93", name: "Lamm Vindaloo", desc: "Lamm mit Kartoffeln, Ingwer & Kokosraspeln in Vindaloo-Soße", descEn: "Lamb with potatoes, ginger & coconut in Vindaloo sauce", price: "21,90 €", spicy: true },
      { num: "94", name: "Gosht Saagwala", desc: "Lamm mit Spinat, Tomaten & Zwiebeln in orientalischer Gewürzmischung", descEn: "Lamb with spinach, tomatoes & onions in oriental spice mix", price: "21,90 €" },
      { num: "95", name: "Gosht Achari", desc: "Lamm mit Ingwer, Knoblauch, Koriander & Kreuzkümmel in Masala-Soße", descEn: "Lamb with ginger, garlic, coriander & cumin in Masala sauce", price: "21,90 €" },
      { num: "96", name: "Lamm Karahi", desc: "Lamm mit Champignons, Zwiebeln, Tomaten, Brokkoli & Paprika — Spezialität", descEn: "Lamb with mushrooms, onions, tomatoes, broccoli & peppers — specialty", price: "22,90 €", signature: true },
    ],
  },
  {
    id: "seafood",
    title: "Samundari — Aus dem Meer",
    titleEn: "Samundari — From the Sea",
    subtitle: "Serviert mit Basmati-Reis",
    subtitleEn: "Served with Basmati rice",
    dishes: [
      { num: "97", name: "Prawn Jal Frezi", desc: "Garnelen in würziger Curry-Soße mit Paprika, Tomaten & Ingwer", descEn: "Prawns in spicy curry sauce with peppers, tomatoes & ginger", price: "22,90 €" },
      { num: "98", name: "Coconut Prawn", desc: "Garnelen mit Kartoffeln, Ingwer & Kokos, in Kokosmilch — Goa Art", descEn: "Prawns with potatoes, ginger & coconut, in coconut milk — Goa style", price: "22,90 €" },
      { num: "99", name: "Chili Prawn", desc: "Garnelen mit Paprika, Chili und Zwiebeln, in scharfer Soße", descEn: "Prawns with peppers, chili and onions, in spicy sauce", price: "22,90 €", spicy: true },
      { num: "100", name: "Fish Masala", desc: "Zanderfilet in Masala-Soße mit Tomaten & Ingwer", descEn: "Pike-perch fillet in Masala sauce with tomatoes & ginger", price: "22,90 €" },
      { num: "101", name: "Kerala Fish Curry", desc: "Zanderfilet in Curry-Soße mit Tamarinde & Kokosmilch — südindisch", descEn: "Pike-perch fillet in curry sauce with tamarind & coconut milk — South Indian", price: "22,90 €", signature: true },
    ],
  },
  {
    id: "vegetarian",
    title: "Vegetarisch — Gemüse & Käse",
    titleEn: "Vegetarian — Vegetables & Cheese",
    subtitle: "Serviert mit Basmati-Reis",
    subtitleEn: "Served with Basmati rice",
    dishes: [
      { num: "102", name: "Dal Makhni", desc: "Schwarze Linsen in Buttersoße mit indischer Spezial-Gewürzmischung", descEn: "Black lentils in butter sauce with Indian special spice mix", price: "14,90 €", vegetarian: true },
      { num: "103", name: "Mix Veg Curry", desc: "Kartoffeln, Bohnen, Paprika, Erbsen, Blumenkohl in Curry-Soße", descEn: "Potatoes, beans, peppers, peas, cauliflower in curry sauce", price: "15,90 €", vegetarian: true },
      { num: "104", name: "Palak Paneer", desc: "Spinat mit Paneer, Tomaten & Ingwer in Masala-Soße", descEn: "Spinach with paneer, tomatoes & ginger in Masala sauce", price: "16,90 €", vegetarian: true },
      { num: "105", name: "Karahi Paneer", desc: "Paneer mit Paprika, Tomaten & Ingwer", descEn: "Paneer with peppers, tomatoes & ginger", price: "16,90 €", vegetarian: true },
      { num: "106", name: "Aloo Chana Masala", desc: "Kichererbsen mit Kartoffeln in würziger Masala-Soße", descEn: "Chickpeas with potatoes in spicy Masala sauce", price: "15,90 €", vegetarian: true },
      { num: "107", name: "Bharta", desc: "Auberginen gegrillt & püriert, mit Zwiebeln, Erbsen & Tomaten", descEn: "Grilled & pureed eggplant with onions, peas & tomatoes", price: "16,90 €", vegetarian: true },
      { num: "108", name: "Malai Kofta", desc: "Gemüse-Käsebällchen mit Kartoffeln, Mandeln & Rosinen in Cashew-Soße", descEn: "Vegetable cheese balls with potatoes, almonds & raisins in cashew sauce", price: "17,90 €", vegetarian: true },
      { num: "109", name: "Paneer Tikka Masala", desc: "Im Tandoor gegrillter Paneer in Masala-Soße — vegetarische Köstlichkeit", descEn: "Tandoor-grilled paneer in Masala sauce — vegetarian delicacy", price: "17,90 €", vegetarian: true, signature: true },
    ],
  },
  {
    id: "biryani",
    title: "Biryani — Reis",
    titleEn: "Biryani — Rice",
    subtitle: "Serviert mit Gurken-Raita",
    subtitleEn: "Served with cucumber Raita",
    dishes: [
      { num: "110", name: "Chicken Tikka Biryani", desc: "Gegrilltes Hähnchen mit gebratenem Safran-Reis — Spezialität", descEn: "Grilled chicken with fried saffron rice — specialty", price: "19,90 €", signature: true },
      { num: "111", name: "Bombay Lamm-Biryani", desc: "Safran-Reis mit Lamm, garniert mit Nüssen & Rosinen", descEn: "Saffron rice with lamb, garnished with nuts & raisins", price: "21,90 €" },
      { num: "112", name: "Prawn Biryani", desc: "Safran-Reis mit Garnelen, Kardamom, Ingwer & Kräutern", descEn: "Saffron rice with prawns, cardamom, ginger & herbs", price: "22,90 €" },
      { num: "113", name: "Jaipur Mix Biryani", desc: "Safran-Reis mit Hähnchen, Garnelen & Lamm, garniert mit Mandelflocken", descEn: "Saffron rice with chicken, prawns & lamb, garnished with almond flakes", price: "24,90 €", signature: true },
      { num: "114", name: "Gemüse-Paneer Biryani", desc: "Frisches Gemüse mit mariniertem Käse in Safran-Reis", descEn: "Fresh vegetables with marinated cheese in saffron rice", price: "15,90 €", vegetarian: true },
    ],
  },
  {
    id: "naan",
    title: "Indisches Fladenbrot — Naan",
    titleEn: "Indian Flatbread — Naan",
    dishes: [
      { num: "115", name: "Gemischter Brotkorb", desc: "Dreierlei Fladenbrot: Knoblauch- und Butter Naan, Tandoori Roti", descEn: "Three flatbreads: garlic and butter naan, tandoori roti", price: "9,90 €", vegetarian: true },
      { num: "116", name: "Knoblauch Naan", desc: "Fladenbrot aus Weizenmehl mit Knoblauch", descEn: "Wheat flour flatbread with garlic", price: "4,40 €", vegetarian: true },
      { num: "117", name: "Butter Naan", desc: "Fladenbrot aus Weizenmehl mit Butter", descEn: "Wheat flour flatbread with butter", price: "4,20 €", vegetarian: true },
      { num: "118", name: "Paneer Naan", desc: "Fladenbrot gefüllt mit Paneer (hausgemachter Käse)", descEn: "Flatbread filled with paneer (homemade cheese)", price: "6,20 €", vegetarian: true },
      { num: "119", name: "Peshwari Naan", desc: "Gefüllt mit Nüssen, Rosinen, Kokosnuss & Paneer — Spezialität", descEn: "Filled with nuts, raisins, coconut & paneer — specialty", price: "6,60 €", vegetarian: true, signature: true },
      { num: "120", name: "Classic Naan", desc: "Fladenbrot aus Weizenmehl", descEn: "Wheat flour flatbread", price: "3,40 €", vegetarian: true },
      { num: "121", name: "Knoblauch Roti", desc: "Aus Vollkornmehl mit Knoblauch", descEn: "Whole wheat with garlic", price: "3,40 €", vegetarian: true },
      { num: "122", name: "Tandoori Roti", desc: "Aus Vollkornmehl", descEn: "Whole wheat", price: "2,90 €", vegetarian: true },
    ],
  },
];

const filterLabels = [
  { de: "Alle", en: "All" },
  { de: "Vorspeisen", en: "Starters" },
  { de: "Tandoor", en: "Tandoor" },
  { de: "Hähnchen", en: "Chicken" },
  { de: "Lamm", en: "Lamb" },
  { de: "Meeresfrüchte", en: "Seafood" },
  { de: "Vegetarisch", en: "Vegetarian" },
  { de: "Biryani", en: "Biryani" },
  { de: "Naan", en: "Naan" },
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
};

export default function MenuPopup({ isOpen, onClose }: MenuPopupProps) {
  const [filter, setFilter] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setFilter(0);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.popupHeader}>
          <div>
            <h2 className={styles.popupTitle}>{t("Unsere Speisekarte", "Our Menu")}</h2>
            <p className={styles.popupSubtitle}>JAIPUR — Indian Heritage</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <div className={styles.filterBar}>
          {filterLabels.map((label, i) => (
            <button
              key={i}
              className={`${styles.filterBtn} ${filter === i ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter(i)}
            >
              {t(label.de, label.en)}
            </button>
          ))}
        </div>

        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <Award size={13} className={styles.legendGold} /> {t("Spezialität", "Signature")}
          </span>
          <span className={styles.legendItem}>
            <Leaf size={13} className={styles.legendGreen} /> {t("Vegetarisch", "Vegetarian")}
          </span>
          <span className={styles.legendItem}>
            <Flame size={13} className={styles.legendOrange} /> {t("Scharf", "Spicy")}
          </span>
          <span className={styles.legendItem}>
            <Flame size={13} className={styles.legendRed} /> {t("Sehr scharf", "Very spicy")}
          </span>
        </div>

        <div className={styles.menuList} ref={listRef}>
          {filteredMenu.map((category) => (
            <div key={category.id} className={styles.categoryBlock}>
              <div className={styles.categoryHeader}>
                <h3 className={styles.categoryTitle}>
                  {t(category.title, category.titleEn)}
                </h3>
                {category.subtitle && (
                  <p className={styles.categorySubtitle}>
                    {t(category.subtitle, category.subtitleEn || category.subtitle)}
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
                      <p className={styles.dishDesc}>{t(dish.desc, dish.descEn || dish.desc)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.cateringBlock}>
            <h3 className={styles.cateringTitle}>{t("Catering", "Catering")}</h3>
            <p className={styles.cateringDesc}>
              {t(
                'Für Hochzeiten, Geburtstage, Firmen oder sonstige Feiern liefern wir ein "Indisches Buffet" nach Ihren Wünschen!',
                'For weddings, birthdays, corporate events or other celebrations we deliver an "Indian Buffet" to your wishes!'
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
