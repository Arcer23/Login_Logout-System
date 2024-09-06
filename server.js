const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const port = 3000;
const bcrypt = require("bcrypt");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // alternative of body-parser
app.use(cookieParser());
const database = require("./database");
const jwt = require("jsonwebtoken");
const post = require("./models/post");

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/logout", (req, res) => {
  res.cookie("token ", "");
  res.redirect("/login");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/profile", isLoggenIn, async (req, res) => {
  // getting the user details
  const user = await userModel
    .findOne({ username: req.user.username })
    .populate("posts");
  res.render("profile", { user });
});
app.get("/like/:id", isLoggenIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }

  await post.save();
  res.redirect("/profile");
});
app.get("/edit/:id", isLoggenIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  res.render('edit', {post})
});
app.post("/update/:id", isLoggenIn, async (req, res) => {
  let post = await postModel.findOneAndUpdate({ _id: req.params.id }, {content:req.body.content})
  res.redirect('/profile')
});

app.post("/post", isLoggenIn, async (req, res) => {
  // getting the user details
  const user = await userModel.findOne({ username: req.user.username });
  let { content } = req.body;
  let post = await postModel.create({
    user: user._id,
    content,
  });
  user.posts.push(post.id);
  await user.save();
  res.redirect("/login");
});
app.post("/register", async (req, res) => {
  const { username, password, name } = req.body;

  let user = await userModel.findOne({ username });
  if (user) res.status(500).send("User Already Registered");
  bcrypt.genSalt(10, (error, salt) => {
    bcrypt.hash(password, salt, async (error, hash) => {
      let user = await userModel.create({
        name,
        username,
        password: hash,
      });
      const token = jwt.sign({ username: username }, "arcer");
      // you bujina maile alikati
      res.cookie("token", token);
      res.send("Created Account Successfully");
    });
  });
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  let user = await userModel.findOne({ username });
  if (!user) return res.status(200).send("User Not Found");
  const isMatched = bcrypt.compare(
    password,
    user.password,
    function (error, result) {
      if (result) {
        const token = jwt.sign({ username: username }, "arcer");
        // you bujina maile alikati
        res.cookie("token", token);
        res.status(200).redirect("/profile");
      } else res.redirect("/login");
    }
  );
});

app.delete("/profile/:id", async (req, res) => {
  const deletedPost = await postModel.findByIdAndDelete(req.params.id);
  if (!deletedPost) return res.status(404).json({ message: "Post Not found" });
  res.status(200).send("Post deleted Successfully");
});
function isLoggenIn(req, res, next) {
  if (req.cookies.token === "") res.render("/login");
  try {
    let data = jwt.verify(req.cookies.token, "arcer");
    req.user = data;

    next();
  } catch (error) {
    return res.status(401).send("Login First");
  }
}

app.listen(port, () => {
  console.log(`The server is currently running on port ${port}`);
});
