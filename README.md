# Social Media App Backend

This is the backend of a social media application built using Node.js, Express, and MongoDB. It provides APIs for user authentication, post management, and social interactions such as likes, comments, and following other users.

## Features

### User Authentication

- **Register**: Create a new account.
- **Login**: Access the application using your credentials.
- **Logout**: End the session.

### Post Management

- **Create a Post**: Add new posts to the feed.
- **Update a Post**: Modify existing posts.
- **Delete a Post**: Remove posts from the feed.
- **Like/Dislike a Post**: Interact with posts by liking or disliking them.

### Comments

- **Add a Comment**: Comment on a post.
- **Reply to a Comment**: Respond to existing comments.
- **Like/Unlike a Comment**: Interact with comments by liking or unliking them.

### Social Interactions

- **Follow/Unfollow Users**: Manage your network by following or unfollowing other users.
- **Block Users**: Restrict interactions from certain users.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/social-media-backend.git
   cd backend

2. **Install dependencies:**

   ```bash
   npm install

3. **Set up environment variables:**

   ```bash
   MONGODB_URL=<Your MongoDB URI>
   JWT_SECRET=<Your JWT Secret>
   JWT_EXPIRE=<Your Expire Time>
   PORT=<Your Port>

Api documentation : https://documenter.getpostman.com/view/29743624/2sA3rzKt18
