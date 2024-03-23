import express from "express";
import session from 'express-session'
import logger from "morgan";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import { Server } from "socket.io";

import appRouter from "./routes/index.js";
import { configObject } from "./config/connectDB.js";
import ProductManagerMongo from "./daos/MongoDB/productDaoMongo.js";
import messageModel from "./daos/MongoDB/models/message.models.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import cors from 'cors'
import CartController from "./controllers/carts.controller.js";

const app = express();
const PORT = configObject.port
app.get('/favicon.ico', (req, res) => res.status(204));
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(cookieParser());
app.use(cors())

initializePassport()
app.use(passport.initialize())
app.use(session({

  secret: 'palabraSecreta',
  resave: true,
  saveUninitialized: true
}))

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use(appRouter);

const httpServer = app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`Escuchando en el puerto ${PORT}:`);
});

const io = new Server(httpServer);
const managerMongo = new ProductManagerMongo();
const cartService = new CartController();


io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado.");

  socket.on("addProduct", async (data) => {
    const newProduct = {
      title: data.title,
      description: data.description,
      price: data.price,
      thumbnail: data.thumbnail,
      code: data.code,
      stock: data.stock,
      category: data.category,
    };

    const existingCode = await managerMongo.getProductCode(data.code);
    if (existingCode) {
      io.emit("exisitingCode", { data: data.code });
      return "Ya existe un producto con el mismo código.";
    }

    await managerMongo.create(newProduct);
    const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, page } =
      await managerMongo.get();
    io.emit("updateProducts", {
      products: docs,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
      page,
    });
  });

  socket.on("deleteProduct", async (data) => {
    const pid = data.idProduct;
    await managerMongo.delete(pid);
    const { payload, hasPrevPage, hasNextPage, prevPage, nextPage, page } =
      await managerMongo.get();
    io.emit("updateProducts", {
      products: payload,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
      page,
    });
  });

  socket.on("updateProductId", async (updateProduct) => {
    await managerMongo.update(updateProduct);
    const { payload, hasPrevPage, hasNextPage, prevPage, nextPage, page } =
      await managerMongo.get();

    io.emit("updateProducts", {
      products: payload,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
      page,
    });
  });

  socket.on("addToCart", async ({ _id, user }) => {
    try {
      const pid = _id;
      let cid
      const userCart = await cartService.getBy({ user })
      if (!userCart) {
        const cart = await cartService.createCart({ user });
        cid = cart._id.toString();
        await cartService.addProductToCart({ cid, pid });
        io.emit("addToCartSucces", cart);
      } else {
        cid = userCart._id.toString()
        if (userCart) {
          const index = userCart.products.findIndex(product => product.product._id.toString() === pid.toString());
          if (index === -1) {
            const addpro = await cartService.addProductToCart({ cid, pid });
            io.emit("addToCartSucces", addpro);
          } else {
            const addpro = await cartService.updateQuantity({ cid, pid });
            io.emit("addToCartSucces", addpro);
          }
        }
      }

    } catch (error) {
      return `Error de servidor. ${error}`;
    }
  });

  socket.on("getMessages", async (data) => {
    const message = await messageModel.find();
    io.emit("messageLogs", message);
  });

  socket.on("message", async (data) => {
    await messageModel.create(data);

    const message = await messageModel.find();
    io.emit("messageLogs", message);
  });
});

//3.43
