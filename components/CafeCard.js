import { MAX_SCORE } from "@/lib/score";
import { directionsUrl, osmUrl, websiteUrl } from "@/lib/cafes";
import StarRating from "./StarRating";
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
        {cafe.ratingCount > 0 ? (
          <span className={styles.score} title={`${cafe.ratingCount} ziyaretçi puanı`}>
            ★ {cafe.ratingAvg.toFixed(1)} · {cafe.ratingCount}
          </span>
        ) : (
          <span className={styles.featureScore} title="Özellik skoru: Wi-Fi, dış mekân, açılış saatleri, bağımsızlık">
            {cafe.score}/{MAX_SCORE}
          </span>
        )}
      </div>

      <h2 className={styles.name}>{cafe.name}</h2>
      {cafe.brand && <p className={styles.brand}>{cafe.brand}</p>}
      {location && <p className={styles.meta}>{location}</p>}
      {cafe.openingHours && <p className={styles.meta}>🕒 {cafe.openingHours}</p>}

      <Features cafe={cafe} />

      <StarRating
        cafeId={cafe.id}
        ratingAvg={cafe.ratingAvg}
        ratingCount={cafe.ratingCount}
      />

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
