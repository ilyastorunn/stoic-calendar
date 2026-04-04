# /aso-manage - Reviews & Legal Documents

## Usage
```bash
/aso-manage reviews               # List recent reviews
/aso-manage reviews --negative    # Filter 1-3 star only
/aso-manage reviews --respond ID  # AI response suggestion
/aso-manage reviews --stats       # Analytics
/aso-manage legal                 # Generate Privacy, Terms, EULA
/aso-manage legal privacy         # Privacy Policy only
/aso-manage legal terms           # Terms of Use only
/aso-manage legal eula            # EULA only
```

## reviews subcommand
Lists reviews with priority tagging (HIGH for 1-3 stars).
- `--respond ID`: AI-generated response draft (empathetic, offers help, never defensive)
- `--stats`: Analytics dashboard
- `--negative`: Filter 1-3 star only

## legal subcommand
Generates privacy, terms, eula as both `.md` and `.html` files.
Output: `legal/` directory.

**Compliance:**
- GDPR (legal basis, right to access/delete, portability)
- CCPA (right to know/delete, opt-out)
- Apple (Privacy Policy URL + Privacy Labels match)

## Response Guidelines
**DO:**
- Thank reviewer
- Acknowledge concerns
- Offer help
- Be empathetic

**DON'T:**
- Be defensive
- Promise features/dates
- Argue
- Use generic copy-paste

> Disclaimer: Generated documents are templates. Review with an attorney.
