import type { Metadata } from "next";
import { pageCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Impressum — JAIPUR Indian Heritage",
  description: "Impressum und rechtliche Informationen des Restaurants Jaipur in Freiburg.",
  alternates: pageCanonical("/impressum"),
};

// Two addresses, both correct, confirmed by the owner:
//   Gerberau 5a — the registered business address. Used here and for the
//                 controller block in the Datenschutz, because both are legal
//                 identifications of the business.
//   Gerberau 5  — the restaurant itself. Used everywhere a visitor looks: the
//                 contact section, the footer, the JSON-LD and the Google
//                 Business Profile, so the local search NAP stays consistent.
// The note below the address exists so the difference does not read as a typo.
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
      <p style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "10px" }}>
        Dies ist die Anschrift des Unternehmens. Das Restaurant selbst finden Sie
        in der Gerberau 5, 79098 Freiburg im Breisgau.
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
