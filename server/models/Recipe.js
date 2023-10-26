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
<<<<<<< HEAD
=======
<<<<<<< HEAD
        required: 'This field is required.',
=======
>>>>>>> 3765d89748c3afd94f11a55583bc5ceb41094862
        required: 'This field is required.'
>>>>>>> 4d59fae3865ca7c76cb3d8e9e5d18d5117e52c4e
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
