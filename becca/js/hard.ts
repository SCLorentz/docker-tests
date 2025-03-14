// not realy useful, however, intresting...
void function(): number
{
    console.log`Hello World!`;
    return 0
}()

// one line funcions with arrow funcions and && operators
const i = (): boolean => (console.log("hello from one line function!"), 1) && true

console.log("the function returned:", i());

function main()
{
    for (let i = 0; i <= 4; i++)
    {
        F: {
            if (i == 3) break F
            console.log("scope F");
        }

        console.log("scope of loop");
    }
    console.log("funcion scope");
}

main()