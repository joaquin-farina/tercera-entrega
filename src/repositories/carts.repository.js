import CartDaoMongo from "../daos/MongoDB/cartDaoMongo.js";
class CartService {
    constructor(cartsDao) {
        this.dao = new CartDaoMongo()
    }

    getCart = async (cid) => await this.dao.get(cid)

    getBy = async (filter) => await this.dao.getBy(filter)

    createCart = async (user) => await this.dao.create(user)

    addProduct = async (cid, pid) => await this.dao.addProductToCart(cid, pid)

    deleteProductToCart = async (cid, pid) => await this.dao.deleteProductToCart(cid, pid)

    deleteProducts = async (pid) => await this.dao.deleteProducts(pid)

    updateQuantity = async (cid, pid) => await this.dao.updateQuantity(cid, pid)
}

export default CartService