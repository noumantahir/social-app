import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  AsyncStorage,
  TouchableHighlight,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Button,
  Image,
  View
} from 'react-native';

import * as firebase from 'firebase'
import * as Values from '../res/Values';
import * as Styles from '../res/Styles';
import HelperMethods from '../utility/HelperMethods'
import UserNotificationService from '../utility/UserNotificationService'
import Ionicons from 'react-native-vector-icons/Ionicons';


export default class NotificationsScreen extends Component<{}>{

  static navigationOptions = ({navigation}) => {
    console.log(navigation);
    return {
    title:"Notifications",
  }}

  constructor(props){
    super(props)
    this.mNextBatchPriority = -(new Date()).getTime()
    this.state = {isLoading:false}
  }

  fetchUserNotificaitons(){
    this.uid = firebase.auth().currentUser.uid;
    if(!this.state.isLoading){
      this.setState({isLoading:true})

      firebase.database().ref("user_data").child(this.uid).child("notification")
        .orderByChild("priority")
        .startAt(this.mNextBatchPriority)
        .limitToFirst(Values.Numbers.ITEMS_PER_BATCH)
        .once('value')
        .then((snapshot)=>{
          var newNotifications = []
          var post = 0;
          var priority = this.mNextBatchPriority;

          if(snapshot.numChildren() <= 0){
            this.setState({endOfData:true, isLoading:false})
            return
          }

          snapshot.forEach((childSnap) =>{
            var notification = childSnap.val();
            notification.key = childSnap.key;
            newNotifications.push(notification);

            priority = notification.priority;
          });

          this.mNextBatchPriority = priority + 1;

          this.setState((state)=>{
            var notifications = state.notifications || []
            state.notifications = notifications.concat(newNotifications);
            state.isLoading = false;
            return state;
          })
        })
      }
  }

  _renderNotificationItem = (item) => {
    const notification = item.item;
    const navigation = this.props.navigation;

    const onClick = ()=>{
      switch (notification.action) {
        case UserNotificationService.NOTIFICATION_ACTION_POST:
          navigation.navigate("PostDetails", {postKey:notification.actionKey});
          break;
        case UserNotificationService.NOTIFICATION_ACTION_USER:
          navigation.navigate("UserProfile", {uid:notification.actionKey});
          break;
        default:

      }
    }

    return (
      <View style={Styles.background.card} >
        <TouchableHighlight underlayColor={Values.Colors.COLOR_BACKGROUND} onPress={onClick} >
          <View style={{flexDirection:'row', flex:1}}>
            <Image style={{height:32, width:32, backgroundColor:Values.Colors.COLOR_LIGHT_GRAY}}
              resizeMode='contain'
              source={{uri: notification.thumbURL}} borderRadius={16} />
            <View style={{flex:1, flexDirection:'column', marginLeft:4}}>
              <Text style={{fontWeight:'500', fontSize:16}}> {notification.title || ""}</Text>
              <Text style={{
                color:Values.Colors.COLOR_GRAY,
                fontSize:12,
                marginLeft:4,
              }}>{notification.body}</Text>
            </View>

            <Text style={{color:Values.Colors.COLOR_GRAY, fontSize:12}} >{HelperMethods.getShortTime(notification.timestamp)}</Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }

  _renderFooter = () => {
    var retComponet = (this.state.isLoading) ? <ActivityIndicator animating={true} /> : null;
    if(this.state.endOfData){
       retComponet = this.state.notifications ?
         <View style={{
           width:Dimensions.get('window').width - 32,
           height:1,
           margin:16,
           backgroundColor:Values.Colors.COLOR_GRAY}}
         />
         :
         <View style={{flex:1, alignItems:'center', margin:16}}>
           <Text style={Styles.text.screenPlaceholder} >No Notificaitons Yet</Text>
         </View>

    }
    return retComponet;
  }

  render(){
    var notifications = this.state.notifications || []
    return (
      <FlatList
        data = {notifications}
        renderItem = {this._renderNotificationItem}
        keyExtractor = {(item, index) => item.key}
        extraData = {this.state}
        ListFooterComponent = {this._renderFooter}
        onEndReached = {()=>{
          if(!this.state.endOfData)
            this.fetchUserNotificaitons()
        }}
      />
    )
  }


}
