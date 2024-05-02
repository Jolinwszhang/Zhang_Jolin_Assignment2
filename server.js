// loads the products array into server memory from the products.json file
const products = require(__dirname + '/products.json');

// load user registration data from user_data.json file
let user_data_file = __dirname + '/user_data.json';
const user_data = require(user_data_file);

const express = require('express');
const app = express();

// load fs module
const fs = require('fs');


// tmp storage for user quantities from form data
let user_quantities;

const myParser = require("body-parser");
const e = require('express');
app.use(myParser.urlencoded({ extended: true }));

app.all('*', function (request, response, next) {
  console.log(request.method + ' to ' + request.path);
  next();
});


//--------------------------Log-in-------------------------------- //

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
app.post('/register', function (req, res, next) {
  //console.log(req.body, req.query);
  // Process registration form POST and redirect to invoice in page if ok, back to registraion page 
  const qs = new URLSearchParams(req.query);
  qs.append('email', req.body.email);
 

  const errors = {}; // assume no errors to start
  // validate name
  // Extract email, name, password, confirm_password from request body
  const email = req.body.email?.trim(); // Ensure it is trimmed and optional chaining to avoid undefined
  const name = req.body.name?.trim(); // Similar to email
  const password = req.body.psw; // Consider hashing for security
  const confirm_password = req.body.confirm_psw; // Check if it matches password
  
  if (!email) {
    errors.email = 'Email is required'; // Check for missing email
  }

  if (email) {
    const emailLower = email.toLowerCase(); // Convert email to lowercase for case-insensitive comparison

    // Check if email already exists
    if (emailLower in user_data) {
      errors.email = 'Email is already registered';
    }

    // Validate name (optional, could add length checks, etc.)
    if (!email) {
      errors.name = 'Email is required';
    }

    // Ensure passwords match
    if (password !== confirm_password) {
      errors.password = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      qs.append('errors', JSON.stringify(errors));
      console.log(`jolin1`);
      res.redirect('./registration_page.html?' + qs.toString());
    } else {
      // Save user data with lowercase email
      user_data[emailLower] = {
        name: name,
        password: password,
      };

      // Write updated user data to file
      fs.writeFileSync(user_data_file, JSON.stringify(user_data, null, 2));

      qs.append('email', emailLower); // Use emailLower to ensure case-insensitivity
      res.redirect('./invoice.html?' + params.toString());
    }
  } else {
    console.log(`jolin2`);
    // If email is undefined or has errors
    qs.append('errors', JSON.stringify(errors));
    res.redirect('./registration_page.html?' + qs.toString());
  }
});

// A micro-service to return the products data currently in memory on the server as
// javascript to define the products array
app.get('/products.json', function (req, res, next) {
  res.json(products);
});
//declare global quries string 
let params;

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
  params = new URLSearchParams();
  params.append('quantities', JSON.stringify(quantities));
 
  // If there are errors, send the user back to fix otherwise redirect to the invoice with the quantities in the query string
  if (Object.keys(errors).length > 0) {
    // Have errors, redirect back to store where errors came from to fix and try again
    params.append('errors', JSON.stringify(errors));
    res.redirect('store.html?' + params.toString());
  } else {
    for (let i = 0; i < quantities.length; i++) {
      const quantitySold = Number(quantities[i]);
      const product = products[i];
      product.quantity_available -= quantitySold;
      product.quantity_sold += quantitySold;
    }
    // Reduce the quantities of each product purchased from the quantities available
    res.redirect('./login_page.html?' + params.toString());
  }
});

// This adds middleware to serve files from the public directory
app.use(express.static(__dirname + '/public'));
app.listen(8080, () => console.log(`listening on port 8080`));

function isNonNegInt(q, returnErrors = false) {
  let errs = []; // assume no errors at first
  if (q == '') q = 0; // handle blank inputs as if they are 0
  if (Number(q) != q) errs.push('Not a number!'); // Check if string is a number value
  else {
    if (q < 0) errs.push('Negative value!'); // Check if it is non-negative
    if (parseInt(q) != q) errs.push('Not an integer!'); // Check that it is an integer
  }
  return returnErrors ? errs : (errs.length == 0);
}
// IR 1 
const http = require('http');

const users = [
    {
        email: 'example@gmail.com',
        hashedPassword: '5060708090' // Hashed password from registration
    }
];


//--------------------------A2IR1 Encryption-------------------------------- //

// IR1: Microservice for user registration and login using encryption
let server = http.createServer((req, res) => {

  if (req.url === '/register' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const userData = JSON.parse(body);
      const hashedPassword = crypto.createHash('sha256').update(userData.password).digest('hex');
      // Save the hashed password and other user data to your database or file
      // You can use fs module for file operations or connect to a database like MongoDB
      res.end('Registration successful');
    });
  } else if (req.url === '/login' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const loginData = JSON.parse(body);
      const hashedPassword = crypto.createHash('sha256').update(loginData.password).digest('hex');
      const user = users.find(u => u.username === loginData.username && u.hashedPassword === hashedPassword);
            
      if (user) {
        res.end('Login successful');
      } else {
        res.end('Invalid username or password');
      }
    });
  }
});




const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
