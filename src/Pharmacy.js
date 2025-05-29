import React, { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const resimler = [
  "/images/welcome.jpg",
  "/images/reklam-1.jpg",
  "/images/reklam-2.jpg",
  "/images/reklam-3.jpg",
  "/images/reklam-4.jpg",
  "/images/reklam-5.jpg",
  "/images/reklam-6.jpg",
  "/images/reklam-7.jpg",
  "/images/reklam-8.jpg",
  "/images/reklam-9.jpg",
  "/images/reklam-10.jpg",
  "/images/reklam-11.jpg",
  "/images/reklam-12.jpg",
  "/images/reklam-13.jpg",
  "/images/reklam-14.jpg",
  "/images/reklam-15.jpg",
  "/images/reklam-16.jpg",
];

function ResimSablonu() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    for (let i = 1; i <= 2; i++) {
      const preloadIndex = (index + i) % resimler.length;
      const img = new Image();
      img.src = resimler[preloadIndex];
    }
  }, [index]);

  useEffect(() => {
    const currentDuration = index === 0 ? 60000 : 15000;

    const timeout = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % resimler.length);
        setImageLoaded(false);
      }, 300);
    }, currentDuration);

    return () => clearTimeout(timeout);
  }, [index]);

  return (
    <div className="fullscreen-slider">
      <img
        src={resimler[index]}
        alt={`slider-${index}`}
        onLoad={() => {
          setImageLoaded(true);
          setFade(true);
        }}
        loading="eager"
        className={`fullscreen-image ${
          fade && imageLoaded ? "fade-in" : "fade-out"
        }`}
      />
    </div>
  );
}

export default function NobetciEczaneler() {
  const [eczaneler, setEczaneler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState(null);
  const [currentEczane, setCurrentEczane] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetch("https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler")
      .then((response) => {
        if (!response.ok) throw new Error("Ağ(API) yanıtı başarısız oldu.");
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const now = currentTime;

  const startTime = new Date(now);
  startTime.setHours(9, 0, 0, 0); // 09:00:00

  const endTime = new Date(now);
  endTime.setHours(19, 0, 0, 0); // 19:00:00

  const isResimZamani = now >= startTime && now < endTime;

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

  if (isResimZamani) {
    return <ResimSablonu />;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Yükleniyor...</p>
      </div>
    );
  }

  if (hata) {
    return (
      <div className="error-message">
        <p>⚠️ Hata: {hata}</p>
      </div>
    );
  }

  const kendiSecilenEczane =
    kendiBolgeEczaneleri.length > 0
      ? kendiBolgeEczaneleri[currentEczane]
      : null;

  return (
    <div className="accordion">
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
          <div className="logo">
            <img src="./images/pharmacy.png" alt="pharmacy" />
          </div>
          <div className="mainHour">
            <Hour />
          </div>
          BÖLGENİZDE NÖBETÇİ ECZANE YOKTUR.
        </div>
      )}
    </div>
  );
}

function AccordionItemKendiBolge({
  title,
  latitude,
  longitude,
  adres,
  telefon,
}) {
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  function formatPhoneNumber(phone = "") {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 11) {
      return digits.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
    }
    return phone;
  }

  return (
    <div className="item featured">
      <div className="logo">
        <img src="./images/pharmacy.png" alt="pharmacy" />
      </div>
      <div className="mainHour">
        <Hour />
      </div>
      <div className="content-box">
        <div className="box">
          <span className="badge">
            <b>NÖBETÇİ ECZANE</b>
          </span>
          <div className="header">
            <p className="title text-card">{title}</p>
          </div>
          <p className="text-card2">
            <strong>Adres:</strong> {adres}
            <br />
            <strong>Telefon:</strong> {formatPhoneNumber(telefon)}
            <strong className="location">Enlem: {latitude}</strong>
            <strong className="location">Boylam: {longitude}</strong>
          </p>
        </div>
        <div className="qrCode">
          <QRCodeCanvas value={googleMapsUrl} size={300} />
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
