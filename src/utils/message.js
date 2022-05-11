const renderMessage = function (userName, text) {
  return {
    userName: userName,
    message: text,
    createdAt: new Date(),
  };
};

const renderLocation = function (userName, location) {
  return { userName: userName, location: location, createdAt: new Date() };
};
module.exports = { renderMessage, renderLocation };
