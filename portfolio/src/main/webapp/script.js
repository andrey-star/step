function addRandomQuote() {
  const quotes = [
    `Now. Say my name. Heisenberg. You're god damn right`,
    "I am the danger.",
    `And on that terrible dissapointment I'm afraid it's time to end.`,
    "There’s a woman lying dead. Perfectly sound analysis but I was hoping you’d go deeper.",
    `You're treading on some mighty thin ice here.`,
  ];

  // Pick a random quote.
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  // Add it to the page.
  const quoteContainer = document.getElementById("quote-container");
  quoteContainer.innerText = quote;
}

function fetchComments() {
  const url = "/data";
  const params = {
    "comment-limit": commentLimitSelector.value,
    "comment-order": commentOrderSelector.value,
  };
  submitRequest(url, "GET", params)
    .then((response) => response.json())
    .then((comments) => {
      const commentContainer = document.getElementById("comments-container");
      commentContainer.innerHTML = "";
      for (let comment of comments) {
        const row = createElement(
          "div",
          commentContainer,
          "row",
          "align-items-center"
        );

        const colPara = createElement("div", row, "col-10", "mt-3");
        const para = createElement("p", colPara, "border-bottom", "h-100");
        para.key = comment.key;
        para.appendChild(document.createTextNode(comment.text));

        const colDeleteBtn = createElement("div", row, "col-2");
        const btnDelete = createElement(
          "button",
          colDeleteBtn,
          "btn",
          "btn-light"
        );
        btnDelete.onclick = function () {
          deleteComment(para.key);
        };

        const trashIcon = createElement("img", btnDelete);
        trashIcon.src = "images/trash.svg";
      }
    });
}

function createElement(name, parent, ...classes) {
  const element = document.createElement(name);
  for (let clazz of classes) {
    element.classList.add(clazz);
  }
  parent.appendChild(element);
  return element;
}

function submitComment() {
  submitFormUrlEncoded("/data", commentForm).then(() => {
    for (let i = 0; i < commentForm.length; i++) {
      if (commentForm[i].name === "user-comment") {
        commentForm[i].value = "";
      }
    }
    fetchComments();
  });

  // No redirect
  return false;
}

function submitFormUrlEncoded(url, form) {
  const params = {};
  for (let i = 0; i < form.length; i++) {
    const name = form[i].name;
    const value = form[i].value;
    if (name) {
      params[name] = value;
    }
  }
  return submitRequest(url, "POST", params);
}

function submitRequest(url, method, params = {}) {
  let requestBody = [];
  for (const [key, value] of Object.entries(params)) {
    requestBody.push(`${key}=${value}`);
  }
  requestBody = requestBody.join("&");
  let fetchOptions = {};
  if (method === "GET") {
    url += `?${requestBody}`;
  } else if (method === "POST") {
    fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestBody,
    };
  }
  return fetch(url, fetchOptions);
}

function deleteComment(id) {
  const url = "/delete-data";
  postRequestUrlEncoded(url, { "comment-key": id }).then(() => fetchComments());
}

function deleteAllComments() {
  if (confirm("Are you sure you want to delete all comments?")) {
    const url = "/delete-data";
    postRequestUrlEncoded(url).then(() => fetchComments());
  }
}

function getLoginStatus() {
  const url = "/login-status";
  fetch(url).then((response) => response.json());
}

let commentForm;
let commentLimitSelector;
let commentOrderSelector;

window.onload = function () {
  commentLimitSelector = document.getElementById("comment-limit-selector");
  commentLimitSelector.onchange = fetchComments;

  commentOrderSelector = document.getElementById("comment-order-selector");
  commentOrderSelector.onchange = fetchComments;

  commentForm = document.getElementById("comment-form");
  commentForm.onsubmit = submitComment;

  fetchComments();
};
