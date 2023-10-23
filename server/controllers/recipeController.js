require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const Contact = require('../models/Contact');
const User = require('../models/User');
const bcrypt = require('bcrypt'); // Import bcrypt for password comparison
const {
    check,
    validationResult
} = require('express-validator');
// GET /
// homepage

// Update the recipeController.homepage route with defined "user" constant and also render "user"
exports.homepage = async (req, res) => {
    try {
        // Check if the user is logged in
        const user = req.session.userId ? await User.findById(req.session.userId) : null;

        const limitNumber = 5;
        const categories = await Category.find({}).limit(limitNumber);
        const latest = await Recipe.find({}).sort({
            _id: -1
        }).limit(limitNumber);
        const thai = await Recipe.find({
            'category': 'Thai'
        }).limit(limitNumber);
        const american = await Recipe.find({
            'category': 'American'
        }).limit(limitNumber);
        const chinese = await Recipe.find({
            'category': 'Chinese'
        }).limit(limitNumber);

        const food = {
            latest,
            thai,
            american,
            chinese
        };

        res.render('index', {
            title: 'Cookie Blog - Home',
            categories,
            food,
            user: user || null, // Pass the user object or null if not defined
        });

    } catch (error) {
        res.status(500).send({
            message: error.message || "Error occurred"
        });
    }
}


// GET /
// categories

exports.exploreCategories = async (req, res) => {
    try {
        const limitNumber = 20;
        const categories = await Category.find({}).limit(limitNumber);


        res.render('categories', {
            title: 'Cookie Blog - Categories',
            categories
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Error occured"
        });
    }
}

// GET categories by id

exports.exploreCategoriesById = async (req, res) => {
    try {
        let categoryId = req.params.id;
        const limitNumber = 20;
        const categoryById = await Recipe.find({
            'category': categoryId
        }).limit(limitNumber);
        res.render('categories', {
            title: 'Cookie Blog - Categories',
            categoryById
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Error occured"
        });
    }
}

// get recipe / id
// recipes

exports.exploreRecipe = async (req, res) => {
    try {
        let recipeId = req.params.id;

        const recipe = await Recipe.findById(recipeId);


        res.render('recipe', {
            title: 'Cookie Blog - Recipe',
            recipe
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Error occured"
        });
    }
}

// post search
// search

exports.searchRecipe = async (req, res) => {

    // searchTerm

    try {

        let searchTerm = req.body.searchTerm;
        let recipe = await Recipe.find({
            $text: {
                $search: searchTerm,
                $diacriticSensitive: true
            }
        });

        res.render('search', {
            title: 'Cookie Blog - Search',
            recipe
        });

    } catch (error) {
        res.status(500).send({
            message: error.message || "Error occured"
        });
    }


}

// Get/ explore-latest
// explore latest

exports.exploreLatest = async (req, res) => {
    try {
        const limitNumber = 20;
        const recipe = await Recipe.find({}).sort({
            _id: -1
        }).limit(limitNumber);


        res.render('explore-latest', {
            title: 'Cookie Blog - Explore Latest',
            recipe
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Error occured"
        });
    }
}

// Get/ explore-random
// explore random as JSON

exports.exploreRandom = async (req, res) => {
    try {
        let count = await Recipe.find().countDocuments();
        let random = Math.floor(Math.random() * count);
        let recipe = await Recipe.findOne().skip(random).exec();

        res.render('explore-random', {
            title: 'Cookie Blog - Explore Random',
            recipe
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Error occured"
        });
    }
}

// Get/ submitRecipe
// submitRecipe

exports.submitRecipe = async (req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');

    try {
        // Fetch categories from the database
        const categories = await Category.find({}).exec();

        res.render('submit-recipe', {
            title: 'Cookie Blog - Submit Recipe',
            infoErrorsObj,
            infoSubmitObj,
            categories, // Pass the categories to the template
        });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

}

// POST/ submitRecipe
// submitRecipe

exports.submitRecipeOnPost = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json(errors.array())
    }

    try {

        let imageUploadFile;
        let uploadPath;
        let newImageName;

        if (!req.files || Object.keys(req.files).length === 0) {
            console.log('No files were uploaded');
        } else {

            imageUploadFile = req.files.image;
            newImageName = Date.now() + imageUploadFile.name;

            uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

            imageUploadFile.mv(uploadPath, function (err) {

                if (err) return res.status(500).send(err);
            })

        }

        const newRecipe = new Recipe({
            name: req.body.name,
            description: req.body.description,
            email: req.body.email,
            ingredients: req.body.ingredients,
            category: req.body.category,
            image: newImageName

        });

        await newRecipe.save();

        req.flash('infoSubmit', 'Recipe had been added.');
        res.redirect('/submit-recipe');

    } catch (error) {
        // res.json(error);
        req.flash('infoErrors', error);
        res.redirect('/submit-recipe');
    }

}

