import './Badge.css';

/**
 * Badge Component
 * Status indicator and label component
 * 
 * @param {string} variant - 'default' | 'primary' | 'success' | 'warning' | 'error'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} dot - Show dot indicator only
 * @param {boolean} pulse - Animate the badge
 */
export function Badge({
    variant = 'default',
    size = 'md',
    dot = false,
    pulse = false,
    className = '',
    children,
    ...props
}) {
    const classes = [
        'badge',
        `badge--${variant}`,
        `badge--${size}`,
        dot && 'badge--dot',
        pulse && 'badge--pulse',
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={classes} {...props}>
            {!dot && children}
        </span>
    );
}

export default Badge;
