密钥 别名: cashier

### deploy
####android
* cd android & ./gradlew assembleRelease
* 编译打包出的文件为:android/app/build/outputs/apk/app-release.apk

####ios
* xcode中打开ios工程
* 上传到app store: product->archive->distrution->upload
* 打包出ipa文件: product->archive->export

###热更新
####热更新文档地址 https://github.com/reactnativecn/react-native-pushy/blob/master/docs/guide.md
####热更新包管理地址 https://update.reactnative.cn/home
#####android本体apk上传
* 账号：zclwlappleid@163.com
* 密码：Dcj629629

* pushy selectApp --platform android
* pushy uploadApk android/app/build/outputs/apk/app-release.apk

#####android热更新上传
* pushy bundle --platform android

#####ios本体ipa上传
* pushy selectApp --platform ios
* pushy uploadApk path-to/grainApps.ipa

#####android热更新上传
* pushy bundle --platform ios








