import Joi from 'joi';

// Joi object to validate product
const productSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    size: Joi.string().required(),
    image: Joi.string()
})

export default productSchema;