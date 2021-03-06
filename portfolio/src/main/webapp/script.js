function fetchComments() {
  const url = '/data';
  const params = {
    'comment-limit': commentLimitSelector.value,
    'comment-order': commentOrderSelector.value,
  };
  submitRequest(url, 'GET', params)
    .then((response) => response.json())
    .then((comments) => {
      const commentContainer = document.getElementById('comments-container');
      commentContainer.innerHTML = '';
      for (let comment of comments) {
        const commentRow = createElement(
          'div',
          commentContainer,
          'row',
          'align-items-center',
        );

        const textCol = createElement('div', commentRow, 'col-8', 'mt-3');
        const text = createElement('p', textCol, 'border-bottom', 'h-100');
        text.key = comment.key;
        text.appendChild(document.createTextNode(comment.text));

        const authorCol = createElement('div', commentRow, 'col-3');
        const info = createElement('p', authorCol, 'text-right', 'mt-3');
        let authorName = '-';
        if (comment.email && comment.email !== '') {
          authorName = comment.email;
        }
        if (comment.username && comment.username !== '') {
          authorName = comment.username;
        }
        info.appendChild(document.createTextNode(authorName));
        info.appendChild(document.createElement('br'));
        const time = createElement('small', info);
        time.appendChild(
          document.createTextNode(getDateFromTimestamp(comment.timestamp)),
        );

        const deleteBtnCol = createElement('div', commentRow, 'col-1');
        const deleteBtn = createElement(
          'button',
          deleteBtnCol,
          'btn',
          'btn-light',
        );
        deleteBtn.onclick = function () {
          deleteComment(text.key);
        };

        const trashIcon = createElement('img', deleteBtn);
        trashIcon.src = 'images/trash.svg';
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
  getLoginStatus().then((status) => {
    if (status.isLoggedIn) {
      submitFormUrlEncoded('/data', commentForm).then(() => {
        for (let i = 0; i < commentForm.length; i++) {
          if (commentForm[i].name === 'user-comment') {
            commentForm[i].value = '';
          }
        }
        fetchComments();
      });
    } else {
      // Redirect to auth page
      window.location.href = status.authUrl;
    }
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
  return submitRequest(url, 'POST', params);
}

function submitRequest(url, method, params = {}) {
  let requestBody = [];
  for (const [key, value] of Object.entries(params)) {
    requestBody.push(`${key}=${value}`);
  }
  requestBody = requestBody.join('&');
  let fetchOptions = {};
  if (method === 'GET') {
    url += `?${requestBody}`;
  } else if (method === 'POST') {
    fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    };
  }
  return fetch(url, fetchOptions);
}

function deleteComment(id) {
  const url = '/delete-data';
  submitRequest(url, 'POST', { 'comment-key': id }).then(() => fetchComments());
}

function deleteAllComments() {
  if (confirm('Are you sure you want to delete all comments?')) {
    const url = '/delete-data';
    submitRequest(url, 'POST').then(() => fetchComments());
  }
}

function updateAuthInfo() {
  getLoginStatus().then((status) => {
    authLink.href = status.authUrl;
    authButton.innerText = status.isLoggedIn ? 'Logout' : 'Login';
  });
}

function getLoginStatus() {
  const url = '/login-status';
  return fetch(url).then((response) => response.json());
}

function getDateFromTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString('en-GB');
}

google.charts.load('current', { packages: ['line'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
  fetch('/memes-data')
    .then((response) => response.json())
    .then((memes) => {
      const data = new google.visualization.DataTable();
      data.addColumn('string', memes[0][0]);
      data.addColumn('number', memes[0][1]);
      data.addColumn('number', memes[0][2]);
      data.addColumn('number', memes[0][3]);
      data.addColumn('number', memes[0][4]);
      data.addColumn('number', memes[0][5]);
      for (let i = 1; i < memes.length; i++) {
        data.addRow(memes[i]);
      }
      const options = {
        chart: {
          title: 'Meme Popularity',
        },
      };

      const chart = new google.charts.Line(
        document.getElementById('chart-container'),
      );
      chart.draw(data, google.charts.Line.convertOptions(options));
    });
}

let commentForm;
let commentLimitSelector;
let commentOrderSelector;
let authLink;
let authButton;

function setup() {
  commentLimitSelector = document.getElementById('comment-limit-selector');
  commentLimitSelector.onchange = fetchComments;

  commentOrderSelector = document.getElementById('comment-order-selector');
  commentOrderSelector.onchange = fetchComments;

  commentForm = document.getElementById('comment-form');
  commentForm.onsubmit = submitComment;

  fetchComments();

  authLink = document.getElementById('auth-link');
  authButton = document.getElementById('auth-button');
  updateAuthInfo();
}

document.addEventListener('DOMContentLoaded', setup);
