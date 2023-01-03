# WorkLog

## Oct 22, 2022

Today's goal, finish compiler reorganization, have some basic macros like
$$if, $$else, $$then, $$for, $$while, to be able to use it the compiler as a toy.
Though it doesn't really do anything. (just as some tests)

One bug fixed, the non-starting $$ literal are now not considered to be a new line
but instead just merged with other parameters