exports.editRecipe = async (req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    const recipeId = req.params.id;
    try {
        
        const recipe = await Recipe.findById(recipeId);
        const categories = await Category.find({});

        if (!recipe) {
            return res.status(404).render('not-found', {
                title: 'Cookie Blog - Not Found',
                message: 'Recipe not found.',
            });
        }

        res.render('edit-recipe', {
            title: 'Cookie Blog - Edit Recipe',
            recipe,
            categories,
            infoErrorsObj,
            infoSubmitObj,
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Error occurred"
        });
    }
}


exports.editRecipeOnPost = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json(errors.array());
    }

    try {
        const recipeId = req.params.id;
        const existingRecipe = await Recipe.findById(recipeId);

        if (!existingRecipe) {
            return res.status(404).render('not-found', {
                title: 'Cookie Blog - Not Found',
                message: 'Recipe not found.',
            });
        }

        let imageUploadFile;
        let uploadPath;
        let newImageName;

        if (!req.files || Object.keys(req.files).length === 0) {
            console.log('No files were uploaded');
        } else {
            imageUploadFile = req.files.image;
            newImageName = Date.now() + imageUploadFile.name;
            uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

            imageUploadFile.mv(uploadPath, function (err) {
                if (err) return res.status(500).send(err);
            });
        }

        // Update the existing recipe with the new data
        existingRecipe.name = req.body.name;
        existingRecipe.description = req.body.description;
        existingRecipe.email = req.body.email;
        existingRecipe.ingredients = req.body.ingredients;
        existingRecipe.category = req.body.category;
        existingRecipe.image = newImageName;

        await existingRecipe.save();

        req.flash('infoSubmit', 'Recipe has been updated.');
        res.redirect(`/edit-recipe/${recipeId}`);

    } catch (error) {
        req.flash('infoErrors', error);
        res.redirect(`/edit-recipe/${recipeId}`);
    }
}









// Get/ about
// about 

exports.about = async (req, res) => {
    res.render('about', {
        title: 'Cooking Blog - About'
    });
}


// get register

exports.register = async (req, res) => {
    res.render('register', { error: null });
}

// post register

exports.newRegister = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Check if the email is already registered
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).render('register', { error: 'Email already exists' });
      }
  
      // Hash the password before saving it to the database
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Create a new user with the hashed password
      const newUser = new User({
        name,
        email,
        password: hashedPassword, // Store the hashed password
      });
  
      // Save the user to the database
      await newUser.save();
  
      // Redirect to login or another page
      res.redirect('/login');
    } catch (error) {
      console.error(error);
      // Pass the error message to the view
      res.status(500).render('register', { error: 'Internal Server Error' });
    }
  };



// get login

// exports.login = async (req, res) => {
//     res.render('login', { error: null });
// }


// get login
exports.login = async (req, res) => {
    try {
      // Check if the user is logged in
      const user = req.session.userId ? await User.findById(req.session.userId) : null;
      
      res.render('login', { error: null, user }); // Pass the user object to the template
    } catch (error) {
      console.error(error);
      res.status(500).render('login', { error: 'Internal Server Error', user: null });
    }
  };
// post login

exports.logIn = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
  
      // If user doesn't exist or password doesn't match, display an error
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('login', { error: 'Invalid credentials', user: null });
      }
  
      // Create a session (e.g., using express-session) to keep the user logged in
      req.session.userId = user._id;
  
      // Redirect to the user's dashboard or another protected page
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.status(500).render('login', { error: 'Internal Server Error', user: null });
    }
  };

// Logout route
exports.logout = async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/login'); // Redirect to the login page after logout
    });
  };












// get/ contact
// contact

exports.contact = async (req, res) => {
    const infoErrorObj = req.flash('infoErrors');
    const infoContactObj = req.flash('infoContact');

    res.render('contact', {
        title: 'Cooking Blog - Contact',
        infoErrorObj,
        infoContactObj
    });
}

