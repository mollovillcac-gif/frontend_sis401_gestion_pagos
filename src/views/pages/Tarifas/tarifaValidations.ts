import { helpers, required, numeric, minValue, maxValue } from '@vuelidate/validators';

const mensajes = {
    requerido: 'Este campo es obligatorio',
    valorMinimo: (min: number) => `El valor debe ser mayor o igual a ${min}`,
    valorMaximo: (max: number) => `El valor no debe exceder ${max}`,
    seleccionarOpcion: 'Debe seleccionar una opción',
    numerico: 'Este campo debe contener solo números'
};

export const tarifaValidations = {
    navieraId: {
        required: helpers.withMessage(mensajes.seleccionarOpcion, required)
    },
    montoBase: {
        required: helpers.withMessage(mensajes.requerido, required),
        numeric: helpers.withMessage(mensajes.numerico, numeric),
        minValue: helpers.withMessage(mensajes.valorMinimo(0), minValue(0)),
        maxValue: helpers.withMessage(mensajes.valorMaximo(1000000), maxValue(1000000))
    },
    activo: {
        required: helpers.withMessage(mensajes.requerido, required)
    }
};
