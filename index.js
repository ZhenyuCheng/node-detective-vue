/**
 * @note 根据Vue文件，获取Vue文件的依赖
 * @author chengzhenyu@corp.netease.com
 * @date 2019-12-02 15:26:36
 * @Last Modified by: chengzhenyu@corp.netease.com
 * @Last Modified time: 2019-12-02 16:59:16
 */
'use strict';

const compiler = require('vue-template-compiler');
const detectiveCjs = require('detective-cjs');
const detectiveAmd = require('detective-amd');
const detectiveEs6 = require('detective-es6');
const detectiveLess = require('detective-less');
const detectivePostcss = require('detective-postcss');
const detectiveSass = require('detective-sass');
const detectiveScss = require('detective-scss');
const detectiveStylus = require('detective-stylus');
const detectiveTypeScript = require('detective-typescript');
/**
 * Extracts the dependencies of the supplied es6 module
 *
 * @param  {String|Object} src - File's content or AST
 * @param  {Object} options - optional extra settings
 * @return {String[]}
 */
function getVueDeps(src, options) {

    let dependencies = [];
    let output = compiler.parseComponent(src);
    console.log(output);
    let theJsDetective;
    let jsType;
    if(output.script.lang && (output.script.lang.toLowerCase === 'ts' ||  output.script.lang.toLowerCase === 'typescript')) {
        theJsDetective = detectiveTypeScript;
        jsType = 'ts';
    } else {
        theJsDetective = detectiveEs6;
        jsType = 'js';
    }
    let scripts
    if(output.script.src) {
        // 不需要type，处理路径时会使用node-resolve-dependency-path
        scripts = [output.script.src];
    } else {
        scripts = theJsDetective(output.script.content, options).map(ele => ({
            partial: ele,
            ast: output.script.content,
            type: jsType
        }));
    }
    let styles = Array.isArray(output.styles) ? output.styles : [output.styles];
    styles = styles.map((style) => {
        // 不需要type，处理路径时会使用node-resolve-dependency-path
        if (style.src) return [ style.src];
        let theDetective;
        switch (style.lang) {
            case 'css':
                theDetective = detectivePostcss;
                break;
            case 'sass':
                theDetective = detectiveSass;
                break;
            case 'less':
                theDetective = detectiveLess;
                break;
            case 'scss':
                theDetective = detectiveScss;
                break;
            case 'stylus':
                theDetective = detectiveStylus;
                break;
            default:
                theDetective = detectivePostcss;
                break
        }
        return theDetective(style.content, options).map(ele => ({
            partial: ele,
            ast: style.content,
            type: style.lang || 'css'
        }));
    })
    styles = styles.reduce((pre, current) => [...pre, ...current], []),
    dependencies = [...scripts, ...styles]
    return dependencies;
};

// // test
var content = require('fs').readFileSync('./main.vue', 'utf8');
getVueDeps(content)
module.exports = getVueDeps;