// post contact
// contact

exports.newContact = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json(errors.array())
    }

    try {

        const newContact = new Contact({

            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message,

        });

        await newContact.save();

        req.flash('infoContact', 'Contact has been added.');
        res.redirect('/contact');

    } catch (error) {
        // res.json(error);
        req.flash('infoErrors', error);
        res.redirect('/contact');
    }

}

// deleting a recipe


// async function deleteRecipe(){

//     try {
//        await Recipe.deleteOne({ name: 'New Chocolate cake'});

//     } catch (error) {
//         console.log(error);
//     }

// }
// deleteRecipe();




// Updating a recipe

// async function updateRecipe(){

//     try {
//         const res = await Recipe.updateOne({ name: 'New recipe witth image'}, {name: 'Updated'});
//         res.n;   //Number  of documents matched
//         res.nModified; //Number of documends modified
//     } catch (error) {
//         console.log(error);
//     }

// }
// updateRecipe();


// insert one

// async function insertDummyCategoryData(){
// try{
//     await Category.insertOne([
//     {
//                    "name": "Indian",
//                     "image": "indian-food.jpg"
//                },
//             ]);
// }
//  catch (error) {
//     console.log('err', + error)
// }
// }
// insertDummyCategoryData();

// insert many

// async function insertDummyCategoryData(){

// try{
//     await Category.insertMany([
//               {
//                 "name": "Thai",
//                 "image": "thai-food.jpg"
//               },
//               {
//                 "name": "American",
//                 "image": "american-food.jpg"
//               },
//               {
//                 "name": "Chinese",
//                 "image": "chinese-food.jpg"
//               },
//               {
//                 "name": "Mexican",
//                 "image": "mexican-food.jpg"
//               },
//               {
//                 "name": "Indian",
//                 "image": "indian-food.jpg"
//               },
//               {
//                 "name": "Spanish",
//                 "image": "spanish-food.jpg"
//               }
//             ]);
// } catch (error) {
//     console.log('err', + error)
// }

// }
// insertDummyCategoryData();




// async function insertDummyRecipeData(){

