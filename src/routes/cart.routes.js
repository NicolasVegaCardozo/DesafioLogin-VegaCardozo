import { Router } from "express";
import cartModel from "../models/carts.models.js";

const cartRouter = Router();

// Crear un nuevo carrito
cartRouter.post("/", async (req, res) => {
    try {
        const respuesta = await cartModel.create(req.body);
        res.status(200).send({ resultado: "OK", message: respuesta });
    } catch (error) {
        res.status(400).send({ error: `Error al crear producto: ${error}` });
    }
});

// Obtener todos los carritos
cartRouter.get("/", async (req, res) => {
    try {
        const carts = await cartModel.find();
        res.json(carts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el carrito" });
    }
});

// Obtener un carrito específico por su ID
cartRouter.get("/:cid", async (req, res) => {
    try {
        const cid = req.params.cid;

        const cart = await cartModel.findById(cid);
        res.status(200).send(cart);
    } catch (error) {
        res.status(400).send("Carrito no existe");
    }
});


// Agregar un producto a un carrito específico
cartRouter.post("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    try {
        const cart = await cartModel.findById(cid);
        if (cart) {
            cart.products.push({ id_prod: pid, quantity: quantity });
            const respuesta = await cartModel.findByIdAndUpdate(cid, cart); //Actualizo el carrito de mi BDD con el nuevo producto
            res.status(200).send({ respuesta: "OK", mensaje: respuesta });
        }
    } catch (e) {
        res.status(400).send({ error: e });
    }
});



cartRouter.put("/:cid", async (req, res) => {
    const { cid } = req.params;
    const productsArray = req.body; //Enviar desde postman un array que contenga al menos un producto. Envio en un objeto id_prod y quantity

    try {
        const cart = await cartModel.findById(cid); //Buscas el carrito por el id .
        if (cart) {
            productsArray.forEach((product) => {
                const prod = cart.products.find(
                    (cartProd) => cartProd.id_prod._id == product.id_prod
                );
                if (prod) {
                    //Si el producto ya existe le aumento la cantidad (operador += devuelve la suma ambos valores)
                    prod.quantity += product.quantity;
                } else {
                    // Si no existe lo agrego al carrito
                    cart.products.push(product);
                }
            });
            await cart.save();
            res.status(200).send({ resultado: "OK", message: cart });
        } else {
            res.status(404).send({ resultado: "Cart Not Found", message: error });
        }
    } catch (error) {
        res.status(400).send({ error: `Error al agregar productos: ${error}` });
    }
});

cartRouter.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { updatedField } = req.body;

        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        const product = cart.products.find((item) => item.id_prod._id.toString() === pid);

        if (!product) {
            return res.status(404).json({ message: "Producto del carrito no encontrado" });
        }

        product.field = updatedField; // Actualizar el campo específico del producto

        const updatedCart = await cart.save(); // Guardar los cambios en el carrito

        res.json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el producto del carrito" });
    }
});


cartRouter.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        const productIndex = cart.products.findIndex((product) => product.id_prod._id === pid);

        if (productIndex <= -1) {
            return res.status(404).json({ message: "Producto del carrito no encontrado" });
        }

        cart.products.splice(productIndex, 1); // Eliminar el producto del carrito

        await cart.save(); // Guardar los cambios en el carrito

        res.json({ message: "Producto eliminado del carrito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el producto del carrito" });
    }
});


cartRouter.delete("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        cart.products = []; // Vaciar el array de productos del carrito

        await cart.save(); // Guardar los cambios en el carrito

        res.json({ message: "Carrito vaciado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al vaciar el carrito" });
    }
});
export default cartRouter;