import { notFound } from "next/navigation";
import { districts, getDistrict } from "@/lib/districts";
import { getCafesByDistrict } from "@/lib/cafes";
import CafeCard from "@/components/CafeCard";
import styles from "./page.module.css";

export const dynamicParams = false;

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

  const cafes = getCafesByDistrict(slug);

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>{district.name} cafeleri</h1>
        <p>{cafes.length} cafe, skora göre sıralı</p>
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
