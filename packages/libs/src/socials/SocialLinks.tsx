import { SocialLinkItem } from './SocialLinkItem';
import { SOCIAL_LINKS } from './socialLinkData';

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={`flex items-center justify-center gap-3 ${className ?? ''}`}>
      {SOCIAL_LINKS.map((link) => (
        <li key={link.id}>
          <SocialLinkItem link={link} />
        </li>
      ))}
    </ul>
  );
}