// try{
//     await Recipe.insertMany([
//       {
//         "name": "Crab Cakes",
//         "description": `Maryland Crab Cakes with Quick Tartar Sauce`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "2 large eggs",
//           "2½ tablespoons mayonnaise, best quality such as Hellmann's or Duke's",
//           "1 teaspoon Worcestershire sauce",
//           "1 teaspoon Old Bay seasoning",
//           "¼ teaspoon salt",
//           "¼ cup finely diced celery, from one stalk",
//           "2 tablespoons finely chopped fresh parsley",
//           "1 pound lump crab meat",
//           "½ cup panko",
//           "Vegetable or canola oil, for cooking",
//         ],
//         "category": "American",
//         "image": "crab-cakes.jpg"
//       },
//       {
//         "name": "Chinese Steak Tofu",
//         "description": `Chinese steak & tofu stew`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "250g rump or sirloin steak",
//           "2 cloves of garlic",
//           "4cm piece of ginger",
//           "2 fresh red chilli",
//           "1 bunch of spring onions",
//           "2 large carrots",
//           "250g mooli or radishes",
//           "1 heaped teaspoon Szechuan peppercorns",
//           "groundnut oil",
//           "2 tablespoons Chinese chilli bean paste",
//           "1 litre veg stock",
//           "1 x 400g tin of aduki beans",
//           "250g pudding or risotto rice",
//           "1 tablespoon cornflour",
//           "200g tenderstem broccoli",
//           "350g firm silken tofu",
//         ],
//         "category": "Chinese",
//         "image": "chinese-steak-tofu-stew.jpg"
//       },
//       {
//         "name": "Chocolate Banoffe",
//         "description": `Chocolate Banoffe Whoopie Pie`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "2 heaped tablespoons cocoa powder , plus extra for dusting",
//           "350 g self-raising flour",
//           "175 g sugar",
//           "200 ml milk",
//           "100 ml nut or rapeseed oil",
//           "1 large free-range egg",
//           "240 g dulce de leche",
//           "3 bananas",
//           "icing sugar , for dusting",
//         ],
//         "category": "American",
//         "image": "chocolate-banoffe-whoopie-pies.jpg"
//       },
//       {
//         "name": "Grilled Lobster Rolls",
//         "description": `Tasty Lobster Rolls`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "85 g butter",
//           "500 g cooked lobster meat, from sustainable sources",
//           "1 stick of celery",
//           "2 tablespoons mayonnaise , made using free-range eggs",
//           "6 submarine rolls",
//           "½ an iceberg lettuce",
//         ],
//         "category": "American",
//         "image": "grilled-lobster-rolls.jpg"
//       },
//       {
//         "name": "Key Lime Pie",
//         "description": `Tastiest Key Lime Pie`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "1½ cups finely crushed graham cracker crumbs, from about 12 whole graham crackers",
//           "⅓ cup packed light brown sugar",
//           "4 tablespoons unsalted butter, melted",
//           "Two 14-oz cans sweetened condensed milk",
//           "1 cup plain Greek yogurt (2% or whole milk)",
//           "1 tablespoon grated lime zest",
//           "¾ cup fresh lime juice",
//           "1 cup cold heavy cream",
//           "2 tablespoons confectioners' sugar",
//           "1 teaspoon grated lime zest",
//           "8 to 10 thin lime slices",
//         ],
//         "category": "American",
//         "image": "key-lime-pie.jpg"
//       },
//       {
//         "name": "Southern Fried Chicken",
//         "description": `Finger Lickin' Fried Chicken`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "1 1/2 cups milk",
//           "2 large eggs",
//           "2 1/2 cups all-purpose flour",
//           "2 tablespoons salt, plus additional for sprinkling",
//           "2 teaspoons black pepper",
//           "4 pounds bone-in skin-on chicken pieces",
//           "Vegetable oil, for frying",
//         ],
//         "category": "American",
//         "image": "southern-friend-chicken.jpg"
//       },
//       {
//         "name": "Spring Rolls",
//         "description": `CANTONESE SPRING ROLLS`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "8 ounces finely shredded pork loin",
//           "¼ teaspoon salt",
//           "½ teaspoon sesame oil",
//           "1 teaspoon Shaoxing wine",
//           "½ teaspoon cornstarch",
//           "¼ teaspoon white pepper",
//         ],
//         "category": "Chinese",
//         "image": "spring-rolls.jpg"
//       },
//       {
//         "name": "Stir Fry",
//         "description": `Stir Fried Vegetables`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "⅓ cup soy sauce (use gluten-free if needed)",
//           "3 tablespoons water",
//           "2 tablespoons dry sherry or Chinese rice wine",
//           "1 teaspoon Asian/toasted sesame oil",
//           "2 teaspoons sugar",
//           "1 tablespoon cornstarch",
//           "¼ teaspoon red pepper flakes",
//           "¼ teaspoon dry mustard",
//           "2 tablespoons vegetable oil",
//           "1 pound broccoli, cut into 1-inch florets (or ¾ pound florets)",
//           "7 ounces shiitake mushrooms, stems removed and thinly sliced",
//           "1 red bell pepper, thinly sliced",
//           "3 cloves garlic, finely chopped",
//           "3 scallions, thinly sliced, white/light green and dark green parts separated",
//           "1 tablespoon grated fresh ginger",
//         ],
//         "category": "Chinese",
//         "image": "stir-fried-vegetables.jpg"
//       },
//       {
//         "name": "Pinch Salad",
//         "description": `Chinese Pinch Salad`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "5 cm piece of ginger",
//           "1 fresh red chilli",
//           "25 g sesame seeds",
//           "24 raw peeled king prawns , from sustainable sources (defrost first, if using frozen)",
//           "1 pinch Chinese five-spice powder",
//           "1 lime",
//           "sesame oil",
//           "2 round lettuces",
//           "50 g fine rice noodles",
//           "½ a bunch of fresh coriander (15g)",
//         ],
//         "category": "Chinese",
//         "image": "thai-chinese-inspired-pinch-salad.jpg"
//       },
//       {
//         "name": "Green Curry",
//         "description": `Thai Green Curry`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "225g new potatoes, cut into chunks",
//           "100g green beans, trimmed and halved",
//           "1 tbsp vegetable or sunflower oil",
//           "1 garlic clove, chopped",
//           "1 rounded tbsp or 4 tsp Thai green curry paste (you can't fit the tablespoon into some of the jars)",
//           "400ml can coconut milk",
//           "2 tsp Thai fish sauce",
//           "1 tsp caster sugar",
//           "450g boneless skinless chicken (breasts or thighs), cut into bite-size pieces",
//           "2 lime leaves finely shredded, or 3 wide strips lime zest, plus extra to garnish",
//           "good handful of basil leaves",
//           "boiled rice, to serve",
//         ],
//         "category": "Thai",
//         "image": "thai-green-curry.jpg"
//       },
//       {
//         "name": "Vegetable Broth",
//         "description": `Thai Inspired Vegetable Broth`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "3 cloves of garlic",
//           "5cm piece of ginger",
//           "200 g mixed Asian greens , such as baby pak choi, choy sum, Chinese cabbage",
//           "2 spring onions",
//           "1 fresh red chilli",
//           "5 sprigs of fresh Thai basil",
//           "1 stick of lemongrass",
//           "2 star anise",
//           "800 ml clear organic vegetable stock",
//           "1 teaspoon fish sauce , (optional)",
//           "1 teaspooon soy sauce",
//           "1 small punnet shiso cress",
//           "1 lime",
//         ],
//         "category": "Thai",
//         "image": "thai-inspired-vegetable-broth.jpg"
//       },
//       {
//         "name": "Red Chicken Soup",
//         "description": `Thai Red Chicken Soup`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "1 x 1.6 kg whole chicken",
//           "1 butternut squash (1.2kg)",
//           "1 bunch of fresh coriander (30g)",
//           "100 g Thai red curry paste",
//           "1 x 400 ml tin of light coconut milk",
//          ],
//         "category": "Thai",
//         "image": "thai-red-chicken-soup.jpg"
//       },
//       {
//         "name": "Mussels",
//         "description": `Thai Style Mussels`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "1 kg mussels , debearded, from sustainable sources",
//           "4 spring onions",
//           "2 cloves of garlic",
//           "½ a bunch of fresh coriander",
//           "1 stick of lemongrass",
//           "1 fresh red chilli",
//           "groundnut oil",
//           "1 x 400 ml tin of reduced fat coconut milk",
//           "1 tablespoon fish sauce",
//           "1 lime",
//         ],
//         "category": "Thai",
//         "image": "thai-style-mussels.jpg"
//       },
//       {
//         "name": "Tom Daley",
//         "description": `Tom Daley's sweet & sour chicken`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "1 x 227 g tin of pineapple in natural juice",
//           "1 x 213 g tin of peaches in natural juice",
//           "1 tablespoon low-salt soy sauce",
//           "1 tablespoon fish sauce",
//           "2 teaspoons cornflour",
//           "2 x 120 g free-range chicken breasts , skin on",
//           "Chinese five-spice",
//           "1 lime",
//           "2 cloves of garlic",
//           "1 bunch of asparagus , (350g)",
//           "100 g tenderstem broccoli",
//           "1 small onion",
//           "2 fresh red chillies",
//           "1 red pepper",
//           "1 yellow pepper",
//           "7 cm piece of ginger",
//           "groundnut oil",
//           "100 g baby sweetcorn",
//           "1 teaspoon runny honey",
//           "½ a bunch of fresh coriander , (15g)",

//         ],
//         "category": "Thai",
//         "image": "tom-daley.jpg"
//       },
//       {
//         "name": "Pad Thai",
//         "description": `Veggie Pad Thai`,
//         "email": "recipeemail@tsubine.com",
//         "ingredients": [
//           "150 g rice noodles",
//           "sesame oil",
//           "20 g unsalted peanuts",
//           "2 cloves of garlic",
//           "80 g silken tofu",
//           "low-salt soy sauce",
//           "2 teaspoons tamarind paste",
//           "2 teaspoons sweet chilli sauce",
//           "2 limes",
//           "1 shallot",
//           "320 g crunchy veg , such as asparagus, purple sprouting broccoli, pak choi, baby corn",
//           "80 g beansprouts",
//           "2 large free-range eggs",
//           "olive oil",
//           "dried chilli flakes",
//           "½ a cos lettuce",
//           "½ a mixed bunch of fresh basil, mint and coriander , (15g)",

//         ],
//         "category": "Thai",
//         "image": "veggie-pad-thai.jpg"
//       },

//     ]);
// } catch (error) {
//     console.log('err', + error)
// }

// }

// insertDummyRecipeData();