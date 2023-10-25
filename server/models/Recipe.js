const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required.',
    },
    description: {
        type: String,
        required: 'This field is required.',
    },
    email: {
        type: String,
        required: 'This field is required.',
    },
    ingredients: {
        type: Array,
        required: 'This field is required.',
    },
    category: {
        type: String,
        enum: ['Thai', 'American', 'Chinese', 'Mexican', 'Indian', 'Spanish'],
        required: 'This field is required.',
    },
    image: {
        type: String,
        required: 'This field is required.',
    },
    // // Add user field to store the user ID
    // user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User', // Assuming your user model is named 'User'
    //     required: true,
    // },
});

recipeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
