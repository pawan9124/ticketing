import Link from "next/link";

const Header = ({currentUser})=>{
    const links = [
        !currentUser && { label: 'Sign In', href: '/auth/signin' },
        !currentUser && { label: 'Sign Up', href: '/auth/signup' },
        currentUser && { label: ' Sell Tickets', href: '/tickets/new' },
        currentUser && { label: "My Orders", href: "/orders" },
        currentUser && { label: 'Sign Out', href: '/auth/signout' }
    ]
    .filter(linkItems=> linkItems )
    .map(({label, href})=>{
        return <li key={href} className="nav-item">
            <Link href={href}>
                <a className="nav-link">{label}</a>
            </Link>
        </li>
    })

    return(
        <nav className="navbar navbar-light bg-light">
            <Link href="/">
                <a className="navbar-brand">GitTix</a>
            </Link>

            <div className="d-flex justify-content-end">
                <ul className="nav d-flex align-item-center">
                    {links}
                </ul>
            </div>
        </nav>
    )
};

export default Header;