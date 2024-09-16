const mongoose = require('mongoose');
const database = require('./database.js');

const option = { socketTimeoutMS: 3000000 };

// the UsedDatabase will inherient from the other database its functionality
class UsedDatabase extends database {
    constructor() {
        // we will connect to the same database, but a different collection
        super();
        mongoose.connect('mongodb://localhost:27017/quotes', option) //host.docker.internal if you're uploading to Docker
            .then(() => {
                console.log("Connection Successful");
            })
            .catch((err) => {
                console.log("Error in the Connection", err);
            });

        const userSchema = new mongoose.Schema({
            name: {type: String},
            text: {type: String}
        });

        // if the used-quotes collection is there, use it. Otherwise, create it
        this.User = mongoose.models['used-quotes'] || mongoose.model('used-quotes', userSchema);
    }

    // this function we will add for the Used Database to check if the quote we want to write has been posted already
    async compare(name, text) {
        const result = await this.User.findOne({ name: name, text: text });
        if (result !== null) {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = UsedDatabase;