type Maybe<T> = T | undefined;

interface Token { value: string; type: TokenType; raw: string; }

declare global
{
    interface String
    {
        is_numeric(): Maybe<TokenType>,
        token(type: TokenType): Token,
        is_string(token: string): Maybe<TokenType>
    }    
}

String.prototype.is_numeric = function() { return /^\d+$/.test(this) ? TokenType.Num : undefined }

String.prototype.token = function(type: TokenType) { return { value: this, type, raw: this } }

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
    ["\"", TokenType.Quotes],
]).get(a) || typeof a === 'string' && a.is_numeric() || TokenType.Identifier,

lexer = (i: string): Token[] => i.split("").map((_, i, a, g = get_token) =>
{
    for (let x = 1; x < a.length - i; x++)
    {
        const $ = a[i+x];
        
        g($) != g(a[i]) ?
            (a.splice(i+1, x-1)) && (x = a.length) :    // remove the next char and breaks the loop
            (a[i] += $) && (a[i+x] = " ")               // complement the value to current token and remove the next
    }

    return g(a[i-1]) == TokenType.Quotes && g(a[i+1]) == TokenType.Quotes ?
        a[i].token(TokenType.Str) :
        a[i].token(g(a[i]))
})
.filter(t => t.value != " "),

// todo: use generics <T>() => new Map<String, T> in futurure
variables = new Map<String, any>();

class Process
{
    constructor(public token: Token[]) {}

    new(): string | void
    {
        while (this.token.length > 0)
        {
            const t = this.token.shift();
    
            switch (t?.type)
            {
                case TokenType.Out:
                    this.out();
                    break
                case TokenType.In:
                    this.in()
                    break
                case TokenType.Identifier:
                    const next = this.token.shift();
                    if (next?.type == TokenType.In)
                    {
                        const v = this.in();
                        if (v.a) return v.a;
                        variables.set(t?.value, v.b);
                    }
                    console.log(variables)
                    break
            }
        }
    }

    in(): { a: Maybe<string>, b: string }
    {
        this.token.shift();
        const val = this.token.shift();
        return val?.type != TokenType.Str ? {a: "not a string literal", b: ""} : { a: undefined, b: prompt(val?.value) || ""};
    }

    out = () => this.token.shift() && console.log(this.token.shift()?.value);
}

async function main()
{
    // @ts-ignore: Deno
    const tree = await Deno.readTextFile("./math/math.m").then(async (t: string) => lexer(t));

    console.log(tree, "\n");

    const error = new Process(tree).new();
    if (error) console.error(`\x1b[31m${error}\x1b[39m`)
}

main()

export {}