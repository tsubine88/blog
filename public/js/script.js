let addIngredientsBtn = document.getElementById('addIngredientsBtn');
let ingredientList = document.querySelector('.ingredientList');
let ingredientDiv = document.querySelectorAll('.ingredientDiv')[0];

addIngredientsBtn.addEventListener('click', function() {

    let newIngredients = ingredientDiv.cloneNode(true);
    let input = newIngredients.getElementsByTagName('input')[0];
    input.value = '';
    ingredientList.appendChild(newIngredients);



});


// document.addEventListener('DOMContentLoaded', function () {
//     let addIngredientsBtn = document.getElementById('addIngredientsBtn');
//     let ingredientList = document.querySelector('.ingredientList');
//     let ingredientDiv = document.querySelectorAll('.ingredientDiv')[0];
  
//     if (addIngredientsBtn) {
//       addIngredientsBtn.addEventListener('click', function() {
//         let newIngredients = ingredientDiv.cloneNode(true);
//         let input = newIngredients.getElementsByTagName('input')[0];
//         input.value = '';
//         ingredientList.appendChild(newIngredients);
//       });
//     } else {
//       console.error('addIngredientsBtn is null or undefined.');
//     }
//   });
  
document.addEventListener('DOMContentLoaded', function () {
    const registerButton = document.getElementById('registerButton'); // Add an id to your register button
    let isLoggedIn;
    if (isLoggedIn) {
        // If the user is logged in, change the button to a logout button
        registerButton.innerText = 'Logout';
        registerButton.href = '/logout'; // Change the href to your logout route
        // Add any other necessary changes for logout
    } else {
        // If the user is not logged in, keep it as a register button
        registerButton.innerText = 'Register';
        registerButton.href = '/register'; // Change the href to your register route
        // Add any other necessary changes for register
    }
});
