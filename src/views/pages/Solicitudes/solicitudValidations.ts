import { required, minLength, maxLength, minValue, helpers, numeric } from '@vuelidate/validators';

const mensajes = {
    requerido: 'Este campo es obligatorio',
    minLongitud: (min: number) => `Este campo debe tener al menos ${min} caracteres`,
    maxLongitud: (max: number) => `Este campo no debe exceder los ${max} caracteres`,
    valorMinimo: (min: number) => `El valor debe ser mayor o igual a ${min}`,
    seleccionarOpcion: 'Debe seleccionar una opción',
    numerico: 'Este campo debe contener solo números'
};

export const solicitudValidations = {
    contenedor: {
        required: helpers.withMessage(mensajes.requerido, required),
        minLength: helpers.withMessage(mensajes.minLongitud(3), minLength(3)),
        maxLength: helpers.withMessage(mensajes.maxLongitud(100), maxLength(100))
    },
    navieraId: {
         required: helpers.withMessage(mensajes.seleccionarOpcion, required)
    },
    tipo: {
         required: helpers.withMessage(mensajes.seleccionarOpcion, required)
    },
    monto: {
        required: helpers.withMessage(mensajes.requerido, required),
        minValue: helpers.withMessage(mensajes.valorMinimo(1), minValue(1))
    }
};
