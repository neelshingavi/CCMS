import { forwardRef } from 'react';
import './Input.css';

/**
 * Input Component
 * Form input with built-in validation states and accessibility
 * 
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} state - 'default' | 'error' | 'success'
 * @param {string} label - Input label
 * @param {string} hint - Helper text below input
 * @param {string} error - Error message
 * @param {ReactNode} leftAddon - Content before input
 * @param {ReactNode} rightAddon - Content after input
 */
export const Input = forwardRef(function Input({
    size = 'md',
    state = 'default',
    label,
    hint,
    error,
    leftAddon,
    rightAddon,
    className = '',
    id,
    disabled,
    required,
    ...props
}, ref) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = state === 'error' || !!error;

    const wrapperClasses = [
        'input-wrapper',
        `input-wrapper--${size}`,
        hasError && 'input-wrapper--error',
        state === 'success' && 'input-wrapper--success',
        disabled && 'input-wrapper--disabled',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {label && (
                <label htmlFor={inputId} className="input__label">
                    {label}
                    {required && <span className="input__required" aria-hidden="true">*</span>}
                </label>
            )}

            <div className="input__container">
                {leftAddon && <div className="input__addon input__addon--left">{leftAddon}</div>}

                <input
                    ref={ref}
                    id={inputId}
                    className="input__field"
                    disabled={disabled}
                    required={required}
                    aria-invalid={hasError}
                    aria-describedby={hint || error ? `${inputId}-hint` : undefined}
                    {...props}
                />

                {rightAddon && <div className="input__addon input__addon--right">{rightAddon}</div>}
            </div>

            {(hint || error) && (
                <p id={`${inputId}-hint`} className={`input__hint ${hasError ? 'input__hint--error' : ''}`}>
                    {error || hint}
                </p>
            )}
        </div>
    );
});

export default Input;
