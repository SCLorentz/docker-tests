type Maybe<T> = T | undefined;

interface Token { value: string; type: TokenType; raw: string; }

declare global
{
    interface String
    {
        is_numeric(): Maybe<TokenType>,
        token(type: TokenType): Token,
        is_string(token: string): Maybe<TokenType>,
        is_symbol(): Maybe<TokenType>
    }    
}

String.prototype.is_numeric = function() { return /^\d+$/.test(this) ? TokenType.Num : undefined }

String.prototype.token = function(type: TokenType) { return { value: this, type, raw: this } }

String.prototype.is_symbol = function() { return ["+","-","/","*","%",">","<"].includes(this) ? TokenType.Symbol : undefined }

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
    Symbol = "Operator",
    NewLn = "new line"
}

const get_token = (a: string): TokenType => new Map<string, TokenType>([
    ["->", TokenType.Out],
    ["<-", TokenType.In],
    [";", TokenType.LnBreak],
    ["\"", TokenType.Quotes],
    ["\n", TokenType.NewLn]
]).get(a) || typeof a === 'string' && (a.is_numeric() || a.is_symbol()) || TokenType.Identifier,

lexer = (i: string): Token[] => i.split("").map((_, i, a, g = get_token) =>
{
    for (let x = 1; x < a.length - i; x++)
    {
        const $ = a[i+x], _ = g($) != g(a[i]) ?
            (a.splice(i+1, x-1)) && (x = a.length) :    // remove the next char and breaks the loop
            (a[i] += $) && (a[i+x] = " ")               // complement the value to current token and remove the next
    }

    return g(a[i-1]) == TokenType.Quotes && g(a[i+1]) == TokenType.Quotes ?
        a[i].token(TokenType.Str) :
        a[i].token(g(a[i]))
})
.filter(t => t.value != " "),

variables = new Map<String, any>(); // TODO: use generics <T>() => new Map<String, T> in futurure

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
                {
                    const v = this.out();
                    if (v.a) return v.a;
                    break
                }
                case TokenType.In:
                {
                    const v = this.in();
                    if (v.a) return v.a;
                    break
                }
                case TokenType.Num:
                {
                    this.number(t);
                    break
                }
                case TokenType.Identifier:
                    const next = this.token.shift();
                    if (next?.type == TokenType.In)
                    {
                        const v = this.in();
                        if (v.a) return v.a;
                        variables.set(t?.value.replace(" ", ""), v.b);
                    }
                    else if (next) { this.token.unshift(next!) }
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

    out(): { a: Maybe<string> }
    {
        const next = this.token.shift();
        let val: string;
        //
        switch (next?.type)
        {
            case TokenType.Identifier:
                val = variables.get(next.value.replace(" ", ""));
                break
            case TokenType.Num:
                const r = this.number(next);
                if (!r) return {a: "Error parsing number"};
                val = r.toString();
                break
            default:
                const t = this.token.shift();
                if (!t) return {a: "nothing to print"}
                if (t.type != TokenType.Str) return {a: "not a string literal"}
                //
                val = t.value;
        }
        console.log(val);
        return {a: undefined};
    }

    number(t: Token, v = this.token.shift(), n = this.token.shift()): number | void
    {
        // handles with operations
        if (v?.type == TokenType.Symbol && n?.type == TokenType.Num) return eval(`${t.value}${v.value}${n.value}`);
        return eval(`${t.value}`)
    }
}

async function main()
{
    // @ts-ignore: Deno
    const tree = await Deno.readTextFile("./math/math.m").then(async (t: string) => lexer(t));
    //console.log(tree, "\n");

    const error = new Process(tree).new();
    if (error) console.error(`\x1b[31m${error}\x1b[39m`)
}

main()

export {}