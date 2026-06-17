import Navbar from './Navbar';

type HeaderProps = {
  currentPath: string;
};

function Header({ currentPath }: HeaderProps) {
  return (
    <header className="app-header">
      <a className="brand" href="/" aria-label="Stock Dashboard home">
        <span className="brand-mark">S</span>
        <span>
          <strong>Stock Dashboard</strong>
          <small>Phase 1 market data</small>
        </span>
      </a>

      <Navbar currentPath={currentPath} />
    </header>
  );
}

export default Header;
