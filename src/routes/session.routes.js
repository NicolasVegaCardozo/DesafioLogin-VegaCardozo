import { Router } from "express";
import userModel from "../models/user.models.js";

const sessionRouter = Router({caseSensitive: false});

sessionRouter.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await userModel.findOne({email: email})
        
        if(req.session.login) {
            req.session.user = user
            res.redirect('/static/productsViews')
        }

        if(user) {
            if (user.password === password) {
                // login
                req.session.login =true
                req.session.user = user
                res.redirect('/static/productsViews')
            } else {
                res.status(401).send({error: 'Invalid password.'})
            }
        } else {
            res.status(404).send({error: 'User not found.'})
        }
    } catch (error) {
        console.log(error)
    }
})

sessionRouter.get('/logout', (req, res) => {
    if (req.session.login) {
        req.session.destroy()
    }
    req.status(200).send({info: 'Logged out.'})
}) 

export default sessionRouter;