import ticketsModel from "../daos/MongoDB/models/ticket.models.js";
import { cartRepository, productRepository, userRepository } from "../repositories/index.js";
import sendMail from "../utils/sendEmail.js";

const Tickets = ticketsModel

class CartController {
    constructor() {
        this.cartService = cartRepository
        this.productService = productRepository
        this.userService = userRepository
    }

    getCart = async (req, res) => {
        try {
            const { cid } = req.params;

            const cart = await this.cartService.getCart(cid);

            const products = cart.products.map((item) => {
                const productDetails = item.product
                const quantity = item.quantity
                return {
                    _id: productDetails._id.toString(),
                    title: productDetails.title,
                    description: productDetails.description,
                    price: productDetails.price,
                    quantity,
                    total: quantity * productDetails.price
                };
            });

            res.render("carts", {
                status: "succes",
                payload: products,
                cid
            });
        } catch (error) {
            res.status(500).send(`Error de servidor get. ${error.message}`);
        }
    }

    purchase = async (req, res) => {
        try {
            const { cid } = req.params
            const cart = await this.cartService.getCart(cid)
            let totalAmount = 0

            for (const cartProduct of cart.products) {
                const product = await this.productService.getProduct(cartProduct.product);
                if (product.stock >= cartProduct.quantity) {
                    product.stock -= cartProduct.quantity;
                    await product.save();

                    totalAmount += product.price * cartProduct.quantity;

                    const pid = product._id.toString()
                    await this.cartService.deleteProductToCart(cid, pid)

                } else {
                    console.log(`No hay suficiente stock para el producto ${product.title}.`);
                }
            }
            const cartUpdate = await this.cartService.getCart(cid)
            if (totalAmount <= 0) {
                res.status(200).send({
                    status: 'Fallo la compra.',
                    message: 'No hay productos disponibles para facturar.',

                    notPurchased: { message: 'Los siguientes productos no cumplen con la cantidad de stock solicitado.', cartUpdate }
                });

            } else {
                const ticket = new Tickets({
                    code: await generateCode(),
                    purchase_datetime: new Date(),
                    amount: totalAmount,
                    purchaser: cart.user,
                });
                await ticket.save();

                console.log(cart.user);
                const getUser = await this.userService.getUser({email: cart.user})
                console.log(getUser);
                
                

                const to = 'alan.maciel@neotel.us'
                const subject = '¡Tu compra fue confirmada!'
                const html = `
                                <h1>Tu compra Fue confirmada!</h1>
                                <h3>Hola ${getUser.fullname}</h3>

                                Adjunto el ticket por la compra realizada.

                                <p>${ticket}</p>

                `

                sendMail(to, subject, html)

                res.status(200).send({
                    status: 'Compra realizada exitosamente.',
                    ticket,
                    notPurchased: cartUpdate
                });

            }

        } catch (error) {
            console.error('Error al finalizar la compra:', error);
            res.send({ status: 'Error interno del servidor.', error });
        }

        async function generateCode() {
            let code;
            let existingTicket
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            do {
                code = '';
                for (let i = 0; i < 10; i++) {
                    code += characters.charAt(Math.floor(Math.random() * characters.length));
                }
                existingTicket = await Tickets.findOne({ code });
            } while (existingTicket);
            return code;
        }
    }

    getBy = async (req, res) => {
        const user = req.user
        return await this.cartService.getBy({ user })

    }

    createCart = async (req, res) => {
        try {
            const user = req.user
            return await this.cartService.createCart(user);
        } catch (error) {
            res.status(500).send(`Error de servidor. ${error.message}`);
        }
    }

    addProductToCart = async (req, res) => {
        try {
            return await this.cartService.addProduct(req.cid, req.pid);
        } catch (error) {
            res.status(500).send(`Error de servidor. ${error.message}`);
        }
    }

    updateQuantity = async (req, res) => {
        try {
            const { cid, pid } = req
            return await this.cartService.updateQuantity(cid, pid);
        } catch (error) {
            console.error("Error al intentar actualizar el producto:", error);
            res.status(500).json({
                error: "Error interno del servidor al actualizar el producto.",
            });
        }
    }

    deleteProducts = async (req, res) => {
        const { cid } = req.params;
        const cart = await this.cartService.deleteProducts({ _id: cid });
        res.send({
            status: "succes",
            payload: cart,
        });
    }

    deleteProductToCart = async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const cart = await this.cartService.deleteProductToCart(cid, pid);
            res.send({
                status: "succes",
                payload: cart,
            });
        } catch (error) {
            res.status(500).send(`Error de servidor. ${error.message}`);
        }
    }
}

export default CartController