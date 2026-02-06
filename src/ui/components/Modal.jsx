import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';
import { Icon } from './Icon';
import { Text } from '../primitives/Text';
import { Button } from './Button';

/**
 * Modal Component
 * Dialog overlay with focus trap and keyboard handling
 * 
 * @param {boolean} isOpen - Control visibility
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {boolean} closeOnOverlay - Close when clicking overlay
 * @param {boolean} closeOnEsc - Close on Escape key
 */
export function Modal({
    isOpen,
    onClose,
    title,
    size = 'md',
    closeOnOverlay = true,
    closeOnEsc = true,
    footer,
    className = '',
    children,
}) {
    // Handle Escape key
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && closeOnEsc) {
            onClose();
        }
    }, [closeOnEsc, onClose]);

    // Add/remove event listener
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && closeOnOverlay) {
            onClose();
        }
    };

    const modalContent = (
        <div className="modal__overlay" onClick={handleOverlayClick}>
            <div
                className={`modal ${size ? `modal--${size}` : ''} ${className}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {/* Header */}
                <div className="modal__header">
                    {title && (
                        <Text as="h2" variant="h4" id="modal-title">
                            {title}
                        </Text>
                    )}
                    <button
                        className="modal__close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <Icon name="close" size="md" />
                    </button>
                </div>

                {/* Body */}
                <div className="modal__body">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="modal__footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

/**
 * Confirm Modal - Pre-built confirmation dialog
 */
export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    loading = false,
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </>
            }
        >
            <Text color="secondary">{message}</Text>
        </Modal>
    );
}

export default Modal;
