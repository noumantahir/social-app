/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

 import React, { Component } from 'react';
 import {
   Platform,
   StyleSheet,
   TextInput,
   Button,
   Dimensions,
   ScrollView,
   Image,
   AsyncStorage,
   ActivityIndicator,
   TouchableWithoutFeedback,
   TouchableOpacity,
   DeviceEventEmitter,
   FlatList,
   Alert,
   Text,
   View
 } from 'react-native';

 import MapView from 'react-native-maps';
 import {LoginManager} from 'react-native-fbsdk';
 import {NavigationActions} from 'react-navigation'

 import * as firebase from 'firebase';
 import * as Values from '../res/Values';
  import * as Styles from '../res/Styles';

 import PostLinkerService from '../utility/PostLinkerService';
 import PostListItem from '../components/PostListItem';
 import StatsListItem from './profile_screen_helpers/StatsListItem';
 import StatsHeaderItem from './profile_screen_helpers/StatsHeaderItem';
 import UserProfileUpdateService from '../utility/UserProfileUpdateService';
 import Ionicons from 'react-native-vector-icons/Ionicons';
 import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
 import FastImage from 'react-native-fast-image';
 import * as Contract from '../firebase/DatabaseContract';
 import * as DatabaseHelpers from '../firebase/DatabaseHelpers';

 const DATA_TYPE_STATS = "DATA_TYPE_STATS";
 const DATA_TYPE_POSTS = "DATA_TYPE_POSTS";
 const DATA_TYPE_WISHLIST = "DATA_TYPE_WISHLIST";

 const EVENT_TYPE_HEADER_RIGHT = "EVENT_TYPE_HEADER_RIGHT";

 const ACTION_FOLLOW = "ACTION_FOLLOW";
 const ACTION_UNFOLLOW = "ACTION_UNFOLLOW";
 const ACTION_LOGOUT = "ACTION_LOGOUT";

 export default class UserProfileScreen extends Component<{}> {

   static navigationOptions = ({ navigation, screenProps }) => {
     const params = navigation.state.params || {}

     var targetUid = params.uid

     if(!targetUid){
       const currentUser = firebase.auth().currentUser || {};
       targetUid = currentUser.uid || ""
     }

     var headerRight = null

     if(params.isSelf){
       headerRight =
        <TouchableOpacity onPress={()=>{
          DeviceEventEmitter.emit(EVENT_TYPE_HEADER_RIGHT, {action:ACTION_LOGOUT, targetUid})
          }}>
          <View  style={{marginRight:8}} >
            <Ionicons
               name={'ios-log-out'}
               size={26}
               style={{ color: Values.Colors.COLOR_BLACK }}
            />
          </View>
        </TouchableOpacity>

     }else{
       headerRight = params.isFollowed ?
          // <TouchableOpacity onPress={()=>{
          //    DeviceEventEmitter.emit(EVENT_TYPE_HEADER_RIGHT, {action:ACTION_UNFOLLOW, targetUid})
          //    }}>
          //    <View  style={{marginRight:8}} >
          //      <MaterialCommunityIcons
          //         name={'account-check'}
          //         size={26}
          //         style={{ color: Values.Colors.COLOR_BLACK }}
          //      />
          //    </View>
          //  </TouchableOpacity>
          <Button title="Unfollow" onPress={()=>{DeviceEventEmitter.emit(EVENT_TYPE_HEADER_RIGHT, {action:ACTION_UNFOLLOW, targetUid})}}/>
          :
          // <TouchableOpacity onPress={()=>{
          //   DeviceEventEmitter.emit(EVENT_TYPE_HEADER_RIGHT, {action:ACTION_FOLLOW, targetUid})
          //   }}>
          //   <View style={{marginRight:8}} >
          //     <MaterialCommunityIcons
          //        name={'account-plus'}
          //        size={26}
          //        style={{ color: Values.Colors.COLOR_BLACK }}
          //     />
          //   </View>
          // </TouchableOpacity>
          <Button title="Follow" onPress={()=>{DeviceEventEmitter.emit(EVENT_TYPE_HEADER_RIGHT, {action:ACTION_FOLLOW, targetUid})}}/>

     }

     return {
       title:"Profile",
       headerRight,
     }
   }

   constructor(props){
     super(props)
     const params = this.props.navigation.state.params || {};
     var targetUid = params.uid;
     if(!targetUid){
       const currentUser = firebase.auth().currentUser || {};
       targetUid = currentUser.uid || ""
     }


     this.state = {
       targetUid, post:{}, isUserLoading:true,
       isPostsLoading:true, isSelf:false, dataType:DATA_TYPE_STATS,
       loggedInUserType:Contract.User.USER_TYPE_DEFAULT
     };


   }

   componentDidMount(){
     this.fetchUser();
     this.fetchData();
     this.checkFollowStatus();
     this.fetchLoggedInUserType();

     DeviceEventEmitter.addListener(EVENT_TYPE_HEADER_RIGHT, this.headerRightListener)
   }


   fetchLoggedInUserType(){
     DatabaseHelpers.User.fetchLoggedInUserType()
      .then((userType)=>{
        this.setState({loggedInUserType:userType})
      })
      .catch(err=>console.warn(err))
   }


   fetchData(){
     this.fetchUserPosts();
     this.fetchWishlistItems();
     this.fetchUserStats();
   }


   componentWillUnmount(){
     DeviceEventEmitter.removeAllListeners(EVENT_TYPE_HEADER_RIGHT)

     if(this.userRef){
       this.userRef.off('value', this.userSnapshotListener);
     }
   }


   headerRightListener = (params) => {

     if(params.targetUid !== this.state.targetUid){
       return;
     }

     switch (params.action) {
       case ACTION_LOGOUT:
         this.logout();
         break;
       case ACTION_FOLLOW:
        this.followUser();
        break;
      case ACTION_UNFOLLOW:
        this.unfollowUser();
        break;
       default:

     }
   }


   fetchUserStats(){
     const uid = this.state.targetUid;
     firebase.database().ref(Contract.UserData.PATH_BASE)
      .child(uid)
      .child(Contract.Stats.PATH_BASE)
      .orderByChild(Contract.Stats.CHILD_PRIORITY)
      .once('value')
          .then((snapshot)=>{

            var stats = []
            snapshot.forEach((childSnap) =>{

              var statsItem = childSnap.val();

              statsItem.key = childSnap.key;
              stats.push(statsItem);

            });

            this.setState({stats, isUserLoading:false});

          });
   }


   fetchUserPosts(){

     const uid = this.state.targetUid;
     this.setState({isPostsLoading:true})
     firebase.database().ref("post").orderByChild("uid").equalTo(uid).once('value')
          .then((snapshot)=>{

            var posts = []
            snapshot.forEach((childSnap) =>{

              var post = childSnap.val();

              post.key = childSnap.key;
              posts.splice(0,0,post);

            });

            this.setState({posts, isPostsLoading:false});

          });
   }


   fetchWishlistItems(){
     const uid = this.state.targetUid;
     this.setState({isWishlistLoading:true})
     firebase.database().ref("user_data").child(uid).child("wishlist")
          .orderByChild("priority").once('value')
          .then((snapshot)=>{

            var wishlistItems = []
            snapshot.forEach((childSnap) =>{

              var post = childSnap.val();

              post.key = childSnap.key;
              wishlistItems.push(post);


            });

            this.setState({wishlistItems, isWishlistLoading:false});

          });
   }


   checkFollowStatus(){
     const uid = firebase.auth().currentUser.uid
     firebase.database().ref("user_data").child(uid).child("followings")
        .child(this.state.targetUid).once("value", (snapshot)=>{
            const isFollowed = (snapshot.val() !== null)
            this.props.navigation.setParams({isFollowed});
        });
   }


   fetchUser(){
     this.userRef = firebase.database().ref("user").child(this.state.targetUid);
     this.userRef.on("value", this.userSnapshotListener);
   }


   userSnapshotListener = (snapshot) => {
     var targetUser = snapshot.val();

     const isSelf = (snapshot.key === firebase.auth().currentUser.uid)
     const isBlocked = targetUser.accountStatus === Contract.User.ACCOUNT_STATUS_BLOCKED;


     this.setState({targetUser, isUserLoading:false, isSelf, isBlocked});
     this.props.navigation.setParams({isSelf})

     if(!isSelf) this.checkFollowStatus();
   }


   followUser(){
      UserProfileUpdateService.followUser(this.state.targetUid);
      PostLinkerService.linkUserPostsOnFollow(this.state.targetUid);
   }


   unfollowUser(){

     UserProfileUpdateService.unfollowUser(this.state.targetUid);
     PostLinkerService.unlinkUserPostsOnUnFollow(this.state.targetUid);
   }


   logout(){
     firebase.auth().signOut().then(()=> {
       // Sign-out successful.
       LoginManager.logOut();
       this.props.navigation.goBack(null);
       this.props.navigation.goBack(null);
     }).
     catch((error)=> {
       // An error happened.
     });
   }


   showUsersFollowing = () => {
     const ref = DatabaseHelpers.UserData.getUsersFollowingRef(this.state.targetUid)
     const params = {
       databaseRef:ref,
       title:'Followings'
     }
     this.props.navigation.navigate(Values.Screens.SCREEN_USERS_LIST, params)
   }


   showFollowers = () => {
     const ref = DatabaseHelpers.UserData.getUsersFollowersRef(this.state.targetUid)
     const params = {
       databaseRef:ref,
       title:'Followers'
     }
     this.props.navigation.navigate(Values.Screens.SCREEN_USERS_LIST, params)
   }



   _renderTabItem = (label, dataType)=>{
     return (
       <TouchableOpacity onPress={()=>{this.setState({dataType})}}>
         <View style={{
             borderRadius:16,
             marginRight:4,
             marginLeft:4,
             paddingLeft:16,
             paddingRight:16,
             justifyContent:'center',
             alignItems:'center',
             borderColor:this.state.dataType === dataType?
                Values.Colors.COLOR_BLUE_600:Values.Colors.COLOR_DARKER_GRAY,
             backgroundColor:this.state.dataType === dataType ?
               Values.Colors.COLOR_BLUE_600 : Values.Colors.COLOR_WHITE,
             flex:1,
             borderWidth:1,
           }} >

             <Text style={{
               flex:1,
               padding:4,
               fontWeight:'600',
               color:this.state.dataType === dataType ?
                 Values.Colors.COLOR_WHITE : Values.Colors.COLOR_DARKER_GRAY

               }}>{label}</Text>

         </View>
       </TouchableOpacity>
     )
   }


   _renderTabs = () => {
     return (
        <View style={{
            marginTop:8,
            flexDirection:'row',
            justifyContent:'center',
            marginLeft:8,
            marginRight:8
          }}>
          {this._renderTabItem("Stats", DATA_TYPE_STATS)}
          {this._renderTabItem("Achievements", DATA_TYPE_POSTS)}
          {this._renderTabItem("Wishlist", DATA_TYPE_WISHLIST)}
        </View>
     )
   }


   blockUser = () => {
     const onConfirm = () =>{
       DatabaseHelpers.User.updateAccountStatus(this.state.targetUid, Contract.User.ACCOUNT_STATUS_BLOCKED)
     }

     Alert.alert(
       "Confirm Block",
       "Are you sure you want to black this user",
       [
         {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         {text: 'Confirm', onPress:onConfirm}
       ],
      {cancelable:false}
     )
   }


   onModeratorMenuPress = () => {

     const buttons = [
       {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       {text: 'Block User', onPress:this.blockUser}
     ]

     Alert.alert(
       "Moderator Menu",
       "Perform action on opened profile",
       buttons,
       {cancelable:false}

     )
   }

   _renderModeratorMenuButton(){
     if(this.state.isSelf)
      return null;

     const loggedInUserType = this.state.loggedInUserType;
     const shouldPrintButton = loggedInUserType === Contract.User.USER_TYPE_ADMIN
      || loggedInUserType === Contract.User.USER_TYPE_MODERATOR;

      return shouldPrintButton?(
        <TouchableOpacity onPress={this.onModeratorMenuPress}>
          <View style={{marginLeft:8}} >
            <Ionicons
               name={'ios-settings'}
               size={24}
               style={{ color:Values.Colors.COLOR_GRAY }}
            />
          </View>
        </TouchableOpacity>
      ):null;

   }


   renderProfileHeader = () => {
     const user = this.state.targetUser || {} ;
     const screenWidth = Dimensions.get('screen').width;
     return(
       <View style={{flex:1}}>

        <View style={{
            alignItems:'center',
            padding:8,
            borderColor:Values.Colors.COLOR_LIGHT_GRAY,
            borderBottomWidth:1,
            backgroundColor:Values.Colors.COLOR_WHITE
          }} >

          <View style={{flex:1, width:screenWidth, marginTop:8, flexDirection:'row', justifyContent:'space-around', alignItems:'center'}} >

            <View style={{alignItems:'center'}}>
              <TouchableOpacity onPress={this.showFollowers}>
                <View style={{width:56,
                  height:56,
                  borderRadius:28,
                  backgroundColor:Values.Colors.COLOR_BLUE_600,
                  justifyContent:'center',
                  alignItems:'center'
                }} >
                  <Text style={{color:Values.Colors.COLOR_WHITE,
                    fontWeight:'bold',
                  fontSize:18,
                }} >{user.numFollowers || 0}</Text>
                </View>
              </TouchableOpacity >
              <Text>Followers</Text>
            </View>

            <View style={{alignItems:'center'}}>
              <FastImage style={{
                  width:100,
                  height:100,
                  backgroundColor:Values.Colors.COLOR_LIGHT_GRAY
                }} borderRadius={50} source={{uri:user.photoURL}} />

            </View>

            <View style={{alignItems:'center'}}>
              <TouchableOpacity onPress={this.showUsersFollowing}>
                <View style={{
                    width:56,
                    height:56,
                    borderRadius:28,
                    backgroundColor:Values.Colors.COLOR_BLUE_600,
                    justifyContent:'center',
                    alignItems:'center'
                }} >
                  <Text style={{
                    color:Values.Colors.COLOR_WHITE,
                    fontWeight:'bold',
                    fontSize:18,
                  }}>{user.numFollowings || 0}</Text>
                </View>
              </TouchableOpacity >

              <Text>Following</Text>
            </View>

          </View>

          <View style={{flexDirection:'row', flex:1}}>
            <View style={{width:32}}></View>

            <Text style={{
              fontSize:18,
              textAlign:'center',
              fontWeight:'600',
              marginTop:8,
              flex:1
            }}>
              {user.name}
            </Text>

            <View style={{width:32}}>
              {this._renderModeratorMenuButton()}
            </View>
          </View>




        </View>


        {this._renderTabs()}

        {this.state.dataType === DATA_TYPE_STATS?
          <StatsHeaderItem targetUid={this.state.targetUid} /> : null
        }

       </View>
     )
   }


   onCityPress = (cityItem) =>{
     const {postsSetKey, key} = cityItem;
     const params = {
       uid:this.state.targetUid,
       title:key,
       level2SetKey:postsSetKey
     }
     this.props.navigation.navigate(Values.Screens.SCREEN_POSTS_COLLECTION, params)
   }

   _renderItem = ({item}) => {

      switch (this.state.dataType) {
        case DATA_TYPE_STATS:
          return <StatsListItem
            statsItem={item}
            onCityPress={this.onCityPress}
            />

        case DATA_TYPE_POSTS:
          return (
            <PostListItem
              post={item}
              onPostClick={(key)=>{this.onPostClick(key)}}
              onUserInfoClick={()=>{}}
            />
          );

          case DATA_TYPE_WISHLIST:
            return (
              <PostListItem
                post={item}
                onPostClick={(key)=>{this.onPostClick(key, true)}}
                onAddToAchievementsPress={()=>{this.onAddToAchievementsPress(item)}}
                hideMoreOptions={true}
                isWishlist={true}
                />
            )
        default: return null;
      }

   };

   onAddToAchievementsPress(post){
     const {navigation} = this.props;
     const description = post.description;
     const location = post.location
     const params = {
       description,
       location
     }
     navigation.navigate(Values.Screens.SCREEN_NEW_POST, params)
   }


   onPostClick(postKey:string, isWishlistItem:boolean = false){
      this.props.navigation.navigate("PostDetails", {postKey, isWishlistItem})
   }


   handlePlaceholders(){
     const stats = this.state.stats || []
     const posts = this.state.posts || []

    var placeholder = null;
    if(this.state.isUserLoading) return null;


    if(this.state.isPostsLoading){
      placeholder = null;
    }else if(this.state.dataType === DATA_TYPE_POSTS && posts.length == 0){
      placeholder = <Text style={Styles.text.screenPlaceholder}>Use '+' button to create achievements</Text>
    }else if(this.state.dataType === DATA_TYPE_STATS && stats.length == 0){
      placeholder = <Text style={Styles.text.screenPlaceholder}>Stats update with achievements</Text>
    }

    return (
      <View style={{alignItems:'center', marginTop:8}}>
        {placeholder}
      </View>
    )
   }


   handleRefresh = () =>{
     this.fetchData();
   }


   render(){
     const isFollowed  = this.state.isFollowed || false;
     const isBlocked = this.state.isBlocked || false;
     if(isBlocked)
      return <Text>User bloack by user</Text>;

     var data = [];
     switch (this.state.dataType) {
       case DATA_TYPE_STATS:
        data = this.state.stats
         break;

      case DATA_TYPE_POSTS:
        data = this.state.posts
        break;

      case DATA_TYPE_WISHLIST:
        data = this.state.wishlistItems;
        break;
       default:break;

     }

     return (

       <View>
        {this.state.isUserLoading ? <ActivityIndicator animating={true} /> :
          (
            <FlatList
              data = {data}
              renderItem = {this._renderItem}
              ListHeaderComponent = {this.renderProfileHeader}
              extraData={this.state}
              refreshing={this.state.isPostsLoading}
              onRefresh={this.handleRefresh}
              />
          )
        }

        {this.handlePlaceholders()}
        </View>
     )
   }
 }


 const styles = StyleSheet.create({
   item:{
     flex:1,
     borderColor:'gray',
     borderWidth:1,
     borderRadius:8,
     margin:8,
     padding:8,
     backgroundColor:'#fff'
   },

   statusLabel:{
     fontWeight:"bold",
     marginTop:16,
   },

   itemTitle:{
     fontWeight:'bold',
     fontSize:18,
   }
 })
