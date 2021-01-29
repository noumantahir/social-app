/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */


import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  AsyncStorage,
  Button,
  View
} from 'react-native';

import * as firebase from 'firebase';

import {LoginManager} from 'react-native-fbsdk';

export default class HomeScreen extends Component<{}> {

  static navigationOptions = ({ navigation, screenProps }) => {
    return {
      title: 'Root',
      headerLeft:<Button title="Logout" onPress={() => {

        firebase.auth().signOut().then(function() {
          // Sign-out successful.
          LoginManager.logOut();
          navigation.goBack();
        }, function(error) {
          // An error happened.
        });
      }}/>
    };
  }

  constructor(props){
    super(props);

    const uid = firebase.auth().currentUser.uid;
    firebase.database().ref('user').child(uid).once('value').then((snapshot) =>{
      const user = snapshot.val();
      try {
        AsyncStorage.setItem("KEY_USER_DATA", JSON.stringify(user));
        console.log("user data saved for later use");
      } catch (error) {
        // Error saving data
      }
    });
  }


  render(){
    const {navigation} = this.props;
    const uid = firebase.auth().currentUser.uid;
    return (
      <View style={{flex:1, alignItems:"center"}} >

        <Button title="Create New Post" onPress={() => {navigation.navigate("NewPost")}} />
        <Button title="Marker Map Screen" onPress={() => {navigation.navigate("MarkerMap")}} />
        <Button title="User Posts Screen" onPress={() => {navigation.navigate("UserPosts", {uid})}} />
        <Button title="Timeline Screen" onPress={() => {navigation.navigate("Timeline")}} />
        <Button title="Users Search" onPress={() => {navigation.navigate("UserSearch")}} />
        <Button title="Profile Screen" onPress={() => {navigation.navigate("UserProfile", {uid})}} />
        <Button title="User Stats Screen" onPress={() => {navigation.navigate("UserStats", {uid})}} />
        <Button title="Wishlist Screen" onPress={() => {navigation.navigate("WishList", {uid})}} />
        <Button title="Events Screen" onPress={() => {navigation.navigate("AdminEvents")}} />
        <Button title="Post Search Screen" onPress={() => {navigation.navigate("PostSearch")}} />

      </View>
    )
  }

}
