#include <stdio.h>

void main()
{
    int myNumbers[4] = {25, 50, 75, 100};

    for (int i = 0; i <= 3; i++)
    {
        printf("element %d of array: %d, pointer: %p;\n", i, *(myNumbers + i), (myNumbers + i));
    };
}