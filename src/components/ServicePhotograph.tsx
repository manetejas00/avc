import type { CSSProperties } from 'react';
import { servicePhotography } from '../data/photography';

type PhotoKey = keyof typeof servicePhotography;
const featurePositions: Record<PhotoKey, string> = { investments: '50% 0%', loans: '50% 22%', insurance: '50% 25%', tax: '50% 15%' };

export default function ServicePhotograph({ service, feature = false }: { service: PhotoKey; feature?: boolean }) {
  const photo = servicePhotography[service];
  return <picture className={`service-photograph${feature ? ' service-photograph--feature' : ''}`} style={{ '--photo-position': feature ? featurePositions[service] : photo.position } as CSSProperties}>
    <source type="image/webp" srcSet={`${photo.base}-480.webp 480w, ${photo.base}-960.webp 960w, ${photo.base}-1600.webp 1600w`} sizes={feature ? '(max-width: 650px) calc(100vw - 40px), (max-width: 1240px) calc(100vw - 64px), 1176px' : '(max-width: 650px) calc(100vw - 40px), (max-width: 1150px) calc((100vw - 88px) / 2), 276px'} />
    <img src={`${photo.base}.jpg`} alt={photo.alt} width={photo.width} height={photo.height} loading={feature ? 'eager' : 'lazy'} decoding="async" />
  </picture>;
}
