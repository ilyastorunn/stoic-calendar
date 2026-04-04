# /aso - Metadata Generation & Optimization

## Usage
```bash
/aso AppName                      # Quick metadata
/aso AppName --audit              # Full audit with competitors
/aso --localize tr,de,ja          # Translate .xcstrings
```

## Modes

### Quick Mode (Default)
Generates copy-paste ready metadata in 2-5 minutes:
- Title (30 chars), Subtitle (30 chars), Keywords (100 chars), Description (4000 chars)

Output example:
```json
{
  "title": "TaskFlow - AI Task Manager",
  "subtitle": "Smart Productivity & Focus",
  "keywords": "productivity,task,planner,todo,organize,schedule,reminder",
  "description": "..."
}
```

### Audit Mode (--audit)
Full ASO audit (20-30 min), competitor analysis via iTunes API, keyword gaps, launch checklist.
Output: `outputs/[app-name]/00-MASTER-ACTION-PLAN.md`

### Localize Mode (--localize)
AI-powered .xcstrings translation (70+ languages), preserves placeholders (%@, %d), context-aware.

## Character Limits
| Platform | Title | Subtitle | Keywords | Description |
|----------|-------|----------|----------|-------------|
| Apple    | 30    | 30       | 100      | 4000        |
| Google   | 50    | -        | -        | 4000        |

## Rules
- Title words NOT in subtitle
- Title/subtitle words NOT in keywords
- No spaces after commas in keywords
