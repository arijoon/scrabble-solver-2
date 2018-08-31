@echo off
set PATH=%PATH%;C:\Android\build-tools\28.0.2
SETLOCAL ENABLEDELAYEDEXPANSION
FOR /F "tokens=* USEBACKQ" %%F IN (`git describe`) DO (
  SET version=%%F
)
@echo version is: %version%

@echo on
cp -f platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk builds\app-release-unsigned.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ..\cordova-keys.keystore builds\app-release-unsigned.apk word_maker
zipalign -v 4 builds\app-release-unsigned.apk builds\app-release-signed.%version%.apk
apksigner verify builds\app-release-signed.%version%.apk
rm builds\app-release-unsigned.apk

:exit