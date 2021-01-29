/* @flow */
import type {Location} from '../utility/GeoHelpers'

export class Post {
  title:string
  description:string
  likesCount:number
  commentsCount:number
  points:number
  location:Location
  priority:number
  uid:string
  status:string
  regionString:string
  address_components:any

  static get PATH_BASE(){return 'post'}
  static get CHILD_LIKES_COUNT(){return 'likesCount'}
  static get CHILD_UID(){return 'uid'}
  static get CHILD_COMMENTS_COUNT(){return 'commentsCount'}

  static get STATUS_SUSPENDED(){return 'suspended'}
  static get STATUS_APPROVED(){return 'approved'}
  static get STATUS_PENDING(){return 'pending'}

}

export class PostData {
    static get PATH_BASE(){return "post_data"}
    static get PATH_LIKE(){return "like"}
    static get PATH_COMMENT(){return "comment"}
    static get PATH_LEVEL_2_SETS(){return "level2Sets"}
}

export class Comment {
  uid:string
  text:string
  timestamp:number
  priority:number
  key:string|null

  static get CHILD_PRIORITY(){return "priority"}
}

export class User {
  name:string
  fcmToken:string
  type:string
  eulaAccepted:boolean

  static get PATH_BASE(){return "user"}
  static get CHILD_FCM_TOKEN(){return "fcmToken"}
  static get CHILD_ACCOUNT_STATUS(){return 'accountStatus'}
  static get CHILD_ACCOUNT_TYPE(){return 'type'}
  static get CHILD_EULA_ACCEPTED(){return 'aulaAccepted'}

  static get USER_TYPE_ADMIN(){return 'admin'}
  static get USER_TYPE_DEFAULT(){return 'default'}
  static get USER_TYPE_MODERATOR(){return 'moderator'}

  static get ACCOUNT_STATUS_BLOCKED(){return 'blocked'}
  static get ACCOUNT_STATUS_ACTIVE(){return 'active'}
}


export class Stats {
  totalPosts:number
  priority:number
  level2:any

  static get PATH_BASE(){return "stats"}
  static get PATH_LEVEL_2(){return "level2"}
  static get CHILD_TOTAL_POSTS(){return "totalPosts"}
  static get CHILD_PRIORITY(){return "priority"}
}

export class UserData {
  static get PATH_BASE(){return 'user_data'}
  static get PATH_WISHLIST(){return 'wishlist'}
  static get PATH_TIMELINE(){return 'timeline'}
  static get PATH_FOLLOWINGS(){return 'followings'}
  static get PATH_FOLLOWERS(){return 'followers'}
  static get PATH_LEVEL_2_SETS(){return 'level2Sets'}
  static get CHILD_UNREAD_NOTIFICATIONS_FLAG(){return 'unreadNotificationsFlag'}
}

type LocationCoordinates = {
  latitude:number,
  longitude:number
}

export class VisitCounts{
  static get PATH_BASE(){return 'visit_count'}
  static get PATH_COUNTS(){return 'counts'}
  static get PATH_CITIES_INDEX(){return 'cities_index'}
  static get PATH_COUNTRIES_INDEX(){return 'countries_index'}
  static get CHILD_CITIES(){return 'cities'}
  static get CHILD_COUNTRIES(){return 'countries'}

  counties:number
  cities:number
}

export class Notification {

  action:string
  actionKey:string
  timestamp:number
  priority:number
  title:string
  body:string
  thumbURL:string

  static get PATH_BASE(){return 'notification'}
  static get NOTIFICATION_ACTION_USER(){return 'user'}
  static get NOTIFICATION_ACTION_POST(){return 'post'}
}

export class FlaggedPosts {
  static get PATH_BASE(){return 'flagged_posts'}
  static get PATH_BASE_BADGE(){return 'flagged_posts_badge'}
}
