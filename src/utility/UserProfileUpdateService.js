/**
@flow
**/

import * as firebase from 'firebase'
import UserNotificationService from './UserNotificationService';

export default class UserProfileUpdateService{

  static followUser(targetUid){
    const uid = firebase.auth().currentUser.uid;

    firebase.database().ref("user_data").child(uid).child("followings")
        .child(targetUid).set(true);

    firebase.database().ref("user_data").child(targetUid).child("followers")
            .child(uid).set(true);

    //update numFollowers and numFollowings
    firebase.database().ref("user").child(uid).child("numFollowings")
        .once("value").then((snapshot)=>{
          var numFollowings = snapshot.val() || 0;
          numFollowings += 1;
          snapshot.ref.set(numFollowings);
        });

    firebase.database().ref("user").child(targetUid).child("numFollowers")
            .once("value").then((snapshot)=>{
              var numFollowers = snapshot.val() || 0;
              numFollowers += 1;
              snapshot.ref.set(numFollowers);
            })

    //send appropriate notification;
    UserNotificationService.sendNotificaitonForUserFollowed(targetUid);
  }

  static unfollowUser(targetUid){
    const uid = firebase.auth().currentUser.uid;
    firebase.database().ref("user_data").child(uid).child("followings")
        .child(targetUid).remove();

    firebase.database().ref("user_data").child(targetUid).child("followers")
            .child(uid).remove();

    //update numFollowers and numFollowings
    firebase.database().ref("user").child(uid).child("numFollowings")
                .once("value").then((snapshot)=>{
                  var numFollowings = snapshot.val() || 0;
                  numFollowings = numFollowings <= 0 ? 0 : --numFollowings;
                  snapshot.ref.set(numFollowings);
    });

    firebase.database().ref("user").child(targetUid).child("numFollowers")
                  .once("value").then((snapshot)=>{
                      var numFollowers = snapshot.val() || 0;
                      numFollowers = numFollowers <= 0 ? 0 : --numFollowers;
                      snapshot.ref.set(numFollowers);
    })
  }
}
