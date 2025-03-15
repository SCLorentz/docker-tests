import { debug } from "../js/control.js"

type Maybe<T> = T | undefined;
type More<T> = T | T[];

export interface Token
{
    value: string;          // contains the raw value as seen inside the source code.
    type: TokenType;        // tagged structure.
    raw: string;
}

declare global
{
    interface String
    {
        is_numeric(): Maybe<TokenType>,
        token(type: TokenType): Token,
        is_string(token: string): Maybe<TokenType>
    }    
}

String.prototype.is_numeric = function()
{
    // @ts-ignore: this is a string
    return /^\d+$/.test(this) ? TokenType.Num : undefined;
}

String.prototype.token = function(type: TokenType)
{
    return { value: this, type, raw: this }
}

///////////////////////////////

enum TokenType
{
    In = "In",
    Out = "Out",
    Num = "Num",
    Str = "Str",
    Identifier = "Identifier",
    LnBreak = "semi-colon",
    Quotes = "quotes"
}

const get_token = (a: string): TokenType => new Map<string, TokenType>([
    ["->", TokenType.Out],
    ["<-", TokenType.In],
    [";", TokenType.LnBreak],
    ["\"", TokenType.Quotes]
]).get(a) || typeof a === 'string' && a.is_numeric() || TokenType.Identifier,

lexer = (i: string): Token[] => i.split("").map((t, i, a, next = a[i+1], y = get_token(t)) =>
{
    y == get_token(next) ? (t += next) && (a[i+1] = "") : null;

    return t.trimEnd() == "" ? null : t.token(y)
})
.filter(token => token !== null);

function process(token: Token[])
{
    while (token.length > 0)
    {
        const t = token.shift();

        switch (t?.type)
        {
            case TokenType.Out:
                console.log(token.shift()?.value);
                break
            case TokenType.In:
                prompt(token.shift()?.value);
                break
            case TokenType.Identifier:
                if (token[0].type == TokenType.In)
                {
                    console.log(`${t?.value} needs to be set as variable`)
                }
        }
    }
}

async function main()
{
    // @ts-ignore: Deno
    const tree = await Deno.readTextFile("./math/math.m").then(async (t: string) => lexer(t));

    console.log(tree, "\n");
    process(tree);
}

main()