var socket = io();

//elements
const form = document.querySelector("form");
const inputMessage = document.querySelector("#input-message");
const btnSentLocation = document.querySelector("#btn-location");
const btnSubmit = document.querySelector("#btn-submit");
const message = document.querySelector("#message");

//template
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options
const { userName, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//autoscroll

const autoscroll = () => {
  //new message element
  const newMessage = message.lastElementChild;

  //height of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = message.offsetHeight;

  //height of message container
  const containerHeight = message.scrollHeight;

  //how far have I scrolled?
  const scrollOffset = message.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    message.scrollTop = message.scrollHeight;
  }
};

socket.on("roomData", ({ room, users }) => {
  // console.log(room, users);
  const html = Mustache.render(sidebarTemplate, {
    room: room,
    users: users,
  });

  const sidebar = document.querySelector("#sidebar");

  sidebar.innerHTML = html;
});

socket.on("message", (data) => {
  // console.log(data);
  const html = Mustache.render(messageTemplate, {
    userName: data.userName,
    message: data.message,
    createdAt: moment(data.createdAt).format(" h:mm:ss a"),
  });
  message.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (data) => {
  // console.log(data);
  const html = Mustache.render(locationTemplate, {
    userName: data.userName,
    url: data.location,
    createdAt: moment(data.createdAt).format(" h:mm:ss a"),
  });
  message.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  btnSubmit.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", inputMessage.value, (message) => {
    btnSubmit.removeAttribute("disabled");
    inputMessage.value = "";
    inputMessage.focus();
    // console.log(message);
  });
});

btnSentLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Location is not available");
  }

  btnSentLocation.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        btnSentLocation.removeAttribute("disabled");
        console.log("Location shared");
      }
    );
  });
});

socket.emit("join", { userName, room }, (error) => {
  alert(error);
  location.href = "/";
});
