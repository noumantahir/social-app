/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React from 'react'
import {View} from 'react-native';
import firebase from 'firebase';

import { AppRegistry } from 'react-native';
import HomeScreen from './screens/HomeScreen.js';
import LoginScreen from './screens/LoginScreen.js';
import NewPostScreen from './screens/NewPostScreen.js';
import MarkerMapScreen from './screens/MarkerMapScreen.js';
import UserPostsScreen from './screens/UserPostsScreen.js';
import UserSearchScreen from './screens/UserSearchScreen.js';
import UserProfileScreen from './screens/UserProfileScreen.js';
import TimelineScreen from './screens/TimelineScreen.js';
import PostsCollectionScreen from './screens/PostsCollectionScreen.js';
import PostDetailsScreen from './screens/PostDetailsScreen.js';
import UserStatsScreen from './screens/UserStatsScreen.js';
import AdminEventsScreen from "./screens/AdminEventsScreen";
import WishListScreen from './screens/WishListScreen';
import PostSearchScreen from './screens/PostSearchScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import CommentsScreen from './screens/CommentsScreen';
import UsersListScreen from './screens/UsersListScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FlaggedPostsScreen from './screens/moderator_screens/FlaggedPostsScreen';


import {
  StackNavigator,
  TabNavigator,
  TabBarBottom,
  NavigationActions,
} from 'react-navigation';

import * as Values from './res/Values';
import IconBadge from 'react-native-icon-badge';


// Initialize Firebase
  var config = {
    apiKey: "AIzaSyDqTJOhKb5e8T3PAsGYMTEIYFwQZDm-hcI",
    authDomain: "com-noumantahir-bucket-list.firebaseapp.com",
    databaseURL: "https://com-noumantahir-bucket-list.firebaseio.com",
    projectId: "com-noumantahir-bucket-list",
    storageBucket: "",
    messagingSenderId: "710304482808"
  };
  firebase.initializeApp(config);

//initialize cloudinary
  // cloudinary.config({
  //   cloud_name: 'hz93izbzd',
  //   api_key: '487165954462671',
  //   api_secret: 'oYupQPZ7tvo0s1tL1XAnd1WYQQk'
  // });


  //navigatin screens stack
  const screens = {
    Home: { screen: HomeScreen },
    MarkerMap: {screen: MarkerMapScreen},
    UserPosts: {screen: UserPostsScreen},
    Timeline: {screen: TimelineScreen},
    PostsCollection: {screen: PostsCollectionScreen},
    PostDetails: {screen: PostDetailsScreen},
    UserSearch: {screen: UserSearchScreen},
    UserProfile: {screen: UserProfileScreen},
    UserStats: {screen: UserStatsScreen},
    AdminEvents:{screen: AdminEventsScreen},
    WishList:{screen: WishListScreen},
    PostSearch:{screen:PostSearchScreen},
    Notifications:{screen:NotificationsScreen},
    Comments:{screen:CommentsScreen},
    UsersList:{screen:UsersListScreen},
    FlaggedPosts:{screen:FlaggedPostsScreen}
  }

const HomeNavigator = StackNavigator(screens, {initialRouteName:"MarkerMap"});
const ExploreNavigator = StackNavigator(screens, {initialRouteName:"Timeline"});
const NewPostNavigator = StackNavigator({NewPost:{screen:NewPostScreen}})
const NotificationsNavigator = StackNavigator(screens, {initialRouteName:"Notifications"});
const ProfileNavigator = StackNavigator(screens, {initialRouteName:"UserProfile"});

const TabNav = TabNavigator({
  HomeTab: {
    screen: ExploreNavigator,
    navigationOptions: {
      tabBarLabel: 'Home',
      tabBarIcon: ({ tintColor, focused }) => (
         <Ionicons
          name={focused ? 'ios-home' : 'ios-home-outline'}
          size={26}
          style={{ color: tintColor }}
        />
      ),
    }
  },

  ExploreTab: {
    screen: HomeNavigator,
    navigationOptions: { tabBarLabel: 'Explore',
    tabBarIcon: ({ tintColor, focused }) => (
       <Ionicons
        name={focused ? 'ios-globe' : 'ios-globe-outline'}
        size={26}
        style={{ color: tintColor }}
      />
    ),
   }
  },

  NewPostTab:{
    screen: HomeScreen,
    navigationOptions: { tabBarLabel: 'New',
    tabBarIcon: ({ tintColor, focused }) => (
       <Ionicons
        name={focused ? 'ios-add-circle' : 'ios-add-circle-outline'}
        size={26}
        style={{ color: tintColor }}
      />
    ),
   }
  },

  NotificationsTab:{
    screen: NotificationsNavigator,
    navigationOptions:({ navigation }) => {
      console.log("tab navigation options: " + JSON.stringify(navigation))

      const showBadge = navigation.params?
        (navigation.params.showBadge || false) : false

      return {
        tabBarLabel: 'Notifications',
        tabBarIcon: ({ tintColor, focused }) => {
          return (
            <View style={{height:26, width:26}}>

                <Ionicons
                  name={focused ? 'ios-notifications' : 'ios-notifications-outline'}
                  size={26}
                  style={{ color: tintColor }}
                  />

                {showBadge?
                  <View style={{
                    position:'absolute',
                    top:0, left:0,
                    height:12, width:12,
                    borderRadius:6,
                    backgroundColor:Values.Colors.COLOR_RED,
                  }}/>
                  :null
              }
            </View>
          )
        },
      }
    }
  },

  ProfileTab:{
    screen: ProfileNavigator,
    navigationOptions: { tabBarLabel: 'Profile',
    tabBarIcon: ({ tintColor, focused }) => (
       <Ionicons
        name={focused ? 'ios-person' : 'ios-person-outline'}
        size={26}
        style={{ color: tintColor }}
      />
    ),
   }
  }
}, {
  tabBarPosition: 'bottom',
  animationEnabled: false,
  lazy: true,
  tabBarOptions: {
    activeTintColor: 'black',
  },
  tabBarComponent: ({jumpToIndex, ...props, navigation}) => (
        <TabBarBottom
            {...props}
            jumpToIndex={index => {
                if (index === 2) {
                  navigation.navigate('NewPost')
                }
                else {
                    jumpToIndex(index)
                }
            }}
        />
    )

});

export const App = StackNavigator({
    Login: {
      screen: LoginScreen,
      navigationOptions: {
        title: 'Login',
      },
    },
    Root: {
      screen:TabNav,
      navigationOptions:{
        header:null, gesturesEnabled: false,
      }
    },
    NewPost:{
      screen: NewPostNavigator,
    }
  },{
    mode: 'modal',
    headerMode: 'none',
  });
