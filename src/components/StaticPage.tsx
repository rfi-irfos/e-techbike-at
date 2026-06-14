import { useEffect } from 'react'

interface StaticPageProps {
  pageId: string
  brand?: string
  phone?: string
  email?: string
  address?: string
}

function PageLayout({ title, children, brand }: { title: string; children: React.ReactNode; brand?: string }) {
  return (
    <div className="static-page">
      <header className="static-page-nav">
        <a href="/" className="static-page-brand">{brand ?? 'e-techbike.at'}</a>
        <a href="/" className="static-page-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Zurück zur Startseite
        </a>
      </header>
      <main className="static-page-main">
        <div className="static-page-content">
          <h1>{title}</h1>
          {children}
        </div>
      </main>
    </div>
  )
}

export function StaticPage({ pageId, brand, phone, email, address }: StaticPageProps) {
  useEffect(() => { window.scrollTo(0, 0) }, [pageId])

  if (pageId === 'uber-uns') {
    return (
      <PageLayout title="Über uns" brand={brand}>
        <p className="sp-lead">e-techbike ist ein Einzelhandelsunternehmen für den Direktvertrieb umweltfreundlicher elektrischer Fortbewegungsmittel. Unsere Standorte liegen in Graz und Wien.</p>
        <p>Bei uns finden Sie das für Sie ideale Elektrofahrzeug zu absolut besten Preisen. Wir bieten nach dem Verkauf jeglichen Service rund um Ersatzteile, Zubehör und preiswerte Reparaturen für alle Fahrzeuge aus unserem gesamten Sortiment.</p>
        <p>Wir arbeiten mit kompetenten und vertrauenswürdigen Partnern aus Mitteleuropa und China zusammen, die über langjährige Erfahrung verfügen. Unser Unternehmen greift auf eines der größten Elektrofahrrad-Lager in Europa zu und beliefert neben Österreich Kunden in zahlreichen europäischen Ländern.</p>
        <h2>Unser Versprechen</h2>
        <ul>
          <li>Qualitativ hochwertige Waren zu günstigen Lagerdirektpreisen</li>
          <li>Umfangreiches Sortiment, laufend erweitert</li>
          <li>Pünktliche Lieferung und schnelle Reklamationsbearbeitung</li>
          <li>2 Jahre gesetzliche Gewährleistung auf alle Fahrzeuge (Verschleißteile: 1 Jahr, Akkus: 6 Monate)</li>
          <li>Service als oberstes Gebot</li>
        </ul>
        <div className="sp-contact-card">
          <strong>e-techbike.at</strong>
          {address && <span>{address}</span>}
          {phone && <a href={`tel:${phone.replace(/\s/g,'')}`}>{phone}</a>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
        </div>
        <div className="sp-fb-widget">
          <iframe
            src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fetechbike&tabs=timeline&width=340&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true"
            width="340" height="500"
            style={{ border: 'none', overflow: 'hidden', borderRadius: '12px' }}
            scrolling="no"
            frameBorder={0}
            allowTransparency
            allow="encrypted-media"
            title="E-Techbike Facebook"
          />
        </div>
      </PageLayout>
    )
  }

  if (pageId === 'wie-kaufen') {
    return (
      <PageLayout title="Wie kaufen, liefern, zahlen?" brand={brand}>
        <p className="sp-lead">Bevor Sie bestellen, informieren Sie sich bitte über unseren aktuellen Lagerbestand und Lieferzeiten — telefonisch oder per E-Mail.</p>
        <h2>Bestellung aufgeben</h2>
        <p>Sie können Ihre Bestellung via E-Mail oder SMS einschicken. Unsere Abholstandorte befinden sich in Graz und Wien.</p>
        <h2>Lieferung</h2>
        <ul>
          <li>Hauszustellung innerhalb der Stadtgebiete von Graz und Wien: <strong>kostenlos</strong></li>
          <li>Österreichweit: €40 pro 100 km (Hin- und Rückfahrt)</li>
        </ul>
        <h2>Bezahlung</h2>
        <h3>Barzahlung</h3>
        <p>Im Geschäft oder bei Lieferung zu Ihnen nach Hause.</p>
        <h3>Vorabüberweisung</h3>
        <div className="sp-bank-card">
          <strong>E-TECHBIKE</strong>
          <span>TIMEA DOBOSNE KOVACS</span>
          <span>STMK SPARKASSE</span>
          <span>IBAN: AT45 2081 5000 4188 5187</span>
          <span>BIC: STSPAT26XXX</span>
        </div>
        <div className="sp-contact-card">
          {phone && <a href={`tel:${phone.replace(/\s/g,'')}`}>{phone}</a>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
        </div>
      </PageLayout>
    )
  }

  if (pageId === 'foerderung') {
    return (
      <PageLayout title="Förderungen" brand={brand}>
        <p className="sp-lead">Der österreichische Staat fördert den Kauf von Elektrofahrzeugen. Wir helfen Ihnen bei der Antragstellung — kostenlos.</p>
        <h2>Elektro-Kraftwagen-Förderung für Privatpersonen</h2>
        <p>Ziel ist es, durch die Förderung des Ankaufes von neuen Elektrofahrzeugen die Marktentwicklung der Elektromobilität in Österreich zu forcieren und einen Beitrag zur klimafreundlichen Veränderung des Mobilitätsverhaltens zu leisten.</p>
        <h2>Aktuelle Förderbeträge</h2>
        <div className="sp-foerder-grid">
          <div className="sp-foerder-card"><span className="sp-foerder-amount">bis €1.800</span><span>E-Motorrad / E-Moped 45 km/h</span></div>
          <div className="sp-foerder-card"><span className="sp-foerder-amount">bis €1.200</span><span>E-Scooter / E-Moped 25 km/h</span></div>
          <div className="sp-foerder-card"><span className="sp-foerder-amount">bis €500</span><span>E-Klapprad / E-Fahrrad</span></div>
          <div className="sp-foerder-card"><span className="sp-foerder-amount">bis €3.000</span><span>E-Seniorenmobil / Kabinenroller</span></div>
        </div>
        <p>Erkundigen Sie sich auch bei Ihrer Gemeinde — viele fördern Elektromobilität zusätzlich.</p>
        <p>Betriebe: <a href="https://www.umweltfoerderung.at/betriebe" target="_blank" rel="noopener noreferrer">umweltfoerderung.at/betriebe</a></p>
        <div className="sp-contact-card">
          <strong>Förderberatung — kostenlos</strong>
          {phone && <a href={`tel:${phone.replace(/\s/g,'')}`}>{phone}</a>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
        </div>
      </PageLayout>
    )
  }

  if (pageId === 'akku-pflege') {
    return (
      <PageLayout title="Akku-Pflege" brand={brand}>
        <h2>Bleigel-Akkus — wichtige Hinweise</h2>
        <ul>
          <li>Nur für die geeignete Anwendung einsetzen — Versorgungsbatterie nicht als Starterbatterie verwenden</li>
          <li>Passendes Ladegerät verwenden: Kapazität, Typ und Ladekennlinie müssen übereinstimmen</li>
          <li>Vor dem ersten Gebrauch vollständig laden</li>
          <li>Volle Kapazität erst nach 3–4 Ladezyklen erreicht</li>
          <li>Kein Memory-Effekt — auch nach kurzem Gebrauch sofort nachladen möglich</li>
          <li>Tiefentladung vermeiden: max. 60 % Kapazität entnehmen</li>
          <li>Bei Nichtbenutzung: einmal im Monat nachladen</li>
          <li>Sicherheitshinweise des Herstellers beachten</li>
        </ul>
        <h2>Lithium-Ionen-Akkus — wichtige Hinweise</h2>
        <ul>
          <li>Nur für die geeignete Anwendung einsetzen — kein Einsatz als Starterbatterie</li>
          <li>Passendes Lithium-Ladegerät verwenden — auf Kapazität und Typ angepasst</li>
          <li>Vor dem ersten Gebrauch möglichst vollständig laden</li>
          <li>Volle Kapazität erst nach wenigen Zyklen erreicht</li>
          <li>Kein Memory-Effekt — jederzeit nachladen</li>
          <li>Tiefentladung schadet dem Akku: max. 15 % Restkapazität entnehmen</li>
          <li>Bei Nichtbenutzung: alle 2 Monate nachladen</li>
        </ul>
        <h2>Sicherheitshinweise</h2>
        <ul>
          <li>Ladegerät, Kabel und Stecker vor jeder Benutzung prüfen — beschädigte Teile nicht verwenden</li>
          <li>Fahrzeug und Ladegerät nicht selbst öffnen oder reparieren</li>
          <li>Sauber halten — Verschmutzung erhöht das Risiko eines elektrischen Schlages</li>
          <li>Vor Regen und Nässe schützen</li>
          <li>Akku nicht unbeaufsichtigt laden</li>
          <li>Nicht in den Hausmüll — gemäß EU-Richtlinie 2006/66/EG gesondert entsorgen</li>
        </ul>
        <div className="sp-contact-card">
          <strong>Fragen zur Akku-Pflege?</strong>
          {phone && <a href={`tel:${phone.replace(/\s/g,'')}`}>{phone}</a>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
        </div>
      </PageLayout>
    )
  }

  return null
}
