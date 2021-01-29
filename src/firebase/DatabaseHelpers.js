/* @flow */
import {DeviceEventEmitter} from 'react-native'
import firebase from 'firebase';
import * as Contract from './DatabaseContract';
import * as Values from '../res/Values';
import GeoHelpers from '../utility/GeoHelpers';
import CloudinaryHelpers from '../utility/CloudinaryHelpers';
import PostLinkerService from '../utility/PostLinkerService';
import UserNotificationService from '../utility/UserNotificationService';
import RNFirebase from 'react-native-firebase';
import MessagingHelpers from '../firebase/MessagingHelpers';


export class User {

  static fetchSelectedUsers(usersMap){
    return new Promise((resolve, reject)=>{
      const promises = [];
      for(const uid in usersMap){
        const promise = firebase.database().ref(Contract.User.PATH_BASE)
          .child(uid)
          .once("value")

        promises.push(promise)
      }

      const onSnapshots = (snapshots) => {
        snapshots.map((userSnap) =>{
          const uid = userSnap.key;
          const user = userSnap.val();
          usersMap[uid] = user
        })

        resolve(usersMap)
      }

      Promise.all(promises)
        .then(onSnapshots)
        .catch(err=>console.error(err))
    })
  }


  static updateUser(values:any){
    const uid = firebase.auth().currentUser.uid;
    firebase.database().ref(Contract.User.PATH_BASE)
      .child(uid)
      .update(values)

  }

  static updateFcmToken(fcmToken){
    try{
      const uid = firebase.auth().currentUser.uid;
      firebase.database().ref(Contract.User.PATH_BASE)
        .child(uid)
        .child(Contract.User.CHILD_FCM_TOKEN)
        .set(fcmToken);

    }catch(er){
      console.warn(er);
    }
  }



  static fetchFcmToken(uid){
    return new Promise((resolve, reject)=>{
      firebase.database().ref(Contract.User.PATH_BASE)
        .child(uid)
        .child(Contract.User.CHILD_FCM_TOKEN)
        .once(
          'value',
          (snapshot) => {
            const fcmToken = snapshot.val();
            if(fcmToken){
              resolve(fcmToken)
            }
            else{
              reject("Failed to retrieve token")
            }
          },
          (err)=>{
            console.warn(err.message);
            reject(err)
          }
        )
    })
  }



  static fetchUser(uid:string){
    return new Promise((resolve, reject)=>{
      console.log("Fetching user:", uid);
      firebase.database().ref(Contract.User.PATH_BASE)
        .child(uid)
        .once("value")
        .then((snapshot)=>{
          const user = snapshot.val();
          console.log("Returning user:", user);
          resolve(user);
        })
        .catch((err)=>{console.warn(err); reject(err)})
    })
  }

  static listenForUser(uid:string, callback, onError){
    return firebase.database().ref(Contract.User.PATH_BASE)
      .child(uid)
      .on("value", (snapshot)=>{
        const user = snapshot.val();
        if(user){
          callback(user)
        }else{
          onError("Failed to fetch user")
        }
      },
      (error)=>{
        onError(error)
      }
    )
  }

  static unlistenForUser(uid:string, callbackFunction){
    firebase.database().ref(Contract.User.PATH_BASE)
      .child(uid)
      .off("value", callbackFunction)
  }

