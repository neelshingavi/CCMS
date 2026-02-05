import './Card.css';

/**
 * Card Component
 * Container for grouped content with elevation and optional interactions
 * 
 * @param {string} variant - 'elevated' | 'outlined' | 'filled'
 * @param {string} padding - Padding token (0-8)
 * @param {boolean} interactive - Enable hover effects
 * @param {boolean} selected - Selected state
 */
export function Card({
    variant = 'elevated',
    padding = '6',
    interactive = false,
    selected = false,
    className = '',
    children,
    onClick,
    ...props
}) {
    const classes = [
        'card',
        `card--${variant}`,
        `card--padding-${padding}`,
        interactive && 'card--interactive',
        selected && 'card--selected',
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classes}
            onClick={onClick}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className = '', children, ...props }) {
    return (
        <div className={`card__header ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardBody({ className = '', children, ...props }) {
    return (
        <div className={`card__body ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className = '', children, ...props }) {
    return (
        <div className={`card__footer ${className}`} {...props}>
            {children}
        </div>
    );
}

export default Card;
