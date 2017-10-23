package com.staltz.datinstaller;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class PackageInfoModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public PackageInfoModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "PackageInfo";
    }

    @ReactMethod
    public void getPackageInfo(String apkPath, String iconsPath, Promise promise) {
        try {
            PackageManager pm = this.reactContext.getPackageManager();
            PackageInfo pi = pm.getPackageArchiveInfo(apkPath, 0);
            ApplicationInfo ai = pi.applicationInfo;
            ai.sourceDir = apkPath;
            ai.publicSourceDir = apkPath;

            String pkg = pi.packageName;
            String label = pm.getApplicationLabel(ai).toString();
            String versionName = pi.versionName;
            int versionCode = pi.versionCode;
            long firstInstallTime = pi.firstInstallTime;
            long lastUpdateTime = pi.lastUpdateTime;
            Bitmap bm = BitmapFactory.decodeResource(pm.getResourcesForApplication(ai), ai.icon);

            WritableMap info = Arguments.createMap();
            info.putString("package", pkg);
            info.putString("label", label);
            info.putString("versionName", versionName);
            info.putDouble("versionCode", versionCode);
            info.putDouble("firstInstallTime", firstInstallTime);
            info.putDouble("lastUpdateTime", lastUpdateTime);

            File iconsFile = new File(iconsPath);
            iconsFile.mkdirs();
            savePngIcon(iconsFile, pkg + ".png", bm);

            promise.resolve(info);
        }
        catch (Exception ex) {
            ex.printStackTrace();
            promise.reject(null, ex.getMessage());
        }
    }

    boolean savePngIcon(File dir, String fileName, Bitmap bm) {
        File imageFile = new File(dir, fileName);
        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(imageFile);
            bm.compress(Bitmap.CompressFormat.PNG, 100, fos);
            fos.close();
            return true;
        }
        catch (IOException e) {
            Log.e("PackageInfoModule", e.getMessage());
            if (fos != null) {
                try {
                    fos.close();
                } catch (IOException e1) {
                    e1.printStackTrace();
                }
            }
        }
        return false;
    }

}