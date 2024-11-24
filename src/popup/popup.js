document.addEventListener("DOMContentLoaded", () => {
  const menuProfile = document.getElementById("menu-profile");
  const menuSettings = document.getElementById("menu-settings");
  const keyValueManager = document.getElementById("key-value-manager");
  const profileSection = document.getElementById("profile");
  const settingsSection = document.getElementById("settings");

  // Event-Listener for menu
  menuProfile.addEventListener("click", () => {
    showSection("profile");
  });

  menuSettings.addEventListener("click", () => {
    showSection("settings");
  });

  // Function to switch visibility
  function showSection(section) {
    keyValueManager.style.display = section === "key-value" ? "block" : "none";
    profileSection.style.display = section === "profile" ? "block" : "none";
    settingsSection.style.display = section === "settings" ? "block" : "none";
  }

  // Show default Key-Value-Manager
  showSection("key-value");

  // Key-Value-Manager functions
  const form = document.getElementById("kv-form");
  const list = document.getElementById("kv-list");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const key = document.getElementById("key").value.trim();
    const value = document.getElementById("value").value.trim();

    if (key && value) {
      const storedData = await browser.storage.local.get("pairs");
      const pairs = storedData.pairs || [];
      pairs.push({ key, value });

      await browser.storage.local.set({ pairs });

      document.getElementById("key").value = "";
      document.getElementById("value").value = "";

      renderPairs();
    }
  });

  async function renderPairs() {
    const storedData = await browser.storage.local.get("pairs");
    const pairs = storedData.pairs || [];
    list.innerHTML = "";

    pairs.forEach(({ key, value }, index) => {
      const item = document.createElement("div");
      item.classList.add("kv-item");
      item.innerHTML = `
        <input type="text" class="key-input" value="${key}" data-index="${index}" disabled>
        <input type="text" class="value-input" value="${value}" data-index="${index}" disabled>
        <button data-index="${index}" class="edit-btn">Bearbeiten</button>
        <button data-index="${index}" class="save-btn" style="display: none;">Speichern</button>
        <button data-index="${index}" class="delete-btn">Löschen</button>
      `;
      list.appendChild(item);
    });

    addEventListeners();
  }

  function addEventListeners() {
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const index = parseInt(button.getAttribute("data-index"));
        toggleEditMode(index, true);
      });
    });

    document.querySelectorAll(".save-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const index = parseInt(button.getAttribute("data-index"));
        const keyInput = document.querySelector(`.key-input[data-index="${index}"]`);
        const valueInput = document.querySelector(`.value-input[data-index="${index}"]`);

        const key = keyInput.value.trim();
        const value = valueInput.value.trim();

        if (key && value) {
          const storedData = await browser.storage.local.get("pairs");
          const pairs = storedData.pairs || [];

          pairs[index] = { key, value };
          await browser.storage.local.set({ pairs });

          toggleEditMode(index, false);
          renderPairs();
        }
      });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const index = parseInt(button.getAttribute("data-index"));
        const storedData = await browser.storage.local.get("pairs");
        const pairs = storedData.pairs || [];

        pairs.splice(index, 1);
        await browser.storage.local.set({ pairs });
        renderPairs();
      });
    });
  }

  function toggleEditMode(index, isEditing) {
    const keyInput = document.querySelector(`.key-input[data-index="${index}"]`);
    const valueInput = document.querySelector(`.value-input[data-index="${index}"]`);
    const editButton = document.querySelector(`.edit-btn[data-index="${index}"]`);
    const saveButton = document.querySelector(`.save-btn[data-index="${index}"]`);

    if (isEditing) {
      keyInput.disabled = false;
      valueInput.disabled = false;
      editButton.style.display = "none";
      saveButton.style.display = "inline";
    } else {
      keyInput.disabled = true;
      valueInput.disabled = true;
      editButton.style.display = "inline";
      saveButton.style.display = "none";
    }
  }

  renderPairs();
});

document.addEventListener("DOMContentLoaded", () => {
  const menuProfile = document.getElementById("menu-profile");
  const menuSettings = document.getElementById("menu-settings");
  const keyValueManager = document.getElementById("key-value-manager");
  const profileSection = document.getElementById("profile");
  const settingsSection = document.getElementById("settings");
  const selectedPathDisplay = document.getElementById("selected-path");
  const settingsForm = document.getElementById("settings-form");
  const folderPathInput = document.getElementById("folder-path");

  // Event-Listener für Menü
  menuProfile.addEventListener("click", () => {
    showSection("profile");
  });

  menuSettings.addEventListener("click", () => {
    showSection("settings");
  });

  // Swtich visibilty
  function showSection(section) {
    keyValueManager.style.display = section === "key-value" ? "block" : "none";
    profileSection.style.display = section === "profile" ? "block" : "none";
    settingsSection.style.display = section === "settings" ? "block" : "none";
  }

  // Show default Key-Value-Manager
  showSection("key-value");

  // Save local path
  settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const files = folderPathInput.files;
    if (files.length > 0) {
      const path = files[0].webkitRelativePath.split("/")[0]; // main folder name
      await browser.storage.local.set({ selectedPath: path });
      updateSelectedPath(path);
    }
  });

  // Show selected path
  async function updateSelectedPath(path) {
    selectedPathDisplay.textContent = `Ausgewählter Pfad: ${path}`;
  }

  // Init display saved path
  async function loadSavedPath() {
    const storedData = await browser.storage.local.get("selectedPath");
    const path = storedData.selectedPath || "No path selected";
    updateSelectedPath(path);
  }

  loadSavedPath();
});

document.addEventListener("DOMContentLoaded", () => {
  // prev code unchanged

  const downloadButton = document.createElement("button");
  downloadButton.textContent = "JSON speichern";
  document.body.appendChild(downloadButton);

  downloadButton.addEventListener("click", async () => {
    const storedData = await browser.storage.local.get("pairs");
    const pairs = storedData.pairs || [];

    // Create JSON file
    const jsonData = JSON.stringify(pairs, null, 2);

    // call saved path
    const pathData = await browser.storage.local.get("selectedPath");
    const selectedPath = pathData.selectedPath || "default_folder";

    // create file and path
    const filename = `${selectedPath}/key_value_data.json`;

    // send json-file for downlaod
    downloadJSON(jsonData, filename);
  });

  // Function download JSON-file
  function downloadJSON(data, filename) {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url); // revoke physical space
  }
});
