const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    // Define CLI options
    this.option('projectName', { type: String, required: false });
    this.option('frontendFramework', { type: String, required: false });
    this.option('includeBackend', { type: Boolean, required: false });
  }

  async prompting() {
    // If CLI args are provided, skip interactive prompt
    if (
      this.options.projectName &&
      this.options.frontendFramework !== undefined &&
      this.options.includeBackend !== undefined
    ) {
      // Use the CLI arguments directly
      this.answers = {
        projectName: this.options.projectName,
        frontendFramework: this.options.frontendFramework,
        includeBackend: this.options.includeBackend
      };
    } else {
      // Otherwise, run normal Yeoman prompts
      this.answers = await this.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Enter your project name:',
          default: 'my-app'
        },
        {
          type: 'list',
          name: 'frontendFramework',
          message: 'Select a frontend framework:',
          choices: ['React', 'Vanilla JS'],
          default: 'React'
        },
        {
          type: 'confirm',
          name: 'includeBackend',
          message: 'Do you want to include an Express backend?',
          default: true
        }
      ]);
    }
  }

  writing() {
    const { projectName, frontendFramework, includeBackend } = this.answers;

    // 1) Set the destination folder
    this.destinationRoot(this.destinationPath(projectName));

    // 2) Generate Frontend
    if (frontendFramework === 'React') {
      this.log('⚡ Creating React app with create-react-app@latest...');
      // Run create-react-app@latest in <projectName> folder
      this.spawnCommandSync('npx', ['create-react-app@latest', 'frontend'], {
        cwd: this.destinationRoot()
      });

      // Overwrite default CRA files with your custom React files
      // Example: App.jsx, main.jsx, pages, components, etc.
      this.fs.copyTpl(
        this.templatePath('frontend/App.js'),
        this.destinationPath('frontend/src/App.js')
      );
      // this.fs.copyTpl(
      //   this.templatePath('frontend/main.jsx'),
      //   this.destinationPath('frontend/src/main.jsx')
      // );
      this.fs.copyTpl(
        this.templatePath('frontend/index.css'),
        this.destinationPath('frontend/src/index.css')
      );
      this.fs.copyTpl(
        this.templatePath('frontend/index.html'),
        this.destinationPath('frontend/public/index.html')
      );

      // Copy my components
      this.fs.copyTpl(
        this.templatePath('frontend/MyComponents/About.js'),
        this.destinationPath('frontend/src/MyComponents/About.js')
      );
      this.fs.copyTpl(
        this.templatePath('frontend/MyComponents/AddTodo.js'),
        this.destinationPath('frontend/src/MyComponents/AddTodo.js')
      );
      this.fs.copyTpl(
        this.templatePath('frontend/MyComponents/Footer.js'),
        this.destinationPath('frontend/src/MyComponents/Footer.js')
      );
      this.fs.copyTpl(
        this.templatePath('frontend/MyComponents/Header.js'),
        this.destinationPath('frontend/src/MyComponents/Header.js')
      );
      this.fs.copyTpl(
        this.templatePath('frontend/MyComponents/TodoItem.js'),
        this.destinationPath('frontend/src/MyComponents/TodoItem.js')
      );
      this.fs.copyTpl(
        this.templatePath('frontend/MyComponents/Todos.js'),
        this.destinationPath('frontend/src/MyComponents/Todos.js')
      );

      // (Optional) Overwrite CRA's package.json with your custom one
      // Be aware this removes the default CRA scripts if not merged carefully.
      this.fs.copyTpl(
        this.templatePath('frontend/package.json'),
        this.destinationPath('frontend/package.json')
      );

    } else {
      // If user selects Vanilla, copy the vanilla index.html
      this.log('⚡ Creating Vanilla JS frontend...');
      this.fs.copyTpl(
        this.templatePath('vanilla-index.html'),
        this.destinationPath('frontend/index.html')
      );
    }

    // 3) Generate Backend
    if (includeBackend) {
      this.log('⚡ Setting up Express backend...');
      this.fs.copyTpl(
        this.templatePath('backend/server.js'),
        this.destinationPath('backend/server.js')
      );
      this.fs.copyTpl(
        this.templatePath('backend/_package.json'),
        this.destinationPath('backend/package.json')
      );
      // If you have data.json or any other files
      this.fs.copyTpl(
        this.templatePath('backend/data.json'),
        this.destinationPath('backend/data.json')
      );
    }
  }

  install() {
    // 4) Install Backend Dependencies if included
    if (this.answers.includeBackend) {
      this.log('📦 Installing backend dependencies...');
      this.spawnCommandSync('npm', ['install'], {
        cwd: this.destinationPath('backend')
      });
    }
  }

  end() {
    // 5) Final instructions
    this.log('\n✅ Project setup complete!');
    this.log(`\nNext steps:`);
    this.log(`  cd ${this.answers.projectName}`);

    if (this.answers.frontendFramework === 'React') {
      this.log('  cd frontend && npm start   # React on localhost:3000');
    } else {
      this.log('  # Open frontend/index.html in your browser (Vanilla JS)');
    }

    if (this.answers.includeBackend) {
      this.log('  cd backend && npm start    # Express on localhost:5000');
    }

    this.log('\nHappy coding! 🚀');
  }
};
