import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ProductModel from '../models/products.models.js';

export class ProductManager {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async addProduct(product) {
        try {
            if (
                !product.title ||
                !product.description ||
                !product.price ||
                !product.category ||
                !product.code ||
                !product.stock
            ) {
                console.error('Todos los campos del producto son obligatorios.');
                return;
            }

            const existingProduct = await ProductModel.findOne({ code: product.code });
            if (existingProduct) {
                console.error('Ya existe un producto con el mismo código.');
                return;
            }

            product.id = uuidv4();
            product.status = true;
            const newProduct = new ProductModel(product);
            await newProduct.save();
            console.log('Producto agregado correctamente:', newProduct);

            await this.saveProductsToFile();
        } catch (error) {
            console.error('Error al agregar el producto:', error.message);
        }
    }

    async getProductById(id) {
        try {
            const product = await ProductModel.findById(id);
            if (product) {
                console.log(product);
                return product;
            } else {
                console.log('Producto no encontrado');
                return null;
            }
        } catch (error) {
            console.error('Error al obtener el producto:', error.message);
        }
    }

    async getProducts() {
        try {
            const products = await ProductModel.find();
            return products;
        } catch (error) {
            console.error('Error al obtener los productos:', error.message);
            return [];
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const product = await ProductModel.findById(id);
            if (product) {
                // Asegurarnos de que status sea true incluso si updatedProduct.status es false
                updatedProduct.status = true;
                Object.assign(product, updatedProduct);
                await product.save();
                console.log('Producto actualizado correctamente:', product);
                await this.saveProductsToFile();
            } else {
                console.error('Producto no encontrado.');
            }
        } catch (error) {
            console.error('Error al actualizar el producto:', error.message);
        }
    }

    async deleteProduct(id) {
        try {
            const product = await ProductModel.findById(id);
            if (product) {
                await ProductModel.deleteOne({ _id: id });
                console.log('Producto eliminado correctamente.');
                await this.saveProductsToFile();
            } else {
                console.error('Producto no encontrado.');
            }
        } catch (error) {
            console.error('Error al eliminar el producto:', error.message);
        }
    }

    async loadProductsFromFile() {
        try {
            const productsData = await fs.readFile(this.filePath, 'utf-8');
            this.products = JSON.parse(productsData);
        } catch (error) {
            this.products = [];
        }
    }

    async saveProductsToFile() {
        try {
            const productsData = JSON.stringify(this.products, null, 2);
            await fs.writeFile(this.filePath, productsData);
        } catch (error) {
            console.error('Error al guardar los productos en el archivo:', error.message);
        }
    }
}