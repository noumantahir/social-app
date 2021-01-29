/* @flow */


 import * as Styles from '../res/Styles';
 import React, { Component } from 'react';
 import {
   Platform,
   StyleSheet,
   TextInput,
   Button,
   Dimensions,
   ScrollView,
   AsyncStorage,
   ActivityIndicator,
   TouchableOpacity,
   DeviceEventEmitter,
   TouchableWithoutFeedback,
   FlatList,
   Image,
   Text,
   View
 } from 'react-native';

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import PostLinkerService from '../utility/PostLinkerService';
 import * as Values from '../res/Values';
 import * as Contract from '../firebase/DatabaseContract';
 import * as DatatbaseHelpers from '../firebase/DatabaseHelpers';

 import HelperMethods from '../utility/HelperMethods';
 import CloudinaryHelpers from '../utility/CloudinaryHelpers';
 import PostHeader from './post_details_helpers/PostHeader';
 import FastImage from 'react-native-fast-image';
 import MediaItems from './post_details_helpers/MediaItems';
 import {KeyboardAwareView} from 'react-native-keyboard-aware-view';


 type Params = {
   postKey:string,
 }

 type Props = {
   navigation:{
     state:{
       params:Params
     }
   }
 }

 type State = {
   postKey:string,
   comments:Array<Contract.Comment>,
   newComment:string
 }


 export default class CommentsScreen extends Component<Props, State> {
   commentsReference:any

   constructor(props:Props){
     super(props)
     const params:Params = this.props.navigation.state.params

     this.state = {
      newComment:'',
      comments:[],
      postKey:params.postKey}
   }

   componentDidMount(){
     this.fetchComments();
   }

   componentWillUnmount(){
     if(this.commentsReference){
       DatatbaseHelpers.PostData.unregisterCommentsListener(this.commentsReference)
     }
   }

   fetchComments(){
     const {postKey} = this.state;
     const onCallback = (comments) =>{
       this.setState({comments})
     }
     const onError = (err) => {
       console.log(err);
     }

     this.commentsReference = DatatbaseHelpers.PostData.listenForCommentsWithUser(
       postKey,
       onCallback,
       onError
     );
   }


   onUserInfoClick(uid:string){
     this.props.navigation.navigate(Values.Screens.SCREEN_USER_PROFILE, {uid})
   }


   makeComment = () => {
     const {newComment, postKey} = this.state;
     if(newComment){
       const uid = firebase.auth().currentUser.uid;
       const timestamp = (new Date()).getTime();
       const priority = timestamp

       const comment = new Contract.Comment();
       comment.text = newComment;
       comment.uid = uid;
       comment.timestamp = timestamp;
       comment.priority = priority;

       DatatbaseHelpers.PostData.makeComment(postKey, comment)
        .then((status)=>{
          if(status){
            //publish update event
            DeviceEventEmitter.emit(Values.Strings.EVENT_FETCH_UPDATED_POST, {postKey})
          }
        })

       //clean test input
       this.setState({newComment:''})


     }
   }



   _renderItem = ({item, index}) => {
     const comment:Contract.Comment = item;

     const user = comment.user || new Contract.User();
     const name = user.name || "Bucketlist User"

     return (
       <TouchableWithoutFeedback onPress={()=>{this.onUserInfoClick(comment.uid)}} >
         <View style={styles.itemCommentHeader}>
          <View>
           <Image style={{height:32, width:32, backgroundColor:Values.Colors.COLOR_LIGHT_GRAY}}
             resizeMode='contain'
             source={{uri: user.photoURL}} borderRadius={16} />
          </View>

           <View style={{flex:1, flexDirection:'column', marginLeft:4}}>
             <Text style={{fontWeight:'600', fontSize:16}}> {name}</Text>
             <Text style={{fontSize:16, marginLeft:4}}>{comment.text}</Text>
           </View>

           <Text style={{color:Values.Colors.COLOR_GRAY, fontSize:12}} >{HelperMethods.getShortTime(comment.timestamp)}</Text>
         </View>
       </TouchableWithoutFeedback>
     )
   }



   _renderCommentsList(){
     const {comments} = this.state
     return (
       <View style={styles.commentsContainer}>
         <FlatList
           data={comments}
           renderItem={this._renderItem}
           extraData={this.state}
         />
       </View>
     )
   }



   _renderCommentBox(){
     const {newComment} = this.state;
     return(
       <View style={styles.commentInputContainer}>
         <TextInput
           style={styles.commentTextInput}
           placeholder="Add Comment..."
           multiline={true}
           value={newComment}
           onChangeText={(text)=>{this.setState({newComment:text})}}
           />
         <Button
           title = "Post"
           onPress = {this.makeComment}
          />
       </View>
     )
   }


   render(){
     return (
       <KeyboardAwareView style={styles.container}>
          {this._renderCommentsList()}
          {this._renderCommentBox()}
       </KeyboardAwareView>
     )
   }
 }



 const styles = StyleSheet.create({
   container:{
     flex:1
   },
   commentsContainer:{
     width:'100%',
     flex:1,
   },
   commentInputContainer:{
     width:'100%',
     flexDirection:'row',
     alignItems:'center',
     borderTopWidth:StyleSheet.hairlineWidth,
     borderColor:Values.Colors.COLOR_GRAY,

   },
   commentTextInput:{
     flex:1,
     margin:8,
     padding:8,
     borderRadius:20,
     backgroundColor:Values.Colors.COLOR_WHITE,
   },
   itemCommentHeader:{
     flexDirection:'row',
     flex:1,
     paddingTop:8,
     paddingBottom:8,
     paddingLeft:16,
     paddingRight:16,
     backgroundColor:Values.Colors.COLOR_WHITE,
     borderBottomWidth:StyleSheet.hairlineWidth,
     borderColor:Values.Colors.COLOR_LIGHT_GRAY
   }
 })
