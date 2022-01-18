const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');

// tagsRouter.use((req, res, next) => {
//   console.log("A request is being made to /tags");

//   next(); // THIS IS DIFFERENT
// });

tagsRouter.get('/', async (req, res) => {
  const tags = await getAllTags();

  res.send({
    tags
  });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  const { tagName } = req.params;
  try {
    let posts = await getPostsByTagName(tagName)
    posts = posts.filter((post) => {
      if (post.active) {
        return true;
      }
      if (req.user.id && post.author.id === req.user.id) {
        return true
      }
      return false;
    });

    res.send({ posts });


  } catch ({ name, message }) {
    next({ name, message });
    // forward the name and message to the error handler
  }
});

module.exports = tagsRouter;