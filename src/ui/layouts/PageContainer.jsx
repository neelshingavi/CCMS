import './PageContainer.css';
import { Text } from '../primitives/Text';
import { Stack } from '../primitives/Stack';

/**
 * PageContainer Component
 * Standard page wrapper with title, subtitle, and content area
 * 
 * @param {string} title - Page title
 * @param {string} subtitle - Optional subtitle
 * @param {ReactNode} actions - Optional action buttons
 * @param {string} maxWidth - 'sm' | 'md' | 'lg' | 'xl' | 'full'
 */
export function PageContainer({
    title,
    subtitle,
    actions,
    maxWidth = 'xl',
    className = '',
    children,
}) {
    const classes = [
        'page-container',
        `page-container--${maxWidth}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            {(title || actions) && (
                <div className="page-container__header">
                    <div className="page-container__title-group">
                        {title && (
                            <Text as="h1" variant="h2" color="primary">
                                {title}
                            </Text>
                        )}
                        {subtitle && (
                            <Text variant="body" color="secondary">
                                {subtitle}
                            </Text>
                        )}
                    </div>
                    {actions && (
                        <div className="page-container__actions">
                            {actions}
                        </div>
                    )}
                </div>
            )}

            <div className="page-container__content">
                {children}
            </div>
        </div>
    );
}

/**
 * Section Component
 * Content section within a page
 */
export function Section({
    title,
    subtitle,
    actions,
    className = '',
    children,
}) {
    return (
        <section className={`section ${className}`}>
            {(title || actions) && (
                <div className="section__header">
                    <div className="section__title-group">
                        {title && (
                            <Text as="h2" variant="h4" color="primary">
                                {title}
                            </Text>
                        )}
                        {subtitle && (
                            <Text variant="body-sm" color="tertiary">
                                {subtitle}
                            </Text>
                        )}
                    </div>
                    {actions && (
                        <div className="section__actions">
                            {actions}
                        </div>
                    )}
                </div>
            )}
            <div className="section__content">
                {children}
            </div>
        </section>
    );
}

export default PageContainer;
