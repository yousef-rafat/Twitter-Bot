const mongoose = require('mongoose');

// create a class that will host all of our MongoDB functions
class MongoDB {
    constructor() {
        mongoose.connect('mongodb://localhost:27017/quotes') //host.docker.internal if you're uploading to Docker
            .then(() => { // connect to the quotes database
                console.log("Connection Successful");
            })
            .catch((err) => {
                console.log("Error in the Connection", err);
            });

        const userSchema = new mongoose.Schema({ // the user schema is simple as we will only require name and text
            name: {type: String},
            text: {type: String}
        });

        // checks is the collection already exists, otherwise we will create it
        this.User = mongoose.models['all-quotes'] || mongoose.model('all-quotes', userSchema);
    }

    // the add functionality of the database
    async add(name, text) {
        const user = new this.User({
            name: name,
            text: text,
        });

        await user.save();
    }

    // the remove function of the database
    async remove(query, many = false) {
        if (many) { // the many specifies if the user want to delete everything that matches their query
            const result = await this.User.deleteMany(query);
            console.log(result);
        } else {
            const result = await this.User.deleteOne(query);
            console.log(result);
        }
    }

    // print all data || beneficial only when testing and development
    async all() {
        console.log(await this.User.find())
    }

    // get all the data in the database | helpful in printing all the data out in a JSON format
    async getAll() {
        return await this.User.find();
    }

    // get a random sample from the database
    async sample() {
        return await this.User.aggregate([{ $sample: { size: 1 } }]);
    }

    // remove Duplicates if any in the database
    async removeDuplicates() {
    
        try {
            // Find all documents
            const allDocuments = await this.User.find({})//.toArray();
    
            // Track seen texts
            const seenTexts = new Set();
            const duplicates = [];
    
            allDocuments.forEach(doc => {
                const text = doc.text;
                if (seenTexts.has(text)) {
                    duplicates.push(doc._id);
                } else {
                    seenTexts.add(text);
                }
            });
    
            // Remove duplicates
            if (duplicates.length > 0) {
                await this.User.deleteMany({ _id: { $in: duplicates } });
                console.log(`Removed ${duplicates.length} duplicate(s).`);
            } else {
                console.log('No duplicates found.');
            }
        } catch (err) {
            console.log("ERR: " + err)
        }
    }
}

module.exports = MongoDB;