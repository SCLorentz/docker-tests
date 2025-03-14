import { test } from  "./admin.js"

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

let myNum = 1;      // this is a variable
const otherNum = 1; // this is a constant

test(() => myNum = 2);
test(() => otherNum = 2);

console.log(myNum);
console.log(otherNum);