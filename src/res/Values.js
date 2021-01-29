/* @flow */

export class Colors {

  static get COLOR_BACKGROUND(){return '#f2f2f2';}
  static get COLOR_LIGHT_GRAY(){ return '#CCCCCC';}
  static get COLOR_GRAY(){ return 'gray';}
  static get COLOR_GREEN(){return '#4CAF50'}
  static get COLOR_RED(){return '#F44336'}
  static get COLOR_ORANGE(){return '#FF9800'}
  static get COLOR_TEAL(){return '#009688'}
  static get COLOR_PURPLE(){return '#673AB7'}
  static get COLOR_DARKER_GRAY(){return '#444444'}
  static get COLOR_WHITE(){ return 'white';}
  static get COLOR_BLUE(){ return 'blue';}
  static get COLOR_BLACK(){return 'black';}
  static get COLOR_BLACK_TRANS(){return '#00000080';}
  static get COLOR_INDIGO(){return '#3F51B5'}
  static get COLOR_BLUE_600(){return '#1E88E5'}
  static get COLOR_TRANSPARENT(){return '#00000000'}

  static get COLOR_PRIMARY(){return Colors.COLOR_BLUE_600}
}


export class Dimens{
  static get BODY_HEIGHT_FACTOR() { return 0.8 };
  static get OUTER_MARGIN () { return 12};
  static get INNER_BODY_MARGIN () { return 8};
  static get MINI_MAP_HEIGHT(){return 256};
  static get MICRO_MAP_HEIGHT(){return 128};

  static get CARD_TOP_MARGIN(){return 8};
  static get CARD_SIDE_MARGIN(){return 6};
  static get CARD_INNER_PADDING(){return 8};
  static get CARD_BORDER_RADIUS(){return 4}

  static get NEW_POST_MAP_HEIGHT(){return 256};
}

export class Numbers{
  static get ITEMS_PER_BATCH() { return 3 };
}

export class Images{
  static get SPLASH(){return require('./drawables/splash.png')}
  static get INTRO_1(){return require('./drawables/intro_1.png')}
  static get INTRO_2(){return require('./drawables/intro_2.png')}
  static get INTRO_3(){return require('./drawables/intro_3.png')}
  static get INTRO_4(){return require('./drawables/intro_4.png')}
  static get IC_CITY_PLACEHOLDER(){return require('./drawables/ic_city_placeholder.png')}

}

export class Strings{
  static get GOOGLE_MAPS_API_KEY(){return "AIzaSyDF8IQG7_S1LaK7N3D2O4I3q-9sCrm7eqY"}
  static get GOOGLE_SERVICES_API_KEY(){return "AIzaSyDgn7OpYyetU-N02diKjPvvpenpHz3yU38"}

  static get EVENT_REFRESH_WISHLIST(){return "EVENT_REFRESH_WISHLIST"}
  static get EVENT_FETCH_UPDATED_POST(){return "EVENT_FETCH_UPDATED_POST"}
  static get EVENT_REFRESH_TIMELINE(){return "EVENT_REFRESH_TIMELINE"}
  static get INTRO_TEXT_1(){return "Bucketlist is at its core a way for users to track their accomplishmentas and experiences - and earn points and rewards for doing so"}
  static get INTRO_TEXT_2(){return "The catch is that users must upload a picture or video of themselves actually doing each ‘item’ (for example, skydiving, or traveling to a specific location, or completing a dare or challenge)"}
  static get INTRO_TEXT_3(){return "Once the Bucketlist team verifies that the user actually completed an item, points are awarded depending on the difficulty. Points are to be awarded by category."}
  static get EULA_TITLE(){return "End User License Agreement"}
  static get EULA_TEXT(){return `1. All user(s) (hereinafter, "licensee/licensees") of the application hereby agree to terms (EULA) and these terms must make it clear that there is no tolerance for objectionable content or abusive users.\n2. Licensor reserves the right to implement and use a method for filtering objectionable content. Licensor reserves the right to remove from the application any content it deems objectionable, for any reason, at any time. Licensee shall have no cause of action for the removal of content deemed objectionable by the licensor.\n3. Licensor reverses the right to implement a mechanism for users to flag objectionable content.\n4.  Licensor reserves the right to implement a mechanism for users to block abusive users.\n5. Licensor reserves the right to and will act on objectionable content reports within 24 hours by removing the content and ejecting the user who provided the offending content.`}
}

export class Screens{
  static get SCREEN_COMMENTS_SCREEN(){return "Comments"}
  static get SCREEN_USER_PROFILE(){return "UserProfile"}
  static get SCREEN_NEW_POST(){return "NewPost"}
  static get SCREEN_USERS_LIST(){return "UsersList"}
  static get SCREEN_POSTS_COLLECTION(){return "PostsCollection"}
  static get SCREEN_FLAGGED_POSTS(){return 'FlaggedPosts'}
}
