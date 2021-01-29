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
   Image,
   TouchableWithoutFeedback,
   AsyncStorage,
   ActivityIndicator,
   Text,
   View
 } from 'react-native';

 import * as Values from '../res/Values'
 import * as Contract from '../firebase/DatabaseContract'
 import CloudinaryHelpers from '../utility/CloudinaryHelpers'
 import HelperMethods from '../utility/HelperMethods';
 import Ionicons from 'react-native-vector-icons/Ionicons';
 import MapView from 'react-native-maps'
 import * as Styles from '../res/Styles'
 import FastImage from 'react-native-fast-image';
 import MediaItemImage from '../screens/post_details_helpers/MediaItemImage';
 import MediaItemVideo from '../screens/post_details_helpers/MediaItemVideo';
 import PostActionPanel from './PostActionPanel';

type Props = {
  post:Contract.Post,
  onPress:()=>void
}

type State = {

}

 export default class PostTextHolder extends React.Component<Props, State>{

   _renderCommentItem(comment:Contract.Comment){

     const user = comment.user || new Contract.User();
     const name = user.name? (user.name.split(" ")[0] + " ") : "User "
     return (
       <View style={styles.commentContainer}>
        <Text style={styles.commentUsername}>
          {name}
        </Text>

        <Text
          style={styles.commentText}
          numberOfLines={1}
          ellipsizeMode={'tail'}
          >
          {comment.text}
        </Text>
       </View>
     )
   }

   render(){
     const post = this.props.post

     const latestComment = post.latestComment;
     const commentItem = latestComment? this._renderCommentItem(latestComment):null;

     return(
       <TouchableWithoutFeedback onPress={this.props.onPress}>
         <View style={styles.container}>
           <Text style={{fontWeight:'500', fontSize:18}}
             numberOfLines={2}
             >
             {post.title || post.description}
           </Text>
           {post.title?
             <Text style={{ color:Values.Colors.COLOR_GRAY}}
               numberOfLines={3}
               >
               {post.description}
             </Text>
             :
             null
           }
           {commentItem}
         </View>
       </TouchableWithoutFeedback>
     )
   }
 }

 const styles = StyleSheet.create({
   container:{
     margin:8
   },
   commentContainer:{
     marginTop:4,
     flexDirection:'row'
   },
   commentUsername:{
    fontWeight:'600'
   },
   commentText:{
     flex:1,
     color:Values.Colors.COLOR_GRAY
   }
 })
