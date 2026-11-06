# How the screenshots and demo GIF are made

The README media come from the real app running on an Android emulator, not from mockups.

## Regenerate

```bash
gh workflow run capture.yml -R nhucsau1995/tidepass-react-native --ref main
gh run list -R nhucsau1995/tidepass-react-native --workflow capture.yml -L 1
gh run watch <run-id> -R nhucsau1995/tidepass-react-native --exit-status
gh run download <run-id> -R nhucsau1995/tidepass-react-native -n capture -D capture-tmp/artifact
rm -rf screenshots && mv capture-tmp/artifact screenshots
```

## How it works

1. `.github/workflows/capture.yml` (manual dispatch) runs on `ubuntu-latest` with KVM: `npm ci`, `expo prebuild` + `gradlew assembleRelease` (production JS, no Metro), ffmpeg and Maestro.
2. `reactivecircus/android-emulator-runner` boots an API 34 Pixel 6 emulator and runs `.github/scripts/capture-emulator.sh expo` as one command.
3. The script installs the APK, does a warm-up launch, then runs `.maestro/screenshots.yaml`: real taps on `testID`s through onboarding, sign in, explore, destination, boat detail, calendar (13:30 slot), the last-seat race sheet, checkout hold, confirmation, booking detail, my trips, search, the fully booked state, profile, operator console and notifications, with one `takeScreenshot` per screen.
4. `.maestro/demo.yaml` replays the core loop (discover a boat, pick the last seats, lose the race, take the live alternative, pay inside the hold, open the booking, 10 taps) and records it with Maestro's `startRecording`/`stopRecording`. ffmpeg turns the mp4 into `demo.gif` (palette pass, 12 fps, 300 px wide). If a slow emulator stretches the walkthrough past 60 s, the script speeds the video up to fit instead of cutting its end.
5. Every tap caps Maestro's settle wait (`waitToSettleTimeoutMs: 1500`): the Live pills pulse when they appear and the hold countdown ticks every second, so some screens never go fully still.
6. The run fails unless there are 3+ PNGs and a GIF, then uploads them as the `capture` artifact. The workflow never commits; the files are committed separately.

The app state lives in memory, so each `launchApp` starts from the same seed: the last-seat race on the Lagoon 380 13:30 departure happens on every run.

## Local emulator

With an Android SDK and a booted emulator (`emulator -avd <name> -no-window -gpu swiftshader_indirect`):

```bash
npx expo prebuild --platform android --no-install
(cd android && ./gradlew assembleRelease)
APP_ID=com.tidepass.app bash .github/scripts/capture-emulator.sh expo
```
