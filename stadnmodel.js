
// User Object

function User(userId, username, fullName, userType, createdAt) {
  this.userId = Number(userId);
  this.username = username;
  this.fullName = fullName;
  this.userType = userType;
  this.createdAt = Date(createdAt);
}


// Post Object

function Post(postId, user, text, entities, createdAt) {
  this.postId = Number(postId);
  this.user = user;
  this.text = text;
  this.entities = entities;
  this.createdAt = Date(createdAt);
}


// Entities Object

function Entities(entitiesData) {
  // Mentions (only mentions for now, sorry)
  var mentions = [];
  if (entitiesData.mentions) {
    entitiesData.mentions.forEach(function(element, index) {
      mentions.push(new Mention(element.id, element.name));
    });
  }

  this.mentions = mentions;
}


// Mention Object

function Mention(userId, username) {
  this.userId = Number(userId);
  this.username = username;
}




function Model() {}

Model.prototype.post = function(postId, user, text, entities, createdAt) {
  return new Post(postId, user, text, entities, createdAt);
}

Model.prototype.postWithData = function(data) {
  var user = this.userWithData(data.user);
  var entities = this.entitiesWithData(data.entities);
  return this.post(data.id, user, data.text, entities, data.created_at);
}

Model.prototype.user = function(userId, username, fullName, userType, createdAt) {
  return new User(userId, username, fullName, userType, createdAt);
}

Model.prototype.userWithData = function(data) {
  return this.user(data.id, data.username, data.name, data.type, data.created_at);
}

Model.prototype.entitiesWithData = function(data) {
  return new Entities(data);
}


module.exports = Model;
