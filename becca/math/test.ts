type Maybe<T> = T | undefined;

class Result<T>
{
    constructor(public error?: string, public result?: T) {}
    unwrap_or = (fn: (error: string) => string | ErrorStd): T | string | ErrorStd => this.error ? fn(this.error) : this.result!;
}

interface Token { value: string; type: TokenType; raw: string; }

class ErrorStd
{
    constructor(public error: string)
    {
        console.error(`\x1b[31m${error}\x1b[39m`);
        // @ts-ignore
        Deno.exit(1)
    }
}

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

    new(): ErrorStd | void
    {
        while (this.token.length > 0)
        {
            const t = this.token.shift();
    
            switch (t?.type)
            {
                case TokenType.Out:
                {
                    this.out().unwrap_or(e=>{return e});
                    break
                }
                case TokenType.In:
                    this.in().unwrap_or(e=>{return e});
                    break
                case TokenType.Num:
                    this.number(t).unwrap_or(e=>{return e});
                    break
                case TokenType.Identifier:
                    const next = this.token.shift();
                    //
                    if (next?.type == TokenType.In) variables.set(t?.value.replace(" ", ""), this.in().unwrap_or(e=>new ErrorStd(e)));
                    else if (next) this.token.unshift(next)
                    break
            }
        }
    }

    in(): Result<string>
    {
        this.token.shift();
        const val = this.token.shift();
        if (val?.type != TokenType.Str) return new Result("not a string literal");
        return new Result(undefined, prompt(val?.value) || "");
    }

    out(): Result<null>
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
                val = this.number(next).unwrap_or(_ => {return new ErrorStd("Error parsing number")})!.toString();
                break
            default:
                const t = this.token.shift();
                if (!t) return new Result("nothing to print")
                if (t.type != TokenType.Str) return new Result("not a string literal")
                //
                val = t.value;
        }
        console.log(val);
        return new Result(undefined, null);
    }

    number(t: Token, v = this.token.shift(), n = this.token.shift()): Result<number>
    {
        // handles with operations
        if (v?.type == TokenType.Symbol && n?.type == TokenType.Num) return new Result(undefined, eval(`${t.value}${v.value}${n.value}`));
        return new Result(eval(`${t.value}`))
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