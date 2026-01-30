

import '../style.scss';
import '../admin.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init();
/*
This Javascript file is for Admin purposes on the Admin page,
you must be logged in to get a personal JSON Web Token saved in localstorage 
to be able to access the API calls.
 */

//declaring variables for elements in DOM
const imageFormEl = document.getElementById('imageForm');
const loginFormEl = document.getElementById("loginForm");
const currentOrdersEl = document.getElementById("currentOrders")
const foodFormEl = document.getElementById("foodForm")
const drinkFormEl = document.getElementById("drinkForm")
const galleryEl = document.getElementById("gallery");
const foodMenuEl = document.getElementById("foodMenu")
const drinkMenuEl = document.getElementById("drinkMenu")
const logoutEl = document.getElementById("logout");
//run on load
window.onload = init



function init() {
  //Event listener for image form

  if (logoutEl) {
    logoutEl.addEventListener("click", () => {
      localStorage.removeItem("JWT_token")
      window.location.href = "login.html";
    })
  }

  if (imageFormEl) {
    imageFormEl.addEventListener("submit", newImage);
  }

  if (loginFormEl) {
    //Event listener for login form
    loginFormEl.addEventListener("submit", login);
  }

  if (foodFormEl) {
    //Eventlistener for add food form
    foodFormEl.addEventListener("submit", addFoodItem)
  }

  if (drinkFormEl) {
    //Eventlistener for add drink form
    drinkFormEl.addEventListener("submit", addDrinkItem)
  }

  //load current orders if element exists 
  if (currentOrdersEl) {
    loadOrders()
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


//function for deleting drink from menu
async function deleteDrinkItem(drinkId) {
  //confirm delete
  const confirmDelete = confirm("Are you sure you want to delete this item from the menu?");
  if (!confirmDelete) return;

  try { //send request /drink:_id with passed drinkId 
    const resp = await fetch(`https://pokeroserestaurant.onrender.com/drink/${drinkId}`, {
      method: "DELETE",
      headers: { //JSON Web Token required
        "authorization": `Bearer ${localStorage.getItem("JWT_token")}`
      }
    });

    if (resp.ok) {
      //refresh the list
      loadDrinkMenu();

    } else {//if error
      alert("Failed to delete drink item.");
    }
  } catch (err) {
    console.error("Error deleting item:", err);
    alert("An error occurred.");
  }
}

//function for deleting food menu item
async function deleteFoodItem(foodId) {
  //confirm delete
  const confirmDelete = confirm("Are you sure you want to delete this item from the menu?");
  if (!confirmDelete) return;

  try { //fetch /food_:id with passed foodId with method DELETE
    const resp = await fetch(`https://pokeroserestaurant.onrender.com/food/${foodId}`, {
      method: "DELETE",
      headers: { //JSON Web Token required
        "authorization": `Bearer ${localStorage.getItem("JWT_token")}`
      }
    });

    if (resp.ok) {
      //refresh food list 
      loadFoodMenu();

    } else {  //if error
      alert("Failed to delete food item.");
    }

  } catch (err) {
    console.error("Error deleting item:", err);
    alert("An error occurred.");
  }
};

//function for adding drink item to drink menu
async function addDrinkItem(e) {
  //prevent refresh
  e.preventDefault()

  //get the input from the form
  let drinkname = document.getElementById("drinkname").value;
  let drinkprice = document.getElementById("drinkprice").value;

  //if no input, return
  if (!drinkname || !drinkprice) {
    alert("Please fill in item name and price")
    return;
  }

  //create drink object
  let drink = {
    name: drinkname,
    price: drinkprice,

  }

  try { //request POST /drink  with drink object
    const resp = await fetch("https://pokeroserestaurant.onrender.com/drink", {
      method: "POST",
      headers: { //JSON Web Token required
        "Authorization": `Bearer ${localStorage.getItem("JWT_token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(drink)
    })
    if (resp.ok) {
      const data = await resp.json()
      alert("Drink item added to menu!")
      drinkFormEl.reset()
      //refresh drink menu
      loadDrinkMenu()
    } else { //if error
      console.log("something went wrong" + error)
    }
  } catch (error) {
    console.log("An error occured" + error)
  }
}


//function for adding food item to food menu
async function addFoodItem(e) {
  //prevent page refresh
  e.preventDefault()
  //get the input from the form
  let foodname = document.getElementById("foodname").value;
  let foodprice = document.getElementById("foodprice").value;
  let description = document.getElementById("description").value;

  //If all fields aren't filled in, return
  if (!foodname || !foodprice || !description) {
    alert("Please fill in item name, price and description")
    return;
  }

  //Create food object
  let food = {
    name: foodname,
    price: foodprice,
    description: description,
  }

  try { //send POST request with /food and food object
    const resp = await fetch("https://pokeroserestaurant.onrender.com/food", {
      method: "POST",
      headers: { //JSON Web Token required
        "Authorization": `Bearer ${localStorage.getItem("JWT_token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(food)
    })
    if (resp.ok) {

      const data = await resp.json()
      alert("Food item added to menu!")
      foodFormEl.reset()
      //refresh food menu
      loadFoodMenu()
    } else {//if error
      console.log("something went wrong" + error)
    }
  } catch (error) {
    console.log("An error occured" + error)
  }
}

//function for loading current orders
async function loadOrders() {
  try { //Fetch /order with method GET
    const response = await fetch("https://pokeroserestaurant.onrender.com/order", {
      method: "GET",
      headers: { //JSON Web Token required
        Authorization: `Bearer ${localStorage.getItem("JWT_token")}`,
        "Content-Type": "application/json"
      }
    });

    //if ok
    if (response.ok) {

      const data = await response.json();
      //refresh listconsole.log(data)
      currentOrdersEl.innerHTML = "";
      let ulEl = document.createElement("ul")
      //sort orders so newest order shows up first
      const sortedOrders = data.sort((a, b) => new Date(b.created) - new Date(a.created));
      //for each order, create list 
      sortedOrders.forEach(order => {
        let liEl = document.createElement("li")

        liEl.innerHTML = `
  <p>
    <strong>Created at: </strong>${new Date(order.created).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Stockholm'
        })}<br>
    <strong>Name:</strong> ${order.name} <br>
    <strong>Phone:</strong> ${order.phoneno} <br><br>
    <strong>Food:</strong> ${order.food} <br>
    <strong>Drink:</strong> ${order.drink} <br><br>
    <strong>Other / Note:</strong> ${order.note}
  </p>`;
        //add delete button which calls deleteOrder with _id of order
        const btn = document.createElement("button");
        btn.textContent = "Delete";
        btn.addEventListener("click", () => deleteOrder(order._id));
        //connect DOM
        currentOrdersEl.appendChild(ulEl)
        ulEl.appendChild(liEl)
        liEl.appendChild(btn)

      });
    } else {//if error
      console.error("Failed to fetch orders");
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}


//function for deleting an order by orderId
async function deleteOrder(orderId) {
  //confirm delete
  const confirmDelete = confirm("Are you sure you want to delete this order?");
  if (!confirmDelete) return;

  try { //Fetch /order/:_ID with method DELETE
    const resp = await fetch(`https://pokeroserestaurant.onrender.com/order/${orderId}`, {
      method: "DELETE",
      headers: { //JSON Web Token required
        "authorization": `Bearer ${localStorage.getItem("JWT_token")}`
      }
    });

    if (resp.ok) {
      //refresh order list
      loadOrders();

    } else { //if error
      alert("Failed to delete order.");
    }
  } catch (err) {
    console.error("Error deleting order:", err);
    alert("An error occurred.");
  }
}




/*function to upload new image, requires authentication token.
Cloudinary and Multer for storing and creating cloud URL is being used in backend*/
async function newImage(e) {
  //prevent page refresh
  e.preventDefault();

  //get file and input from form element
  const imageDescriptionEl = document.getElementById("imagedescription").value;
  const imageEl = document.getElementById("image").files[0];

  //if any input is empty, return
  if (!imageDescriptionEl || !imageEl) {
    alert("Please choose an image and description");
    return;
  }
  //create formData to send in request
  const formData = new FormData();
  formData.append("description", imageDescriptionEl);
  formData.append("image", imageEl);

  try { //send POST request with route /image
    const resp = await fetch("https://pokeroserestaurant.onrender.com/image", {
      method: "POST",
      headers: { //requires JSON Web token
        Authorization: `Bearer ${localStorage.getItem("JWT_token")}`,
      }, //send formData
      body: formData
    });

    if (resp.ok) { //if response ok, imageurl and description created and saved to server
      const data = await resp.json();
      alert("Image created");
      imageFormEl.reset()
      getImages()

    } else {//if error, file size might be too big (max 5MB)
      console.error("Create post failed", await resp.json());
      alert("Something went wrong, the image might be too big. Max 5MB is allowed");
    }
  } catch (error) {
    console.error("Post error:", error);
    alert("Something went wrong, the image might be too big. Max 5MB is allowed");
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
      drinkMenuEl.innerHTML = "<h3>Drink menu</h3>";
      const data = await response.json();

      let ulEl = document.createElement("ul")
      //create ul list for each drink item
      data.forEach(drink => {
        let liEl = document.createElement("li");
        liEl.id = "menuLi"
        liEl.innerHTML = `
  <p><strong>${drink.name} - ${drink.price}</strong<</p>`

        //create delete button used by Admin
        const deletebutton = document.createElement("button");
        deletebutton.textContent = "Delete";
        //on click, run function deleteDrinkItem with drink item _id
        deletebutton.addEventListener("click", () => deleteDrinkItem(drink._id));
        drinkMenuEl.appendChild(ulEl)
        liEl.appendChild(deletebutton);
        ulEl.appendChild(liEl);
        //create update button
        const updatebutton = document.createElement("button");
        updatebutton.textContent = "Update";

        //on click, run function updateeDrinkItem with drink item _id
        updatebutton.addEventListener("click", () => {
          let updateFormEl = document.createElement("form")
          updateFormEl.id = "updateForm";
          updateFormEl.innerHTML = `  
  <label for="name">Drink Name:</label>
  <input type="text" id="drinkName" name="name" value="${drink.name}" />

  <label for="price">Price:</label>
  <input type="string" id="drinkPrice" name="price" value="${drink.price}"/>

  <button id="confirmUpdateButton" type="submit">Update Drink</button>`
          liEl.innerHTML = ""
          liEl.appendChild(updateFormEl)
          updateFormEl.addEventListener("submit", (e) => {
            updateDrinkItem(e, drink._id)
          });


        });
        drinkMenuEl.appendChild(ulEl)
        liEl.appendChild(updatebutton);
        ulEl.appendChild(liEl);
      });
    } else {//if error
      console.error("Failed to fetch drink");
    }
  } catch (error) {
    console.error("Error fetching drink:", error);
  }
}



async function updateDrinkItem(e, drinkID) {
  e.preventDefault()
  let drinkname = document.getElementById("drinkName").value
  let drinkprice = document.getElementById("drinkPrice").value

  let drink = {
    name: drinkname,
    price: drinkprice,
    _id: drinkID,
  }
  try {
    const response = await fetch(`https://pokeroserestaurant.onrender.com/drink/${drinkID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("JWT_token")}`,
      },
      body: JSON.stringify(drink),
    });

    if (response.ok) {
      const data = await response.json();
      loadDrinkMenu()
    } else {
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
      foodMenuEl.innerHTML = "<h3>Food menu</h3>";
      let ulEl = document.createElement("ul");

      const data = await response.json();
      //add ul list to menu for each food item
      data.forEach(food => {
        //create li element for item and button
        let liEl = document.createElement("li");
        liEl.id = "foodmenuLi"
        let updateFoodButton = document.createElement("button")
        liEl.innerHTML = `
  <p><strong>${food.name} - ${food.price}</strong> <br> ${food.description}</p>`
        foodMenuEl.appendChild(ulEl)
        ulEl.appendChild(liEl)
        //add delete button with each item _id
        const deletebutton = document.createElement("button");
        deletebutton.textContent = "Delete";
        updateFoodButton.textContent = "Update";
        deletebutton.addEventListener("click", () => deleteFoodItem(food._id));
        updateFoodButton.addEventListener("click", () => {
          let updateFoodFormEl = document.createElement("form")
          updateFoodFormEl.id = "updateFoodForm";
          updateFoodFormEl.innerHTML = `  
  <label for="foodName">Food Name:</label>
  <input type="text" id="foodName" name="foodName" value="${food.name}" />

  <label for="foodPrice">Price:</label>
  <input type="string" id="foodPrice" name="foodPrice" value="${food.price}"/>
<label for="updateDescription">Description:</label>
  <textarea id="updateDescription" name="updateDescription">${food.description}</textarea>
  
  <button id="confirmFoodButton" type="submit">Update Food</button>`
 liEl.innerHTML = ""
  liEl.appendChild(updateFoodFormEl)
  liEl.addEventListener("submit", (e) => {
    updateFoodItem(e, food._id)
  });})
        liEl.appendChild(deletebutton);
        liEl.appendChild(updateFoodButton)

      });
    } else {//if error
      console.error("Failed to fetch food");
    }
  } catch (error) {
    console.error("Error fetching food:", error);
  }
}


async function updateFoodItem(e, foodID) {
  e.preventDefault()
  let foodName = document.getElementById("foodName").value
  let foodPrice = document.getElementById("foodPrice").value
  let description = document.getElementById("updateDescription").value

  let food = {
    name: foodName,
    description: description,
    price: foodPrice,
    _id: foodID,
  }
  try {
    const response = await fetch(`https://pokeroserestaurant.onrender.com/food/${foodID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("JWT_token")}`,
      },
      body: JSON.stringify(food),
    });

    if (response.ok) {
      const data = await response.json();
      loadFoodMenu()
    } else {
      console.error("Failed to fetch food");
    }
  } catch (error) {
    console.error("Error fetching food:", error);
  }
}


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
            ${image.imageurl ? `<img id="galleryitem" src="${image.imageurl}" alt="${image.description}">` : ""}
        <p>Description: ${image.description}</p>`;
    let deletebutton = document.createElement("button")
    deletebutton.textContent = "Delete"
    deletebutton.addEventListener("click", () => deleteImage(image._id));
    //connect to DOM
    divEl.appendChild(deletebutton)
    galleryEl.appendChild(divEl);
  });
}

async function deleteImage(imageID) {
  //confirm delete
  const confirmDelete = confirm("Are you sure you want to delete this image?");
  if (!confirmDelete) return;

  try { //Fetch /order/:_ID with method DELETE
    const resp = await fetch(`https://pokeroserestaurant.onrender.com/image/${imageID}`, {
      method: "DELETE",
      headers: { //JSON Web Token required
        "authorization": `Bearer ${localStorage.getItem("JWT_token")}`
      }
    });

    if (resp.ok) {
      //refresh order list
      getImages();

    } else { //if error
      alert("Failed to delete image.");
    }
  } catch (err) {
    console.error("Error deleting image:", err);
    alert("An error occurred.");
  }
}
//function for logging in user, fetch for validation and get JWT token to access hidden pages
async function login(e) {
  //prevent page refresh
  e.preventDefault()
  //get input values from form
  let nameinput = document.getElementById("username").value;
  let passwordinput = document.getElementById("password").value;

  //check if the user has filled in all the fields
  if (!nameinput || !passwordinput) {
    alert("Please fill in all fields")
    return;
  }

  //create a user object with the username and password
  let admin = {
    username: nameinput,
    password: passwordinput
  }
  try {
    //send a POST request to the server with the user object
    const resp = await fetch("https://pokeroserestaurant.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(admin)
    })
    if (resp.ok) {

      const data = await resp.json()
      //set the JWT token in local storage
      localStorage.setItem("JWT_token", data.token)
      //write logged in user to DOM
      let loggedinuserEl = document.getElementById("loggedinuser")
      console.log(data)
      loggedinuserEl.innerHTML = `<p>logged in as: ${data.admin.username}</p>`

      window.location.href = "/adminorders.html"
    } else { //if error
      alert("Wrong username or password")
    }
  } catch (error) {
    console.error("Error logging in:", error)
    alert("An error occured. Please try again")
  }
}
