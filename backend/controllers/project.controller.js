import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import { validationResult } from 'express-validator';

export const createProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({ errors: errors.array() }));
    }

    try {
        const { name } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const userId = loggedInUser._id;
        const newProject = await projectService.createProject({ name, userId });
        res.setHeader('Content-Type', 'application/json');
        res.status(201).send(JSON.stringify(newProject));
    } catch (err) {
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ error: err.message }));
    }
}

export const getAllProject = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const allUserProjects = await projectService.getAllProjectByUserId({ userId: loggedInUser._id });
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({ projects: allUserProjects }));
    } catch (err) {
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ error: err.message }));
    }
}

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({ errors: errors.array() }));
    }

    try {
        const { projectId, users } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const project = await projectService.addUsersToProject({ projectId, users, userId: loggedInUser._id });
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({ project }));
    } catch (err) {
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ error: err.message }));
    }
}

export const getProjectById = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await projectService.getProjectById({ projectId });
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({ project }));
    } catch (err) {
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ error: err.message }));
    }
}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({ errors: errors.array() }));
    }

    try {
        const { projectId, fileTree } = req.body;
        const project = await projectService.updateFileTree({ projectId, fileTree });
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({ project }));
    } catch (err) {
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ error: err.message }));
    }
}