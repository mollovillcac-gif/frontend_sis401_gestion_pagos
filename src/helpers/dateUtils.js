export function formatDate(date, includeTime = false) {
    // Verificar si la fecha existe y no es un objeto vacío
    if (!date || (typeof date === 'object' && Object.keys(date).length === 0)) {
        return 'N/A';
    }

    try {
        const dateObj = new Date(date);

        // Verificar si la fecha es válida
        if (isNaN(dateObj.getTime())) {
            return 'N/A';
        }

        // Formatear según si se incluye la hora o no
        if (includeTime) {
            return dateObj.toLocaleString('es-BO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } else {
            return dateObj.toLocaleDateString('es-BO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }
    } catch (error) {
        console.warn('Error formateando fecha:', error);
        return 'N/A';
    }
}

export function formatDateTime(date) {
    return formatDate(date, true);
}

export function toISOString(date) {
    if (!date || (typeof date === 'object' && Object.keys(date).length === 0)) {
        return null;
    }

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return null;
        }
        return dateObj.toISOString();
    } catch (error) {
        return null;
    }
}

export function isValidDate(date) {
    if (!date || (typeof date === 'object' && Object.keys(date).length === 0)) {
        return false;
    }

    try {
        const dateObj = new Date(date);
        return !isNaN(dateObj.getTime());
    } catch (error) {
        return false;
    }
}
