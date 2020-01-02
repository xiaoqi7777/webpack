const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const babylon = require('babylon');
const t = require('babel-types');
const generate = require('babel-generator').default;
const traverse = require('babel-traverse').default;
class NormalModule {
  constructor({ name, context, request }) {
    this.name = name;
    this.context = context;
    this.request = request;
    this.dependencies = [];
    this.moduleId;
    this._ast;
    this._source;
  }
  getSource(request, compilation) {
    let source = compilation.inputFileSystem.readFileSync(this.request, 'utf8');
    let { module: { rules } } = compilation.options;
    for (let i = 0; i < rules.length; i++) {
      let rule = rules[i];
      if (rule.test.test(request)) {
        let loaders = rule.use;
        let loaderIndex = loaders.length - 1;
        let iterateLoaders = () => {
          let loaderName = loaders[loaderIndex];
          let loader = require(path.resolve(this.context, 'loaders', loaderName));
          source = loader(source);
          if (loaderIndex > 0) {
            loaderIndex--;
            iterateLoaders();
          }
        }
        iterateLoaders();
        break;
      }
    }
    return source;
  }
  build(compilation) {
    let originalSource = this.getSource(this.request,compilation)
    const ast = babylon.parse(originalSource);
    let dependencies = [];
    traverse(ast, {
      CallExpression: (nodePath) => {
        if (nodePath.node.callee.name == 'require') {
          //获取当前节点
          let node = nodePath.node;
          //修改require为__webpack_require__
          node.callee.name = '__webpack_require__';
          //获取要加载的模块ID
          let moduleName = node.arguments[0].value;
          let extension = moduleName.split(path.posix.sep).pop().indexOf('.') == -1 ? '.js' : '';
          //获取依赖模块的绝对路径
          let dependencyRequest = path.posix.join(path.posix.dirname(this.request), moduleName + extension);
          //获取依赖模块的模块ID
          let dependencyModuleId = './' + path.posix.relative(this.context, dependencyRequest);
          //把依赖对象添加到依赖列表里
          dependencies.push({ name: this.name, context: this.context, request: dependencyRequest });
          //修改加载的模块ID名称
          node.arguments = [t.stringLiteral(dependencyModuleId)];
        }
      }
    });
    //生成新的代码
    let { code } = generate(ast);
    //获取模块的来源代码
    this._source = code;
    //获得语法树
    this._ast = ast;
    //获取模块ID
    this.moduleId = './' + path.posix.relative(this.context, this.request);
    //添加到模块数组里
    compilation.modules.push(this);
    //KEY为模块的绝对路径 值为模块转译后的代码
    compilation._modules[this.request] = code;
    //编译依赖项
    compilation.buildDependencies(this, dependencies);
    return this;
  }
}
module.exports = NormalModule;