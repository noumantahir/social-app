/* @flow */
import {Dimensions, PixelRatio} from 'react-native';


const BASE_CLOUDINARY_URL = "https://res.cloudinary.com/hz93izbzd";
const PATH_VIDEO = "video";
const PATH_IMAGE = "image";
const PATH_FACEBOOK = "facebook";
const PATH_UPLOAD = "upload";
const JPG_FORMAT = "jpg";
const WEBM_FORMAT = "webm"
const MP4_FORMAT = "mp4"
const MOV_FORMAT = "mov"

const PARAM_WIDTH = "w";
const PARAM_HIGHT = "h";
const PARAM_CROP = "c";

const URL_IMAGE = `${BASE_CLOUDINARY_URL}/${PATH_IMAGE}/${PATH_UPLOAD}`;
const URL_VIDEO = `${BASE_CLOUDINARY_URL}/${PATH_VIDEO}/${PATH_UPLOAD}`;
const URL_FACEBOOK = `${BASE_CLOUDINARY_URL}/${PATH_IMAGE}/${PATH_FACEBOOK}`


export default class CloudinaryHelpers {

  static getFacebookProfilePicThumb(fbId, sizePx = 120){
      return `${URL_FACEBOOK}/w_${sizePx},h_${sizePx},c_fill/${fbId}.${JPG_FORMAT}`;
  }

  static getSmallThumbUrlForVideo(publicId){
    const widthPx = 256
    return `${URL_VIDEO}/${PARAM_WIDTH}_${widthPx}/${publicId}.${JPG_FORMAT}`;
  }

  static getSmallThumbUrlForImage(publicId){
    const widthPx = 256
    return `${URL_IMAGE}/${PARAM_WIDTH}_${widthPx}/${publicId}.${JPG_FORMAT}`;
  }


  static getVideoThumbUrl(publicId){
    const widthPx = CloudinaryHelpers.getScreenWidthInPx()
    return `${URL_VIDEO}/${PARAM_WIDTH}_${widthPx}/${publicId}.${JPG_FORMAT}`;
  }

  static getResizedImageUrl(publicId){
    const widthPx = CloudinaryHelpers.getScreenWidthInPx()
    return `${URL_IMAGE}/${PARAM_WIDTH}_${widthPx}/${publicId}.${JPG_FORMAT}`;
  }

  static getVideoUrl(publicId, quality = 480){
    return `${URL_VIDEO}/${PARAM_WIDTH}_${quality}/${publicId}.${MP4_FORMAT}`;
  }

  static getRawImageUrl(publicId){
    return URL_IMAGE + publicId + JPG_FORMAT;
  }

  static getScreenWidthInPx(){
    const widthDp = Dimensions.get("screen").width;
    return PixelRatio.getPixelSizeForLayoutSize(widthDp);
  }
}
