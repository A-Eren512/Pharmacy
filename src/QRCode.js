import { QRCodeCanvas } from "qrcode.react";

export default function Code() {
  const WEBSITELINK = process.env.REACT_APP_WEBSITE_LINK;

  const Url = `${WEBSITELINK}/pharmacy`;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "200px",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
      }}
    >
      <h1
        style={{
          fontSize: "100px",
          fontFamily: "sans-serif",
          letterSpacing: "4px",
          wordSpacing: "8px",
          color: "#087f5b",
        }}
      >
        AÇIK OLAN NÖBETÇİ ECZANELER
      </h1>
      <QRCodeCanvas value={Url} size={500} />
    </div>
  );
}
