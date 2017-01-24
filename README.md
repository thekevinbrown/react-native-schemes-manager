XCode environments without the stress. Use XCode schemes with React Native without pulling your hair out.

[![Supported by Thinkmill](https://thinkmill.github.io/badge/heart.svg)](http://thinkmill.com.au/?utm_source=github&utm_medium=badge&utm_campaign=react-native-schemes-manager)

If your app has multiple environments, you'd probably like to be able to manage these the way native developers have been doing for years, XCode schemes and build configurations.

By default, React Native doesn't handle these particularly well, and the ability to launch dev tools or run in debug mode is impacted. This package fixes these problems.

*Made by [Kevin Brown](https://twitter.com/kevinbrowntech), supported by [Thinkmill](http://thinkmill.com.au/). Thank you for making this project possible!*

## Installation

```
yarn add --dev react-native-schemes-manager
```
or
```
npm install --save-dev react-native-schemes-manager
```

Once the package is installed in your project, you just need to configure it by adding a `schemes` section to your `package.json`:

```json
{
  "name": "your-awesome-app",
  "version": "1.0.0",
  ...
  "schemes": {
      "Debug": ["Staging", "Preflight"]
  }
}
```

This configuration will copy the "Debug" build configuration to "Staging" and "Preflight" build configurations in all your dependent library projects.

## What Then?

The package will automatically run this script and clean up your XCode project files on `postinstall`. This means you shouldn't need to do anything further to make this work than just install your project dependencies again.

## Running Manually

You can run it on demand by running `react-native-schemes-manager` from your project's directory. The best way to do this is add to your `package.json` scripts section like so:

```json
{
  "name": "your-awesome-app",
  "version": "1.0.0",
  "scripts": {
      "fix-xcode-projects": "react-native-schemes-manager"
  }
}
```

You can then `yarn run fix-xcode-projects` or `npm run fix-xcode-projects`.

## Further Reading

These are some great articles about related topics in case you're hungry for more:

- [📝 Migrating iOS App Through Multiple Environments](http://www.blackdogfoundry.com/blog/migrating-ios-app-through-multiple-environments/): Explains how XCode is handling this situation in a detailed way.
- [📝 How to set up multiple schemes & configurations in Xcode for your React Native iOS app](https://zeemee.engineering/how-to-set-up-multiple-schemes-configurations-in-xcode-for-your-react-native-ios-app-7da4b5237966#.vsq9mlgv8): The inspiration and approach for this package, unfortunately written in Ruby. I wanted a pure Node build pipeline.

## License

Licensed under the MIT License, Copyright © 2017 Kevin Brown.

See [LICENSE](./LICENSE) for more information.

## Acknowledgements

This project builds on a lot of earlier work by clever folks all around the world. We'd like to thank Alek Hurst and Craig Edwards who contributed ideas and inspiration, without which this project woudln't have been possible.
