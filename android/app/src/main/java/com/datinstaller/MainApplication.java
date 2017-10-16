package com.datinstaller;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.staltz.reactnativenode.RNNodePackage;
import com.rnfs.RNFSPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.reactnativenavigation.NavigationApplication;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {
    @Override
  public boolean isDebug() {
    // Make sure you are using BuildConfig from your own application
      return BuildConfig.DEBUG;
    }

    protected List<ReactPackage> getPackages() {
    // Add additional packages you require here
    // No need to add RnnPackage and MainReactPackage
      return Arrays.<ReactPackage>asList(
            new RNFSPackage(),
            new RNNodePackage()
      );
    }

    @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    return getPackages();
  }
}
