import { Link } from 'react-router-dom';
import './Header.css';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { useAppShell } from './AppShell';

/**
 * Header Component
 * Main navigation header with logo, nav, and actions
 */
export function Header({
    onConnectWallet,
    walletAddress,
    isConnected,
    onDisconnect,
}) {
    const { sidebarOpen, setSidebarOpen } = useAppShell();

    const formatWallet = (addr) => {
        if (!addr) return '';
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    return (
        <div className="header">
            <div className="header__left">
                <button
                    className="header__menu-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                >
                    <Icon name="menu" size="md" />
                </button>

                <Link to="/" className="header__logo">
                    <div className="header__logo-mark">
                        <Icon name="blockchain" size="lg" />
                    </div>
                    <span className="header__logo-text">CCMS</span>
                </Link>
            </div>

            <nav className="header__nav">
                <Link to="/student" className="header__nav-link">Dashboard</Link>
                <Link to="/organizer" className="header__nav-link">Organizer</Link>
                <Link to="/certificates" className="header__nav-link">Certificates</Link>
            </nav>

            <div className="header__right">
                {isConnected ? (
                    <div className="header__wallet">
                        <div className="header__wallet-indicator" />
                        <span className="header__wallet-address">{formatWallet(walletAddress)}</span>
                        <Button variant="ghost" size="sm" onClick={onDisconnect}>
                            Disconnect
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Icon name="wallet" size="sm" />}
                        onClick={onConnectWallet}
                    >
                        Connect Wallet
                    </Button>
                )}
            </div>
        </div>
    );
}

export default Header;
