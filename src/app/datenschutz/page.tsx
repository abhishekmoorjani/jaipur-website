import type { Metadata } from "next";
import { pageCanonical } from "@/lib/seo";
import ContactEmail from "@/components/ContactEmail";

export const metadata: Metadata = {
  title: "Datenschutz — JAIPUR Indian Heritage",
  description: "Datenschutzerklärung des Restaurants Jaipur in Freiburg.",
  alternates: pageCanonical("/datenschutz"),
};

const H2 = { fontSize: "1.5rem", marginBottom: "12px", marginTop: "30px" };
const P = { marginBottom: "12px" };

// Every statement here was checked against the live site on 2026-10-18: no
// Set-Cookie on any page, the only browser storage is the "jaipur-lang"
// preference (written only when the visitor picks a language), no third party
// requests, fonts self hosted. Cloudflare, Inc. and Microsoft Corporation were
// both "Active" on dataprivacyframework.gov the same day; Cloudflare's
// re-certification is under review, which is why the SCC fallback sentence
// stays. Re-check all of this before enabling Bot Fight Mode, Turnstile,
// analytics or any embed: each would make a sentence below false.
export default function DatenschutzPage() {
  return (
    <main className="section-padding" style={{ paddingTop: "150px", minHeight: "80vh", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "40px" }}>Datenschutzerklärung</h1>

      {/* The controller is a legal identification of the business, so it uses
          the registered address (Gerberau 5a), matching the Impressum. The
          restaurant itself is at Gerberau 5, which is what every visitor
          facing part of the site and the Google listing show. */}
      <h2 style={H2}>Verantwortlicher</h2>
      <p style={P}>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
      <p style={P}>
        Abhay Singh<br />
        Jaipur Restaurant Freiburg<br />
        Gerberau 5a<br />
        79098 Freiburg im Breisgau<br />
        Deutschland<br />
        Telefon: <a href="tel:0761272082" style={{ color: "inherit" }}>0761 / 27 20 82</a><br />
        E-Mail: <ContactEmail />
      </p>
      <p style={P}>
        Einen Datenschutzbeauftragten haben wir nicht bestellt. Dazu sind wir nicht verpflichtet, weil bei uns nicht
        mindestens 20 Personen ständig mit der automatisierten Verarbeitung personenbezogener Daten beschäftigt sind
        (§ 38 Abs. 1 BDSG).
      </p>

      <h2 style={H2}>Hosting</h2>
      <p style={P}>
        Diese Website wird von Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, USA, gehostet und
        ausgeliefert (Dienst Cloudflare Pages). Cloudflare, Inc. ist unser Vertragspartner. Die Cloudflare Germany GmbH,
        c/o Design Offices München Atlas, Rosenheimer Straße 143C, 81671 München, ist lediglich die deutsche
        Niederlassung des Unternehmens und nicht unser Vertragspartner.
      </p>
      <p style={P}>
        Soweit Cloudflare die beim Aufruf dieser Website anfallenden Verbindungsdaten für uns verarbeitet, handelt
        Cloudflare als Auftragsverarbeiter nach Art. 28 DSGVO und ist dabei an unsere Weisungen gebunden. Ein
        Auftragsverarbeitungsvertrag besteht. Daneben verarbeitet Cloudflare bestimmte Daten, etwa zur Sicherheit und
        zum Betrieb des eigenen Netzes sowie zur Abrechnung, als eigener Verantwortlicher. Wie Cloudflare dabei mit Daten
        umgeht, beschreibt Cloudflare in seiner eigenen Datenschutzerklärung unter www.cloudflare.com/privacypolicy.
      </p>

      <h2 style={H2}>Datenübermittlung in die USA</h2>
      <p style={P}>
        Cloudflare, Inc. hat seinen Sitz in den USA. Personenbezogene Daten können deshalb außerhalb der EU verarbeitet
        werden. Cloudflare betreibt ein weltweites Servernetz. Ein Zugriff aus den USA ist damit nicht ausgeschlossen.
      </p>
      <p style={P}>
        Die Europäische Kommission hat am 10. Juli 2023 festgestellt, dass die USA für zertifizierte Unternehmen ein
        angemessenes Datenschutzniveau bieten (Durchführungsbeschluss (EU) 2023/1795 über die Angemessenheit des
        Schutzniveaus für personenbezogene Daten nach dem Datenschutzrahmen EU-USA). Cloudflare, Inc. ist unter diesem
        Rahmen zertifiziert. Die Übermittlung stützt sich deshalb auf Art. 45 Abs. 1 DSGVO. Die Zertifizierung können
        Sie unter www.dataprivacyframework.gov einsehen.
      </p>
      <p style={P}>
        Sollte die Zertifizierung enden oder der Angemessenheitsbeschluss wegfallen, gelten ergänzend die
        Standardvertragsklauseln der Europäischen Kommission nach Art. 46 Abs. 2 lit. c DSGVO. Eine Kopie erhalten Sie
        auf Anfrage unter <ContactEmail />.
      </p>

      <h2 style={H2}>Server-Logdaten</h2>
      <p style={P}>
        Wenn Sie diese Website aufrufen, verarbeitet Cloudflare die technisch notwendigen Verbindungsdaten: Ihre
        IP-Adresse, Datum und Uhrzeit des Zugriffs, die aufgerufene Adresse, die übertragene Datenmenge, den verwendeten
        Browser und das Betriebssystem sowie eine gegebenenfalls verweisende Seite.
      </p>
      <p style={P}>
        Zweck ist es, die Website technisch fehlerfrei auszuliefern und sie vor Angriffen, Überlastung und Missbrauch zu
        schützen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse ist der sichere und
        stabile Betrieb dieser Website.
      </p>
      <p style={P}>
        Einzelne Zugriffsprotokolle erhalten wir nicht. Wir speichern keine IP-Adressen und werten das Verhalten
        einzelner Besucherinnen und Besucher nicht aus. In unserem Cloudflare-Konto steht uns lediglich eine
        zusammengefasste Statistik ohne Personenbezug zur Verfügung, etwa die Zahl der Aufrufe und die übertragene
        Datenmenge. Ein Analyse- oder Trackingwerkzeug setzen wir nicht ein.
      </p>
      <p style={P}>
        Cloudflare speichert die Verbindungsdaten nur so lange, wie es für die Auslieferung der Seiten und für die
        Sicherheit erforderlich ist, und löscht sie danach. Eine Zusammenführung mit anderen Daten findet bei uns nicht
        statt.
      </p>

      <h2 style={H2}>Kontaktaufnahme per E-Mail und Telefon</h2>
      <p style={P}>
        Wenn Sie uns schreiben oder anrufen, verarbeiten wir Ihre Angaben, um Ihre Anfrage zu beantworten. Dazu gehören
        Ihr Name, Ihre Kontaktdaten und der Inhalt Ihrer Nachricht.
      </p>
      <p style={P}>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, wenn sich Ihre Anfrage auf eine Reservierung, eine Bestellung
        oder deren Anbahnung bezieht. In allen übrigen Fällen ist die Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO mit
        unserem berechtigten Interesse, Anfragen zu beantworten.
      </p>
      <p style={P}>
        Unsere E-Mail-Adresse wird über den Dienst Outlook.com der Microsoft Corporation, One Microsoft Way, Redmond,
        WA 98052, USA, betrieben. E-Mails an uns werden dort gespeichert und verarbeitet. Microsoft Corporation ist unter
        dem Datenschutzrahmen EU-USA zertifiziert. Die Übermittlung in die USA stützt sich deshalb auf Art. 45 Abs. 1
        DSGVO. Wie Microsoft mit Daten umgeht, beschreibt Microsoft unter privacy.microsoft.com.
      </p>
      <p style={P}>
        Bitte beachten Sie, dass die Übertragung von E-Mails über das Internet nicht in jedem Fall verschlüsselt erfolgt.
        Für vertrauliche Angaben nutzen Sie bitte den Telefonweg.
      </p>
      <p style={P}>
        Wir löschen Ihre Nachricht, sobald sie nicht mehr benötigt wird, spätestens nach Ablauf der gesetzlichen
        Aufbewahrungsfristen.
      </p>

      <h2 style={H2}>Speicherung Ihrer Spracheinstellung</h2>
      <p style={P}>
        Wenn Sie über die Sprachauswahl eine Sprache wählen, speichern wir diese Auswahl im lokalen Speicher Ihres
        Browsers (Eintrag „jaipur-lang“), damit die Website beim nächsten Besuch in Ihrer Sprache erscheint. Dabei wird
        nichts an uns oder an Dritte übertragen. Ohne Ihre Auswahl wird nichts gespeichert.
      </p>
      <p style={P}>
        Diese Speicherung ist unbedingt erforderlich, um die von Ihnen ausdrücklich gewünschte Funktion bereitzustellen,
        und deshalb ohne Einwilligung zulässig (§ 25 Abs. 2 Nr. 2 TDDDG). Sie können den Eintrag jederzeit über die
        Einstellungen Ihres Browsers löschen.
      </p>

      <h2 style={H2}>Ihre Rechte</h2>
      <p style={P}>
        Sie haben das Recht auf Auskunft über die zu Ihnen gespeicherten Daten (Art. 15 DSGVO), auf Berichtigung
        unrichtiger Daten (Art. 16 DSGVO), auf Löschung (Art. 17 DSGVO) und auf Einschränkung der Verarbeitung (Art. 18
        DSGVO). Soweit wir Daten auf der Grundlage eines Vertrags oder Ihrer Einwilligung verarbeiten, haben Sie außerdem
        das Recht auf Datenübertragbarkeit (Art. 20 DSGVO).
      </p>
      <p style={P}>Wenden Sie sich dafür formlos an <ContactEmail />.</p>

      <h2 style={H2}>Widerspruchsrecht</h2>
      <p style={P}>
        Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die
        Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen, soweit wir diese Verarbeitung auf Art. 6
        Abs. 1 lit. f DSGVO stützen (Art. 21 Abs. 1 DSGVO). Das betrifft die Verbindungsdaten beim Aufruf dieser Website
        sowie die Bearbeitung von Anfragen, die nicht der Anbahnung oder Erfüllung eines Vertrags dienen.
      </p>
      <p style={P}>
        Legen Sie Widerspruch ein, verarbeiten wir die betroffenen Daten nicht weiter, es sei denn, wir können zwingende
        schutzwürdige Gründe für die Verarbeitung nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen.
        Ihren Widerspruch richten Sie formlos an <ContactEmail />.
      </p>

      <h2 style={H2}>Beschwerderecht</h2>
      <p style={P}>
        Sie können sich jederzeit bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO). Für uns zuständig
        ist:
      </p>
      <p style={P}>
        Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg<br />
        Heilbronner Straße 35, 70191 Stuttgart<br />
        Telefon: 0711 61 55 41-0<br />
        <ContactEmail address="poststelle@lfdi.bwl.de" />
      </p>

      <h2 style={H2}>Keine automatisierte Entscheidungsfindung</h2>
      <p style={P}>Eine automatisierte Entscheidungsfindung einschließlich Profiling nach Art. 22 DSGVO findet nicht statt.</p>

      <h2 style={H2}>Was diese Website nicht tut</h2>
      <p style={P}>
        Diese Website setzt keine Cookies. Außer Ihrer Spracheinstellung, wenn Sie eine wählen, speichert sie nichts in
        Ihrem Browser. Es gibt kein Tracking und keine Analysewerkzeuge. Alle Schriften liegen auf unserem eigenen Server,
        es werden keine Google Fonts geladen. Es sind keine Karten, Videos oder Social-Media-Elemente eingebunden. Beim
        Aufruf dieser Seiten werden außer an unseren Hoster keine Daten an Dritte übertragen. Links zu Google Maps sind
        reine Verweise. Daten fließen erst, wenn Sie einen solchen Link anklicken und die fremde Seite öffnen. Ab diesem
        Zeitpunkt gilt die Datenschutzerklärung des jeweiligen Anbieters.
      </p>
    </main>
  );
}
