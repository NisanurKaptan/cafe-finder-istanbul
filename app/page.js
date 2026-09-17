import Link from "next/link";
import { districts } from "@/lib/districts";
import { countCafes } from "@/lib/cafes";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className="container">
      <section className={styles.hero}>
        <h1>İstanbul&apos;da sana uygun cafeyi bul</h1>
        <p>
          Wi-Fi, dış mekân, açılış saatleri ve bağımsız olup olmamasına göre sıralanmış cafeler.
          Şimdilik üç ilçe ile başlıyoruz.
        </p>
      </section>

      <section className={styles.grid}>
        {districts.map((district) => (
          <Link key={district.slug} href={`/${district.slug}`} className={styles.card}>
            <h2>{district.name}</h2>
            <p>{countCafes(district.slug)} cafe</p>
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