  static async updateUserStats(post:Contract.Post, postKey:string){
    try{

      const uid = post.uid;

      const addressLevels:any = GeoHelpers.getAddressLevels(post.address_components)

      const baseKey = (addressLevels.level1 === "Other" || !addressLevels.countryCode)?(
          addressLevels.level1
        ):(
          `${addressLevels.level1}, ${addressLevels.countryCode}`
        );

      const childKey = addressLevels.level2 === "Other"?(
        post.regionString
      ):addressLevels.level2


      User.updateVisitCounts(uid, addressLevels.countryCode, addressLevels.level2)

      //base referecne to stats
      const baseRef = firebase.database().ref(Contract.UserData.PATH_BASE)
        .child(uid)
        .child(Contract.Stats.PATH_BASE)
        .child(baseKey)

      //update priority and total posts
      const baseTotalPostsSnapshot = await baseRef
        .child(Contract.Stats.CHILD_TOTAL_POSTS)
        .once('value');

      //update base total posts for level 1
      var baseTotalPosts = baseTotalPostsSnapshot.val() || 0;
      baseTotalPosts++;
      var baseValues = {
        totalPosts:baseTotalPosts,
        priority:-baseTotalPosts
      }

      baseRef.update(baseValues);

      //update level2 indices
      const level2Ref = baseRef
        .child(Contract.Stats.PATH_LEVEL_2)
        .child(childKey)

      const level2Snapshot = await level2Ref.once('value');

      var level2Child = level2Snapshot.val()

      var postsSetKey = null;
      if(!level2Child){
        //make new set
        postsSetKey = baseRef.push().key;
        level2Child = {
          postsSetKey,
          priority:-1,
          totalPosts:1,
        }
      }else{
        //update existing set
        postsSetKey = level2Child.postsSetKey;
        const totalPosts = level2Child.totalPosts + 1;
        level2Child.totalPosts = totalPosts;
        level2Child.priority = -totalPosts;
      }

      if(post.media){
        const {publicId, resourceType} = post.media[0];
        level2Child.thumbUrl = resourceType === 'image' ?
          CloudinaryHelpers.getSmallThumbUrlForImage(publicId)
          :
          CloudinaryHelpers.getSmallThumbUrlForVideo(publicId)
      }


      //put post set entry
      firebase.database().ref(Contract.UserData.PATH_BASE)
        .child(uid)
        .child(Contract.PostData.PATH_LEVEL_2_SETS)
        .child(postsSetKey)
        .child(postKey)
        .set(post.priority)

      //update level2child
      level2Ref.set(level2Child)

    }
    catch(err){
      console.error("Failed to update stats:", err.message);
    }
  }

  static async updateVisitCounts(uid, country:string = 'other', city:string = 'other'){
    try{
      console.log(`updating visit counts for ${city}, ${country}`);
      //check previous existance
      const countryRef = firebase.database().ref(Contract.UserData.PATH_BASE)
        .child(uid)
        .child(Contract.VisitCounts.PATH_BASE)
        .child(Contract.VisitCounts.PATH_COUNTRIES_INDEX)
        .child(country);

      const cityRef = firebase.database().ref(Contract.UserData.PATH_BASE)
        .child(uid)
        .child(Contract.VisitCounts.PATH_BASE)
        .child(Contract.VisitCounts.PATH_CITIES_INDEX)
        .child(city);

      const countryIndexSnap = await countryRef.once('value');
      const countryIndex = countryIndexSnap.val() || false;

      const cityIndexSnap = await cityRef.once('value')
      const cityIndex = cityIndexSnap.val() ||false;

      const updateCount = (ref:any) => {
        ref.once('value').then((countSnap)=>{
          var count = countSnap.val() || 0
          count++;
          ref.set(count)
        }).catch(err=>console.error(err.message));
      }

      //if does not exist
      if(!countryIndex){
        //update index
        countryRef.set(true)
        //update count
        const countRef = firebase.database().ref(Contract.UserData.PATH_BASE)
          .child(uid)
          .child(Contract.VisitCounts.PATH_BASE)
          .child(Contract.VisitCounts.PATH_COUNTS)
          .child(Contract.VisitCounts.CHILD_COUNTRIES)

        updateCount(countRef)
      }

      if(!cityIndex){
        //update index
        cityRef.set(true)
        //update count
        const countRef = firebase.database().ref(Contract.UserData.PATH_BASE)
          .child(uid)
          .child(Contract.VisitCounts.PATH_BASE)
          .child(Contract.VisitCounts.PATH_COUNTS)
          .child(Contract.VisitCounts.CHILD_CITIES)

        updateCount(countRef)
      }

    }

    catch(err){
      console.error(err.message)
    }
  }


