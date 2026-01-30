import '../style.scss';
import '../admin.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init();
/*This Javascript file is for public API calls and forms
which can be used on the restaurant public pages without logging in. */

//declaring variables for elements in DOM
const galleryEl = document.getElementById("gallery");
const loginFormEl = document.getElementById("loginForm");
const orderFormEl = document.getElementById("orderForm");
const foodMenuEl = document.getElementById("foodMenu")
const drinkMenuEl = document.getElementById("drinkMenu")
const publicMenuEl = document.querySelector(".publicmenu")
const messagedivEl = document.getElementById("messagediv")

//run on load
window.onload = init

function init() {
  //Event listener for image form

  if (loginFormEl) {
    //Event listener for login form
    loginFormEl.addEventListener("submit", login);
  }

  if (orderFormEl) {
    //Event listener for order form
    orderFormEl.addEventListener("submit", addOrder),
    loadOrderItems()
  }


  //load current food menu if element exists 
  if (foodMenuEl) {
    loadFoodMenu()
  }

  //load current drink menu if element exists
  if (drinkMenuEl) {
    loadDrinkMenu()
  }

  //load gallery images if element exists 
  if (galleryEl) {
    getImages()
  }
}



//function for loading drink menu items
async function loadDrinkMenu() {
  try {

    //fetch /drink with method GET
    const response = await fetch("https://pokeroserestaurant.onrender.com/drink", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      //clear innerHTML
      drinkMenuEl.innerHTML = "";
      const data = await response.json();

      let ulEl = document.createElement("ul")
      //create ul list for each drink item
      data.forEach(drink => {
        let liEl = document.createElement("li");
        liEl.innerHTML = `
  <p><strong>${drink.name}</strong> - ${drink.price}</p>`

        //create delete button used by Admin
        const button = document.createElement("button");
        button.textContent = "Delete";
        //on click, run function deleteDrinkItem with drink item _id
        button.addEventListener("click", () => deleteDrinkItem(drink._id));
        drinkMenuEl.appendChild(ulEl)
        liEl.appendChild(button);
        ulEl.appendChild(liEl);
        //if the menu has class .publicmenu, hide delete button
        if (publicMenuEl) { button.style.display = "none" }
      });
    } else {//if error
      console.error("Failed to fetch drink");
    }
  } catch (error) {
    console.error("Error fetching drink:", error);
  }
}


//function for loading food menu items
async function loadFoodMenu() {
  try {//fetch /food with method GET
    const response = await fetch("https://pokeroserestaurant.onrender.com/food", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (response.ok) {
      //clear current menu
      foodMenuEl.innerHTML = "";
      let ulEl = document.createElement("ul");
      const data = await response.json();
      //add ul list to menu for each food item
      data.forEach(food => {
        //create li element for item and button
        let liEl = document.createElement("li");
        liEl.innerHTML = `
  <p><strong>${food.name}</strong>  - ${food.price}<br> ${food.description}</p>`
        foodMenuEl.appendChild(ulEl)
        ulEl.appendChild(liEl)
        //add delete button with each item _id
        const btn = document.createElement("button");
        //if the menu has class .publicmenu, hide delete button
        if (publicMenuEl) { btn.style.display = "none" }
        btn.textContent = "Delete";
        btn.addEventListener("click", () => deleteFoodItem(food._id));
        liEl.appendChild(btn);


      });
    } else {//if error
      console.error("Failed to fetch food");
    }
  } catch (error) {
    console.error("Error fetching food:", error);
  }
}


async function loadOrderItems() {

 try {//get menu item names
    const res = await fetch('https://pokeroserestaurant.onrender.com/menu',
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

    const data = await res.json();
    const foodSelect = document.getElementById('choosefood');
    const drinkSelect = document.getElementById('choosedrink');

    //Clear option
    foodSelect.innerHTML = '<option value="">None</option>'
    drinkSelect.innerHTML = '<option value="">None</option>';

    //add food options
    data.food.forEach(item => {
      const option = document.createElement('option');
      option.value = item.name;
      option.textContent = item.name;
      foodSelect.appendChild(option);
    });

    // Add drink options
    data.drink.forEach(item => {
      const option = document.createElement('option');
      option.value = item.name;
      option.textContent = item.name;
      drinkSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading menu:', err);
  }
}

//function for creating new order
async function addOrder(e) {
  //prevent page refresh
  e.preventDefault()
 
//get the input from the form
let name = document.getElementById("name").value;
let phoneno = document.getElementById("phoneno").value;
let choosefood = document.getElementById("choosefood").value;
let choosedrink = document.getElementById("choosedrink").value;
let note = document.getElementById("note").value;

//if no name input or phone input, return
if (!name || !phoneno || !choosefood) {
  messagedivEl.innerHTML = `<p><strong>Please fill in at least your name, phone number and food to order</strong></p>`
   return;
} 



//create order object
let order = {
  name: name,
  phoneno: phoneno,
  food: choosefood,
  drink: choosedrink,
  note: note,
}

try { //send POST request with /order and order object
  const resp = await fetch("https://pokeroserestaurant.onrender.com/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(order)
  })
  if (resp.ok) { //if order is saved
    const data = await resp.json()
   messagedivEl.innerHTML = `<p><strong>Order placed! It will be ready for pick-up in about 10 minutes.</strong></p>`
    orderFormEl.reset()
  } else { //if error
    console.log("something went wrong" + error)
  }
} catch (error) {
  console.log("An error occured" + error)
}
};


//function for getting images from server
async function getImages() {
  try {//send GET request with /image
    const response = await fetch("https://pokeroserestaurant.onrender.com/image", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      //call function loadImages to load the data to page
      loadImages(data);
    } else {//if error
      console.error("Failed to fetch images");
    }
  } catch (error) {
    console.error("Error fetching images:", error);
  }
}


//function for loading images and inserting images in DOM
function loadImages(image) {
  //refresh gallery
  galleryEl.innerHTML = "";
  //for each passed image, create a div
  image.forEach(image => {
    const divEl = document.createElement("div");
    divEl.className = "image_div";
    //create IMG element and image URL with alt description inside divEl
    divEl.innerHTML = `
            ${image.imageurl ? `<img src="${image.imageurl}" alt="${image.description}">` : ""}
        `;
    //connect to DOM
    galleryEl.appendChild(divEl);
  });
}

