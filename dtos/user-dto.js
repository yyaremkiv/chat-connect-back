class UserDto {
  email;
  id;
  isActivated;

  constructor(model) {
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.email = model.email;
    this._id = model._id;
    this.isActivated = model.isActivated;
  }
}

export default UserDto;
