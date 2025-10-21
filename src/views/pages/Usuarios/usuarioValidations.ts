import { email, helpers, maxLength, minLength, numeric, required } from '@vuelidate/validators';

const mensajes = {
    requerido: 'Este campo es obligatorio',
    minLongitud: (min: number) => `Este campo debe tener al menos ${min} caracteres`,
    maxLongitud: (max: number) => `Este campo no debe exceder los ${max} caracteres`,
    emailInvalido: 'El formato de correo electrónico no es válido',
    seleccionarOpcion: 'Debe seleccionar una opción',
    numerico: 'Este campo debe contener solo números'
};

export const usuarioValidations = {
    usuario: {
        required: helpers.withMessage(mensajes.requerido, required),
        minLength: helpers.withMessage(mensajes.minLongitud(2), minLength(2)),
        maxLength: helpers.withMessage(mensajes.maxLongitud(20), maxLength(20))
    },
    nombre: {
        required: helpers.withMessage(mensajes.requerido, required),
        minLength: helpers.withMessage(mensajes.minLongitud(2), minLength(2)),
        maxLength: helpers.withMessage(mensajes.maxLongitud(100), maxLength(100))
    },
    apellido: {
        required: helpers.withMessage(mensajes.requerido, required),
        minLength: helpers.withMessage(mensajes.minLongitud(2), minLength(2)),
        maxLength: helpers.withMessage(mensajes.maxLongitud(100), maxLength(100))
    },
    correo: {
        required: helpers.withMessage(mensajes.requerido, required),
        email: helpers.withMessage(mensajes.emailInvalido, email),
        maxLength: helpers.withMessage(mensajes.maxLongitud(255), maxLength(255))
    },
    telefono: {
        required: helpers.withMessage(mensajes.requerido, required),
        numeric: helpers.withMessage(mensajes.numerico, numeric),
        minLength: helpers.withMessage(mensajes.minLongitud(11), minLength(11)),
        maxLength: helpers.withMessage(mensajes.maxLongitud(11), maxLength(11))
    },

    rolId: {
        required: helpers.withMessage(mensajes.seleccionarOpcion, required)
    }
};

export const claveValidations = {
    clave: {
        required: helpers.withMessage(mensajes.requerido, required),
        minLength: helpers.withMessage(mensajes.minLongitud(6), minLength(6)),
        maxLength: helpers.withMessage(mensajes.maxLongitud(20), maxLength(20))
    }
};
