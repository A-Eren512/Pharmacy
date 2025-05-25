import React, { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function NobetciEczaneler() {
  const [eczaneler, setEczaneler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState(null);
  const [currentEczane, setCurrentEczane] = useState(0);
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

  const kendiBolgeEczaneleri = useMemo(() => {
    const bolgeId = 42;

    return eczaneler.filter((e) => e.BolgeId === bolgeId);
  }, [eczaneler]);

  useEffect(() => {
    setCurrentEczane(0);
  }, [kendiBolgeEczaneleri.length]);

  useEffect(() => {
    if (kendiBolgeEczaneleri.length < 2) return;

    const interval = setInterval(() => {
      setCurrentEczane(
        (prevIndex) => (prevIndex + 1) % kendiBolgeEczaneleri.length
      );
    }, 15000);

    return () => clearInterval(interval);
  }, [kendiBolgeEczaneleri.length]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Yükleniyor...</p>
      </div>
    );
  }

  if (hata) return <p>Hata: {hata}</p>;

  const kendiSecilenEczane =
    kendiBolgeEczaneleri.length > 0
      ? kendiBolgeEczaneleri[currentEczane]
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
            BÖLGENİZDE NÖBETÇİ ECZANE YOKTUR.
          </div>
        )}
      </div>
      <div className="advertisement">
        <div className="promo">
          <img src={dynamicPromo1Image} alt="promo-1" />
          <img src="./images/reklam-2.jpg" alt="promo-2" />
          <DynamicImageRotator />
        </div>
      </div>
    </div>
  );
}

function getFormattedDayMonth(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}`;
}

const specialDayImages = {
  "01-01": "./images/reklam-2.jpg",
};

const todayKey = getFormattedDayMonth();
const dynamicPromo1Image =
  specialDayImages[todayKey] || "./images/reklam-1.jpg";

function DynamicImageRotator() {
  const images = useMemo(
    () => [
      "./images/reklam-1.jpg",
      "./images/reklam-2.jpg",
      "./images/reklam-3.jpg",
    ],
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoaded(false);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <img
      key={images[currentIndex]}
      src={images[currentIndex]}
      alt="promo-3"
      className={`fade-image ${loaded ? "loaded" : ""}`}
      onLoad={() => setLoaded(true)}
    />
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

  const colors = useMemo(() => ["#087f5b", "#169b73"], []);

  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [colors.length]);

  const badgeStyle = {
    backgroundColor: colors[currentColorIndex],
    transition: "background-color 1s ease-in-out",
  };

  function formatPhoneNumber(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  }

  return (
    <div className="item featured">
      <div className="content-box">
        <div className="box">
          <div className="header">
            <p className="title text-card">{title}</p>
            <span className="badge" style={badgeStyle}>
              Sizin Bölgeniz
            </span>
          </div>
          <p className="text-card2">
            <strong>Adres:</strong> {adres}
            <br />
            <strong>Telefon:</strong> {formatPhoneNumber(telefon)}
            <br />
            <strong>İlçe:</strong> {bolge}
            <strong className="location">Enlem: {latitude}</strong>
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
