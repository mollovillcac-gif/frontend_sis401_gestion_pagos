export const DOCUMENT_TYPES = [
    { value: 'CI', label: 'CI' },
    { value: 'NIT', label: 'NIT' },
    { value: 'RUT', label: 'RUT' },
    // { value: 'PASAPORTE', label: 'PASAPORTE' },
    // { value: 'DNI', label: 'DNI' },
    // { value: 'LICENCIA', label: 'LICENCIA' },
    // { value: 'RUC', label: 'RUC' },
    // { value: 'OTRO', label: 'OTRO' }
];

export const PAYMENT_METHODS = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TARJETA', label: 'Tarjeta de Crédito' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'DEPOSITO', label: 'Depósito' },
    { value: 'CHEQUE', label: 'Cheque' }
];

export const TIPOS_SOLICITUD = [
    { label: 'Gate In', value: 'gatein' },
    { label: 'Demora', value: 'demora' },
    { label: 'Liberación', value: 'liberacion' }
];

export const ESTADOS_SOLICITUD = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Subido', value: 'subido' },
    { label: 'Verificada', value: 'verificada' },
    { label: 'Pagada', value: 'pagada' },
    { label: 'Anulada', value: 'anulada' }
];
