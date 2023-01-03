```ts
// proposal for @mdx/math

// direct import
$import(math)

// macros
$macro($a, ($a, $b, $c, ...etc) => {
    ...functions

})

// blocks
$block($rule, $env, ...functions)

// declare rule and env
$rule({
    wrap : true,
    // autoFraction : true
})

$env({
    $a : 
})

$class({

})



// default parameter
__ // double underscore

// basic function
$func(a, b, c, ...other)

// superscript, subscript
(x^2_(12))

// structural parenthesis
$name()
^()
_()
// other are 

$$ 


$text(\$name)

// maybe add an additional parenthesis inside function
$log($frac(1, 2))

$log*()

$log[p]($frac(1, 2))

// align
$align([
    [(a, =, b), (c, =, d)],
    [(e, =, f), (g, =, i)]
])

// $matrix() // compile to align


// $box()

$sin(a) ==> $text(sin)
$operator_name(text) ==> $space(0.5)$text(text)


$raw ??

// trig
$sin()
$cos()
$tan()

// fraction
$frac(1, 2)
($frac(1, __))


$frac(x, y) = $alignNode(x, ?, y);

$$macro($alignNode, (...$nodes) => {
    $node({
        type : $$NodeType.Align
        children : $nodes,
    })
})

$rectNode = ($width, $height, $padding) => {
  $$node(${
    type : $$NodeType.Rect,
    height : $height,
    width : $width,
    padding : 
  })
}

$alignNode = ($children, ) => {
  $$node(${
    type : $$NodeType.Align,
    children : $children,

  })
}

```
mdx-math -replacer-> static-math -compiler-> math-json -render-> svg

flex-box, pseudo element, padding



Some discovery

Implementation using HTML or canvas is relatively easy,
because HTML has CSS to control the alignment for any possible fonts
also, canvas has an method to get metrics of fonts without rendering them,
so its alignment could also be properly controlled for any fonts.

However, the implementation for svg is tricky.
Typically, to render in svg, we can either use <text> or <path>.
The limitation for <path> is that any fonts must be transformed into <path> before using it.
So, unless there is some transformation library, it's almost impossible to support any fonts

For <text>, the main problem is we couldn't know its metrics reliability without rendering it.
Thus, getting accurate metrics will have unknown runtime cost. 
However, we could instead calculate the text based on the font file itself, using an ttf-parser
written in Rust, but that impose some calculation difficulty.

So, the solution for svg is
1. provide <path> information, need pre-compile
2. provide fonts and its basic information written in json (most probable sol)
3. provide fonts, using Rust-ttf-parser via wasm, calculate text as 2.


for the style configuration, using style reconfiguration function instead of style function.

style function.