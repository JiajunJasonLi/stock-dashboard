import NavItem from './NavItem';

type NavbarProps = {
  currentPath: string;
};

const items = [
  { href: '/', label: 'Tickers' },
  { href: '/tickers/new', label: 'Add Symbol' },
  { href: '/stocks/NVDA', label: 'Stock Detail' },
];

function Navbar({ currentPath }: NavbarProps) {
  const isActive = (href: string) => {
    if (href === '/') {
      return currentPath === '/';
    }

    if (href.startsWith('/stocks/')) {
      return currentPath.startsWith('/stocks/');
    }

    return currentPath.startsWith(href);
  };

  return (
    <nav className="navbar" aria-label="Primary">
      {items.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          label={item.label}
          isActive={isActive(item.href)}
        />
      ))}
    </nav>
  );
}

export default Navbar;
