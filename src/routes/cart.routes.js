import { Router } from 'express';
import cartModel from "../models/carts.models.js";

const cartRouter = Router();

cartRouter.get('/', async (req, res) => {
    try {
        const carts = await cartModel.find();
        res.json(carts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el carrito' });
    }
});

cartRouter.post('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params
    const { quantity } = req.body
    try {
        const cart = await cartModel.findById(cid)
        if (cart) {
            cart.products.push({ id_prod: pid, quantity: quantity })
            const respuesta = await cartModel.findByIdAndUpdate(cid, cart) //Actualizo el carrito de mi BDD con el nuevo producto
            res.status(200).send({ respuesta: 'OK', mensaje: respuesta })
        }
    } catch (e) {
        res.status(400).send({ error: e })
    }
})

cartRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCart = await cartModel.findByIdAndDelete(id);

        if (!deletedCart) {
            return res.status(404).json({ message: 'Producto del carrito no encontrado' });
        }

        res.json({ message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el producto del carrito' });
    }
});

export default cartRouter;