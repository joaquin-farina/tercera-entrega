import UserRepository from "./users.repository.js";
import ProductRepository from "./products.repository.js";
import CartRepository from "./carts.repository.js";

import factory from "../daos/factory.js";
const { UserDao, ProductDao, CartsDao } = factory

export const userRepository = new UserRepository(new UserDao())
export const productRepository = new ProductRepository(new ProductDao())
export const cartRepository = new CartRepository(new CartsDao())