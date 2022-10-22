const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

class Story {
  // collate class into a story  instead of writing everything
  constructor(story) {
    this.storyId = story.storyId;
    this.title = story.title;
    this.author = story.author;
    this.url = story.url;
    this.username = story.username;
    this.createdAt = story.createdAt;
  }
}
// gethost name go to line function 850 in ui.js
/**
 * Generate a new StoryList. It:
 *  - calls the API
 *  - builds an array of Story instances
 *  - makes a single StoryList instance out of that
 *  - returns the StoryList instance.*
 */
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  // Note the presence of `static` keyword: this indicates that getStories
  // is **not** an instance method. Rather, it is a method that is called on the
  // class directly. Why doesn't it make sense for getStories to be an instance method?

  static async getStories() {
    // query the /stories endpoint (no auth required)
    const response = await axios.get(`${BASE_URL}/stories`);

    // turn the plain old story objects from the API into instances of the Story class
    const stories = response.data.stories.map(function (story) {
      return new Story(story);
    });

    // build an instance of our own class using the new array of stories
    const storyList = new StoryList(stories);
    return storyList;
  }

  /**
   * Method to make a POST request to /stories and add the new story to the list
   * - inUser - the current instance of User who will post the story
   * - newStory - a new story object for the API with title, author, and url
   *
   * Returns the new story object
   */

  static async addStory(user, newStory) {
    try {
      const response = await axios.post(`${BASE_URL}/stories`, {
        token: loginToken,
        story: {
          author: newStory.author,
          title: newStory.title,
          url: url.newStory.url,
        },
      });

      if (response.status === 200) {
        user.ownStories.push(new Story(response.data.story));
        return response.data.story;
      }
    } catch (err) {
      console.log("there is an error");

      console.dir(err);
    }
  }

  static async deleteStory(user, storyArticleId) {
    let response;
    try {
      response = await axios.delete(`${BASE_URL}/stories/${storyArticleId}`, {
        headers: {
          Authorization: "token",
        },
        data: {
          token: user.loginToken,
        },
      });
    } catch (error) {
      return error;
    }
    const ownStoriesHolder = user.ownStories.filter(
      (story) => story.storyId !== storyArticleId
    );
    user.ownStories = ownStoriesHolder;

    return response;
  }
}
// a user object is  created
//  set to defaults favorites etc
// purpose is to initilize the attribute of the object with their default values
// when new value or record is created
class User {
  constructor(user) {
    this.username = user.username;
    this.name = user.name;
    this.createdAt = user.createdAt;

    this.favorites = [];
    this.ownStories = [];
    this.loginToken = "";
  }

  static async create(username, password, name) {
    let response;

    try {
      response = await axios.post(`${BASE_URL}/signup`, {
        user: {
          username,
          password,
          name,
        },
      });
    } catch (error) {
      // return the error components for display in the ui.
      return {
        error: error.response.data.error.title,
        errMsg: error.response.data.error.message,
      };
    }

    //  new User instance
    const newUserHolder = new User(response.data.user);

    newUserHolder.loginToken = response.data.token;

    return newUserHolder;
  }

  static async login(username, password) {
    let response;

    try {
      response = await axios.post(`${BASE_URL}/login`, {
        user: {
          username,
          password,
        },
      });
    } catch (error) {
      // error massage is returned
      return {
        error: error.response.data.error.title,
        errMsg: error.response.data.error.message,
      };
    }

    // new User instance
    const newUserHolder = new User(response.data.user);

    newUserHolder.favorites = response.data.user.favorites.map(
      (s) => new Story(s)
    );
    newUserHolder.ownStories = response.data.user.stories.map(
      (s) => new Story(s)
    );

    newUserHolder.loginToken = response.data.token;

    return newUserHolder;
  }
  // get from Api
  // if not token or user name return null
  static async getInUser(token, username) {
    if (!token || !username) return null;

    const response = await axios.get(`${BASE_URL}/users/${username}`, {
      params: {
        token,
      },
    });

    const newUserHolder = new User(response.data.user);
    newUserHolder.loginToken = token;
    newUserHolder.favorites = response.data.user.favorites.map(
      (s) => new Story(s)
    );
    newUserHolder.ownStories = response.data.user.stories.map(
      (s) => new Story(s)
    );
    return newUserHolder;
  }
  // add favorite story
  // user name and article of user
  static async favoriteAdd(user, article) {
    const response = await axios.post(
      `${BASE_URL}/users/${user.username}/favorites/${article}`,
      {
        token: user.loginToken,
      }
    );

    user.favorites = response.data.user.favorites.map((s) => new Story(s));

    return response;
  }

  static async favoriteDelete(user, article) {
    const response = await axios.delete(
      `${BASE_URL}/users/${user.username}/favorites/${article}`,
      {
        headers: {
          Authorization: "token",
        },
        data: {
          token: user.loginToken,
        },
      }
    );

    user.favorites = response.data.user.favorites.map((s) => new Story(s));
    return response;
  }
  // let make sure the story for the storyId mataches the article
  static isFavorite(favorite, article) {
    const storyHolder = favorite.some((story) => story.storyId === article);

    return storyHolder;
  }
}
