import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
export default function NewsImage({ url, source }: { url: string; source: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  return <div className="news-article-image">
    {url && !failed ? <><img src={url} alt={`${source} article image`} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} /><span className="news-article-image__credit">Image from {source} feed</span></> : <div className="news-article-image__empty"><ImageOff size={30} aria-hidden="true" /><span>Publisher image unavailable</span><small>Read the original article for full coverage.</small></div>}
  </div>;
}
