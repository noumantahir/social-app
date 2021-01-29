/*@flow*/

import RNFirebase from 'react-native-firebase';
import * as DatabaseHelpers from './DatabaseHelpers';

export default class MessagingHelpers {

  static processToken () {
    RNFirebase.messaging().getToken()
      .then(fcmToken => {
        if (fcmToken) {
          // user has a device token
          DatabaseHelpers.User.updateFcmToken(fcmToken);

        } else {
          // user doesn't have a device token yet
        }
      });
  }

  static processPermission(){
    RNFirebase.messaging().hasPermission()
      .then(enabled => {
        if (enabled) {
          // user has permissions
        } else {
          // user doesn't have permission
          RNFirebase.messaging().requestPermission()
            .then(() => {
              // User has authorised
            })
            .catch(error => {
              // User has rejected permissions
            });
        }
      });
  }

  //TODO: replace token with driverUid as in firebase functions case we can fetch
  //token from server functions body
  static sendPushNotification(
    uid:string,
    title:string,
    body:string
  ){

    DatabaseHelpers.User.fetchFcmToken(uid)
      .then((fcmToken)=>{

        if(!fcmToken)
          return;

        const baseUrl = "https://us-central1-com-noumantahir-bucket-list.cloudfunctions.net/sendPushNotification";

        var fetchUrl = baseUrl + "?title=" + title
                          +"&body=" + body
                          +"&token=" + fcmToken;

        fetch(fetchUrl).then((response)=>{
          //alert(JSON.stringify(response));
        })
      })
      .catch(err=>console.warn(err))

  }

  // static async sendNotificationMessage(targetUid){
  //   // Create a RemoteMessage
  //   const message = new RNFirebase.messaging.RemoteMessage()
  //     .setMessageId('unique id')
  //     .setTo('senderId@gcm.googleapis.com')
  //     .setData({
  //       key1: 'value1',
  //       key2: 'value2',
  //     });
  //
  //   // Send the message
  //   RNFirebase.messaging().sendMessage(message);
  // }

}
