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
    Quotes = "quotes",
    Space = "space",
}

const get_token = (a: string): TokenType => new Map<string, TokenType>([
    ["->", TokenType.Out],
    ["<-", TokenType.In],
    [";", TokenType.LnBreak],
    ["\"", TokenType.Quotes],
    [" ", TokenType.Space]
]).get(a) || typeof a === 'string' && a.is_numeric() || TokenType.Identifier,

lexer = (i: string): Token[] => i.split("").map((_, i, a, g = get_token) =>
{
    if (g(a[i]) == TokenType.Space) return null;

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
.filter(t => t != null);

function process(token: Token[]): string | void
{
    while (token.length > 0)
    {
        const t = token.shift();

        switch (t?.type)
        {
            case TokenType.Out:
                token.shift();
                console.log(token.shift()?.value);
                break
            case TokenType.In:
                token.shift();
                const val = token.shift();
                if (val?.type != TokenType.Str) return "not a string literal"
                prompt(val?.value);
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

    const error = process(tree);
    if (error) console.error(`\x1b[31m${error}\x1b[39m`)
}

main()

export {}