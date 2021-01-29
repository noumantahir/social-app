/**
@flow
 *
 */

 import * as firebase from 'firebase';
 import * as DatabaseHelpers from '../firebase/DatabaseHelpers';
 import * as Contract from '../firebase/DatabaseContract';




 export default class UserNotificationService {
    static NOTIFICATION_ACTION_POST = "post";
    static NOTIFICATION_ACTION_USER = "user";

   static sendNotificaitonForUserFollowed(targetUid){
      //fetch current user name.
      const uid = firebase.auth().currentUser.uid;
      const timestamp = (new Date()).getTime();

      firebase.database().ref("user")
        .child(uid)
        .once('value').then((snapshot)=>{
          const user = snapshot.val();
          if(user === null){
            return;
          }

          const id = `${uid}_follower`
          const title = "New Follower";
          const body = user.name + " started following you, tap to view profile"

          //compile body
          var notification = new Contract.Notification();
          notification.action = Contract.Notification.NOTIFICATION_ACTION_USER;
          notification.timestamp = timestamp
          notification.priority = -timestamp
          notification.actionKey = uid;
          notification.title = title;
          notification.thumbURL = user.photoURL;
          notification.body = body;

          //send notification to targetUid
          DatabaseHelpers.Notification.putNotification(id, targetUid, notification)
      })
   }

   static async sendNotificationForPostComment(postKey, uid, commentText:string = ''){
     try{
       const timestamp = (new Date()).getTime();

       //fetch post,
       const post = await DatabaseHelpers.Post.fetchPost(postKey)
       if(!post) return;

       //fetch user,
       const user = await DatabaseHelpers.User.fetchUser(uid)
       if(!user) return;

       const targetUid = post.uid;
       const title = "New Post Comment"
       const id = `${postKey}_comment_${uid}`

       //compile notification body
       var body = `${user.name} commented, "${commentText}".`;

       const notification = new Contract.Notification();
       notification.action = Contract.Notification.NOTIFICATION_ACTION_POST;
       notification.timestamp = timestamp
       notification.priority = -timestamp
       notification.actionKey = postKey;
       notification.title = title;
       notification.thumbURL = user.photoURL;
       notification.body = body;

       DatabaseHelpers.Notification.putNotification(id, targetUid, notification)

     }catch(err){
       console.warn(err);
     }
   }



   static async sendNotificationForPostLike(postKey, uid){
     try{
       const timestamp = (new Date()).getTime();

       //fetch post,
       const post = await DatabaseHelpers.Post.fetchPost(postKey)
       if(!post) return;

       //fetch user,
       const user = await DatabaseHelpers.User.fetchUser(uid)
       if(!user) return;

       const id = `${postKey}_like`
       const targetUid = post.uid;
       const title = "New Post Like"

       //compile notification body
       var body = `${user.name}`
       if(post.likesCount > 1)
          body += ` and ${post.likesCount - 1} others`
       body += " liked your post"

       const notification = new Contract.Notification();
       notification.action = Contract.Notification.NOTIFICATION_ACTION_POST;
       notification.timestamp = timestamp
       notification.priority = -timestamp
       notification.actionKey = postKey;
       notification.title = title;
       notification.thumbURL = user.photoURL;
       notification.body = body;

       DatabaseHelpers.Notification.putNotification(id, targetUid, notification)


     }catch(err){
       console.warn(err);
     }
   }



   static async sendNotificationForPostAddedToWishlist(targetUid){
     try{
       const timestamp = (new Date()).getTime();
       const uid = firebase.auth().currentUser.uid;

       const user = await DatabaseHelpers.User.fetchUser(uid);
       if(!user){return;}

       const id = `${uid}_wishlist`
       const title = "User Activity";
       const body = user.name + " added your post to his/her wishlist, tap to view profile"

       //compile body
       var notification = new Contract.Notification();
       notification.action = Contract.Notification.NOTIFICATION_ACTION_USER;
       notification.timestamp = timestamp
       notification.priority = -timestamp
       notification.actionKey = uid;
       notification.title = title;
       notification.thumbURL = user.photoURL;
       notification.body = body;

       //send notification to targetUid
       DatabaseHelpers.Notification.putNotification(id, targetUid, notification)
     }catch(err){
       console.warn(err);
     }
   }



   static sendNotificationForPostReviewed(postKey){

   }

 }
