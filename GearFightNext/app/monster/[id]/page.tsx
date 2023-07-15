'use client'

import styles from '@/app/page.module.css'
import { useRouter, useParams } from 'next/navigation'

export default function Page() {
  const route = useParams();
  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>{route.id}</h1>
    </main>
  );
}