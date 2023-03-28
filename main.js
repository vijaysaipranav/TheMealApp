// Selecting necessary elements from the HTML document
const searchForm=document.querySelector('form');
const searchResultDiv=document.querySelector('.search-result');
const searchinput=document.querySelector('.search-input');
const title=document.querySelector('.brand')
const container=document.querySelector('.container');
const favIcon=document.getElementById('favIcon');
const closeFav=document.getElementById('closeFav');
const favoriteContainer = document.getElementById("fav-meals");
const ScreenResult = document.getElementById("result");
const searchInput = document.querySelector(".search-input input");
const suggestionBox = document.querySelector(".autocom-box");
// we are calling the fetchFavMeals function so that it loads up the favorite meals when the page loads; 
fetchFavMeals();
// this function 
function generateMealItems(results,searchQuery) {
  this.results=results;
  this.searchQuery=searchQuery;
  let generatedHTML = '';
  results.map(result=>
      generatedHTML+=
      `
      <div class="item">
          <img src="${result.strMealThumb}" alt="${result.strMeal}">
          <div class="flex-container">
              <h3 class="title">${result.strMeal}</h3>
              <div class="meal-body">
                  <button class="btn" value ="${result.strMeal}">More details</button>
                  <button class="fav-btn " value="${result.idMeal}">&#9829;</button>
              </div>
          </div>
      </div>
  `
  ).join("");
  searchResultDiv.innerHTML=generatedHTML;

}

async function fetchFavMeals() {
  favoriteContainer.innerHTML = "";

  const mealIds = getMealsLS();

  for (let i=1 ;i<mealIds.length ;i++) {
      const mealId = mealIds[i];
      console.log(mealId);
      let meal = await getMealById(mealId);
      addMealFav(meal);
  }
}

function addMealFav(mealData) {
const favMeal = document.createElement("li");

favMeal.innerHTML = `
    
    <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"/><span>${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>`;

let btn = favMeal.querySelector(".clear");

btn.addEventListener("click", (e) => {
  e.stopPropagation();
    removeMealLS(mealData.idMeal);
    
    fetchFavMeals();
});

favMeal.addEventListener("click", () => {

    getRecipe(mealData.strMeal);
    searchResultDiv.style.display="none";
    searchinput.style.display="none";
    title.style.display="none";
    ScreenResult.style.display="block";
});

favoriteContainer.appendChild(favMeal);
}

function addMealLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
const mealIds = getMealsLS();
  localStorage.setItem(
      "mealIds",
      JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));
  console.log(mealIds);
  return mealIds === null ? [] : mealIds;
}

async function getRecipe(name){
    let myMeal = await getMealByName(name);
    let count = 1;
    let ingredients = [];
    for (let i in myMeal) {
      let ingredient = "";
      let measure = "";
      if (i.startsWith("strIngredient") && myMeal[i]) {
        ingredient = myMeal[i];
        measure = myMeal[`strMeasure` + count];
        count += 1;
        ingredients.push(`${measure} ${ingredient}`);
      }
    }
    console.log(ingredients);

    ScreenResult.innerHTML = `
      <button id="back-btn"><strong>Back</strong></button>
      <img id="item-image"src=${myMeal.strMealThumb}>
      <div class="details">
        <h2>${myMeal.strMeal}</h2>
        <h4>${myMeal.strArea}</h4>
        <h2>Ingredients Required</h2>
      </div>
      <div id="ingredient-con"></div>
      <div id="recipe">
        <button id="hide-recipe"><strong>X</strong></button>
        <h2 class="instructions">Recipe of ${myMeal.strMeal} </h2>
        <pre class="instructions">${myMeal.strInstructions}</pre>
      </div>
      <button id="show-recipe"><strong>View Recipe</strong></button>
      `;
    let ingredientCon = document.getElementById("ingredient-con");
    let parent = document.createElement("ul");
    let recipe = document.getElementById("recipe");
    let hideRecipe = document.getElementById("hide-recipe");
    let showRecipe = document.getElementById("show-recipe");
    let backBtn = document.getElementById("back-btn");

    ingredients.forEach((i) => {
      let child = document.createElement("li");
      child.innerText = i;
      parent.appendChild(child);
      ingredientCon.appendChild(parent);
    });
    backBtn.addEventListener("click", () => {
      ScreenResult.style.display = "none";
      searchResultDiv.style.display = "flex";
      searchinput.style.display="block";
      title.style.display="block";
    });
    hideRecipe.addEventListener("click", () => {
      recipe.style.display = "none";
    });
    showRecipe.addEventListener("click", () => {
      window.scrollTo(0, 0);
      recipe.style.display = "inline-block";
      
    });

}

