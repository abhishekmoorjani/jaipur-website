import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz — JAIPUR Indian Heritage",
  description: "Datenschutzerklärung des Restaurants Jaipur in Freiburg.",
};

export default function DatenschutzPage() {
  return (
    <main className="section-padding" style={{ paddingTop: "150px", minHeight: "80vh", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "40px" }}>Datenschutzerklärung</h1>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" }}>1. Datenschutz auf einen Blick</h2>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", marginTop: "20px" }}>Allgemeine Hinweise</h3>
      <p>
        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert,
        wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert
        werden können.
      </p>

      <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", marginTop: "20px" }}>Datenerfassung auf dieser Website</h3>
      <p>
        Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie
        dem Impressum dieser Website entnehmen.
      </p>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" }}>2. Hosting</h2>
      <p>
        Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, die auf
        dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert.
      </p>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" }}>3. Allgemeine Hinweise und Pflichtinformationen</h2>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", marginTop: "20px" }}>Datenschutz</h3>
      <p>
        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
        personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser
        Datenschutzerklärung.
      </p>

      <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", marginTop: "20px" }}>Hinweis zur verantwortlichen Stelle</h3>
      <p>
        Jaipur — Indian Heritage<br />
        Gerberau 5<br />
        79098 Freiburg im Breisgau<br />
        Telefon: 0761 / 27 20 82<br />
        E-Mail: info@jaipur-freiburg.de
      </p>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" }}>4. Datenerfassung auf dieser Website</h2>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", marginTop: "20px" }}>Cookies</h3>
      <p>
        Diese Website verwendet keine Cookies zu Tracking-Zwecken. Technisch notwendige Cookies können beim
        Besuch der Website automatisch gesetzt werden.
      </p>

      <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", marginTop: "20px" }}>Kontaktformular</h3>
      <p>
        Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular
        inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von
        Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
      </p>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" }}>5. Google Maps</h2>
      <p>
        Diese Website nutzt Google Maps zur Darstellung unseres Standorts. Beim Laden der Karte werden Daten
        an Google übertragen. Weitere Informationen finden Sie in der Datenschutzerklärung von Google.
      </p>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" }}>6. Ihre Rechte</h2>
      <p>
        Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten,
        deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder
        Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich
        jederzeit an uns wenden.
      </p>
    </main>
  );
}
