import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Componente de Alerta Popup Centrado
 * @param {Object} props
 * @param {string} props.type - Tipo de alerta: 'success', 'error', 'warning', 'info'
 * @param {string} props.title - Título de la alerta
 * @param {string} props.message - Mensaje principal de la alerta
 * @param {string} props.details - Detalles adicionales (opcional)
 * @param {boolean} props.isVisible - Controla la visibilidad de la alerta
 * @param {function} props.onClose - Función que se ejecuta al cerrar la alerta
 * @param {number} props.autoCloseTime - Tiempo en ms para auto-cerrar (opcional)
 * @param {boolean} props.showCloseButton - Mostrar botón de cerrar (default: true)
 * @param {string} props.acceptButtonText - Texto del botón aceptar (default: "Aceptar")
 */
const Alert = ({ 
    type = 'info', 
    title, 
    message, 
    details,
    isVisible = false, 
    onClose, 
    autoCloseTime = null,
    showCloseButton = true,
    acceptButtonText = "Aceptar"
}) => {
    const [visible, setVisible] = useState(isVisible);

    useEffect(() => {
        setVisible(isVisible);
    }, [isVisible]);

    useEffect(() => {
        if (visible && autoCloseTime) {
            const timer = setTimeout(() => {
                handleClose();
            }, autoCloseTime);

            return () => clearTimeout(timer);
        }
    }, [visible, autoCloseTime]);

    const handleClose = () => {
        setVisible(false);
        if (onClose) {
            onClose();
        }
    };

    const getAlertConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
                    borderColor: 'border-green-300',
                    iconColor: 'text-green-600',
                    iconBgColor: 'bg-green-100',
                    titleColor: 'text-green-900',
                    messageColor: 'text-green-700',
                    detailsColor: 'text-green-600',
                    buttonColor: 'bg-green-600 hover:bg-green-700',
                    closeButtonColor: 'text-green-600 hover:text-green-800 hover:bg-green-100',
                    overlayColor: 'bg-green-900/20',
                    animation: 'animate-bounce'
                };
            case 'error':
                return {
                    icon: XCircle,
                    bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
                    borderColor: 'border-red-300',
                    iconColor: 'text-red-600',
                    iconBgColor: 'bg-red-100',
                    titleColor: 'text-red-900',
                    messageColor: 'text-red-700',
                    detailsColor: 'text-red-600',
                    buttonColor: 'bg-red-600 hover:bg-red-700',
                    closeButtonColor: 'text-red-600 hover:text-red-800 hover:bg-red-100',
                    overlayColor: 'bg-red-900/20',
                    animation: 'animate-pulse'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
                    borderColor: 'border-yellow-300',
                    iconColor: 'text-yellow-600',
                    iconBgColor: 'bg-yellow-100',
                    titleColor: 'text-yellow-900',
                    messageColor: 'text-yellow-700',
                    detailsColor: 'text-yellow-600',
                    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
                    closeButtonColor: 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100',
                    overlayColor: 'bg-yellow-900/20',
                    animation: 'animate-pulse'
                };
            case 'info':
            default:
                return {
                    icon: Info,
                    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
                    borderColor: 'border-blue-300',
                    iconColor: 'text-blue-600',
                    iconBgColor: 'bg-blue-100',
                    titleColor: 'text-blue-900',
                    messageColor: 'text-blue-700',
                    detailsColor: 'text-blue-600',
                    buttonColor: 'bg-blue-600 hover:bg-blue-700',
                    closeButtonColor: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100',
                    overlayColor: 'bg-blue-900/20',
                    animation: 'animate-bounce'
                };
        }
    };

    if (!visible) return null;

    const config = getAlertConfig();
    const Icon = config.icon;

    return (
        <>
            {/* Overlay de fondo */}
            <div 
                className={`fixed inset-0 z-50 ${config.overlayColor} backdrop-blur-sm transition-all duration-300 ease-in-out ${
                    visible ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={handleClose}
            />
            
            {/* Modal centrado */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${
                visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
                <div 
                    className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out ${
                        visible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Encabezado con icono animado */}
                    <div className="flex flex-col items-center p-6 pb-4">
                        <div className={`${config.iconBgColor} rounded-full p-4 mb-4 ${config.animation}`}>
                            <Icon className={`w-12 h-12 ${config.iconColor}`} />
                        </div>
                        
                        {title && (
                            <h2 className={`text-xl font-bold ${config.titleColor} text-center mb-2`}>
                                {title}
                            </h2>
                        )}
                        
                        <p className={`text-base ${config.messageColor} text-center leading-relaxed`}>
                            {message}
                        </p>
                        
                        {details && (
                            <div className={`mt-4 p-3 bg-white/50 rounded-lg border ${config.borderColor} w-full`}>
                                <p className={`text-sm ${config.detailsColor} leading-relaxed`}>
                                    {details}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center justify-center gap-3 p-6 pt-2">
                        <button
                            onClick={handleClose}
                            className={`px-6 py-3 ${config.buttonColor} text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
                        >
                            {acceptButtonText}
                        </button>
                        
                        {/* {showCloseButton && (
                            <button
                                onClick={handleClose}
                                className={`p-2 rounded-lg transition-colors duration-200 ${config.closeButtonColor}`}
                                aria-label="Cerrar alerta"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )} */}
                    </div>

                    {/* Barra de progreso para auto-cierre */}
                    {autoCloseTime && visible && (
                        <div className="px-6 pb-4">
                            <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                                <div 
                                    className={`h-full ${config.buttonColor.split(' ')[0]} transition-all ease-linear`}
                                    style={{ 
                                        animation: `shrink ${autoCloseTime}ms linear`,
                                        width: '100%'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </>
    );
};

export default Alert;
