let worldSpecName = document.currentScript.dataset.world;
let persistenceKey = "lastScene";
let currentScene;

if (window.self != window.top) {
  /* global toolsContainer persistenceCheckbox */
  toolsContainer.style.visibility = "visible";

  if (sessionStorage[persistenceKey]) {
    persistenceCheckbox.checked = true;
  }

  persistenceCheckbox.onchange = () => {
    if (persistenceCheckbox.checked) {
      sessionStorage.setItem(persistenceKey, currentScene);
    } else {
      sessionStorage.removeItem(persistenceKey);
    }
  };
}

fetch(worldSpecName)
  .then(response => {
    return response.text();
  })
  .then(text => {
    setupInteraction(text);
  });

function setupInteraction(text) {
  console.clear();

  /* global startStory */
  let story = startStory(text);

  if (story === undefined) {
    console.error("The startStory returned undefined value!");
  }

  let { title, initialScene } = story;

  if (title === undefined) {
    console.error("Story had no title!");
  }

  if (initialScene === undefined) {
    console.error("Story had no initialScene!");
  }

  /* global titleContainer */
  titleContainer.innerText = title;

  if (sessionStorage.getItem(persistenceKey)) {
    currentScene = sessionStorage.getItem(persistenceKey);
    console.log(
      "Restoring scene",
      currentScene,
      "because you asked for state to be persisted."
    );
  } else {
    currentScene = initialScene;
  }
  updateDisplay();
}

function updateDisplay() {
  console.log("Showing scene:", currentScene);

  if (persistenceCheckbox.checked) {
    sessionStorage.setItem(persistenceKey, currentScene);
  }

  /* global startScene */
  let sceneObj = startScene(currentScene);
  if (sceneObj === undefined) {
    console.error(
      "The startScene function returned an undefined value for ",
      sceneObj
    );
  }

  let { imageUrl, caption, choices } = sceneObj;

  if (imageUrl === undefined) {
    console.error("Scene had no imageUrl");
  }

  if (caption === undefined) {
    console.error("Scene had no caption!");
  }

  if (choices === undefined) {
    console.error(
      "Scene had no choices! (If you want to indicate an ending scene, return an empty array, [], as the choices.)"
    );
  }

  /* global imageContainer */
  imageContainer.innerHTML = "";
  let img = document.createElement("img");
  img.src = imageUrl;
  img.title = currentScene;
  imageContainer.appendChild(img);

  /* global captionContainer */
  captionContainer.innerHTML = caption;

  /* global choicesContainer */
  choicesContainer.innerHTML = "";
  let ul = document.createElement("ul");

  if (choices.length > 0) {
    for (let item of choices) {
      let li = document.createElement("li");
      let a = document.createElement("a");
      a.href = "javascript:void(0);";
      let { text, target } = item;

      if (text === undefined) {
        console.error("Choice ", item, "had no text!");
      }

      if (target === undefined) {
        console.error("Choice ", item, "had no target!");
      }

      a.innerHTML = item.text;
      a.onclick = () => {
        currentScene = item.target;
        updateDisplay();
      };
      li.appendChild(a);
      ul.appendChild(li);
    }

    choicesContainer.appendChild(ul);
  } else {
    let a = document.createElement("a");
    a.href = "javascript:void(0);";
    a.classList.add("restartMessage");
    a.innerHTML = "The end. (Click to start story again.)";
    a.onclick = () => {
      window.location.reload();
    };
    choicesContainer.appendChild(a);
  }
}
