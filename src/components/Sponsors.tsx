import { colors } from "../theme/tokens";
import { sponsors } from "../config/sponsors";

export default function Sponsors() {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800 }}>
          Commanditaires
        </div>
        <div style={{ fontSize: 13, color: colors.mutedText }}>
          Merci à nos commanditaires · Super Croulants
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
        }}
      >
        {sponsors.map(sponsor => {
          const card = (
            <div
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: 18,
                cursor: sponsor.link ? "pointer" : "default",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  overflow: "hidden",
                  background: sponsor.logoUrl
                    ? undefined
                    : "repeating-linear-gradient(45deg, oklch(0.5 0.03 250), oklch(0.5 0.03 250) 4px, oklch(0.22 0.02 250) 4px, oklch(0.22 0.02 250) 8px)",
                }}
              >
                {sponsor.logoUrl && (
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )}
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 19, fontWeight: 700 }}>
                {sponsor.name}
              </div>
              <div style={{ fontSize: 13, color: colors.mutedText }}>
                {sponsor.link ? sponsor.link.replace(/^https?:\/\//, "") : "Lien à venir"}
              </div>
            </div>
          );

          return sponsor.link ? (
            <a key={sponsor.name} href={sponsor.link} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
              {card}
            </a>
          ) : (
            <div key={sponsor.name}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
