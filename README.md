# ADPR Homepage

### Yarn

Dependencies are managed with Yarn

```
npm install yarn
```

With Yarn installed, change to the build folder to find a package.json file. To create the node_modules folder run the command:
```
yarn
```

### Gulp

With dependencies installed, (into node_modules) gulp is used to serve and build the index page and assets. From the build folder:
```
gulp serve
```

### Notes:
+ With gulp serve running:
  + changes to index.hbs will be written into index.html
  + Changes to Sass files will be compiles in to global.css
  + Changes to JS files will be compiles in to global.js
+ Images / fonts are included in the repo.
+ You can preview the homepage here: http://dev2.garyconstable.co.uk/
+ You will need to follow the above to generate the CSS / JS & index.html files.
+ Occasionally a blank JS file, is created, try restarting gulp serve, or re saving the main JS file.

### Thanks

Enjoy - garyconstable80@gmail.com

:)
