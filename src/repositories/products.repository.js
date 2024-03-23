class ProductService {
    constructor(productDao) {
        this.dao = productDao
    }

    getProducts = async () => this.dao.get()
    getProduct = async (filter) => this.dao.getBy(filter)
    createProduct = async (newProduct) => this.dao.create(newProduct)
    updateProduct = async (pid, data) => this.dao.update(pid, data)
    deleteProduct = async (pid) => this.dao.delete(pid)
}

export default ProductService