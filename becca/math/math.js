function calcularPiLeibniz(iteracoes) 
{
    let pi = 0;
    for (let n = 0; n < iteracoes; n++) {
        pi += ((-1) ** n) / (2 * n + 1);
    }
    return pi * 4;
}
console.log(calcularPiLeibniz(1_000_000));

/*
i <- "amount: "

Σ n = 0; i; n
{
    -> n
}
*/