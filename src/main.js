import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import { __dirname } from './path.js';
import path from 'path';
import mongoose from 'mongoose';

import cartRouter from './routes/cart.routes.js';
import messageRouter from "./routes/messages.routes.js"
import productRouter from './routes/products.routes.js';
import sessionRouter from './routes/session.routes.js';
import userRouter from './routes/user.routes.js';

import cartModel from './models/carts.models.js';
import productModel from './models/products.models.js';
import userModel from './models/user.models.js';


const app = express();
const PORT = 8080;

// Conexion con base de datos
mongoose.connect(process.env.MONGO_DB)
    .then(() => {
        console.log("BDD conectada")
    })
    .catch((error) => console.log(`Error en conexion con MongoDB ATLAS:, ${error}`))

// Server
const httpServer = app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});

// Middleware

app.engine('handlebars', engine({}));
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, './views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de MongoStore para express-session
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_DB,
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 90 // tiempo de duracion de la sesion.
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use((req, res, next) => {
    if (req.session.user) {
        const user = req.session.user;
        res.locals.welcomeMessage = `Welcome, ${user.first_name} ${user.last_name}!`;
    }
    next();
});

// Configuración del motor de plantillas Handlebars
app.set('view engine', 'handlebars');
app.engine('handlebars', engine());
app.set('views', path.resolve(__dirname, './views'));


// Socket
const io = new Server(httpServer);

io.on('connection', (socket) => {
    console.log('Conexión con Socket.io');

    socket.on('add-to-cart', async (productData) => {
        let cart = await cartModel.findOne({ _id: "64f8fbb6d998a951bcb2774e" })
        if (!cart) {
            cart = await cartModel.create({ products: [] })
        }

        cart.products.push({
            product: productData._id,
            quantity: 1
        })

        await cart.save()
        console.log('Product added to cart:', productData)
    });

    socket.on('login', async (newUser) => {
        const user = await userModel.findOne({ email: newUser.email })

        if (user) {
            socket.emit('user', user)
        }
    });
});

// Routes
app.use('/api/users', userRouter);
app.use('/api/session', sessionRouter);
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/messages', messageRouter);

// Archivos estáticos desde la carpeta "públic"
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get

app.get('/static/signIn', async (req, res) => {

    res.render('signIn', {
        pathJS: 'signIn',
        pathCSS: 'signIn'
    });
});

app.get('/static/login', async (req, res) => {
    res.render('login', {
        pathJS: 'login',
        pathCSS: 'login',
    });
});

app.get('/static/products', async (req, res) => {
    // Obtener los productos y renderizar la vista
    try {
        const products = await productModel.find().lean();

        res.render('products', {
            products,
            pathCSS: 'products',
            pathJS: 'products'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los productos');
    }
});


