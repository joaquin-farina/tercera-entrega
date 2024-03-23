import { userRepository } from "../repositories/index.js"

class UserController {
    constructor() {
        this.service = userRepository
    }

    getUsers = async (req, res) => {
        try {
            const result = await this.service.getUsers()

            const users = result.map(user => {                
                return {
                    id: user._id.toString(),
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    password: user.password,
                    role: user.role,
                    isActive: user.isActive ? 'Activo' : 'Inactivo',
                }
            })

            res.render('users', { users })
        } catch (error) {
            res.send({ status: 'error', message: error })
        }
    }
}

export default UserController