  static updateAccountStatus(uid:string, accountStatus:string){
    firebase.database().ref(Contract.User.PATH_BASE)
      .child(uid)
      .child(Contract.User.CHILD_ACCOUNT_STATUS)
      .set(accountStatus)

    if(accountStatus === Contract.User.ACCOUNT_STATUS_BLOCKED){
      Post.suspendAllPostsForUser(uid);
    }
  }


  static fetchLoggedInUserType(){
    return new Promise((resolve, reject)=>{
      const uid = firebase.auth().currentUser.uid;
      firebase.database().ref(Contract.User.PATH_BASE)
        .child(uid)
        .child(Contract.User.CHILD_ACCOUNT_TYPE)
        .once(
          'value',
          (snapshot)=>{
            const userType = snapshot.val();
            if(userType){
              resolve(userType)
              return
            }
            reject("Failed to fetch account type")
          },
          (err)=>{console.warn(err.message), reject(err)}
        )
    })
  }
}


export class UserData {

  static async checkPostEntryInWishlist(uid, postKey){
    try{
      var isWishlistItem = false;

      const snapshot = await firebase.database().ref(Contract.UserData.PATH_BASE)
          .child(uid)
          .child(Contract.UserData.PATH_WISHLIST)
          .child(postKey)
          .once('value')

      const post = snapshot.val();
      isWishlistItem = post? true:false;
      return isWishlistItem;
    }catch(err){
      console.warn(err);
      return false;
    }
  }

  static fetchNotificationFlag(){
    return new Promise((resolve, reject)=>{
      const uid = firebase.auth().currentUser.uid;
      firebase.database().ref(Contract.UserData.PATH_BASE)
        .child(uid)
        .child(Contract.UserData.CHILD_UNREAD_NOTIFICATIONS_FLAG)
        .once(
          'value',
          (snapshot)=>{
            const statusFlag = snapshot.val()?true:false;
            resolve(statusFlag)
          },
          (err)=>{console.warn(err.message); reject(err.message)}
        )
    })
  }

  static updateNotificationFlag(uid:string, flagStatus:boolean){
    firebase.database().ref(Contract.UserData.PATH_BASE)
      .child(uid)
      .child(Contract.UserData.CHILD_UNREAD_NOTIFICATIONS_FLAG)
      .set(flagStatus)
  }

  static getUsersFollowingRef(uid){
    return firebase.database().ref(Contract.UserData.PATH_BASE)
      .child(uid)
      .child(Contract.UserData.PATH_FOLLOWINGS)
  }

  static getUsersFollowersRef(uid){
    return firebase.database().ref(Contract.UserData.PATH_BASE)
      .child(uid)
      .child(Contract.UserData.PATH_FOLLOWERS)
  }


  static fetchVisitCounts(uid){
    return new Promise((resolve, reject)=>{
      firebase.database().ref(Contract.UserData.PATH_BASE)
        .child(uid)
        .child(Contract.VisitCounts.PATH_BASE)
        .child(Contract.VisitCounts.PATH_COUNTS)
        .once('value')
        .then((snapshot)=>{
          if(snapshot.val()){
            const counts = snapshot.val();
            console.log("retrieved counts: " + JSON.stringify(counts));
            resolve(counts);
          }else{
            reject("No values returned")
          }
        })
        .catch(err=>{
          console.error(err.message)
          reject("Failed to fetch counts")
        })
    })

  }


