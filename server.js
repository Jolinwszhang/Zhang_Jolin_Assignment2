// loads the products array into server memory from the products.json file
const products = require(__dirname + '/products.json'); // load the products.json file into memory

const express = require('express');
const app = express();
const fs = require('fs');

let errors = {}; // keep errors on server to share with registration page

app.use(express.urlencoded({extended:true}));

// user info JSON file
let filename = "./user_";


if (fs.existsSync(filename)) {
    let stats = fs.statSync(filename);
    data = fs.readFileSync(filename, 'utf-8');
    users_reg_data = JSON.parse(data);
} else {
    console.log(filename + ' does not exist!');
    users_reg_data = {};
}

// This processes the form data in a POST request so that the form data appears in request.body
const myParser = require("body-parser");
const e = require('express');
app.use(myParser.urlencoded({ extended: true }));

// Log requests to the console
app.all('*', function (request, response, next) {
  console.log(request.method + ' to ' + request.path);
  next();
});
// Initialize user_data as an empty object
let user_data = {};

// process login form data
app.post('/process_login', function (req, res, next) {
  console.log(req.body, req.query);
  // Process login form POST and redirect to invoice in page if ok, back to login page 
  const params = new URLSearchParams(req.query);
  params.append('email', req.body.email);
  const errors = {}; // assume no errors to start
  if (req.body.email in user_data) {
    // check if the password is correct
    if (req.body.password == user_data[req.body.email].password) {
      // password ok, send to invoice
      res.redirect('./invoice.html?' + params.toString());
      return;
    } else {
      errors.password = 'Password incorrect';
    }
  } else {
    errors.email = `user ${req.body.email} does not exist`;
  }
  // if errors, send back to login page to fix
  params.append('errors', JSON.stringify(errors));
  res.redirect('./login_page.html?' + params.toString());

});



// process registration form data
app.post('/process_registration', function (req, res, next) {
  console.log(req.body, req.query);
  // Process registration form POST and redirect to invoice in page if ok, back to registraion page 
  const params = new URLSearchParams(req.query);
  params.append('email', req.body.email);

  const errors = {}; // assume no errors to start
  // validate name
  
  // check if email is already taken

  // check if passwords match

  // if errors, send back to registration page to fix otherwise send to invoice
  if (Object.keys(errors).length !== 0) {
   response.redirect('./register.html');
  } else{
    //data valid so add ne user to user_data_reg
    let new_email = request.body.email.toLowercase();
    users_reg_data[new_email] ={};
    users_reg_data[new_email].username = request.body.username;
    users_reg_data[new_email].password = 

    // save data to user_Data_file
    fs.writeFileSync(user_data_file,JSON.stringify(users_reg_data));
    //reduce invenetory 


  }
    
});





// A micro-service to return the products data currently in memory on the server as
// javascript to define the products array
app.get('/products.json', function (request, response) {
  response.json(products);
});

// A micro-service to process the product quantities from the form data
// redirect to invoice if quantities are valid, otherwise redirect back to products_display
app.post('/process_purchase_form', function (req, res, next) {
  // only process if purchase form submitted
  const errors = {}; // assume no errors to start
  let quantities = [];
  if (typeof req.body['quantity_textbox'] != 'undefined') {
    quantities = req.body['quantity_textbox'];
    // Loop through the quantities submitted
    let has_quantities = false;
    for (let i = 0; i < quantities.length; i++) {
      // validate the quantity is a non-negative integer. Add to errors object if not.
      if (!isNonNegInt(quantities[i])) {
        errors['quantity' + i] = isNonNegInt(quantities[i], true).join('<br>');
      }
      // validate the quantity requested is less than or equal to the quantity available. Add to errors object if not.
      // check if it exceeds the quantity available
      const productIndex = parseInt(i);
      if (quantities[i] > products[productIndex].quantity_available) {
        errors['quantity' + i] = 'Quantity requested exceeds available quantity';
      }
      if (quantities[i] > 0) {
        has_quantities = true;
        // any quantities selected 
      }
    }
    // if no quantities are greater than zero make no quantities error report
    // Check the quantities array has at least one value greater than 0 (i.e. something was purchased). Add to errors object if not.

    // error quantities is no_quantities error
    if (has_quantities === false) {
      errors['no_quantities'] = 'Oii! Need to select your board to ride some gnarly waves!';
    }
    // This just logs the purchase data to the console and where it came from. It is not required.
    console.log(Date.now() + ': Purchase made from ip ' + req.ip + ' data: ' + JSON.stringify(req.body));
  }
  // create a query string with data from the form
  const params = new URLSearchParams();
  params.append('quantities', JSON.stringify(quantities));

  // If there are errors, send the user back to fix otherwise redirect to the invoice with the quantities in the query string
  if (Object.keys(errors).length > 0) {
    // Have errors, redirect back to store where errors came from to fix and try again
    params.append('errors', JSON.stringify(errors));
    res.redirect('store.html?' + params.toString());
  } else {
    // Reduce the quantities of each product purchased from the quantities available
    // <add code here>
    res.redirect('./invoice.html?' + params.toString());
  }
});

// This adds middleware to serve files from the public directory
app.use(express.static(__dirname + '/public'));
app.listen(8080, () => console.log(`listening on port 8080`));

function isNonNegInt(q, returnErrors = false) {
  let errors = []; // assume no errors at first
  if (q == '') q = 0; // handle blank inputs as if they are 0
  if (Number(q) != q) errs.push('Not a number!'); // Check if string is a number value
  else {
    if (q < 0) errs.push('Negative value!'); // Check if it is non-negative
    if (parseInt(q) != q) errs.push('Not an integer!'); // Check that it is an integer
  }
  return returnErrors ? errs : (errs.length == 0);
}
