import { useNavItems } from '../../hooks/useNavItems';
import MobileNavItem from './MobileNavItem';

function MobileTabBar() {
  const navItems = useNavItems();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card px-1 py-1 shadow-[0_-1px_3px_rgba(20,20,19,0.08)] sm:hidden"
      style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
    >
      {navItems.map((item) => (
        <MobileNavItem key={item.to} {...item} />
      ))}
    </nav>
  );
}

export default MobileTabBar;
