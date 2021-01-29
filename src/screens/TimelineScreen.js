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
   FlatList,
   AsyncStorage,
   ActivityIndicator,
   TouchableWithoutFeedback,
   TouchableOpacity,
   TouchableHighlight,
   DeviceEventEmitter,
   Alert,
   Text,
   View
 } from 'react-native';

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import * as Values from '../res/Values';
 import * as Contract from '../firebase/DatabaseContract';
  import * as Styles from '../res/Styles';
 import PostListItem, {PlaceholderCardView} from '../components/PostListItem';
 import Ionicons from 'react-native-vector-icons/Ionicons';
 import * as DatabaseHelpers from '../firebase/DatabaseHelpers'
 import HelperMethods from '../utility/HelperMethods';
 import {NavigationActions} from 'react-navigation';
 import MessagingHelpers from '../firebase/MessagingHelpers';
import {LoginManager} from 'react-native-fbsdk';

 import RNFirebase from 'react-native-firebase';

 export default class TimelineScreen extends Component<{}> {

   mNextBatchPriority:number
   uid:string
   postPositions:{}

   static navigationOptions = ({ navigation, screenProps }) => {
     console.log("Current User: " + JSON.stringify(firebase.auth().currentUser, null, '\t'));

     const params = navigation.state.params || {}

     const isModerator = params.isModerator || false
     const flaggedPostsBadge = params.flaggedPostsBadge || false

     const headerLeft = isModerator?(
            <TouchableOpacity onPress={()=>{
              navigation.navigate(Values.Screens.SCREEN_FLAGGED_POSTS, {uid:firebase.auth().currentUser.uid})
              }}>
              <View style={{marginLeft:8}} >
                <Ionicons
                   name={'ios-alert'}
                   size={26}
                   style={{ color: flaggedPostsBadge?'red':Values.Colors.COLOR_BLACK }}
                />
              </View>
            </TouchableOpacity>
          ):null;

     return {
       title:"Home",
       headerLeft,
       headerRight:
         <TouchableOpacity onPress={()=>{
           navigation.navigate("UserSearch");
           }}>
           <View style={{marginRight:8}} >
             <Ionicons
                name={'ios-search'}
                size={26}
                style={{ color: Values.Colors.COLOR_BLACK }}
             />
           </View>
         </TouchableOpacity>,
     }
   }



   constructor(props){
     super(props);
     this.state = {isLoading:false};
     this.mNextBatchPriority = -(new Date()).getTime();
     this.postPositions = {};

     // const dbRef = RNFirebase.database();

     MessagingHelpers.processPermission();
     MessagingHelpers.processToken();
   }



   componentDidMount(){

     this.listenForUser();

     DatabaseHelpers.UserData.fetchNotificationFlag()
      .then((flagStatus)=>{
        HelperMethods.showBadge(this.props.navigation, flagStatus);
      })
      .catch(err => console.warn("Notification flag status" + err.message))


     firebase.auth().onAuthStateChanged((user) => {
       if(user){
         this.uid = user.uid;
         this.fetchUserTimeline();
         HelperMethods.updateFbUidIfRequired();
      }
      else{
        //this.props.navigation.navigate("Login")
      }
     });

     DeviceEventEmitter.addListener(Values.Strings.EVENT_FETCH_UPDATED_POST, this.onEventFetchUpdatedPost)
     DeviceEventEmitter.addListener(Values.Strings.EVENT_REFRESH_TIMELINE, this.handleRefresh)
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


   showEulaDialog():Promise<boolean>{
     return new Promise((resolve, reject)=>{
       const rejectPress = () => {
         resolve(false)
         this.logout();
       }

       const acceptPress = () => {
         resolve(true)
       }

       Alert.alert(
         Values.Strings.EULA_TITLE,
         Values.Strings.EULA_TEXT,
         [
            {text: 'Reject', onPress: rejectPress, style: 'cancel'},
            {text: 'Accept', onPress: acceptPress, style: 'default'},

         ]
       )
     })
   }


   userRefCallbackFunc = (user)=>{
     if(user){

       if(!user.eulaAccepted){
         this.showEulaDialog()
           .then((eulaAccepted) => {
             const values = new Contract.User();
             values.eulaAccepted = eulaAccepted;
             DatabaseHelpers.User.updateUser(values)

           })
           .catch(err=>console.warn(err.message))
       }

       if(user.type === Contract.User.USER_TYPE_ADMIN ||
         user.type === Contract.User.USER_TYPE_MODERATOR)
        {
           this.props.navigation.setParams({isModerator:true})
           this.fetchFlaggedPostBadgeStatus();
        }else{
           this.props.navigation.setParams({isModerator:false})
        }


     }
   }


   fetchFlaggedPostBadgeStatus(){
     DatabaseHelpers.FlaggedPosts.fetchBadgeStatus()
      .then((status)=>{
        this.props.navigation.setParams({flaggedPostsBadge:status})
      })
      .catch(err=>console.warn(err))
   }


   componentWillUnmount(){
     DeviceEventEmitter.removeAllListeners(Values.Strings.EVENT_FETCH_UPDATED_POST)
     this.unlistenForUser();
   }


   listenForUser(){
     const uid = firebase.auth().currentUser.uid;
     DatabaseHelpers.User.listenForUser(uid, this.userRefCallbackFunc,
       (err)=>{console.error(err)});
   }


   unlistenForUser(){
     const uid = firebase.auth().currentUser.uid;
     DatabaseHelpers.User.unlistenForUser(uid, this.userRefCallbackFunc)
   }


   onEventFetchUpdatedPost = (args:any) => {
     console.log("Post Update Request Receive:", args);
     this.fetchPost(args.postKey)
   }


   fetchUserTimeline(){
     console.log("fetching timeline");
     if(!this.state.isLoading && this.uid){
       this.setState({isLoading:true})

       firebase.database().ref("user_data").child(this.uid).child("timeline")
            .orderByValue()
            .startAt(this.mNextBatchPriority)
            .limitToFirst(Values.Numbers.ITEMS_PER_BATCH)
            .once('value')
            .then((snapshot)=>{
                var newPosts = []
                var pos = 0;
                var priority = this.mNextBatchPriority;

                //no more data available
                if(snapshot.numChildren() <= 0){
                  this.setState({endOfData:true})
                }

                snapshot.forEach((childSnap) =>{
                  var postHolder = {key:childSnap.key, isLoading:true}

                  console.log("Adding post holder:", postHolder);
                  newPosts.push(postHolder);

                  //update post list positions map
                  const offset = this.state.posts ? this.state.posts.length : 0
                  this.postPositions[postHolder.key] = (offset + pos);

                  this.fetchPost(postHolder.key);

                  priority = childSnap.val();
                  pos++;
                });

                this.mNextBatchPriority = priority + 1;
                this.setState((state)=>{
                  var posts = state.posts || [];
                  state.posts = posts.concat(newPosts);
                  state.isLoading = false;

                  return state;
                });
            });
        }
   }



  fetchPost(postKey:string){
    console.log("fetching post content");
        DatabaseHelpers.PostData.fetchPostWithExtraData(postKey, this.uid)
          .then((post)=>{
            //get post position in array;
            const postPos = this.postPositions[post.key];

            //return null if position map is empty
            if(postPos === undefined)
              return;

            //update posts array
            this.setState((state)=>{
              console.log("Adding post content to list");
              state.posts[postPos] = post;

              //update selected field for extraData
              state.reRenderToken = post? post.key :'empty_post_token';
              return state;
            });
          })
   }


   _renderItem = (item) => {
        const post = item.item;
        return (<PostListItem
                  post={post}
                  onPostClick={this.onPostClick}
                  onUserInfoClick = {this.onUserInfoClick}
                  onCommentPress={this.onCommentPress}
                  onLikesPress = {this.onLikesPress}
                  />
                )
   };

  onUserInfoClick = (uid) => {
      this.props.navigation.navigate("UserProfile", {uid})
  }

   onPostClick = (postKey) => {
      this.props.navigation.navigate("PostDetails", {postKey})
   }

   onCommentPress = (postKey:string, postOwnerUid:string) =>{
     const params = {postKey}
     this.props.navigation.navigate(Values.Screens.SCREEN_COMMENTS_SCREEN, params)
   }

   onLikesPress = (postKey:string) => {
     console.log('Opening users liked post');
     const ref = DatabaseHelpers.PostData.getLikesReference(postKey)
    const params = {databaseRef:ref, title:"Likes"}
    this.props.navigation.navigate(Values.Screens.SCREEN_USERS_LIST, params)
   }


   _renderFooter = () => {
     var retComponet = (this.state.isLoading || !this.uid) ? <PlaceholderCardView /> : null;
     if(this.state.endOfData){
        posts = this.state.posts || []
        retComponet = posts.length > 0 ?
          <View style={{
            width:Dimensions.get('window').width - 32,
            height:1,
            margin:16,
            backgroundColor:Values.Colors.COLOR_GRAY}}
          />
          :
          <View style={{flex:1, alignItems:'center', margin:16}}>
            <Text style={Styles.text.screenPlaceholder}>Follow users to have activity here</Text>
            <Button title="Find Users" onPress={()=>{this.props.navigation.navigate("UserSearch")}} />
          </View>

     }
     return retComponet;
   }

   _keyExtractor = (item, index) => {
     console.log(JSON.stringify(this.state.posts, null, '\t'));
     return item.key
   }

   handleRefresh = () => {
     console.log("Refreshing items");
     this.setState({
       endOfData:false,
       isLoading:false,
       posts:[]
     });
     this.mNextBatchPriority = -(new Date()).getTime();
     this.postPositions = {};
     this.fetchUserTimeline();
   }

   render(){
     var posts = this.state.posts || []
     return (
       <View style={{flex:1}}>

         <FlatList
            data={posts}
            renderItem={this._renderItem}
            keyExtractor = {this._keyExtractor}
            extraData = {this.state}
            ListFooterComponent = {this._renderFooter}
            onEndReached = {()=>{
              if(!this.state.endOfData)
                this.fetchUserTimeline()
            }}
            refreshing={this.state.isLoading}
            onRefresh={this.handleRefresh}
          />
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
