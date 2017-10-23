package com.staltz.datinstaller;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.cnull.apkinstaller.ApkInstallerPackage;
import com.facebook.react.bridge.Callback;
import com.reactnativenavigation.controllers.ActivityCallbacks;
import com.staltz.reactnativenode.RNNodePackage;
import com.rnfs.RNFSPackage;
import com.facebook.react.ReactPackage;
import com.reactnativenavigation.NavigationApplication;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {
  @Override
  public boolean isDebug() {
    // Make sure you are using BuildConfig from your own application
    return BuildConfig.DEBUG;
  }

  private ActivityCallbacksPackage activityCallbacksPackage;

  protected List<ReactPackage> getPackages() {
    // Add additional packages you require here
    // No need to add RnnPackage and MainReactPackage
    if (this.activityCallbacksPackage == null) {
      this.activityCallbacksPackage = new ActivityCallbacksPackage();
    }
    return Arrays.<ReactPackage>asList(
            new RNFSPackage(),
            new RNNodePackage(),
            new ApkInstallerPackage(),
            new PackageInfoPackage(),
            this.activityCallbacksPackage
    );
  }

  @Override
  public void onCreate() {
    super.onCreate();
    if (this.activityCallbacksPackage == null) {
      this.activityCallbacksPackage = new ActivityCallbacksPackage();
    }
    final ActivityCallbacksPackage pkg = this.activityCallbacksPackage;
    setActivityCallbacks(new ActivityCallbacks() {
      @Override
      public void onActivityCreated(Activity activity, Bundle savedInstanceState) {
      }

      @Override
      public void onActivityStarted(Activity activity) {
        Callback cb = pkg.getStartedCallback();
        if (cb != null) {
          cb.invoke();
        }
      }

      @Override
      public void onActivityResumed(Activity activity) {
      }

      @Override
      public void onActivityPaused(Activity activity) {
      }

      @Override
      public void onActivityStopped(Activity activity) {
        Callback cb = pkg.getStoppedCallback();
        if (cb != null) {
          cb.invoke();
        }
      }

      @Override
      public void onActivityResult(int requestCode, int resultCode, Intent data) {
      }

      @Override
      public void onActivityDestroyed(Activity activity) {
      }
    });
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    return getPackages();
  }
}
