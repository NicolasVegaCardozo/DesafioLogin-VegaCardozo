import { Router } from 'express';
import productModel from '../models/products.models.js';

const productRouter = Router();

productRouter.get('/', async (req, res) => {
	const { limit, page, sort, category, status } = req.query;
	let sortOption;
	sort == 'asc' && (sortOption = 'price');
	sort == 'desc' && (sortOption = '-price');

	const options = {
		limit: limit || 10,
		page: page || 1,
		sort: sortOption || null,
	};

	const query = {};
	category && (query.category = category);
	status && (query.status = status);

	try {
		const prods = await productModel.paginate(query, options);
		res.status(200).send({ resultado: 'OK', message: prods });
	} catch (error) {
		res.status(400).send({ error: `Error al consultar productos: ${error}` });
	}
});

productRouter.get('/:pid', async (req, res) => {
	const { pid } = req.params;
	try {
		const prod = await productModel.findById(pid);
		prod
			? res.status(200).send({ resultado: 'OK', message: prod })
			: res.status(404).send({ resultado: 'Not Found', message: prod });
	} catch (error) {
		res.status(400).send({ error: `Error al consultar producto: ${error}` });
	}
});

productRouter.post('/:cid/products/:pid', async (req, res) => {
	const { title, description, stock, code, price, category } = req.body;

	try {
		const respuesta = await productModel.create({
			title,
			description,
			category,
			stock,
			code,
			price,
		});
		res.status(200).send({ resultado: 'OK', message: respuesta });
	} catch (error) {
		res.status(400).send({ error: `Error al crear producto: ${error}` });
	}
});

productRouter.put('/:pid', async (req, res) => {
	const { pid } = req.params;
	const { title, description, stock, code, price, category, status } = req.body;
	try {
		const prod = await productModel.findByIdAndUpdate(pid, {
			title,
			description,
			category,
			stock,
			code,
			price,
			status,
		});
		prod
			? res.status(200).send({ resultado: 'OK', message: prod })
			: res.status(404).send({ resultado: 'Not Found', message: prod });
	} catch (error) {
		res.status(400).send({ error: `Error al actualizar producto: ${error}` });
	}
});

productRouter.delete('/:pid', async (req, res) => {
	const { pid } = req.params;
	try {
		const prod = await productModel.findByIdAndDelete(pid);
		prod
			? res.status(200).send({ resultado: 'OK', message: prod })
			: res.status(404).send({ resultado: 'Not Found', message: prod });
	} catch (error) {
		res.status(400).send({ error: `Error al eliminar producto: ${error}` });
	}
});

export default productRouter;