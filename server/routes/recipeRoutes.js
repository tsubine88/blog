
const authMiddleware = require('../models/authMiddleware');
const express = require('express');


const router = express.Router();
const recipeController = require('../controllers/recipeController');
const bodyParser = require('body-parser');



const {
    check
} = require('express-validator');
const urlencodedParser = bodyParser.urlencoded({
    extended: false
});
// app Routes


router.get('/', recipeController.homepage);
router.get('/recipe/:id', recipeController.exploreRecipe);
router.get('/categories', recipeController.exploreCategories);
router.get('/categories/:id', recipeController.exploreCategoriesById);
router.post('/search', recipeController.searchRecipe);
router.get('/explore-latest', recipeController.exploreLatest);
router.get('/explore-random', recipeController.exploreRandom);

router.get('/submit-recipe', authMiddleware.isAuthenticated, recipeController.submitRecipe);
router.post('/submit-recipe', urlencodedParser, [
    check('name', 'The Name must be at least 3+ characters long')
        .exists()
        .isLength({
            min: 3,
        }),
    check('email', 'Email is not valid')
        .isEmail()
        .normalizeEmail()
], recipeController.submitRecipeOnPost);
router.get('/edit-recipe/:id', authMiddleware.isAuthenticated, recipeController.editRecipe);

router.post('/edit-recipe/:id', urlencodedParser, [
    check('name', 'The Name must be at least 3+ characters long')
        .exists()
        .isLength({
            min: 3,
        }),
    // Add other validation checks as needed
], recipeController.editRecipeOnPost);


router.get('/about', recipeController.about);
router.get('/register', recipeController.register);
router.post('/register', recipeController.newRegister);
router.get('/login', recipeController.login);
router.post('/login', recipeController.logIn);
router.get('/logout', recipeController.logout);
router.get('/contact', recipeController.contact);
router.post('/contact', urlencodedParser, [
    check('name', 'The Name must be at least 3+ characters long')
        .exists()
        .isLength({
            min: 3
        }),
    check('email', 'Email is not valid')
        .isEmail()
        .normalizeEmail()
], recipeController.newContact);




module.exports = router;