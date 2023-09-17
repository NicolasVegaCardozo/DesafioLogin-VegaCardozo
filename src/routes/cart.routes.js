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


cartRouter.put('/api/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { updatedField } = req.body;

        const updatedCart = await cartModel.findByIdAndUpdate(cid, { field: updatedField }, { new: true });

        if (!updatedCart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        res.json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el carrito' });
    }
});

cartRouter.put('/api/carts/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { updatedField } = req.body;

        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        const product = cart.products.find(item => item.id_prod === pid);

        if (!product) {
            return res.status(404).json({ message: 'Producto del carrito no encontrado' });
        }

        product.field = updatedField;

        const updatedCart = await cart.save();

        res.json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el producto del carrito' });
    }
});


cartRouter.delete('/api/carts/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const deletedCart = await cartModel.findByIdAndDelete(cid, pid);

        if (!deletedCart) {
            return res.status(404).json({ message: 'Producto del carrito no encontrado' });
        }

        res.json({ message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el producto del carrito' });
    }
});

cartRouter.delete('/api/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        const deletedCart = await cartModel.findByIdAndDelete(cid);

        if (!deletedCart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        res.json({ message: 'Carrito eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el carrito' });
    }
});

export default cartRouter;