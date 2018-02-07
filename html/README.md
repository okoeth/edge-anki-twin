# Angular Frontend for mwc-twin Component
This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.16.0.

## Build & development
One prerequesite is to have compass installed. View the docs at http://compass-style.org/install/

The dependencies are not version controlled, hence install dependencies with the following commands:

```
npm install
bower install
```

Then run `grunt` for building and `grunt serve` for preview (which works now). Note that the `./dist` folder is checked into git for faster deployments of the micro service.

## Testing
Running `grunt test` will run the unit tests with karma. Unfortunately, there are not tests yet ;-)

## Tooling
The frontend development requires the following tools:
```
npm install -g bower 
npm install -g yo generator-angular generator-karma
```

There were some issues with the global install of karma, hence:
```
npm install grunt grunt-cli jit-grunt 
npm install karma-phantomjs-launcher karma-jasmine jasmine-core phantomjs-prebuilt
npm install grunt-karma karma
```

## Running without a Camera Image

The `no-camera` branch has been configured to run without a camera image, by including this line in `html/app/scripts/controllers/main.js`:
```
$scope.showCollisionImg = false;
```

If you wish to update the `no-camera` branch to include the latest code from the master branch (while still not using the camera image), use these steps:
```
git checkout no-camera
git merge master
grunt
git add dist
git commit -m "updated no-camera branch"
```

## References
[Getting Started](https://www.sitepoint.com/kickstart-your-angularjs-development-with-yeoman-grunt-and-bower/)
