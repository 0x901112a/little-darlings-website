import Image from "next/image";
import styles from "./minting.module.css";
import MintingUB from "./minting_ub";

export default function minting({}) {
  return (
    <div className={styles.mintWrapper}>
      <h3 className={styles.releaseDate}>
        🔥 RELEASING THIS FRIDAY, MARCH 29th 🔥
      </h3>

      <section className={styles.mintArea}>
        <div className={styles.mintInfo}>
          <MintingUB />

          {/* *********************************** */}
          {/* Friends Allowlist                   */}
          {/* *********************************** */}

          {/* *********************************** */}
          {/* Public                              */}
          {/* *********************************** */}
        </div>
      </section>

      <iframe
        className={styles.trailer}
        title="vimeo-player"
        src="https://player.vimeo.com/video/927131661?h=58c4ec7cd5&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
        frameBorder="0"
        allowFullscreen
      ></iframe>
    </div>
  );
}