  static async addPostToWishlist(uid, postKey, onStatus){
    //check if post is already in wishlist

    //fetch user
    const user = await User.fetchUser(uid)

    //fetch post
    const post = await Post.fetchPost(postKey)
    UserNotificationService.sendNotificationForPostAddedToWishlist(post.uid)

    //clean up post with new parameters
    const created_at = (new Date()).getTime();

    post.user = user;
    post.uid = uid;
    post.created_at = created_at;
    post.priority = -created_at
    post.likesCount = 0;
    post.commentsCount = 0;
    post.points = 0;
    post.status = "pending";



    //add post to wishlist
    const ref = firebase.database().ref(Contract.UserData.PATH_BASE)
      .child(uid)
      .child("wishlist")
      .child(postKey)

    ref.set(post)
    ref.once('value')
    .then((snapshot)=>{
      onStatus(snapshot.val() !== null)
    })
    .then((err)=>{
      console.warn(err);
      onStatus(false);
    });
  }

  static removePostFromWishlist(uid:string, postKey:string){
    firebase.database().ref(Contract.UserData.PATH_BASE)
      .child(uid)
      .child(Contract.UserData.PATH_WISHLIST)
      .child(postKey)
      .remove();

      DeviceEventEmitter.emit(Values.Strings.EVENT_REFRESH_WISHLIST, {})
  }
}

export class Post {

  static fetchPost(postKey){

    return new Promise((resolve, reject)=>{
      firebase.database().ref(Contract.Post.PATH_BASE)
        .child(postKey)
        .once('value')
        .then((snapshot)=>{
          const post = snapshot.val();
          if(post){
            resolve(post)
          }else{
            reject("Error: could not fetch post")
          }
        })
        .catch((err)=>{
          console.log(err);
          reject("Error: failed to make query")
        })
    })
  }


  static updateLikesCount(postKey:string, likesCount:number){
    console.log('Updating likes count:', postKey, likesCount);
      firebase.database().ref(Contract.Post.PATH_BASE)
        .child(postKey)
        .child(Contract.Post.CHILD_LIKES_COUNT)
        .set(likesCount)
  }


  static suspendAllPostsForUser(uid){
    console.log('suspending all user posts');
    firebase.database().ref(Contract.Post.PATH_BASE)
      .orderByChild(Contract.Post.CHILD_UID)
      .equalTo(uid)
      .once('value')
      .then((snapshot)=>{
          if(snapshot.hasChildren()){
            snapshot.forEach((postSnap)=>{
              const post:Contract.Post = postSnap.val()
              if(post){
                const values = new Contract.Post()
                values.status =  Contract.Post.STATUS_SUSPENDED
                postSnap.ref().update(values)

              }
            })
          }
      })
      .catch(err=>console.warn(err.message))
  }


  static fetchLikesCount(postKey:string){
    return new Promise((resolve, reject)=>{
      firebase.database().ref(Contract.Post.PATH_BASE)
        .child(postKey)
        .child(Contract.Post.CHILD_LIKES_COUNT)
        .once('value')
        .then((snapshot)=>{
          const likesCount = snapshot.val() || 0;
          resolve(likesCount);
        })
        .catch((err)=>{
          console.log(err)
          reject(err);
        })
    })
  }


  static incrementCommentsCount(postKey:string){

    return new Promise((resolve, reject)=>{
      //make a reference
      const ref = firebase.database().ref(Contract.Post.PATH_BASE)
        .child(postKey)
        .child(Contract.Post.CHILD_COMMENTS_COUNT)

      //fetch commnets count;
      ref.once("value")
        .then((snapshot)=>{
          var commentsCount = snapshot.val() || 0;

          //increment them
          commentsCount++

          //save them again
          ref.set(commentsCount);

          //check and return status
          ref.once('value')
            .then((snapshot)=>{
              const count = snapshot.val() || 0;
              if(count === commentsCount)
                resolve(true);
              else {
                reject(false)
              }
            })
        })
    })

  }



  static deletePost(postKey:string, postOwnerUid:string){
    PostLinkerService.unlinkPost(postKey, postOwnerUid);
    firebase.database().ref(Contract.Post.PATH_BASE)
      .child(postKey)
      .remove();
  }


  static hideFromTimeline(postKey:string, currentUserUid){
    firebase.database().ref(Contract.UserData.PATH_BASE)
      .child(currentUserUid)
      .child(Contract.UserData.PATH_TIMELINE)
      .child(postKey)
      .remove();

    DeviceEventEmitter.emit(Values.Strings.EVENT_REFRESH_TIMELINE, )
  }


