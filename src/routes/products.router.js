import { Router } from "express";
import ProductController from "../controllers/products.controller.js";
import { passportCall } from "../middleware/passportCall.js";
import { authorization } from "../middleware/authorization.middleware.js";

const router = Router();
const { getProducts } = new ProductController()

router.get("/", passportCall('jwt'), authorization('admin', 'user'), getProducts);

export default router;
