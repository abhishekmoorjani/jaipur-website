import type { Metadata } from "next";
import { pageCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Impressum — JAIPUR Indian Heritage",
  description: "Impressum und rechtliche Informationen des Restaurants Jaipur in Freiburg.",
  alternates: pageCanonical("/impressum"),
};

// Values taken from the Impressum published at jaipur-freiburg.de, which is the
// legally binding version currently in force.
//
// OPEN QUESTION, needs the owner's confirmation: the live site contradicts
// itself on the house number. Its Impressum says "Gerberau 5a" while its
// Anfahrt page, the Google listing and the rest of this site all say
// "Gerberau 5". The legally published Impressum value is kept here rather than
// silently changed, because it is the address of record. Once confirmed, the
// same value has to be used in the contact section, the JSON-LD and the Google
// Business Profile, since inconsistent NAP data hurts local search.
const ADDRESS_LINE = "Gerberau 5a";

const heading: React.CSSProperties = {
  fontSize: "1.5rem",
  marginBottom: "12px",
  marginTop: "30px",
};

export default function ImpressumPage() {
  return (
    <main className="section-padding" style={{ paddingTop: "150px", minHeight: "80vh", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "40px" }}>Impressum</h1>

      <h2 style={heading}>Angaben gemäß § 5 DDG</h2>
      <p>
        Jaipur Restaurant Freiburg<br />
        {ADDRESS_LINE}<br />
        79098 Freiburg im Breisgau<br />
        Deutschland
      </p>

      <h2 style={heading}>Vertreten durch</h2>
      <p>Abhay Singh</p>

      <h2 style={heading}>Kontakt</h2>
      <p>
        Telefon: <a href="tel:0761272082" style={{ color: "inherit" }}>0761 / 27 20 82</a><br />
        E-Mail: <a href="mailto:abi_ind@hotmail.com" style={{ color: "inherit" }}>abi_ind@hotmail.com</a>
      </p>

      <h2 style={heading}>Umsatzsteuer-Identifikationsnummer</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
        DE623754778
      </p>

      <h2 style={heading}>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        Abhay Singh<br />
        {ADDRESS_LINE}<br />
        79098 Freiburg im Breisgau
      </p>

      <h2 style={heading}>Streitbeilegung</h2>
      <p>
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2 style={heading}>Haftung für Inhalte</h2>
      <p>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
        Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen
        zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </p>

      <h2 style={heading}>Haftung für Links</h2>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
        Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
        Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
      </p>
    </main>
  );
}
