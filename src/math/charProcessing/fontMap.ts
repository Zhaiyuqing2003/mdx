export enum FontType {
    Main = "KaTeX_Main",
    Math = "KaTeX_Math"
}

const Main = FontType.Main;
const Math = FontType.Math;


export type CharFontMap = {
    [s : string] : [FontType, string]
}


export const mathCharFontMap : CharFontMap = {
    // number
    "0" : [Main, "0"],
    "1" : [Main, "1"],
    "2" : [Main, "2"],
    "3" : [Main, "3"],
    "4" : [Main, "4"],
    "5" : [Main, "5"],
    "6" : [Main, "6"],
    "7" : [Main, "7"],
    "8" : [Main, "8"],
    "9" : [Main, "9"],
    // capital letter
    "A" : [Math, "A"],
    "B" : [Math, "B"],
    "C" : [Math, "C"],
    "D" : [Math, "D"],
    "E" : [Math, "E"],
    "F" : [Math, "F"],
    "G" : [Math, "G"],
    "H" : [Math, "H"],
    "I" : [Math, "I"],
    "J" : [Math, "J"],
    "K" : [Math, "K"],
    "L" : [Math, "L"],
    "M" : [Math, "M"],
    "N" : [Math, "N"],
    "O" : [Math, "O"],
    "P" : [Math, "P"],
    "Q" : [Math, "Q"],
    "R" : [Math, "R"],
    "S" : [Math, "S"],
    "T" : [Math, "T"],
    "U" : [Math, "U"],
    "V" : [Math, "V"],
    "W" : [Math, "W"],
    "X" : [Math, "X"],
    "Y" : [Math, "Y"],
    "Z" : [Math, "Z"],
    // small letter
    "a" : [Math, "a"],
    "b" : [Math, "b"],
    "c" : [Math, "c"],
    "d" : [Math, "d"],
    "e" : [Math, "e"],
    "f" : [Math, "f"],
    "g" : [Math, "g"],
    "h" : [Math, "h"],
    "i" : [Math, "i"],
    "j" : [Math, "j"],
    "k" : [Math, "k"],
    "l" : [Math, "l"],
    "m" : [Math, "m"],
    "n" : [Math, "n"],
    "o" : [Math, "o"],
    "p" : [Math, "p"],
    "q" : [Math, "q"],
    "r" : [Math, "r"],
    "s" : [Math, "s"],
    "t" : [Math, "t"],
    "u" : [Math, "u"],
    "v" : [Math, "v"],
    "w" : [Math, "w"],
    "x" : [Math, "x"],
    "y" : [Math, "y"],
    "z" : [Math, "z"],
    // greek capital letters, replace to the similar one
    "\u0391" : [Main, "A"], // alpha
    "\u0392" : [Main, "B"], // beta
    "Γ"      : [Main, "Γ"], // gamma
    "Δ"      : [Main, "Δ"], // delta
    "\u0395" : [Main, "E"], // epsilon
    "\u0396" : [Main, "Z"], // zeta
    "\u0397" : [Main, "H"], // eta
    "Θ"      : [Main, "Θ"], // theta
    "\u0399" : [Main, "I"], // iota
    "\u039a" : [Main, "K"], // kappa
    "Λ"      : [Main, "Λ"], // lambda
    "\u039c" : [Main, "M"], // mu
    "\u039d" : [Main, "N"], // nu
    "Ξ"      : [Main, "Ξ"], // xi
    "\u039f" : [Main, "O"], // omicron
    "Π"      : [Main, "Π"], // pi
    "\u03a1" : [Main, "P"], // rho
    "Σ"      : [Main, "Σ"], // sigma
    "\u03a4" : [Main, "T"], // tau
    "\u03a5" : [Main, "Y"], // upsilon
    "Φ"      : [Main, "Φ"], // phi
    "\u03a7" : [Main, "X"], // chi
    "Ψ"      : [Main, "Ψ"], // psi
    "Ω"      : [Main, "Ω"], // omega
    // greek small letters, keep it as is
    "α" : [Math, "α"], // alpha
    "β" : [Math, "β"], // beta
    "γ" : [Math, "γ"], // gamma
    "δ" : [Math, "δ"], // delta
    "ε" : [Math, "ε"], // epsilon
    "ζ" : [Math, "ζ"], // zeta
    "η" : [Math, "η"], // eta
    "θ" : [Math, "θ"], // theta
    "ι" : [Math, "ι"], // iota
    "κ" : [Math, "κ"], // kappa
    "λ" : [Math, "λ"], // lambda
    "μ" : [Math, "μ"], // mu
    "ν" : [Math, "ν"], // nu
    "ξ" : [Math, "ξ"], // xi
    "ο" : [Math, "ο"], // omicron
    "π" : [Math, "π"], // pi
    "ρ" : [Math, "ρ"], // rho
    "ς" : [Math, "ς"], // sigma
    "σ" : [Math, "σ"], // sigma
    "τ" : [Math, "τ"], // tau
    "υ" : [Math, "υ"], // upsilon
    "φ" : [Math, "φ"], // phi
    "χ" : [Math, "χ"], // chi
    "ψ" : [Math, "ψ"], // psi
    "ω" : [Math, "ω"], // omega
    // other symbols
}