/* @flow */

import * as DatabaseHelpers from './DatabaseHelpers';
import firebase from 'firebase';

export default class PostDataHelpers {


  static async updateLikeStatus(postKey:string, uid:string, isLiked:boolean){
    try{
      //update likes table in post data --- post_data -> {postKey} -> like -> {uid} -> boolean
      DatabaseHelpers.PostData.updatePostLikeMap(postKey, uid, isLiked)

      //update likesCount post -> {postKey} -> likesCount
      var likesCount = await DatabaseHelpers.Post.fetchLikesCount(postKey);
      likesCount = isLiked? likesCount + 1 : likesCount - 1;
      likesCount = likesCount < 0 ? 0 : likesCount;
      DatabaseHelpers.Post.updateLikesCount(postKey, likesCount);

      console.log("updated post likes status");

    }catch(err){
      console.log(err);
    }
  }



  static async fetchPostWithExtraData(postKey:string, currentUserUid:string){
    try{

      //get post first;
      const post = await DatabaseHelpers.Post.fetchPost(postKey);

      //get like status
      const isLiked = await DatabaseHelpers.PostData.fetchUserLikeStatus(postKey, currentUserUid)

      //get latest comment
      const latestComment = "Test"//await DatabaseHelpers.PostData.fetchLatestComment(postKey)

      //combine data
      post.key = postKey;
      post.isLoading = false;
      post.isLiked = isLiked;
      post.latestComment = latestComment;

      return post;
    }
    catch(err){
      console.log(err);
    }
  }

}
