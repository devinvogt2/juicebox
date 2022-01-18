const express = require("express");
const postsRouter = express.Router();
const { getAllPosts, createPost, getPostById, updatePost } = require("../db");
const { requireUser } = require("./utils");

postsRouter.get("/", async (req, res) => {
    let posts = await getAllPosts()
    posts = posts.filter((post) => {
        if (post.active) {
            return true;
        }
        if (req.user && post.author.id === req.user.id) {
            return true
        }
        return false
    });

    res.send({ posts });
});


//require a user to post, if user is set go next() if not send error message
postsRouter.post("/", requireUser, async (req, res, next) => {
    const { title, content, tags = "" } = req.body;

    const tagArr = tags.trim().split(/\s+/);
    let postData = {};

    // only send the tags if there are some to send
    if (tagArr.length) {
        postData.tags = tagArr;
    }

    try {
        // add authorId, title, content to postData object
        postData = { ...postData, authorId: req.user.id, title, content };
        const post = await createPost(postData);
        // this will create the post and the tags for us
        // if the post comes back, res.send({ post });
        if (post) {
            res.send({ post });
            // otherwise, next an appropriate error object
        } else {
            next({
                name: "Post Error",
                message: "Post Has Failed!",
            });
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title) {
        updateFields.title = title;
    }

    if (content) {
        updateFields.content = content;
    }

    try {
        const originalPost = await getPostById(postId);

        if (originalPost.author.id === req.user.id) {
            const updatedPost = await updatePost(postId, updateFields);
            res.send({ post: updatedPost })
        } else {
            next({
                name: 'UnauthorizedUserError',
                message: 'You cannot update a post that is not yours'
            })
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");

    next(); // THIS IS DIFFERENT
});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
        const post = await getPostById(req.params.postId);

        if (post && post.author.id === req.user.id) {
            const updatedPost = await updatePost(post.id, { active: false });

            res.send({ post: updatedPost });
        } else {
            // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
            next(post ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete a post which is not yours"
            } : {
                name: "PostNotFoundError",
                message: "That post does not exist"
            });
        }

    } catch ({ name, message }) {
        next({ name, message })
    }
});

module.exports = postsRouter;