type NavItemProps = {
  href: string;
  label: string;
  isActive?: boolean;
};

function NavItem({ href, label, isActive = false }: NavItemProps) {
  return (
    <a className={isActive ? 'nav-item nav-item--active' : 'nav-item'} href={href}>
      {label}
    </a>
  );
}

export default NavItem;
