import { test, debug } from  "./control.js"

// this is a comment
/**
 * this is a multi-line comment
*/

// this is a function that returns 0:
function myFunction()
{
    // this will print "Hello World!" into the console:
    console.log("Hello World!");

    // this ends the function returning 0
    return 0
}

myFunction()

/// Variables

let myNum = 1;          // this is a variable
const otherNum = 1;     // this is a constant

// * let's see what happend when I try to change the values of those variables
debug(test(
    // ! consider only this part of the code as an example
    () => myNum = 2,
    () => otherNum = 2
));