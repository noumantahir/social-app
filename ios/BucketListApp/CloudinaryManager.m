//
//  CloudinaryManager.m
//  BucketListApp
//
//  Created by Nouman Tahir on 30/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "CloudinaryManager.h"
#import <React/RCTLog.h>

@implementation CloudinaryManager
@synthesize bridge = _bridge;


// To export a module named CalendarManager
RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}


RCT_EXPORT_METHOD(initialize) {
  NSString *cloudinaryUrl = [NSString stringWithFormat:@"cloudinary://487165954462671:oYupQPZ7tvo0s1tL1XAnd1WYQQk@hz93izbzd"];
  CLDConfiguration *config = [[CLDConfiguration alloc] initWithCloudinaryUrl:cloudinaryUrl];
  CLDCloudinary *cloudinary = [[CLDCloudinary alloc] initWithConfiguration:config networkAdapter:NULL sessionConfiguration:NULL];

  self.cloudinary = cloudinary;
}

RCT_EXPORT_METHOD(uploadMedia:(NSString *)path
                  withCloudinaryPublicId:(NSString *)publicId
                  andResourceType:(NSString *)resourceType
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{

  //get file path if passed string is uri
  if([path hasPrefix:@"file://"]){
    path = [[NSURL URLWithString:path] path];
  }

  NSData *data = [NSData dataWithContentsOfFile:path];

  if([[NSFileManager defaultManager] fileExistsAtPath:path]) {
    data = [[NSFileManager defaultManager] contentsAtPath:path];
    UIImage* image = [UIImage imageWithData:data];
  
    
    CGFloat newWidth = 1440;
    CGFloat newHeight = newWidth * (image.size.height / image.size.width);
    
    //if old width is greater than new width than process image else use the saem image as is
    if(image.size.width > newWidth){
      //resize image to smaller size
      CGSize newSize=CGSizeMake(newWidth,newHeight);
    
      UIGraphicsBeginImageContext(newSize);
      [image drawInRect:CGRectMake(0, 0, newSize.width, newSize.height)];
      UIImage* newImage = UIGraphicsGetImageFromCurrentImageContext();
      UIGraphicsEndImageContext();
      
      data = UIImageJPEGRepresentation(newImage, 0.7);
      
    }
    
  } else {
    NSString *code = @"No file";
    NSString *message = @"File not exist.";
    NSError *error = [NSError errorWithDomain:@"RNCloudinary" code:0 userInfo:nil];
    reject(code, message, error);
    return;
  }
  

  

  if (self.cloudinary) {
    
    CLDUploadRequestParams *params = [[CLDUploadRequestParams alloc] init];
    [params setPublicId:publicId];
    [params setResourceTypeFromString:resourceType];

    
    [[self.cloudinary createUploader] signedUploadWithData:data params:params progress:^(NSProgress * progress) {
      NSLog(@"Progress update received");

    } completionHandler:^(CLDUploadResult * result, NSError * error) {
      NSArray *keys = [NSArray arrayWithObjects:@"result", @"error", @"publicId", @"resourceType",@"url", nil];
      NSArray *objects = [NSArray arrayWithObjects:@"success", @"", result.publicId, result.resourceType, result.url, nil];
      NSDictionary *dictionary = [NSDictionary dictionaryWithObjects:objects
                                                             forKeys:keys];
      resolve(dictionary);
    }];


  } else {
    NSString *code = @"not configured";
    NSString *message = @"Cloudinary service is not configured correctly.";
    NSError *error = [NSError errorWithDomain:@"RNCloudinary" code:0 userInfo:nil];
    reject(code, message, error);
  }
}


@end
