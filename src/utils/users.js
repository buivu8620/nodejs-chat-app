const { get } = require("express/lib/request");

const users = [];

//add, remove, getUser, getUserInRoom
//addUser
const addUser = function ({ id, userName, room }) {
  //clean the data
  userName = userName == undefined ? "" : userName.trim().toLowerCase();
  room = room == undefined ? "" : room.trim().toLowerCase();

  //validate the user
  if (!userName || !room) {
    return { error: "User Name and Room are required !" };
  }

  //check for existing user
  const existingUser = users.find((user) => {
    return user.userName === userName && user.room === room;
  });

  if (existingUser) {
    return { error: "User already exists" };
  }

  //store user
  const user = { id, userName, room };
  users.push(user);
  return { user };
};

//removeUser
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//getUser
const getUser = (id) => {
  return users.filter((user) => user.id === id)[0];
};

//getUserInRoom
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};
// addUser({ id: 1, userName: "Bin", room: "Admin" });
// addUser({ id: 2, userName: "Bi", room: "Admin" });
// console.log(getUser(1));
// console.log(users);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
