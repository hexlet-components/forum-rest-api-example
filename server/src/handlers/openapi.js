import { getId, getToken, prepareListData, prepareItem, getUserByToken } from '../utils.js';

const getHandlers = (state) => {
  return {
    // Login handlers
    AuthService_create: (c, req, res) => {
      const {
        email,
        password,
      } = c.request.body;
      const user = state.users.find((u) => u.email === email);
      if (!user || user.password !== password) {
        return res.status(401)
          .send({ code: 401, message: 'Wrong email or password' });
      }
      const token = getToken();
      state.tokens.push({ userId: user.id, token });
      return res.status(200).send({ token });
    },

    // Users handlers
    UserService_create: (c, req, res) => {
      const {
        firstName,
        lastName,
        email,
        password,
      } = c.request.body;
      const user = {
        id: getId(),
        firstName,
        lastName,
        email,
        password,
      };

      state.users.push(user);
      return res.status(200).send(user);
    },
    UserService_list: (c, req, res) => res.status(200).send(prepareListData('users', state, c)),
    UserService_get: (c, req, res) => {
      const { id } = c.request.params;
      const { select } = c.request.query.select ?? {};
      const user = state.users.find((item) => item.id === id);
      if (!user) {
        return res.status(404).send({ code: 404, message: 'Not found' });
      }
      return res.status(200).send(prepareItem(user, select));
    },
    UserService_getPosts: (c, req, res) => {
      const { authorId } = c.request.params;
      const data = prepareListData('posts', state, c, (item) => item.authorId === authorId);
      return res.status(200).send(data);
    },
    UserService_getComments: (c, req, res) => {
      const { authorId } = c.request.params;
      const data = prepareListData('comments', state, c, (item) => item.authorId === authorId);
      return res.status(200).send(data);
    },
    UserService_update: (c, req, res) => {
      const { id } = c.request.params;
      const index = state.users.findIndex((item) => item.id === id);
      if (index === -1) {
        return res.status(404).send({ code: 404, message: 'Not found' });
      }
      const currentUser = getUserByToken(c, state);
      if (currentUser?.id !== id) {
        return res
          .status(403)
          .send({ code: 403, message: 'Forbidden action' })
      }
      state.users[index] = {
        ...state.users[index],
        ...c.request.body,
      };
      return res.status(200).send(state.users[index]);
    },
    UserService_delete: (c, req, res) => {
      const { id } = c.request.params;
      const currentUser = getUserByToken(c, state);
      if (currentUser?.id !== id) {
        return res
          .status(403)
          .send({ code: 403, message: 'Forbidden action' })
      }
      const users = state.users.filter((item) => item.id !== id);
      state.users = users;
      return res.status(204).send();
    },

    // Posts handlers
    PostService_create: (c, req, res) => {
      const {
        title,
        body,
      } = c.request.body;
      const currentUser = getUserByToken(c, state);
      if (!currentUser) {
        return res
          .status(403)
          .send({ code: 403, message: 'Forbidden action' })
      }
      const post = {
        id: getId(),
        authorId: currentUser.id,
        title,
        body,
      };

      state.posts.push(post);
      return res.status(200).send(post);
    },
    PostService_list: (c, req, res) => prepareListData('posts', state, c),
    PostService_get: (c, req, res) => {
      const { id } = c.request.params;
      const { select } = c.request.query.select ?? {};
      const post = state.posts.find((item) => item.id === id);
      if (!post) {
        return res.status(404).send({ code: 404, message: 'Not found' });
      }
      return res.status(200).send(prepareItem(post, select));
    },
    PostService_getComments: (c, req, res) => {
      const { postId } = c.request.params;
      const data = prepareListData('comments', state, c, (item) => item.postId === postId);
      return res.status(200).send(data);
    },
    PostService_update: (c, req, res) => {
      const { id } = c.request.params;
      const index = state.posts.findIndex((item) => item.id === id);
      if (index === -1) {
        return res.status(404).send({ code: 404, message: 'Not found' });
      }
      const currentUser = getUserByToken(c, state);
      if (currentUser?.id !== state.posts[index].authorId) {
        return res
          .status(403)
          .send({ code: 403, message: 'Forbidden action' })
      }
      state.posts[index] = {
        ...state.posts[index],
        ...c.request.body,
      };
      return res.status(200).send(state.posts[index]);
    },
    PostService_delete: (c, req, res) => {
      const { id } = c.request.params;
      const index = state.posts.findIndex((item) => item.id === id);
      const currentUser = getUserByToken(c, state);
      if (currentUser?.id !== state.posts[index].authorId) {
        return res
          .status(403)
          .send({ code: 403, message: 'Forbidden action' })
      }
      const posts = state.posts.filter((item) => item.id !== id);
      state.posts = posts;
      return res.status(204).send();
    },

    // Comments handlers
    CommentService_create: (c, req, res) => {
      const {
        postId,
        body,
      } = c.request.body;
      const currentUser = getUserByToken(c, state);
      if (!currentUser) {
        return res
          .status(403)
          .send({ code: 403, message: 'Forbidden action' })
      }
      const comment = {
        id: getId(),
        postId,
        authorId: currentUser.id,
        body
      };

      state.comments.push(comment);
      return res.status(200).send(comment);
    },
    CommentService_list: (c, req, res) => prepareListData('comments', state, c),
    CommentService_get: (c, req, res) => {
      const { id } = c.request.params;
      const { select } = c.request.query.select ?? {};
      const comment = state.comments.find((item) => item.id === id);
      if (!comment) {
        return res.status(404).send({ code: 404, message: 'Not found' });
      }
      return res.status(200).send(prepareItem(comment, select));
    },
    CommentService_update: (c, req, res) => {
      const { id } = c.request.params;
      const index = state.comments.findIndex((item) => item.id === id);
      if (index === -1) {
        return res.status(404).send({ code: 404, message: 'Not found' });
      }
      const currentUser = getUserByToken(c, state);
      if (currentUser?.id !== state.comments[index].authorId) {
        return res
          .status(403)
          .send({ code: 403, message: 'Forbidden action' })
      }
      state.comments[index] = {
        ...state.comments[index],
        ...c.request.body,
      };
      return res.status(200).send(state.comments[index]);
    },
    CommentService_delete: (c, req, res) => {
      const { id } = c.request.params;
      const index = state.comments.findIndex((item) => item.id === id);
      const currentUser = getUserByToken(c, state);
      if (currentUser?.id !== state.comments[index].authorId) {
        return res
          .status(403)
          .send({ code: 403, message: 'Forbidden action' })
      }
      const comments = state.comments.filter((item) => item.id !== id);
      state.comments = comments;
      return res.status(204).send();
    },

    // Courses handlers
    CourseService_create: (c, req, res) => {
      const {
        title,
        description,
      } = c.request.body;
      const course = {
        id: getId(),
        title,
        description
      };

      state.courses.push(course);
      return res.status(200).send(course);
    },
    CourseService_list: (c, req, res) => prepareListData('courses', state, c),
    CourseService_get: (c, req, res) => {
      const { id } = c.request.params;
      const { select } = c.request.query.select ?? {};
      const course = state.courses.find((item) => item.id === id);
      if (!course) {
        return res.status(404).send({ code: 404, message: 'Not found' });
      }
      return res.status(200).send(prepareItem(course, select));
    },
    CourseService_update: (c, req, res) => {
      const { id } = c.request.params;
      const index = state.courses.findIndex((item) => item.id === id);
      if (index === -1) {
        return res.status(404).send({ code: 404, message: 'Not found' });
      }
      state.courses[index] = {
        ...state.courses[index],
        ...c.request.body,
      };
      return res.status(200).send(state.courses[index]);
    },
    CourseService_delete: (c, req, res) => {
      const { id } = c.request.params;
      const courses = state.courses.filter((item) => item.id !== id);
      state.courses = courses;
      return res.status(204).send();
    },

    // Tasks handlers
    TaskService_create: (c, req, res) => {
      const {
        title,
        description,
        status,
      } = c.request.body;
      const task = {
        id: getId(),
        title,
        description,
        status,
      };

      state.tasks.push(task);
      return res.status(200).send(task);
    },
    TaskService_list: (c, req, res) => prepareListData('tasks', state, c),
    TaskService_get: (c, req, res) => {
      const { id } = c.request.params;
      const { select } = c.request.query.select ?? {};
      const task = state.tasks.find((item) => item.id === id);
      if (!task) {
        return res.status(404).send({ code: 404, message: 'Not found' });
      }
      return res.status(200).send(prepareItem(task, select));
    },
    TaskService_update: (c, req, res) => {
      const { id } = c.request.params;
      const index = state.tasks.findIndex((item) => item.id === id);
      if (index === -1) {
        return res.status(404).send({ code: 404, message: 'Not found' });
      }
      state.tasks[index] = {
        ...state.tasks[index],
        ...c.request.body,
      };
      return res.status(200).send(state.tasks[index]);
    },
    TaskService_delete: (c, req, res) => {
      const { id } = c.request.params;
      const tasks = state.tasks.filter((item) => item.id !== id);
      state.tasks = tasks;
      return res.status(204).send();
    },

    validationFail: (c, _req, res) => res.status(400).send({ code: 400, message: c.validation.errors }),
    unauthorizedHandler: (c, req, res) => res
      .status(401)
      .send({ code: 401, message: 'Please authenticate first. Header example: "Authorization: Bearer token"' }),
    // notImplementedHandler: (c, req, res) => res
    //   .status(404)
    //   .send({ code: 501, message: 'No handler registered for operation' }),
  };
};

export default getHandlers;
