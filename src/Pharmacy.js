import React, { useEffect, useMemo, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

const fetchWithRetry = async (
  url,
  options = {},
  retries = 5,
  baseDelay = 1000
) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error("API yanıtı başarısız oldu.");
      return await response.json();
    } catch (err) {
      if (i < retries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.warn(
          `Deneme ${i + 1} başarısız. ${delay}ms sonra tekrar deneniyor...`
        );
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
};

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
  const containerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showFullscreenBtn, setShowFullscreenBtn] = useState(true);
  const [eczaneler, setEczaneler] = useState(() => {
    // Başlangıçta localStorage’dan varsa getir
    const stored = localStorage.getItem("eczaneler");
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(eczaneler.length === 0); // ilk başta veri yoksa loading true
  const [hata, setHata] = useState(null);

  const [currentEczane, setCurrentEczane] = useState(() => {
    const savedIndex = localStorage.getItem("currentEczaneIndex");
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  const toggleFullScreen = () => {
    const el = containerRef.current || document.documentElement;
    if (!isFullScreen) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      const fsElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
      setIsFullScreen(!!fsElement);
      setShowFullscreenBtn(true);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("msfullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullScreenChange
      );
    };
  }, []);

  useEffect(() => {
    if (!isFullScreen) {
      setShowFullscreenBtn(true);
      return;
    }

    let hideTimeout;

    const showButton = () => {
      setShowFullscreenBtn(true);
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => setShowFullscreenBtn(false), 3000);
    };

    hideTimeout = setTimeout(() => setShowFullscreenBtn(false), 3000);

    window.addEventListener("mousemove", showButton);
    window.addEventListener("touchstart", showButton);

    return () => {
      window.removeEventListener("mousemove", showButton);
      window.removeEventListener("touchstart", showButton);
      clearTimeout(hideTimeout);
    };
  }, [isFullScreen]);

  const getData = async () => {
    const eskiVeri = localStorage.getItem("eczaneler");

    if (eskiVeri) {
      setEczaneler(JSON.parse(eskiVeri));
      setLoading(false); // Hemen eski veriyi göster
    } else {
      setLoading(true); // Eski veri yoksa, sadece o zaman loading göster
    }

    setHata(null);

    try {
      const data = await fetchWithRetry(
        "https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler",
        {},
        5,
        1000
      );
      setEczaneler(data);
      localStorage.setItem("eczaneler", JSON.stringify(data));
    } catch (error) {
      console.error("API Hatası:", error.message);
      setHata(error.message);
      // burada tekrar eski veri çekmene gerek yok, zaten yukarıda yüklendi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!hata) return;
    const retryTimeout = setTimeout(() => {
      getData();
    }, 5000);
    return () => clearTimeout(retryTimeout);
  }, [hata]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const now = currentTime;
  const startTime = new Date(now);
  startTime.setHours(9, 0, 0, 0);
  const endTime = new Date(now);
  endTime.setHours(19, 0, 0, 0);
  const isResimZamani = now >= startTime && now < endTime;

  const kendiBolgeEczaneleri = useMemo(() => {
    const bolgeId = 42;
    return eczaneler.filter((e) => e.BolgeId === bolgeId);
  }, [eczaneler]);

  useEffect(() => {
    if (currentEczane >= kendiBolgeEczaneleri.length) {
      setCurrentEczane(0);
      localStorage.setItem("currentEczaneIndex", "0");
    }
    if (kendiBolgeEczaneleri.length === 0 && currentEczane !== 0) {
      setCurrentEczane(0);
      localStorage.setItem("currentEczaneIndex", "0");
    }
  }, [kendiBolgeEczaneleri.length, currentEczane]);

  useEffect(() => {
    if (kendiBolgeEczaneleri.length < 2) return;

    const interval = setInterval(() => {
      setCurrentEczane((prevIndex) => {
        const nextIndex = (prevIndex + 1) % kendiBolgeEczaneleri.length;
        localStorage.setItem("currentEczaneIndex", nextIndex.toString());
        return nextIndex;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [kendiBolgeEczaneleri.length]);

  return (
    <div
      ref={containerRef}
      className="accordion"
      style={{ position: "relative", backgroundColor: "red" }}
    >
      {showFullscreenBtn && (
        <button
          onClick={toggleFullScreen}
          className="fullscreen-btn"
          aria-label={isFullScreen ? "Tam Ekrandan Çık" : "Tam Ekran Aç"}
          title={isFullScreen ? "Tam Ekrandan Çık" : "Tam Ekran Aç"}
        >
          {isFullScreen ? "✕" : "⛶"}
        </button>
      )}

      {isResimZamani ? (
        <ResimSablonu />
      ) : loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Yükleniyor...</p>
        </div>
      ) : kendiBolgeEczaneleri.length > 0 ? (
        <AccordionItemKendiBolge
          key={`kendi-${kendiBolgeEczaneleri[currentEczane].Adi}`}
          title={kendiBolgeEczaneleri[currentEczane].Adi}
          latitude={kendiBolgeEczaneleri[currentEczane].LokasyonX}
          longitude={kendiBolgeEczaneleri[currentEczane].LokasyonY}
          adres={kendiBolgeEczaneleri[currentEczane].Adres}
          telefon={kendiBolgeEczaneleri[currentEczane].Telefon}
          bolgeId={kendiBolgeEczaneleri[currentEczane].BolgeId}
          bolge={kendiBolgeEczaneleri[currentEczane].Bolge}
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
              Konum için <br /> QR kodu okutun
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
