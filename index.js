import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



dotenv.config();
const app = express();
const port = 3000;
const API_URL = "https://techmaniac-backend.vercel.app";
let verified = false;
const verification = process.env.SECRET_MESSAGE;

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, './public')));
//app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/enter", (req,res)=>{
  res.render("login.ejs");
});

app.post("/enter", (req,res)=>{
  const pwd = req.body.pwd;
  if(pwd !== verification){
    console.log("INCORRECT!");
    return res.redirect("/enter");
  } else {
    res.redirect("/");
    verified = true;
  }
});

app.get("/", async (req, res) => {
  if(!verified){
    return res.redirect("/enter");
  }
  try {
    const response = await axios.get(`${API_URL}/posts`);
    console.log(response);
    res.render("index.ejs", { posts: response.data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

app.get("/new", (req, res) => {
  if(!verified){
    return res.redirect("/enter");
  }
  res.render("modify.ejs", { heading: "New Post", submit: "Create Post" });
});





app.get("/edit/:id", async (req, res) => {
  if(!verified){
    return res.redirect("/enter");
  }
  try {
    const response = await axios.get(`${API_URL}/posts/${req.params.id}`);
    console.log(response.data);
    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/posts`, req.body);
    console.log(response.data);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
});

app.post("/api/posts/:id", async (req, res) => {
  console.log("called");
  try {
    const response = await axios.patch(
      `${API_URL}/posts/${req.params.id}`,
      req.body
    );
    console.log(response.data);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});

app.get("/api/posts/delete/:id", async (req, res) => {
  if(!verified){
    return res.redirect("/enter");
  }
  try {
    await axios.delete(`${API_URL}/posts/${req.params.id}`);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});