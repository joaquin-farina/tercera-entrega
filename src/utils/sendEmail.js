import nodemailer from 'nodemailer'
import { configObject } from '../config/connectDB.js'

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: configObject.gmail_user,
        pass: configObject.gmail_pass
    }
})

const sendMail = async (to, subject, html) => await transport.sendMail({
    from: 'Eccomerce <joaquinramiro98@gmail.com>',
    to,
    subject,
    html,
})

export default sendMail