import express from "express";
import User from "../models/user";
import { body, validationResult } from "express-validator";
import { createUser, deleteUser, getUsers, updateUser } from "../controller/userController";

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
