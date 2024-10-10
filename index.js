import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import session from "express-session";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const supabaseUrl = 'https://swjudopsftggwxxeqzri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3anVkb3BzZnRnZ3d4eGVxenJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgyNjkzMzEsImV4cCI6MjA0Mzg0NTMzMX0.K8V9f2BN0NZB0bh-jUOgydMnXjjyzfAIDkYjB00oC2M';
const supabase = createClient(supabaseUrl, supabaseAnonKey);



dotenv.config();
const app = express();
const port = 3000;
const API_URL = "https://techmaniac-backend.vercel.app";
let verified = false;
const verification = process.env.SECRET_MESSAGE;

app.use(session({
  secret: process.env.SECRET_MESSAGE, // Replace with your own secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));


app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, './public')));
//app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next(); // User is authenticated, proceed to the next middleware/route
  }
  res.redirect('/enter'); // User is not authenticated, redirect to login page
};


app.get("/enter", (req,res)=>{
  res.render("login.ejs");
});

app.post('/enter', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email: email, password: password });
  
  if (error) return res.status(400).json({ error: error.message });
  const { data: { user } } = await supabase.auth.getUser()
  console.log(data);
  req.session.user = data;
  console.log(req.session);
  res.redirect("/");
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.redirect('/');
    res.clearCookie('connect.sid'); // Clear the cookie
    res.redirect('/enter'); // Redirect to login page
  });
});



app.get("/", isAuthenticated, async (req, res) => {

  try {
    const response = await axios.get(`${API_URL}/posts`);
    console.log(response);
    res.render("index.ejs", { posts: response.data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

app.get("/new", async (req, res) => {

  res.render("modify.ejs", { heading: "New Post", submit: "Create Post" });
});





app.get("/edit/:id", async (req, res) => {
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