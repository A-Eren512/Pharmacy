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

  return (
    <div className="accordion-container">
      <div className="accordion">
        <div className="logo">
          <img src="./images/pharmacy.png" alt="pharmacy" />
        </div>
        <div className="sentences">
          <h2 className="section-title">BÖLGENİZDEKİ NÖBETÇİ ECZANE</h2>
        </div>
        <div className="mainHour">
          <Hour />
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
      <div className="advertisement">
        <div className="promo">
          <img src="./images/reklam-1.jpg" alt="promo-1" />
          <img src="./images/reklam-2.jpg" alt="promo-2" />
          <img src="./images/reklam-3.jpg" alt="promo-3" />
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
    <div className="item featured">
      <div className="content-box">
        <div className="box">
          <div className="header">
            <p className="title text-card">{title}</p>
            <span className="badge">Sizin Bölgeniz</span>
          </div>
          <p className="text-card2">
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
          <QRCodeCanvas value={googleMapsUrl} size={272} />
          <div className="qrText">
            <p>
              Konum için <br /> QR Kod
            </p>
          </div>
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
