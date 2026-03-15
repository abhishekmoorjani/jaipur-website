import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum — JAIPUR Indian Heritage",
  description: "Impressum und rechtliche Informationen des Restaurants Jaipur in Freiburg.",
};

export default function ImpressumPage() {
  return (
    <main className="section-padding" style={{ paddingTop: "150px", minHeight: "80vh", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "40px" }}>Impressum</h1>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" }}>Angaben gemäß § 5 TMG</h2>
      <p>
        Jaipur — Indian Heritage<br />
        Gerberau 5<br />
        79098 Freiburg im Breisgau<br />
        Deutschland
      </p>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" }}>Kontakt</h2>
      <p>
        Telefon: 0761 / 27 20 82<br />
        E-Mail: info@jaipur-freiburg.de
      </p>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" }}>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
        [USt-IdNr. hier einfügen]
      </p>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" }}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
      <p>
        [Name des Verantwortlichen]<br />
        Gerberau 5<br />
        79098 Freiburg im Breisgau
      </p>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" }}>Streitschlichtung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit.
        Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet,
        an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" }}>Haftung für Inhalte</h2>
      <p>
        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
        Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen
        zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </p>
    </main>
  );
}
