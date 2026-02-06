import './Text.css';

/**
 * Text Primitive
 * Renders text with semantic variants and token-based styling
 * 
 * @param {string} as - HTML element to render
 * @param {string} variant - Text style variant
 * @param {string} color - Text color token
 * @param {string} weight - Font weight
 * @param {string} align - Text alignment
 * @param {boolean} truncate - Enable text truncation
 */
export function Text({
    as: Component = 'span',
    variant = 'body',
    color,
    weight,
    align,
    truncate = false,
    className = '',
    children,
    ...props
}) {
    const classes = [
        'text',
        `text--${variant}`,
        color && `text--color-${color}`,
        weight && `text--weight-${weight}`,
        align && `text--align-${align}`,
        truncate && 'text--truncate',
        className
    ].filter(Boolean).join(' ');

    return (
        <Component className={classes} {...props}>
            {children}
        </Component>
    );
}

export default Text;
