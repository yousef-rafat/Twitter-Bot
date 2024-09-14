# Twitter (X) Bot
> * Note: This repository is made for education purposes only 

![twitter-bot](https://github.com/user-attachments/assets/0934475c-5f34-45ad-b509-bee4b032e3a5)

The Twitter Bot repository is a code base that controls a Twitter Bot. When run, it scraps quotes from a quotes website and passes them to a database. The bot then signs in Twitter using a Google Account, writing the email and password down. 
It then posts regularly using specifications defined by the user. The bot only starts to work when the user signs in and activates the bot with the specification on how much to post.

# Requirments

The requirements to start the chatbot are MongoDB Compass, Node JS, and a .env file. The package requirements are available in the package.json file. 

## Twitter & Google Account

You must have a Twitter account connected to Google to use the bot. 

## .env file

To start using the bot, you must define some emails and passwords:

1. Google's email & password for the Twitter Account
   - The Google Email & password must be under the name: TWITTER_EMAIL, TWITTER_PASSWORD
2. A password & email to access the bot
   - This is a user-defined email and password for accessing the bot control section and activating it.
   - The email and password variable names should be: EMAIL, PASSWORD
3. An email and App password for sending successful and warning emails
   - This is the email and app password for the Gmail account that will send the emails.
   - The App password is generated when you visit Google's safety settings under Two-factor authentication.
   - The name of the email and App password should be: SEND_EMAIL, APP_PASSWORD

## Installation (MongoDB & NodeJS)

The bot is created using Node JS, so it must be installed on the computer. The bot uses a MongoDB to store the quotes.
The user must create a database named "quotes" as it will be used in the scripts.

