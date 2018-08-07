const mongoose = require('mongoose');
const shortid = require('shortid');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: { 
        type: Schema.Types.String, 
        default: shortid.generate 
    },
    username: { 
        type: Schema.Types.String, 
        required: true, 
        index: { 
            unique: true 
        },
    },
});

module.exports = mongoose.model('User', userSchema);