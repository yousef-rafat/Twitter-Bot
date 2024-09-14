const nodemailer = require('nodemailer')
require('dotenv').config();

// we will use a nodemailer to send emails when an event happens
// the start function will be needed when sending an type of email
// we will send the emails through Gmail. This requires an email and something called an App Password
// Gmail requires an App password to allow third-party apps.
// the port 465 is a standard
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
    return transporter; // return the transporter for the other functions
}

// this email is used when we want to warn the user that the days we set the bot to work for is ending
// its made for the user to go and reactive their bot
function endDayEmail() {
    const transporter = start();
    transporter.sendMail({
        to: process.env.EMAIL, // email of the user
        subject: "Last Day For The Bot Running ~ Urgent",
        html: '<h3>Today is the last day your bot will be running on Twitter</h3><br><p>Please sign in the Bot Control to reset the Bot.</p>'
    }).then(() => {
        console.log('Email Sent Successfuly')
    }).catch(err => {
        console.log(err)
    })
}

// when the bot runs successfully, we send the user a success email.
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

module.exports = { successEmail, endDayEmail } // export the two functions