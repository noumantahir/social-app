import * as firebase from "firebase";
import {DeviceEventEmitter} from 'react-native';
import * as Values from '../res/Values';

export default class PostLinkerService {

  static linkPost(postKey, priority, callback){
    //add code to link code

    //add post to user's own Timeline
    const uid = firebase.auth().currentUser.uid;
    firebase.database().ref("user_data").child(uid).child("timeline")
        .child(postKey).set(priority);

    //get all users following this users
    firebase.database().ref("user_data").child(uid).child("followers")
        .once("value").then((snapshot)=>{
            if(snapshot !== null && snapshot.numChildren() > 0){
              snapshot.forEach((childSnap)=>{
                  userKey = childSnap.key;

                  firebase.database().ref("user_data").child(userKey).child("timeline")
                      .child(postKey).set(priority);
              });
            }
        });

    DeviceEventEmitter.emit(Values.Strings.EVENT_REFRESH_TIMELINE, )

  }

  static unlinkPost(postKey, postOwnerUid){
    //add code to unlink code

    //remove post from user's own Timeline
    const uid = postOwnerUid || firebase.auth().currentUser.uid;
    firebase.database().ref("user_data").child(uid).child("timeline")
        .child(postKey).remove();

    //get all users following this users
    firebase.database().ref("user_data").child(uid).child("followers")
        .once("value").then((snapshot)=>{
            if(snapshot !== null && snapshot.numChildren() > 0){
              snapshot.forEach((childSnap)=>{
                  userKey = childSnap.key;

                  firebase.database().ref("user_data").child(userKey).child("timeline")
                      .child(postKey).remove();
              });
            }
        });

    DeviceEventEmitter.emit(Values.Strings.EVENT_REFRESH_TIMELINE, )
  }

  static linkUserPostsOnFollow(followedUserKey){

    firebase.database().ref("post").orderByChild("uid").equalTo(followedUserKey)
      .once("value").then((snapshot)=>{
          if(snapshot.val() !== null && snapshot.numChildren() > 0){
              snapshot.forEach((postSnap)=>{
                  const key = postSnap.key;
                  const priority = postSnap.val().priority;

                  //add post to user's own Timeline
                  const uid = firebase.auth().currentUser.uid;
                  firebase.database().ref("user_data").child(uid).child("timeline")
                      .child(key).set(priority);

              });
          }
      });

  }

  static unlinkUserPostsOnUnFollow(unFollowedUserKey){
    firebase.database().ref("post").orderByChild("uid").equalTo(unFollowedUserKey)
      .once("value").then((snapshot)=>{
          if(snapshot.val() !== null && snapshot.numChildren() > 0){
              snapshot.forEach((postSnap)=>{
                  const key = postSnap.key;
                  const priority = postSnap.val().priority;

                  //add post to user's own Timeline
                  const uid = firebase.auth().currentUser.uid;
                  firebase.database().ref("user_data").child(uid).child("timeline")
                      .child(key).remove();

              });
          }
      });
  }
}
