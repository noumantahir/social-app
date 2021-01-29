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
   TouchableWithoutFeedback,
   DeviceEventEmitter,
   AsyncStorage,
   ActivityIndicator,
   Text,
   View
 } from 'react-native';

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import * as Values from '../res/Values';
 import PostListItem from '../components/PostListItem';

 export default class WishListScreen extends Component<{}> {

   static navigationOptions = {
     title:"Wishlist"
   }

   constructor(props){
     super(props);
     this.state = {isLoading:true};
   }

   componentDidMount(){
     this.fetchUserPosts();
     const listener = () => {
       this.fetchUserPosts();
     }
     DeviceEventEmitter.addListener(Values.Strings.EVENT_REFRESH_WISHLIST, listener)
   }

   componentWillUnmount(){
     DeviceEventEmitter.removeAllListeners(Values.Strings.EVENT_REFRESH_WISHLIST);
   }

   fetchUserPosts(){

     const uid = this.props.navigation.state.params.uid;
     firebase.database().ref("user_data").child(uid).child("wishlist")
          .orderByChild("priority").once('value')
          .then((snapshot)=>{

            var posts = []
            snapshot.forEach((childSnap) =>{

              var post = childSnap.val();

              post.key = childSnap.key;
              posts.push(post);


            });

            this.setState({posts, isLoading:false});

          });
   }

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

   _renderItem = (item) => {
        const post = item.item
        return (
          <PostListItem
            post={post}
            onPostClick={(key)=>{this.onPostClick(key)}}
            onAddToAchievementsPress={()=>{this.onAddToAchievementsPress(post)}}
            hideMoreOptions={true}
            isWishlist={true}
            />

        )
   };

   onPostClick(postKey){
      this.props.navigation.navigate("PostDetails", {postKey, isWishlistItem:true})
   }


   render(){
     var posts = this.state.posts || []
     return (
       <View>
       {this.state.isLoading ? <ActivityIndicator style={{margin:16}} animating={true} /> : null}
       <FlatList
          data={posts}
          renderItem={this._renderItem}
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
