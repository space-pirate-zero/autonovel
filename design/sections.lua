-- Convert known field-manual section headers into colored \dibanner blocks.
-- Everything else passes through to normal (titlesec-styled) headings.

local color_for = {
  ["GLOSSARY"]="cyan",
  ["SITREP"]="red",
  ["THE BROADCAST"]="pink",
  ["BROADCAST"]="pink",
  ["BRIEFING"]="cyan",
  ["BOSS"]="amber",
  ["KEY MISSION TASKS"]="acid",
  ["MISSION TASKS"]="acid",
  ["GLASS HOUSE"]="amber",
  ["SPACE PIRATE ZERO"]="orange",
  ["SPZ CLOSER"]="orange",
  ["SPZ VOICE"]="orange",
  ["THE MIRROR TEST"]="pink",
  ["THE INSURGENT'S OATH"]="acid",
  ["THE INSURGENTS OATH"]="acid",
}

local function tex_escape(s)
  s = s:gsub("\\", "\\textbackslash{}")
  s = s:gsub("([#%$%%&_{}])", "\\%1")
  s = s:gsub("%^", "\\^{}")
  s = s:gsub("~", "\\~{}")
  return s
end

function Header(el)
  if el.level == 2 or el.level == 3 then
    local raw = pandoc.utils.stringify(el)
    local key = raw:upper():gsub("^%s*%[", ""):gsub("%]%s*$", ""):gsub("%s+$", "")
    local color = nil
    for k, c in pairs(color_for) do
      if key == k or key:sub(1, #k + 1) == (k .. " ") or key:sub(1, #k + 1) == (k .. ":") then
        color = c
        break
      end
    end
    if color then
      local title = raw:gsub("^%s*%[", ""):gsub("%]%s*$", "")
      return pandoc.RawBlock("latex", "\\dibanner{" .. color .. "}{" .. tex_escape(title) .. "}")
    end
  end
  return el
end
