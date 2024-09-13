const mongoose = require('mongoose');

class MongoDB {
    constructor() {
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

        this.User = mongoose.models['all-quotes'] || mongoose.model('all-quotes', userSchema);
    }

    async add(name, text) {
        const user = new this.User({
            name: name,
            text: text,
        });

        await user.save();
    }

    async remove(query, many = false) {
        if (many) {
            const result = await this.User.deleteMany(query);
            console.log(result);
        } else {
            const result = await this.User.deleteOne(query);
            console.log(result);
        }
    }

    async all() {
        console.log(await this.User.find())
    }

    async getAll() {
        return await this.User.find();
    }

    async sample() {
        return await this.User.aggregate([{ $sample: { size: 1 } }]);
    }

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