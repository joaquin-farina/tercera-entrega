import { UserDtoGet } from "../dto/userDto.js";
import UserService from "../repositories/users.repository.js";
import { createHash, isValidPassword } from "../utils/hashBcrypt.js";
import { generateToken, authToken } from "../utils/jsonWebToken.js";


class SessionController {
    constructor() {
        this.userService = new UserService()
    }

    register = async (req, res) => {
        try {
            const { firstname, lastname, email, password } = req.body

            const newUser = {
                firstname,
                lastname,
                email,
                password: createHash(password)
            }

            const result = await this.userService.createUser(newUser)

            const token = generateToken({
                id: result._id
            })

            res.status(200).cookie('CookieToken', token, {
                maxAge: 60 * 60 * 1000 * 24,
                httpOnly: true
            }).send({
                status: 'success',
                usersCreate: result,
                token
            })
        } catch (error) {
            res.send({ status: 'error register', message: error })
        }
    }

    login = async (req, res) => {
        try {
            const { email, password } = req.body

            const user = await this.userService.getUser({ email })

            if (!user) return res.status(401).send({ status: 'error', message: 'El email ingresado no existe.' })

            const hash = user.password

            if (!isValidPassword(password, hash)) return res.status(401).send({ status: 'error', message: 'No coincide las credenciales' })

            const token = generateToken({
                email: user.email,
                role: user.role
            })

            res.status(200).cookie('CookieToken', token, {
                maxAge: 60 * 60 * 1000 * 24,
                httpOnly: true
            }).redirect('/api/sessions/current')
            // .send({
            //     status: 'success',
            //     userLogin: { email: user.email, role: user.role }
            // })
        } catch (error) {
            res.send({ status: 'error', message: error })
        }
    }

    logout = (req, res) => {
        try {
            res.send('logout')
        } catch (error) {
            res.send({ status: 'error', message: error })
        }
    }

    current = async (req, res) => {
        try {
            const user = await this.userService.getUser({ email: req.user.email })
            const userDto = new UserDtoGet(user)
            res.send(userDto)
        } catch (error) {
            res.send({ status: 'error', message: error })
        }
    }
}

export default SessionController