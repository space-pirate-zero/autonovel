#!/usr/bin/env python3
"""
convert_equations.py -- Replace plain-bold ASCII equation DEFINITION lines in
chapters/*.md with canonical LaTeX display math ($$...$$), so they render as real
math and can be boxed. Conservative: only rewrites a line whose core (after
stripping >, **, and a 'Formula:' label) is exactly `SYMBOL = <expr with letters>`
with a single '='. Numeric field reports (two '=', or numeric RHS) and inline
glossary mentions are left untouched.

Usage: uv run python convert_equations.py [--apply]   (default = dry run)
"""
import re, sys, glob

# ASCII LHS symbol -> canonical inner LaTeX (no surrounding $$)
EQ = {
    "R_extinction": r"R_{ext} = \frac{Lines_{generic}}{Lines_{authentic}} \times AI_{velocity}",
    "R_ext":        r"R_{ext} = \frac{Lines_{generic}}{Lines_{authentic}} \times AI_{velocity}",
    "A_half-life":  r"A_{hl} = \frac{Taste + Context + Craft}{Replicability}",
    "A_hl":         r"A_{hl} = \frac{Taste + Context + Craft}{Replicability}",
    "R_t":          r"R_t = \frac{Press\_Releases + Demo\_Days}{Production\_Deployments}",
    "F_g":          r"F_g = \frac{Sunk\_Cost \times Political\_Capital}{Migration\_Effort^{2}}",
    "E_tax":        r"E_{tax} = Maintenance \times e^{\lambda t}",
    "mu_leg":       r"\mu_{leg} = \frac{Years\_Since\_Update}{Pages\_of\_Documentation}",
    "μ_leg":   r"\mu_{leg} = \frac{Years\_Since\_Update}{Pages\_of\_Documentation}",
    "D_comp":       r"D_{comp} = \frac{Bugs\_Found}{Bugs\_Fixed}",
    "F_cp":         r"F_{cp} = \frac{n(n-1)}{2}",
    "V_curator":    r"V_{curator} = \frac{Signal_{selected}}{Noise_{available}} \times Context_{depth}",
    "T_authentic":  r"T_{authentic} = Trust_{human} \times \frac{1}{Substitutability_{AI}}",
    "RT":           r"RT = (P_f \times C_d) + (T_{panic} \times C_{career})",
    "DF":           r"DF = \frac{Decisions_{made}}{Glucose_{remaining}}",
    "D_gray":       r"D_{gray} = \frac{Revenue_{dark\text{-}pattern}}{Trust_{eroded}} \times Time",
    "S_soul":       r"S_{soul} = \sum (Impact_{human} \times Intent_{honest})",
    "R_r":          r"R_r = \frac{Impact_{blast}}{Speed_{rollback}}",
    "V_w":          r"V_w = \frac{Pain_{acute} \times Trust_{increment}}{Friction_{adopt}}",
    "GT":           r"GT = \frac{Impact_{change} \times Alignment_{values}}{Risk + Friction}",
    "I_insurgent":  r"I_{insurgent} = \frac{Problems\_Solved_{quietly}}{Credit\_Claimed_{publicly}}",
    "L_legacy":     r"L_{legacy} = P \times (1 + r)^{t}",
    "S_fc":         r"S_{fc} = \frac{Cost_{human} - Cost_{AI}}{Cost_{pilot}}",
    "Score":        r"Score = (Pain\_Owner \times 5) + (Timeline \times 3) + (Budget\_Code \times 5)",
    "I_v":          r"I_v = \frac{Adjectives_{pitch}}{Live\_Demo\_Minutes}",
    "D_audit":      r"D_{audit} = \frac{Certifications \times Scope}{Auditor\_Fear}",
    "T_r":          r"T_r = \frac{Volume_{traffic} \times Time_{uptime}}{Severity_{incidents}}",
}
SYMS = sorted(EQ.keys(), key=len, reverse=True)


def core_of(line):
    c = line.strip()
    c = re.sub(r'^>\s*', '', c)
    c = c.replace('**', '')
    c = re.sub(r'^\s*Formula:\s*', '', c, flags=re.I)
    return c.strip()


def convert(line):
    if '$$' in line or '$' in line:
        return None
    c = core_of(line)
    if c.count('=') != 1:
        return None
    for s in SYMS:
        if c.startswith(s) and re.match(re.escape(s) + r'\s*=', c):
            rhs = c.split('=', 1)[1].strip()
            # definition (starts with a var or '('), not a numeric result line
            if re.match(r'^[+\-−.]?\d', rhs):
                return None
            if re.search(r'[A-Za-z]', rhs):
                return "$$ " + EQ[s] + " $$"
    return None


def main():
    apply = "--apply" in sys.argv
    total = 0
    for f in sorted(glob.glob("chapters/ch_*.md")):
        lines = open(f).read().split("\n")
        changed = False
        for i, l in enumerate(lines):
            new = convert(l)
            if new and new != l:
                print(f"{f}:{i+1}\n   - {l.strip()}\n   + {new}")
                lines[i] = new
                changed = True
                total += 1
        if changed and apply:
            open(f, "w").write("\n".join(lines))
    print(f"\n{'APPLIED' if apply else 'DRY RUN'} — {total} equation lines"
          + ("" if apply else " would be") + " converted.")


if __name__ == "__main__":
    main()
