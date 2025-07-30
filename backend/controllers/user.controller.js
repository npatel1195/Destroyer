import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';


export const createUserController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({ errors: errors.array() }));
    }
    try {
        const user = await userService.createUser(req.body);
        const token = await user.generateJWT();
        delete user._doc.password;
        res.setHeader('Content-Type', 'application/json');
        res.status(201).send(JSON.stringify({ user, token }));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ error: error.message }));
    }
}

export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({ errors: errors.array() }));
    }

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).send(JSON.stringify({ errors: 'Invalid credentials' }));
        }
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).send(JSON.stringify({ errors: 'Invalid credentials' }));
        }
        const token = await user.generateJWT();
        delete user._doc.password;
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({ user, token }));
    } catch (err) {
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ error: err.message }));
    }
}

export const profileController = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({ user: req.user }));
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];
        redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({ message: 'Logged out successfully' }));
    } catch (err) {
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ error: err.message }));
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify({ users: allUsers }));
    } catch (err) {
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ error: err.message }));
    }
}
