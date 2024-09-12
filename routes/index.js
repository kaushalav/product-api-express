import express from 'express';
import { registerController } from '../controllers/auth/registerController';
import { loginController } from '../controllers/auth/loginController';
import { userController } from '../controllers/auth/userController';
import { refreshController } from '../controllers/auth/refreshController';
import { productController } from '../controllers/productController';
import auth from '../middlewares/auth';
import admin from '../middlewares/admin';
const router = express.Router();

router.get('/hello', (req, res) => {
    res.send("Hello")
})

// auth
router.post('/register', registerController.register);
router.post('/login', loginController.login);
router.get('/me', auth, userController.me);
router.post('/refresh', refreshController.refresh);
router.post('/logout', auth, loginController.logout);

// product
router.post('/products', [auth, admin], productController.store);
router.put('/products/:id', [auth, admin], productController.update);
router.delete('/products/:id', [auth, admin], productController.delete);
router.get('/products', productController.index);
router.get('/products/:id', productController.getOneProduct);

export default router;
