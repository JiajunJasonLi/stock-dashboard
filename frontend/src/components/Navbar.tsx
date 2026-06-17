import NavItem from './NavItem';

type NavbarProps = {
  currentPath: string;
};

const items = [
  { href: '/', label: 'Tickers' },
  { href: '/stocks/NVDA', label: 'Stock Detail' },
];

function Navbar({ currentPath }: NavbarProps) {
  return (
    <nav className="navbar" aria-label="Primary">
      {items.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          label={item.label}
          isActive={
            item.href === '/'
              ? currentPath === '/'
              : currentPath.startsWith('/stocks/')
          }
        />
      ))}
    </nav>
  );
}

export default Navbar;
