import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function NobetciEczaneler() {
  const [eczaneler, setEczaneler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    fetch("https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler")
      .then((response) => {
        if (!response.ok) throw new Error("Ağ yanıtı başarısız oldu");
        return response.json();
      })
      .then((data) => {
        setEczaneler(data);
        console.log(data);
        setLoading(false);
      })
      .catch((error) => {
        setHata(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Yükleniyor...</p>
      </div>
    );
  }

  if (hata) return <p>Hata: {hata}</p>;

  const kendiBolgeEczaneleri = eczaneler.filter((e) => e.BolgeId === 42);
  const kendiSecilenEczane =
    kendiBolgeEczaneleri.length > 0
      ? kendiBolgeEczaneleri.sort((a, b) => a.Adi.localeCompare(b.Adi))[0]
      : null;
  const hedefBolgeler = [37, 65, 44, 58];
  const digerBolgelerEczaneleri = hedefBolgeler.map((bolgeId) => {
    const bolgedekiEczaneler = eczaneler.filter((e) => e.BolgeId === bolgeId);
    const secilenEczane =
      bolgedekiEczaneler.length > 0
        ? bolgedekiEczaneler.sort((a, b) => a.Adi.localeCompare(b.Adi))[0]
        : null;
    return {
      bolgeId,
      eczane: secilenEczane,
    };
  });

  return (
    <div>
      <div className="accordion-wrapper">
        <div className="accordion-section">
          <div className="accordion">
            <div className="sentences">
              <h2 className="section-title">Bölgenizdeki Nöbetçi Eczane</h2>
              <div className="mainHour">
                <Hour />
              </div>
            </div>
            {kendiSecilenEczane ? (
              <AccordionItemKendiBolge
                key={`kendi-${kendiSecilenEczane.Adi}`}
                title={kendiSecilenEczane.Adi}
                latitude={kendiSecilenEczane.LokasyonX}
                longitude={kendiSecilenEczane.LokasyonY}
                adres={kendiSecilenEczane.Adres}
                telefon={kendiSecilenEczane.Telefon}
                bolgeId={kendiSecilenEczane.BolgeId}
                bolge={kendiSecilenEczane.Bolge}
              />
            ) : (
              <div className="no-eczane-message">
                BÖLGENİZDE NÖBETÇİ ECZANE BULUNAMADI.
              </div>
            )}
          </div>
        </div>

        <div className="accordion1">
          <h2 className="section-title2">
            Diğer Bölgelerdeki Nöbetçi Eczaneler
          </h2>
          <div className="accordion2">
            {digerBolgelerEczaneleri.map(({ bolgeId, eczane }, index) =>
              eczane ? (
                <AccordionItemDigerBolge
                  key={`diger-${index}`}
                  title={eczane.Adi}
                  latitude={eczane.LokasyonX}
                  longitude={eczane.LokasyonY}
                  adres={eczane.Adres}
                  telefon={eczane.Telefon}
                  bolgeId={eczane.BolgeId}
                  bolge={eczane.Bolge}
                />
              ) : (
                <div key={`bos-${index}`} className="no-eczane-message item2">
                  BU BÖLGEDE NÖBETÇİ ECZANE BULUNAMADI.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AccordionItemKendiBolge({
  title,
  latitude,
  longitude,
  adres,
  telefon,
  bolge,
}) {
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  return (
    <div className="item open featured">
      <div className="image">
        <p>
          <img src="./images/pharmacy.png" alt="pharmacy-logo" />
        </p>
      </div>
      <p className="text">
        {title}
        <span className="badge">Sizin Bölgeniz</span>
      </p>
      <p className="icon">-</p>
      <div className="content-box">
        <div className="box">
          <p>
            <strong>Adres:</strong> {adres}
            <br />
            <strong>Telefon:</strong> {telefon}
            <br />
            <strong>İlçe:</strong> {bolge}
            <br />
            <strong className="location">Enlem: {latitude}</strong>
            <br />
            <strong className="location">Boylam: {longitude}</strong>
          </p>
        </div>
        <div className="qrCode">
          <QRCodeCanvas value={googleMapsUrl} size={128} />
          <p
            style={{ fontSize: "15px", textAlign: "center", fontWeight: "600" }}
          >
            Konum için <br /> QR Kod
          </p>
        </div>
      </div>
    </div>
  );
}

function AccordionItemDigerBolge({
  title,
  latitude,
  longitude,
  adres,
  telefon,
  bolge,
}) {
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  return (
    <div className="item2 open">
      <div className="image">
        <p>
          <img src="./images/pharmacy.png" alt="pharmacy-logo" />
        </p>
      </div>
      <p className="text">{title}</p>
      <p className="icon">-</p>
      <div className="content-box2">
        <div className="box2">
          <p>
            <strong>Adres:</strong> {adres}
            <br />
            <strong>Telefon:</strong> {telefon}
            <br />
            <strong>İlçe:</strong> {bolge}
            <br />
            <strong className="location">Enlem: {latitude}</strong>
            <br />
            <strong className="location">Boylam: {longitude}</strong>
          </p>
        </div>
        <div className="qrCode2">
          <QRCodeCanvas value={googleMapsUrl} size={128} />
        </div>
        <div className="font">
          <p
            style={{ fontSize: "18px", textAlign: "center", fontWeight: "600" }}
          >
            Konum için QR Kod
          </p>
        </div>
      </div>
    </div>
  );
}

function Hour() {
  const [time, setTime] = useState(new Date());
  const today = new Date().toLocaleDateString("tr-TR");

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="hour">
      {formattedTime}
      <div className="date">{today}</div>
    </div>
  );
}
