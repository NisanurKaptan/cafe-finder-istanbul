import { notFound } from "next/navigation";
import { districts, getDistrict } from "@/lib/districts";
import { getCafesByDistrict } from "@/lib/cafes";
import { getRatingStats } from "@/lib/ratings";
import { rankCafes } from "@/lib/ranking";
import CafeCard from "@/components/CafeCard";
import styles from "./page.module.css";

export const dynamicParams = false;

// Pages are prerendered and rebuilt at most every 5 minutes, so a new rating
// shows up for everyone shortly after it is given.
export const revalidate = 300;

export function generateStaticParams() {
  return districts.map((district) => ({ district: district.slug }));
}

export async function generateMetadata({ params }) {
  const { district: slug } = await params;
  const district = getDistrict(slug);
  return {
    title: `${district.name} cafeleri`,
    description: `${district.name}'deki cafeler: Wi-Fi, dış mekân ve açılış saatleri.`,
  };
}

export default async function DistrictPage({ params }) {
  const { district: slug } = await params;
  const district = getDistrict(slug);
  if (!district) notFound();

  const stats = await getRatingStats();
  const cafes = rankCafes(getCafesByDistrict(slug), stats);
  const ratedCount = cafes.filter((cafe) => cafe.ratingCount > 0).length;

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>{district.name} cafeleri</h1>
        <p>
          {cafes.length} cafe, ziyaretçi puanına göre sıralı
          {ratedCount > 0 && ` · ${ratedCount} cafe puan aldı`}
        </p>
      </header>

      <ul className={styles.list}>
        {cafes.map((cafe, index) => (
          <li key={cafe.id}>
            <CafeCard cafe={cafe} rank={index + 1} />
          </li>
        ))}
      </ul>
    </div>
  );
}
