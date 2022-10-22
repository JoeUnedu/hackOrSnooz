$(async function () {
  // jquery variables
  const $loginNav = $("#nav-login");
  const $logOutNav = $("#nav-logout");
  const $submitForm = $("#submit-form");
  const $loginForm = $("#login-form");
  const $storiesList = $("#stories-list");
  const $refineStory = $("#refine-story");
  const $signupForm = $("#signup-form");
  const $favStories = $("#favorite");
  const $ownStories = $("#my-stories");

  const $userProfile = $("#user-profile");
  const $userNavLink = $("#nav-link-user");
  const $userNavShow = $("#nav-show");
  const $userNavProfile = $("#nav-user-profile");
  // javasccript and css variables
  const createAccountMsg = "actmsg";
  const msgLogin = "loginmsg";

  const favMsg = "fav-msg";
  const filledStar = "&#9733;";
  const emptyStar = "&#9734;";
  const formatStarFav = "fav-star";

  const ownMsg = "own-msg";
  const prefixFavList = "--fav--";
  const prefixMyStoryList = "--own--";
  const deleteMsg = "&otimes;";
  const deleteStory = "del-st";
  const deleteSpan = `<span class="${deleteStory}">${deleteMsg}</span>`;
  // set storylist to null as global
  let storyList = null;
  // set current uset to null as global
  let currentUser = null;

  await signInRecord();

  $loginForm.on("submit", async function (e) {
    e.preventDefault();

    letCreateAcct(msgLogin);

    // jquery username and password
    const username = $("#login-username").val();
    const password = $("#login-password").val();

    if (
      validateForm(
        [username, password],
        "username  password",
        $loginForm,
        msgLogin
      )
    ) {
      // user holder instance
      const userHolder = await User.login(username, password);

      if (userHolder.username) {
        // let set the global(currentUser) to the user instance
        currentUser = userHolder;

        navInfoPopulate(); // populate that user
        inUserInfo(); // get there infomrartion while in validation
        logInInfo(); // when they log in validate
      } else {
        const loginError = `${userHolder.error}: ${userHolder.errMsg}`;
        signInorSignUp($loginForm, msgLogin, loginError);
      }
    }
    // END OF LOGINFORM FUNC
  });
  // let call the letCreateAcct  message in the sign up form
  // when the sign up the name, user name and password
  // Also let validate it
  $signupForm.on("submit", async function (e) {
    e.preventDefault();

    letCreateAcct(createAccountMsg);

    let name = $("#create-name").val();
    let username = $("#create-username").val();
    let password = $("#create-password").val();

    if (
      validateForm(
        [name, username, password],
        "name, username,  password",
        createAccountMsg,
        $signupForm
      )
    ) {
      const logInUser = await User.create(username, password, name);

      if (logInUser.username) {
        currentUser = logInUser;

        navInfoPopulate(); // populate that log in user
        inUserInfo(); // get there information while in validation
        logInInfo(); // when they log in validate
      } else {
        const loginError = `${logInUser.error}: ${logInUser.errMsg}`;
        signInorSignUp($signupForm, createAccountMsg, loginError);
      }
    }
    // END OF SIGN UP FORM VALIDATION
  });

  $userNavProfile.on("click", function () {
    hideFew([
      $signupForm,
      $submitForm,
      $refineStory,
      $favStories,
      $ownStories,
      $loginForm,
    ]);

    if (currentUser) {
      $("#profile-name").html(`Name: <strong>${currentUser.name}</strong>`);
      $("#profile-username").html(
        `Username: <strong>${currentUser.username}</strong>`
      );
      $("#profile-date").html(
        `Account Created: <strong>${currentUser.createdAt.substr(
          0,
          10
        )}</strong>`
      );

      let time = 0;
      if ($userProfile.css("display") === "none") {
        $storiesList.show();
        time = 400;
      }

      $userProfile.slideToggle(time);
      $storiesList.toggle();
    }
  });

  $logOutNav.on("click", function () {
    localStorage.clear();

    location.reload();
  });

  $loginNav.on("click", function () {
    clearInfoVal();

    $loginForm.slideToggle();
    $signupForm.slideToggle();
    $storiesList.toggle();
  });

  $("#nav-submit").on("click", function () {
    hideFew([
      $refineStory,
      $favStories,
      $ownStories,
      $loginForm,
      $signupForm,
      $userProfile,
    ]);

    if ($submitForm.css("display") === "none") {
      $storiesList.show();
    }
    $submitForm.slideToggle();
  });

  // on click event for favorites
  $userNavLink.on("click", "#nav-favorites", function () {
    hideFew([
      $submitForm,
      $refineStory,
      $ownStories,
      $loginForm,
      $signupForm,
      $userProfile,
    ]);

    showStory(
      $favStories,
      favMsg,
      `No favorite story  ${filledStar}.`,
      currentUser.favorites,
      filledStar,
      `${formatStarFav} ${prefixFavList}`,
      prefixFavList
    );
  });

  $userNavLink.on("click", "#nav-mystories", function () {
    hide([
      $submitForm,
      $refineStory,
      $favStories,
      $loginForm,
      $signupForm,
      $userProfile,
    ]);

    showStory(
      $ownStories,
      ownMsg,
      "No story is submitted.",
      currentUser.ownStories,
      emptyStar,
      `${formatStarFav} ${prefixMyStoryList}`,
      prefixMyStoryList,
      deleteSpan
    );

    if (currentUser.ownStories.length > 0) {
      $("#my-stories").prepend(
        `<li><h4>Click on ${deleteMsg}  left of the story to delete.</h4></li>`
      );

      const $h4Msg = $(`h4.${ownMsg}`).detach();
      $("#my-stories").append($h4Msg);

      myFavorites(
        currentUser.favorites,
        `span.${prefixMyStoryList}`,
        prefixMyStoryList
      );
    }
  });

  function showStory(
    attachMsg,
    storyList,
    favMsgs,
    noMsg,
    $ListPerName,
    holdsFavs,
    prefixId,
    insertSpan = ""
  ) {
    $ListPerName.empty();

    if ($ListPerName.css("display") === "none") {
      $storiesList.show();

      $ListPerName.empty();

      // attach to append message
      $ListPerName.append(`<h4 class="${attachMsg}">&nbsp;</h4>`);

      if (storyList.length > 0) {
        // generate html for story
        // and run a loop for the list of story
        for (let story of storyList) {
          const storyHtml = htmlForStory(
            story,
            favMsgs,
            holdsFavs,
            prefixId,
            insertSpan
          );
          $ListPerName.append(storyHtml);
        }
      } else {
        //  pass the no message to the attached msg through a class html
        $(`.${attachMsg}`).html(noMsg);
      }
    }

    $storiesList.slideToggle();
    $ListPerName.slideToggle();
  }

  // add a new story by clicking event handler
  // the trim function will help to remove the white space.
  $submitForm.on("click", "button", async function () {
    const addNew = {
      author: $("#author").val().trim(),
      title: $("#title").val().trim(),
      url: $("#url").val().trim(),
    };

    if (
      addNew.author.length > 0 &&
      addNew.title.length > 0 &&
      addNew.url.length > 5
    ) {
      const addedStory = await StoryList.addStory(currentUser, addNew);

      if (addedStory) {
        $storiesList.prepend(
          htmlForStory(
            {
              storyId: addedStory.storyId,
              url: addedStory.url,
              title: addedStory.title,
              author: addedStory.author,
              username: addedStory.username,
            },
            emptyStar,
            formatStarFav
          )
        );

        $("#author").val("");
        $("#title").val("");
        $("#url").val("");

        $submitForm.slideToggle();
      } else {
        $("#submit-form").prepend(
          '<h4 class="submit msg-error">There is an error. Story was not added.</h4>'
        );
      }
    }
  });

  $("body").on("click", "#nav-all", async function () {
    hideItems();

    await signInRecord();

    $storiesList.show();
  });

  // fave star format  event handler when clicked

  $("section.articles-container").on(
    "click",
    `span.${formatStarFav}`,
    async function () {
      //  logged in current user must have the propensity to add or remove fav
      if (currentUser) {
        await addOrRemoveFav($(this));
      }
    }
  );

  // delete story on the click event handler
  // delete can  occur in the container list or arr
  $("section.articles-container").on(
    "click",
    `span.${deleteStory}`,
    async function () {
      if (currentUser) {
        $(`.${ownMsg}`).html("&nbsp;");

        // storyId -  prefix my story list  is used when delete occurs
        const ownPrefix = $(this).parent().attr("id");
        const storyId = ownPrefix.replace(prefixMyStoryList, "");

        const deleteHolder = await StoryList.deleteStory(currentUser, storyId);

        if (deleteHolder.status === 200) {
          // Remove function to remove  the story per stories list.
          $(this).parent().remove();
          // Remove function all stories list.
          $(`#${storyId}`).remove();

          $(`.${ownMsg}`).text(
            `'${deleteHolder.data.story.title}' by ${deleteHolder.data.story.author} was successfully deleted.`
          );
        } else {
          $(`.${ownMsg}`).text(
            `Story not quite deleted. Error: ${deleteHolder.response.data.error.status}: ${deleteHolder.response.data.error.message}`
          );
        }
      }
    }
  );

  // function to add or remove  items of story
  async function addOrRemoveFav($items) {
    const ownPrefix = $items.parent().attr("id");

    //  replace the in story id a prefix my story list
    // replace the in story id a prefix fav list
    let storyId = ownPrefix.replace(prefixFavList, "");
    storyId = storyId.replace(prefixMyStoryList, "");

    if (User.isFavorite(currentUser.favorites, storyId)) {
      // let remove favorite
      const favHolder = await User.favoriteDelete(currentUser, storyId);
      if (favHolder.status === 200) {
        // the story html is changes to empty star
        $("#" + storyId)
          .find(`span.${formatStarFav}`)
          .html(emptyStar);

        // call the function show own list or Fav
        showOwnListOrFav(ownPrefix, emptyStar);
      } else {
        if (User.isFavorite(currentUser.favorites, storyId)) {
          //the story html is changes to filled star
          $("#" + storyId)
            .find(`span.${formatStarFav}`)
            .html(filledStar);
        } else {
          $("#" + storyId)
            .find(`span.${formatStarFav}`)
            .html(emptyStar);
        }
      }
    } else {
      const favHolder = await User.favoriteAdd(currentUser, storyId);

      if (favHolder.status === 200) {
        $("#" + storyId)
          .find(`span.${formatStarFav}`)
          .html(filledStar);

        // call the function show own list or Fav
        showOwnListOrFav(ownPrefix, filledStar);
      } else {
        $("#" + storyId)
          .find(`span.${formatStarFav}`)
          .html(emptyStar);
      }
    }
  }

  // local storage  for token and username  when user sign in recorded checked
  async function signInRecord() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    // call class  User.getInUser when page loads
    currentUser = await User.getInUser(token, username);

    await invokeStories();

    if (currentUser) {
      navInfoPopulate();
      // call function to show favs, my stories-all displayed in the nav bar
      setSignedUser();
    }
  }
  // this func may display current user profile  in the nav bar
  function navInfoPopulate() {
    $userNavProfile.html(`</small>${currentUser.username}</small>`);
  }
  // this function  has hide function to hide  log in info and sign up info
  function logInInfo() {
    $loginForm.hide();
    $signupForm.hide();

    // $(selector).trigger event is needed here to reset the forms
    $loginForm.trigger("reset");
    $signupForm.trigger("reset");

    $storiesList.show();

    // call function to show favs, my stories-all displayed in the nav bar
    setSignedUser();
  }

  // use function to call Story list from the get stories and put it into the
  // get story holder. You can call it get story holder instance per class(StoryList)
  // if you like.
  async function invokeStories() {
    const getStoryHolder = await StoryList.getStories();
    // update global variable from line 32
    storyList = getStoryHolder;

    $storiesList.empty();

    //  generate HTML for the story
    for (let story of storyList.stories) {
      const storyHtml = htmlForStory(story);
      $storiesList.append(storyHtml);
    }
  }

  function showOwnListOrFav(userStory, favMsgs) {
    if (
      $favStories.css("display") === "none" &&
      $ownStories.css("display") === "none"
    ) {
      return;
    }

    if ($favStories.css("display") !== "none") {
      // if user fav storie is not a fav anymore func remove
      $(`#${userStory}`).remove();

      if ($(`.${prefixFavList}`).length === 0) {
        // all favorites have been unfavorited.
        $(`.${favMsg}`).text("It looks like you unfavore your choice!");
      }
    } else if ($ownStories.css("display") !== "none") {
      $("#" + userStory)
        .find(`span.${prefixMyStoryList}`)
        .html(favMsgs);
    }
  }

  // func has the propencity to clear input messages from
  // log in user name and create accout values
  function clearInfoVal() {
    $("#login-username").val("");
    $("#login-password").val("");

    $("#create-name").val("");
    $("#create-username").val("");
    $("#create-password").val("");

    $(`.${msgLogin}`).remove();
    $(`.${createAccountMsg}`).remove();
  }
  // func clears messages if it already in the form
  function letCreateAcct(attachMsg) {
    if ($(`.${attachMsg}`).length > 0) {
      $(`.${attachMsg}`).html("&nbsp;");
    }
  }
  // func for log in or creating an account when user sign up
  function signInorSignUp($userForm, attachMsg, msgError) {
    if ($(`.${attachMsg}`).length === 0) {
      $userForm.prepend(`<h4 class="${attachMsg} msg-error">${msgError}</h4>`);
    } else {
      // if msg exit , update
      $(`.${attachMsg}`).text(msgError);
    }
  }

  // validate the function
  function validateForm(array, msg, $userForm, attachMsg) {
    if (array.every((value) => value.trim().length > 0)) {
      if (array.every((value) => value.trim().length === value.length)) {
        // all fields are not blank and do not begin or end with a space. All is good.
        return true;
      } else {
        // name or username or password contain leading and trailing spaces
        signInorSignUp(
          $userForm,
          attachMsg,
          `${msg} There is no need for space.`
        );
        return false;
      }
    } else {
      // any one of the input fields are blank
      signInorSignUp($userForm, attachMsg, `Values required for ${msg}.`);

      return false;
    }
  }

  function htmlForStory(
    story,
    favMsgs = "",
    holdsFavs = "",
    prefixId = "",
    insertSpan = ""
  ) {
    let hostName = getHostName(story.url);

    const stHol1 = $(`
      <li id="${prefixId}${story.storyId}">
        <span class="${holdsFavs}">${favMsgs}</span>${insertSpan}<a class="article-link" href="${story.url}" target="a_blank">
          <strong>${story.title}</strong>
        </a>
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small>
        <small class="article-username">posted by ${story.username}</small>
      </li>
    `);

    return stHol1;
  }

  function hideItems() {
    const itemList = [
      $submitForm,
      $storiesList,
      $refineStory,
      $ownStories,
      $loginForm,
      $signupForm,
    ];
    itemList.forEach(($elem) => $elem.hide());
  }

  function hideFew(itemList) {
    itemList.forEach(($element) => $element.hide());
  }

  function showNavForLoggedInUser() {
    $loginNav.hide();
    $logOutNav.show();
    $userNavLink.show();
    $userNavShow.show();
  }

  function myFavorites(fav, search, prefixId) {
    fav.forEach((st) => {
      $(`#${prefixId}${st.storyId}`).find(search).html(filledStar);
      $(`#${prefixId}${st.storyId}`).find(search).addClass(formatStarFav);
    });
  }

  function setSignedUser() {
    showNavForLoggedInUser();

    $storiesList.find("span").html(emptyStar);
    $storiesList.find("span").removeClass();
    $storiesList.find("span").addClass(formatStarFav);

    myFavorites(currentUser.favorites, "span", "");
  }

  function getHostName(url) {
    let hostName;
    if (url.indexOf("://") > -1) {
      hostName = url.split("/")[2];
    } else {
      hostName = url.split("/")[0];
    }
    if (hostName.slice(0, 4) === "www.") {
      hostName = hostName.slice(4);
    }
    return hostName;
  }

  function inUserInfo() {
    if (currentUser) {
      localStorage.setItem("token", currentUser.loginToken);
      localStorage.setItem("username", currentUser.username);
    }
  }
});
