import './Stack.css';

/**
 * Stack Primitive
 * Flexbox-based layout component for vertical/horizontal stacking
 * 
 * @param {string} direction - 'vertical' | 'horizontal'
 * @param {string} gap - Spacing token (1-11)
 * @param {string} align - Flex align-items
 * @param {string} justify - Flex justify-content
 * @param {boolean} wrap - Enable flex-wrap
 */
export function Stack({
    as: Component = 'div',
    direction = 'vertical',
    gap = '4',
    align = 'stretch',
    justify = 'flex-start',
    wrap = false,
    className = '',
    children,
    ...props
}) {
    const classes = [
        'stack',
        `stack--${direction}`,
        `stack--gap-${gap}`,
        `stack--align-${align}`,
        `stack--justify-${justify}`,
        wrap && 'stack--wrap',
        className
    ].filter(Boolean).join(' ');

    return (
        <Component className={classes} {...props}>
            {children}
        </Component>
    );
}

export default Stack;