  static addToFlaggedPosts(postKey:string, priority, currentUserUid){
    firebase.database().ref(Contract.FlaggedPosts.PATH_BASE)
      .child(postKey)
      .set(priority);

    FlaggedPosts.updateBadgeStatus(true)

  }


  static removeFromFlaggedPosts(postKey:string){
    firebase.database().ref(Contract.FlaggedPosts.PATH_BASE)
      .child(postKey)
      .remove();
  }


}

export class PostData {

  static updatePostLikeMap(postKey:string, uid:string, isLiked:boolean){
    return new Promise((resolve, reject)=>{
      firebase.database().ref(Contract.PostData.PATH_BASE)
        .child(postKey)
        .child(Contract.PostData.PATH_LIKE)
        .child(uid)
        .set(isLiked);


      resolve(true)
    })
  }

  static getLikesReference(postKey){
    return firebase.database().ref(Contract.PostData.PATH_BASE)
      .child(postKey)
      .child(Contract.PostData.PATH_LIKE)
  }

  static fetchUserLikeStatus(postKey:string, uid:string):Promise<boolean>{
    return new Promise((resolve, reject)=>{
      firebase.database().ref(Contract.PostData.PATH_BASE)
        .child(postKey)
        .child(Contract.PostData.PATH_LIKE)
        .child(uid)
        .once("value")
        .then((snapshot)=>{
          const isLiked = snapshot.val();
          resolve(isLiked || false)
        })
        .catch((err)=>{
          console.log(err);
          reject(err)
        })
    })
  }


  static async makeComment(postKey:string, comment:Contract.Comment){
    try{
      const ref = firebase.database().ref(Contract.PostData.PATH_BASE)
        .child(postKey)
        .child(Contract.PostData.PATH_COMMENT)
        .push();

      ref.set(comment)

      const status = await Post.incrementCommentsCount(postKey)

      UserNotificationService.sendNotificationForPostComment(
        postKey, comment.uid, comment.text)
      return status;

    }catch(err){
      console.warn(err);
    }
  }


  static listenForComments(
    postKey:string, onCallback:(comments:Array<Contract.Comment>)=>void, onError:(error:any)=>void){

      const onSnapshot = (snapshot) => {
        const comments = [];
        snapshot.forEach((commentSnap)=>{
          const comment:Contract.Comment = commentSnap.val();
          if(comment){
            comment.key = commentSnap.key;
            comments.push(comment)
          }
        })
        onCallback(comments)
      }


      const ref = firebase.database().ref(Contract.PostData.PATH_BASE)
        .child(postKey)
        .child(Contract.PostData.PATH_COMMENT)
        .orderByChild(Contract.Comment.CHILD_PRIORITY)

      ref.on("value", onSnapshot, (err)=>{
          console.log(err);
          onError(err)
        });

      return ref;

  }

  static listenForCommentsWithUser(
    postKey:string, onCallback:(comments:Array<Contract.Comment>)=>void, onError:(error:any)=>void){

      const onSnapshot = (snapshot) => {
        const comments = [];
        const userIds = {};

        snapshot.forEach((commentSnap)=>{
          const comment:Contract.Comment = commentSnap.val();
          if(comment){
            comment.key = commentSnap.key;

            //compile user map
            userIds[comment.uid] = true;
            comments.push(comment)
          }
        })

        //fetch all users collected in map
        User.fetchSelectedUsers(userIds)
          .then((usersMap)=>{
            //attach all users with associated comments
            const commentsWithUser = comments.map((comment) =>{
              const user = usersMap[comment.uid]
              comment.user = user;
              return comment
            })

            console.log("updated comments: ");

            onCallback(commentsWithUser)
          })
          .catch(err=>console.error(err))

      }


      const ref = firebase.database().ref(Contract.PostData.PATH_BASE)
        .child(postKey)
        .child(Contract.PostData.PATH_COMMENT)
        .orderByChild(Contract.Comment.CHILD_PRIORITY)

      ref.on("value", onSnapshot, (err)=>{
          console.log(err);
          onError(err)
        });

      return ref;

  }

