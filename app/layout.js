import Link from "next/link";
import { Geist } from "next/font/google";
import { districts } from "@/lib/districts";
import "./globals.css";
import styles from "./layout.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata = {
  title: {
    default: "Cafe Finder İstanbul",
    template: "%s | Cafe Finder İstanbul",
  },
  description: "Kadıköy, Beşiktaş ve Üsküdar'daki cafeleri Wi-Fi, dış mekân ve açılış saatlerine göre keşfet.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={geistSans.variable}>
      <body>
        <header className={styles.header}>
          <div className={`container ${styles.headerInner}`}>
            <Link href="/" className={styles.logo}>
              ☕ Cafe Finder <span>İstanbul</span>
            </Link>
            <nav className={styles.nav}>
              {districts.map((district) => (
                <Link key={district.slug} href={`/${district.slug}`}>
                  {district.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className={styles.main}>{children}</main>

        <footer className={styles.footer}>
          <div className="container">
            Veriler{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
              © OpenStreetMap contributors
            </a>{" "}
            (ODbL) kaynağından alınmıştır.
          </div>
        </footer>
      </body>
    </html>
  );
}
