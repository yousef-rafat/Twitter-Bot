const nodemailer = require('nodemailer')
require('dotenv').config();

function start() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SEND_EMAIL,
            pass: process.env.APP_PASSWORD
        }
    });
    return transporter;
}

function endDayEmail() {
    const transporter = start();
    transporter.sendMail({
        to: process.env.EMAIL,
        subject: "Last Day For The Bot Running ~ Urgent",
        html: '<h3>Today is the last day your bot will be running on Twitter</h3><br><p>Please sign in the Bot Control to reset the Bot.</p>'
    }).then(() => {
        console.log('Email Sent Successfuly')
    }).catch(err => {
        console.log(err)
    })
}

function successEmail() {
    const transporter = start();
    transporter.sendMail({
        to: process.env.EMAIL,
        subject: "Bot running on Twitter successfuly",
        html: '<h3>Congrats! Your Bot is successfuly running on Twitter</h3>'
    }).then(() => {
        console.log("Email Successfuly Sent!")
    }).catch(err => {
        console.log(err);
    })
}

module.exports = { successEmail, endDayEmail }