const params = new URLSearchParams(window.location.search);
let errors = {};
let quantities = [];

// Parse errors from the query string
if (params.has('errors')) {
  errors = JSON.parse(params.get('errors'));
  // Parse quantities from the query string
  if (params.has('quantities')) {
    quantities = JSON.parse(params.get('quantities'));
  }
  // Display an alert if there are errors indicating no quantities were selected
  if (errors['no_quantities']) {
    alert(errors['no_quantities']);
  }
}

let products;

window.onload = async function () {
  // Fetch product data from the server
  await fetch('products.json')
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
      }
    })
    .then(json => {
      products = json;
      display_products();
    })
    .catch(error => {
      console.error(error);
    });
}

// Function to filter products based on search input
function myFunction() {
  const input = document.getElementById("search_textbox");
  const filter = input.value.toUpperCase();
  const sections = document.getElementsByTagName("section");
  for (let i = 0; i < sections.length; i++) {
    const heading = sections[i].getElementsByTagName("h2")[0];
    const txtValue = heading.textContent || heading.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      sections[i].style.display = "";
    } else {
      sections[i].style.display = "none";
    }
  }
}

// Function to display products on the page
function display_products() {
  const productsMainDisplay = document.getElementById("products_main_display");
  // Loop through the products array and display each product
  for (let i = 0; i < products.length; i++) {
    let quantityLabel = 'Quantity';
    // Check if there is an error with this quantity, display it in the label
    if (errors['quantity' + i]) {
      quantityLabel = `<span class="error_message">${errors['quantity' + i]}</span>`;
    }
    let quantity = 0;
    // Insert previous quantity into the textbox if it exists
    if (quantities[i] !== undefined) {
      quantity = quantities[i];
    }
    productsMainDisplay.innerHTML += `
      <section class="item">
        <h2>${products[i].model}</h2>
        <h4> In Stock ${products[i].quantity_available}</h4>
        <h4> Sold ${products[i].quantity_sold}</h4>
        <p>$${products[i].price}</p>
        <label>${quantityLabel}</label>
        <input type="text" placeholder="0" name="quantity_textbox[${i}]" value="${quantity}">
        <img src="./images/${products[i].image}" alt="${products[i].model}">
      </section>
    `;
  }
}
