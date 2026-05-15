'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const messageList = document.querySelector("[data-message-list]");
const messageEmptyState = document.querySelector("[data-message-empty]");

const updateMessageBoardState = function () {
  if (!messageList || !messageEmptyState) return;

  const hasMessages = messageList.children.length > 0;
  messageEmptyState.classList.toggle("active", !hasMessages);
  messageList.classList.toggle("active", hasMessages);
}

const createMessageCard = function (messageData) {
  const article = document.createElement("article");
  article.className = "message-card";
  article.dataset.messageId = messageData.id;

  const header = document.createElement("div");
  header.className = "message-card-header";

  const identity = document.createElement("div");
  identity.className = "message-card-identity";

  const name = document.createElement("h4");
  name.className = "h4 message-card-name";
  name.textContent = messageData.fullName;

  const emailText = document.createElement("p");
  emailText.className = "message-card-email";
  emailText.textContent = messageData.email;

  identity.append(name, emailText);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "message-delete-btn";
  deleteBtn.type = "button";
  deleteBtn.textContent = "Delete";
  deleteBtn.setAttribute("aria-label", `Delete message from ${messageData.fullName}`);

  header.append(identity, deleteBtn);

  const body = document.createElement("p");
  body.className = "message-card-text";
  body.textContent = messageData.message;

  article.append(header, body);

  deleteBtn.addEventListener("click", async function () {
    deleteBtn.disabled = true;
    deleteBtn.textContent = "Deleting...";

    try {
      const response = await fetch(`/api/messages/${messageData.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Unable to delete message.");
      }

      article.remove();
      updateMessageBoardState();
    } catch (error) {
      deleteBtn.disabled = false;
      deleteBtn.textContent = "Delete";
      window.alert("Unable to delete the message right now. Please try again.");
    }
  });

  return article;
}

const renderMessages = function (messages) {
  if (!messageList) return;

  messageList.innerHTML = "";

  for (let i = 0; i < messages.length; i++) {
    messageList.append(createMessageCard(messages[i]));
  }

  updateMessageBoardState();
}

const loadMessages = async function () {
  if (!messageList) return;

  try {
    const response = await fetch("/api/messages");

    if (!response.ok) {
      throw new Error("Unable to load messages.");
    }

    const messages = await response.json();
    renderMessages(messages);
  } catch (error) {
    messageEmptyState.textContent = "Messages could not be loaded right now.";
    messageEmptyState.classList.add("active");
  }
}

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!form.checkValidity() || !messageList) return;

  const fullName = form.fullname.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  if (!fullName || !email || !message) return;

  formBtn.disabled = true;
  formBtn.querySelector("span").textContent = "Posting...";

  try {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fullName, email, message })
    });

    if (!response.ok) {
      throw new Error("Unable to save message.");
    }

    const savedMessage = await response.json();
    messageList.prepend(createMessageCard(savedMessage));
    updateMessageBoardState();

    form.reset();
  } catch (error) {
    window.alert("Unable to save the message right now. Please try again.");
  } finally {
    formBtn.setAttribute("disabled", "");
    formBtn.querySelector("span").textContent = "Send Message";
  }
});

loadMessages();
updateMessageBoardState();

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}
