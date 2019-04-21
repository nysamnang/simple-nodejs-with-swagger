const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const helmet = require("helmet");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

mongoose
  .connect("mongodb://demo:demo123@ds040637.mlab.com:40637/simple-nodejs-with-swagger")
  .then(() => console.log("Connected to MongoDB..."));

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },
  firstName: { type: String },
  lastName: { type: String }
});
const User = mongoose.model("User", UserSchema);

const app = express();
app.use(helmet());
app.use(compression());
app.use(express.json());

app.get("/", (req, res) => {
  const URL = req.protocol + "://" + req.get("host") + req.originalUrl;
  res.send(`<a href="${URL}api-docs">/api-docs</a>`);
});

const createUser = (req, res, next) => {
  const user = new User(req.body);

  user.save(err => {
    if (err) {
      next(err);
    } else {
      res.json(user);
    }
  });
};

const updateUser = (req, res, next) => {
  User.findByIdAndUpdate(req.body._id, req.body, { new: true }, (err, user) => {
    if (err) {
      next(err);
    } else {
      res.json(user);
    }
  });
};

const deleteUser = (req, res, next) => {
  req.user.remove(err => {
    if (err) {
      next(err);
    } else {
      res.json(req.user);
    }
  });
};

const getAllUsers = (req, res, next) => {
  User.find((err, users) => {
    if (err) {
      next(err);
    } else {
      res.json(users);
    }
  });
};

const getOneUser = (req, res) => {
  res.json(req.user);
};

const getByIdUser = (req, res, next, id) => {
  User.findOne({ _id: id }, (err, user) => {
    if (err) {
      next(err);
    } else {
      req.user = user;
      next();
    }
  });
};

router
  .route("/users")
  .post(createUser)
  .get(getAllUsers);

router
  .route("/users/:userId")
  .get(getOneUser)
  .put(updateUser)
  .delete(deleteUser);

router.param("userId", getByIdUser);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1", router);

app.listen(process.env.PORT || 3000);

module.exports = app;
