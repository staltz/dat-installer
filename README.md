# Dat Installer

> Download, install, and update Android apps through [Dat](https://datproject.org/)

The new decentralized internet needs mobile app distribution channels. Dat Installer is the answer for Android apps, working as a decentralized "Play Store" minus the "Store" part (discovery of apps and monetization).

With Dat Installer you can insert a Dat link where you expect the APK file to be, and this app will download the APK and make it easy for you to install it right away (as well as update, in the future).

##

## Publishing an app

Metadata file **must** be named `metadata.json` and should look like this:

```json
{
  "convention": "1",
  "apk": "/app-release.apk",
  "readme": "/readme.md"
}
```
