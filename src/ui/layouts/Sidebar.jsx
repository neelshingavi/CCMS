import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { Icon } from '../components/Icon';
import { Text } from '../primitives/Text';

/**
 * Sidebar Component
 * Navigation sidebar with links and sections
 */
export function Sidebar({ userRole = 'student' }) {
    const navigation = {
        student: [
            { name: 'Dashboard', href: '/student', icon: 'event' },
            { name: 'My Attendance', href: '/student/attendance', icon: 'checkCircle' },
            { name: 'Voting', href: '/student/voting', icon: 'vote' },
            { name: 'Certificates', href: '/certificates', icon: 'certificate' },
            { name: 'Feedback', href: '/student/feedback', icon: 'feedback' },
        ],
        organizer: [
            { name: 'Dashboard', href: '/organizer', icon: 'event' },
            { name: 'Create Event', href: '/organizer/create', icon: 'plus' },
            { name: 'Manage Events', href: '/organizer/events', icon: 'calendar' },
            { name: 'Elections', href: '/organizer/elections', icon: 'vote' },
            { name: 'Reports', href: '/organizer/reports', icon: 'users' },
        ],
    };

    const links = navigation[userRole] || navigation.student;

    return (
        <div className="sidebar">
            <div className="sidebar__section">
                <Text as="p" variant="caption" color="tertiary" className="sidebar__section-title">
                    Navigation
                </Text>
                <nav className="sidebar__nav">
                    {links.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                            }
                            end
                        >
                            <Icon name={item.icon} size="md" />
                            <span className="sidebar__link-text">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="sidebar__footer">
                <div className="sidebar__network">
                    <div className="sidebar__network-dot" />
                    <Text variant="caption" color="tertiary">Algorand TestNet</Text>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
