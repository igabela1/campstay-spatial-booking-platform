'use client';

import dynamic from 'next/dynamic';

const CesiumMap = dynamic(() => import('@/components/CesiumMap'), {
  ssr: false,
});

export default function CesiumMapClient() {
  return <CesiumMap />;
}