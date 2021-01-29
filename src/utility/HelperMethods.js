/*@flow*/

import firebase from 'firebase';
import * as Contract from '../firebase/DatabaseContract';
import CloudinaryHelpers from './CloudinaryHelpers';
 import {NavigationActions} from 'react-navigation';

export default class HelperMethods{

  static DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  static MONTHS = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];
static MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
"Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
];

  static getShortTime(timestamp){

    curTimestamp = (new Date()).getTime();

    timeDiff = curTimestamp - timestamp

    if(timeDiff < 60000){
      return "now"
    }else if(timeDiff < 3600000){
      const mins = Math.ceil(timeDiff / 60000)
      return (mins + " mins ago")
    }else if (timeDiff < 86400000){
      const hours = Math.ceil(timeDiff / 3600000)
      return (hours + " hrs ago")
    }else if (timeDiff < 604800000){
      const days = Math.ceil(timeDiff / 86400000)
      return (days + " days ago")
    }else{
      const dateTime = new Date(timestamp);
      const day = dateTime.getDate();
      const month = HelperMethods.MONTHS_SHORT[dateTime.getMonth()];
      const year = dateTime.getFullYear();

      var retString = day + " " + month;

      if(year !== (new Date()).getFullYear())
        retString += ", " + year

      return retString;
    }
  }


  static formatTimeFromSecs(secs:number){
    mins = 0;
    if(secs > 60){
      mins = Math.floor(secs / 60)
      secs = Math.floor(secs % 60)
    }

    return `${mins<10?('0'+mins):mins}:${secs<10?('0'+secs):secs}`

  }

  static simpleFetch(fetchUrl, callback, onError){
    fetch(fetchUrl)
            .then((response) => response.json())
            .then((responseJson) => {
              console.log(JSON.stringify(responseJson));

              callback(responseJson)
            })
            .catch((error) => {
              onError(error);
            });
  }

  //TODO: update this fucntion as requriedZ
  static async updateFbUidIfRequired(){
    try{
      //fetch user from databaseRef
      const uid = firebase.auth().currentUser.uid;
      const userSnapshot = await firebase.database().ref(Contract.User.PATH_BASE)
        .child(uid)
        .once('value');
      const dbUser = userSnapshot.val();
      if(!dbUser)
        return;

      //check fbUID existance
      if(dbUser.fbUid)
        return;

        console.log("Updating fbUid for user");
      //if not present, get fbUid from providerData
      const providerData = firebase.auth().currentUser.providerData;
      if(!providerData)
        return

      //put fbUId and cloudinary profile url to user
      if(providerData.uid){
        dbUser.fbUid = providerData.uid;
      }else if(providerData[0]){
        dbUser.fbUid = providerData[0].uid
      }

      if(!dbUser.fbUid)
        return;

      dbUser.photoURL = CloudinaryHelpers.getFacebookProfilePicThumb(dbUser.fbUid)
      userSnapshot.ref.set(dbUser);

      //update all posts with fbUid and photoURL
      const postsSnapshot = await firebase.database().ref(Contract.Post.PATH_BASE)
        .orderByChild(Contract.Post.CHILD_UID)
        .equalTo(uid)
        .once('value');

      if(!postsSnapshot.hadChildren())
        return;

      postsSnapshot.forEach((postSnapshot)=>{
        const post = postSnapshot.val();
        if(!post)
          return;

        post.user = dbUser;
        postSnapshot.ref.set(post);
      })

      console.log("Updated fbUid succesfully");
    }
    catch(err){
      console.warn(err);
    }
  }

  static simpleFetchPromise (fetchUrl){
    return new Promise((resolve, reject)=>{
      HelperMethods.simpleFetch(fetchUrl, resolve, reject)
    })
  }

  static showBadge(navigation:any, flagStatus:boolean){
    navigation.dispatch(NavigationActions.setParams({
       params: { showBadge: flagStatus },
       key: 'NotificationsTab',
     })
   );
  }


}
