###### Stuff to talk about with kameron
just type in discord chat
```
kameron help
//or for information about specific command
kameron help <command name>
```
###### Do you want to teach kameron new things ?
No need to modify existing code ( *ok i lie but adding module is a breeze* )
Create new module file somefile.js and try to export only one function ( *it will be run in main kameron.js file* )
example module:
```
exports.decide = function(){
  //some code
  return result;
}
```
remember to use callbacks if dealing with asynchronus tasks ( *like database connections* ) :
```
exports.logMessage = function (callback){
  //some asynchronus task
  callback(result);
}
```
###### Do you want kameron to live in your own PC ?
you will need:

1. node.js
    - Discord.js
    - request
    - mysql
    - shell.js
2. mysql
3. Linux distribution ( *or anything that can run cron and bash commands* )
