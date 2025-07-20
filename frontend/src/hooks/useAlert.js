import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar alertas
 * @returns {Object} Objeto con métodos y estado para manejar alertas
 */
const useAlert = () => {
    const [alert, setAlert] = useState({
        isVisible: false,
        type: 'info',
        title: '',
        message: '',
        details: '',
        autoCloseTime: null
    });

    const showAlert = useCallback((type, title, message, details = '', autoCloseTime = 5000) => {
        setAlert({
            isVisible: true,
            type,
            title,
            message,
            details,
            autoCloseTime
        });
    }, []);

    const hideAlert = useCallback(() => {
        setAlert(prev => ({
            ...prev,
            isVisible: false
        }));
    }, []);

    // Métodos específicos para cada tipo de alerta
    const showSuccess = useCallback((title, message, details = '', autoCloseTime = 4000) => {
        showAlert('success', title, message, details, autoCloseTime);
    }, [showAlert]);

    const showError = useCallback((title, message, details = '', autoCloseTime = 6000) => {
        showAlert('error', title, message, details, autoCloseTime);
    }, [showAlert]);

    const showWarning = useCallback((title, message, details = '', autoCloseTime = 5000) => {
        showAlert('warning', title, message, details, autoCloseTime);
    }, [showAlert]);

    const showInfo = useCallback((title, message, details = '', autoCloseTime = 4000) => {
        showAlert('info', title, message, details, autoCloseTime);
    }, [showAlert]);

    return {
        alert,
        showAlert,
        hideAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
};

export default useAlert;
