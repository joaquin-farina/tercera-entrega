import { Router } from "express";
import sendMail from "../utils/sendEmail.js";
import sendSms from "../utils/sendSms.js";
import { faker } from '@faker-js/faker'


const router = Router()

const generateProducts = () => {
    return {
        id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        price: faker.commerce.price(),
        departament: faker.commerce.department(),
        stock: parseInt(faker.string.numeric()),
        description: faker.commerce.productDescription(),
        image: faker.image.url()
    }
}

const generateUser = () => {
    let numberOfProducts = parseInt(faker.string.numeric(1, { bannedDigits: ['0'] }))
    let products = []
    for (let i = 0; i < numberOfProducts; i++) {
        products.push(generateProducts())
    }
    return {
        id: faker.database.mongodbObjectId(),
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        sex: faker.person.sex(),
        phone: faker.phone.number(),
        image: faker.image.avatar(),
        email: faker.internet.email(),
        products
    }
}

router
    .get('/mail', (req, res) => {

        const to = 'joaquinramiro98@gmail.com'
        const subject = 'Email de prueba'
        const html = '<div><h1>Es es un email de prueba</h1></div>'

        sendMail(to, subject, html)
        

        res.send('Email enviado.')

    })

    .get('/pruebausers', (req, res) => {
        let users = []
        for (let i = 0; i < 5; i++) {
            users.push(generateUser())
        }
        res.send({
            status: 'succes',
            payload: users
        })
    })

export default router
