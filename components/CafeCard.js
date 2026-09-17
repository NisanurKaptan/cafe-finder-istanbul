import { MAX_SCORE } from "@/lib/score";
import { directionsUrl, osmUrl, websiteUrl } from "@/lib/cafes";
import styles from "./CafeCard.module.css";

function Features({ cafe }) {
  const features = [
    cafe.wifi && "Wi-Fi",
    cafe.outdoorSeating && "Dış mekân",
    cafe.wheelchair && "Engelli erişimi",
    cafe.vegan && "Vegan seçenek",
    !cafe.brand && "Bağımsız",
  ].filter(Boolean);

  if (features.length === 0) return null;

  return (
    <ul className={styles.features}>
      {features.map((feature) => (
        <li key={feature}>{feature}</li>
      ))}
    </ul>
  );
}

export default function CafeCard({ cafe, rank }) {
  const website = websiteUrl(cafe);
  const location = [cafe.neighbourhood, cafe.address].filter(Boolean).join(", ");

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <span className={styles.rank}>#{rank}</span>
        <span className={styles.score} title="Özellik skoru">
          {cafe.score}/{MAX_SCORE}
        </span>
      </div>

      <h2 className={styles.name}>{cafe.name}</h2>
      {cafe.brand && <p className={styles.brand}>{cafe.brand}</p>}
      {location && <p className={styles.meta}>{location}</p>}
      {cafe.openingHours && <p className={styles.meta}>🕒 {cafe.openingHours}</p>}

      <Features cafe={cafe} />

      <div className={styles.links}>
        <a href={directionsUrl(cafe)} target="_blank" rel="noopener noreferrer">
          Yol tarifi
        </a>
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer">
            Web sitesi
          </a>
        )}
        <a href={osmUrl(cafe)} target="_blank" rel="noopener noreferrer">
          OSM&apos;de düzenle
        </a>
      </div>
    </article>
  );
}
