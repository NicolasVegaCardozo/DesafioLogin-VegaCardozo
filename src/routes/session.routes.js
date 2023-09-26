import { Router } from "express";
import userModel from "../models/user.models.js";

const sessionRouter = Router({caseSensitive: false});

sessionRouter.post('/static/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({email, password})
        
        if(req.session.login) {
            req.session.user = user
            res.redirect('/static/products')
        }

        if(user) {
            if (user.password === password) {
                // login
                req.session.login =true
                req.session.user = user
                res.redirect('/static/products')
            } else {
                res.status(401).send({error: 'Contraseña Incorrecta'})
            }
        } else {
            res.status(404).send({error: 'Usuario no encontrado.'})
        }
    } catch (error) {
        console.log(error)
    }
})

// sessionRouter.get('/logout', (req, res) => {
//     if (req.session.login) {
//         req.session.destroy()
//     }
//     req.status(200).send({info: 'Logged out.'})
// }) 

export default sessionRouter;