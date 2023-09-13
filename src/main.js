import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import { __dirname } from './path.js';
import path from 'path';
import mongoose from 'mongoose';
import messageModel from './models/messages.models.js';
import productRouter from './routes/products.routes.js';
import cartRouter from './routes/cart.routes.js';
import messageRouter from "./routes/messages.routes.js"
import productModel from './models/products.models.js';
import cartModel from './models/carts.models.js';


const app = express();
const PORT = 8080;

// Server
const server = app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});

const io = new Server(server);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración del motor de plantillas Handlebars
app.set('view engine', 'handlebars');
app.engine('handlebars', engine());
app.set('views', path.resolve(__dirname, './views'));

// Conexion con base de datos
mongoose.connect('mongodb+srv://nicolasvegacardozo:Edna-2023@cluster0.xvvavda.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
        console.log("BDD conectada")
    })
    .catch((error) => console.log(`Error en conexion con MongoDB ATLAS:, ${error}`))

// Conexion con socket.io
io.on('connection', socket => {
    console.log('Conexión con Socket.io');

    socket.on('load', async () => {
        const pages = await productModel.paginate({}, { limit: 5 });
        socket.emit('products', pages);
    });

    socket.on('previousPage', async page => {
        const pages = await productModel.paginate({}, { limit: 5, page: page });
        socket.emit('products', pages);
    });

    socket.on('nextPage', async page => {
        const pages = await productModel.paginate({}, { limit: 5, page: page });
        socket.emit('products', pages);
    });

    socket.on('addProduct', async data => {
        const { pid, cartId } = data;
        if (cartId) {
            const cart = await cartModel.findById(cartId);
            const productExists = cart.products.find(prod => prod.id_prod == pid);
            if (productExists) {
                productExists.quantity++;
            } else {
                cart.products.push({ id_prod: pid, quantity: 1 });
            }
            await cart.save();
            socket.emit('success', cartId);
        } else {
            const cart = await cartModel.create({});
            cart.products.push({ id_prod: pid, quantity: 1 });
            await cart.save();
            socket.emit('success', cart._id.toString());
        }
    });

    socket.on('loadCart', async cid => {
        const cart = await cartModel.findById(cid);
        socket.emit('cartProducts', cart.products);
    });

    socket.on('newProduct', async product => {
        await productModel.create(product);
        const products = await productModel.find();

        socket.emit('products', products);
    });

    socket.on('mensaje', async info => {
        const { email, message } = info;
        await messageModel.create({
            email,
            message,
        });
        const messages = await messageModel.find();

        socket.emit('mensajes', messages);
    });
});

// Routes
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/static', (req, res) => {
	res.render('index', {
		rutaCSS: 'index',
		rutaJS: 'index',
	});
});

app.get('/static/realtimeproducts', (req, res) => {
	res.render('realTimeProducts', {
		rutaCSS: 'realTimeProducts',
		rutaJS: 'realTimeProducts',
	});
});

app.get('/static/chat', (req, res) => {
	res.render('chat', {
		rutaCSS: 'chat',
		rutaJS: 'chat',
	});
});

app.get('/static/products', (req, res) => {
	res.render('products', {
		rutaCSS: 'products',
		rutaJS: 'products',
	});
});

app.get('/static/carts/:cid', (req, res) => {
	res.render('carts', {
		rutaCSS: 'carts',
		rutaJS: 'carts',
	});
});

app.use('/api/products', productRouter); // defino que mi app va a usar lo que venga en productRouter para la ruta que defina
app.use('/api/carts', cartRouter);
app.use('/api/messages', messageRouter);