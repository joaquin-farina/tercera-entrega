import { Router } from "express";
import ProductManagerMongo from "../daos/MongoDB/productDaoMongo.js";
import { authorization } from "../middleware/authorization.middleware.js";
import { passportCall } from "../middleware/passportCall.js";

const router = Router();
const managerMongo = new ProductManagerMongo();

router
  .get('/login', (req, res) => {
    res.render('login')
  })
  .get('/register', (req, res) => {
    res.render('register')
  })
  // .get('/current', async (req, res) => {
  //   res.send({message: 'Validacion datos sensibles ViewsRouter'})
  // })
  .get("/", passportCall('jwt'), authorization('admin', 'user'), async (req, res) => {
    try {
      const { limit, pageQuery, query, sort } = req.query;
      const result = await managerMongo.get(
        limit,
        pageQuery,
        query,
        sort
      );

      let display
      if (req.user.role !== 'admin') {
        display = 'disabled';
        result.payload.forEach(objeto => {
          objeto.displayUser = display; 
          objeto.user = req.user.email
        });
      } else {
        result.payload.forEach(objeto => {
          objeto.displayAdmin = 'disabled'; 
          objeto.user = req.user.email
        });
      }
      
      res.render("realtimeproducts", {
        status: result.status,
        user: req.user.email,
        payload: result.payload,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.prevLink,
        nextLink: result.nextLink,
        page: result.page,
        display,
        style: "index.css",
      });
    } catch (error) {
      console.log(error);
      res.render("Error al obtener la lista de productos (ViewsRouter)!");
      return;
    }
  })

  .get("/:pid", async (req, res) => {
    try {
      const { pid } = req.params;
      const product = await managerMongo.getBy(pid);
      res.render("realtimeproducts", { product, style: "index.css" });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error al obtener al intentar obtener el producto.");
      return;
    }
  })

  .post("/", async (req, res) => {
    try {
      const { product } = req.body;
      const result = await managerMongo.create(product);
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  })

  .put("/:pid", async (req, res) => {
    try {
      const { pid } = req.params;
      const { prop, value } = req.body;

      await ProductManagerMongo.update(pid, prop, value);

      res.status(201).send({
        status: "succes",
        message: "Producto actualizado correctamente.",
      });
    } catch (error) {
      console.error("Error al intentar actualizar el producto:", error);
      res.status(500).json({
        error: "Error interno del servidor al actualizar el producto.",
      });
    }
  })

  .delete("/:pid", async (req, res) => {
    try {
      const { pid } = req.params;
      await managerMongo.delete(pid);
      res.status(201).send({
        status: "succes",
        message: "Producto eliminado correctamente.",
      });
    } catch (error) {
      console.log(error);
    }
  });

export default router;
