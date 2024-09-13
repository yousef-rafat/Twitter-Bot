const mongoose = require('mongoose');
const database = require('./database.js');

class UsedDatabase extends database {
    constructor() {
        super();
        mongoose.connect('mongodb://localhost:27017/quotes') //host.docker.internal if you're uploading to Docker
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

        this.User = mongoose.models['used-quotes'] || mongoose.model('used-quotes', userSchema);
    }

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