async function getMealByName(name){
  const response=await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`);
  const data=await response.json();
  const results=data.meals[0];
  return results;
}
async function getMealById(id) {
  const resp = await fetch(
      "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}


favIcon.addEventListener('click',function(){
document.getElementById("mySidenav").style.width = "30%";
document.getElementById("main").style.marginLeft = "30%";


}) ;
closeFav.addEventListener('click',function(){
document.getElementById("mySidenav").style.width = "0%";
document.getElementById("main").style.marginLeft = "0%";

}) ;


searchForm.addEventListener('submit',async (e)=>{
  
  e.preventDefault();
  let searchQuery=e.target.querySelector('input').value;
  const url=`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`;
  const response=await fetch(url);
  const data=await response.json();
  const results=data.meals;

  generateMealItems(results,searchQuery);

  let favBtn = document.querySelectorAll('.fav-btn');
  favBtn.forEach((favBtn)=>{
      favBtn.addEventListener('click',async (e)=>{
          
          let mealId = e.target.value;
            let mealData = await getMealById(mealId);
          console.log(mealData);
          if (favBtn.classList.contains("active")) {
            removeMealLS(mealData.idMeal);
            favBtn.classList.remove("active");
        } else {
            addMealLS(mealData.idMeal);
            favBtn.classList.add("active");
        }
        fetchFavMeals();
      })
  })
  let Btn = document.querySelectorAll('.btn');

  Btn.forEach((Btn)=>{
      Btn.addEventListener('click',async function handleclick(event){
          let info=event.target.value;
          await getRecipe(info);  
          window.scrollTo(0, 0);
          searchResultDiv.style.display="none";
          searchinput.style.display="none";
          title.style.display="none";
          ScreenResult.style.display="block";
          
            
      })

  })

  

 
});
searchInput.addEventListener("input", async (event) => {
  const searchQuery = event.target.value.trim();
  if (searchQuery.length < 2) {
    suggestionBox.innerHTML = "";
    return;
  }
  const url = "https://www.themealdb.com/api/json/v1/1/search.php?f=";
  const response = await fetch(url+searchQuery[0]);
  const data = await response.json();
  const meals = data.meals || [];
  const suggestions = meals.map((meal) => meal.strMeal);
  suggestionBox.innerHTML = suggestions.map(
    (suggestion) => `<li>${suggestion}</li>`
  ).join("");
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const selectedSuggestion = suggestionBox.querySelector(".selected");
    if (selectedSuggestion) {
      searchInput.value = selectedSuggestion.textContent;
      suggestionBox.innerHTML = "";
    }
  }
});

suggestionBox.addEventListener("click", (event) => {
  const clickedSuggestion = event.target.closest("li");
  if (clickedSuggestion) {
    searchInput.value = clickedSuggestion.textContent;
    suggestionBox.innerHTML = "";
  }
});

suggestionBox.addEventListener("mousemove", (event) => {
  const hoveredSuggestion = event.target.closest("li");
  if (hoveredSuggestion) {
    const selectedSuggestion = suggestionBox.querySelector(".selected");
    if (selectedSuggestion) {
      selectedSuggestion.classList.remove("selected");
    }
    hoveredSuggestion.classList.add("selected");
  }
});




  
