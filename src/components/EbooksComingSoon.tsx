import type { ReactNode } from 'react';
import { BookOpen } from 'lucide-react';

export default function EbooksComingSoon({ children }: { children: ReactNode }) {
  return <div className="ebooks-coming-soon">
    <div className="ebooks-coming-soon__preview" aria-hidden="true" ref={element => element?.setAttribute('inert', '')}>{children}</div>
    <div className="ebooks-coming-soon__overlay">
      <div className="ebooks-coming-soon__message" role="status">
        <BookOpen size={32} aria-hidden="true" />
        <p>E-BOOKS</p>
        <h2>Coming Soon</h2>
        <span>Our financial education library is on its way.</span>
      </div>
    </div>
  </div>;
}
