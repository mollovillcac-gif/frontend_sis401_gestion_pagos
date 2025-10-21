import { helpers, required, maxLength, minLength } from '@vuelidate/validators'

const mensajes = {
  requerido: 'Este campo es obligatorio',
  minLongitud: (min: number) => `Este campo debe tener al menos ${min} caracteres`,
  maxLongitud: (max: number) => `Este campo no debe exceder los ${max} caracteres`
}

export const rolValidations = {
  nombre: {
    required: helpers.withMessage(mensajes.requerido, required),
    minLength: helpers.withMessage(mensajes.minLongitud(3), minLength(3)),
    maxLength: helpers.withMessage(mensajes.maxLongitud(50), maxLength(50))
  },
  descripcion: {
    minLength: helpers.withMessage(mensajes.minLongitud(3), minLength(3)),
    maxLength: helpers.withMessage(mensajes.maxLongitud(250), maxLength(250))
  }
}