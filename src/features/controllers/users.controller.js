import * as usersService from "../service/users.service.js";

const getUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAllUsers();
    res.status(200).json({
      status: 200,
      message: "These are all the users",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }
    res.status(200).json({
      status: 200,
      message: "Got the user",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await usersService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }
    res.status(200).json({
      status: 200,
      message: `Updated user with id: ${req.params.id}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await usersService.deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }
    res.status(200).json({
      status: 200,
      message: `Deleted user with id: ${req.params.id}`,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export { getUsers, getUserById, updateUser, deleteUser };
