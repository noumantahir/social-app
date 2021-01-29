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
   AsyncStorage,
   ActivityIndicator,
   Text,
   View
 } from 'react-native';

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import PostListItem from '../components/PostListItem';

 export default class UserPostsScreen extends Component<{}> {

   static navigationOptions = {
     title:"User Posts"
   }

   constructor(props){
     super(props);
     this.state = {isLoading:true};
   }

   componentDidMount(){
     this.fetchUserPosts();
   }

   fetchUserPosts(){
     const uid = this.props.navigation.state.params.uid;
     firebase.database().ref("post").orderByChild("uid").equalTo(uid).once('value')
          .then((snapshot)=>{

            var posts = []
            snapshot.forEach((childSnap) =>{

              var post = childSnap.val();

              post.key = childSnap.key;
              posts.splice(0,0,post);

            });

            this.setState({posts, isLoading:false});

          });
   }

   _renderItem = ({item}) => {

        return (
          <PostListItem post={item} onPostClick={(key)=>{this.onPostClick(key)}} />
        )
   };

   onPostClick(postKey){
      this.props.navigation.navigate("PostDetails", {postKey})
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