  static unregisterCommentsListener(reference){
    reference.off('value')
  }

  static async updateLikeStatus(postKey:string, uid:string, isLiked:boolean){
    try{
      //update likes table in post data --- post_data -> {postKey} -> like -> {uid} -> boolean
      PostData.updatePostLikeMap(postKey, uid, isLiked)

      //update likesCount post -> {postKey} -> likesCount
      var likesCount = await Post.fetchLikesCount(postKey);
      likesCount = isLiked? likesCount + 1 : likesCount - 1;
      likesCount = likesCount < 0 ? 0 : likesCount;
      Post.updateLikesCount(postKey, likesCount);

      console.log("updated post likes status");
      //process notificaiton to
      if(isLiked)
        UserNotificationService.sendNotificationForPostLike(postKey, uid)

    }catch(err){
      console.log(err);
    }
  }


  static async fetchLatestComment(postKey){
    try{
      const commentsSnap = await firebase.database().ref(Contract.PostData.PATH_BASE)
        .child(postKey)
        .child(Contract.PostData.PATH_COMMENT)
        .orderByChild(Contract.Comment.CHILD_PRIORITY)
        .limitToLast(1)
        .once('value');


      var comment:Contract.Comment = new Contract.Comment();
      commentsSnap.forEach((commentSnap)=>{
        comment = commentSnap.val();
      })

      if(!comment.uid)
        return null

      const uid = comment.uid;
      const user = await User.fetchUser(uid);

      comment.user = user;

      console.log("Compiled latest comment:", comment);
      return comment;



    }catch(err){
      console.warn(err)
    }


  }

  static async fetchPostWithExtraData(postKey:string, currentUserUid:string){
    try{

      //get post first;
      const post = await Post.fetchPost(postKey);

      //get like status
      const isLiked = await PostData.fetchUserLikeStatus(postKey, currentUserUid)

      //get latest comment
      const latestComment = await PostData.fetchLatestComment(postKey)

      //get wishlist status
      const isWishlistItem = await UserData.checkPostEntryInWishlist(currentUserUid, postKey)

      //combine data
      post.key = postKey;
      post.isLoading = false;
      post.isLiked = isLiked;
      post.isWishlistItem = isWishlistItem;
      post.latestComment = latestComment;


      console.log("Returning Post:", post);
      return post;
    }
    catch(err){
      console.warn("Failed for fetch post with extra data:", err);
      return {
        key:postKey,
        isNull:true,
      };
    }
  }
}


export class Notification {

  static putNotification(id, targetUid, notification:Contract.Notification){

    //skip notification if user is self
    const uid = firebase.auth().currentUser.uid;
    if(targetUid === uid)
      return

    //Else put notificaiton to data base and send it's push
    firebase.database().ref("user_data").child(targetUid).child("notification")
      .child(id).set(notification);

    firebase.database().ref(Contract.UserData.PATH_BASE)
      .child(targetUid)
      .child(Contract.UserData.CHILD_UNREAD_NOTIFICATIONS_FLAG)
      .set(true);

    //TODO: send push notification
    MessagingHelpers.sendPushNotification(
      targetUid,
      notification.title,
      notification.body)

  }
}


export class FlaggedPosts {

  static updateBadgeStatus(status:boolean){
    firebase.database().ref(Contract.FlaggedPosts.PATH_BASE_BADGE)
      .set(status)
  }

  static fetchBadgeStatus(){
    return new Promise((resolve, reject)=>{
      firebase.database().ref(Contract.FlaggedPosts.PATH_BASE_BADGE)
        .once('value')
        .then((snapshot)=>{
          const status = snapshot.val()
          resolve(status)
        })
        .catch(reject)
    })
  }
}
