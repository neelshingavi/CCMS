import './Button.css';

/**
 * Button Component
 * Primary interactive element with variants, sizes, and states
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Expand to full width
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {ReactNode} leftIcon - Icon before text
 * @param {ReactNode} rightIcon - Icon after text
 */
export function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    className = '',
    children,
    ...props
}) {
    const classes = [
        'button',
        `button--${variant}`,
        `button--${size}`,
        fullWidth && 'button--full-width',
        loading && 'button--loading',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className="button__spinner" aria-hidden="true">
                    <svg className="button__spinner-icon" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
                    </svg>
                </span>
            )}
            {leftIcon && <span className="button__icon button__icon--left">{leftIcon}</span>}
            <span className="button__label">{children}</span>
            {rightIcon && <span className="button__icon button__icon--right">{rightIcon}</span>}
        </button>
    );
}

export default Button;
