-- ePub variant: wrap known field-manual section headers in a colored <div class="banner ...">.
local color_for = {
  ["GLOSSARY"]="cyan", ["SITREP"]="red", ["THE BROADCAST"]="pink",
  ["BROADCAST"]="pink", ["BRIEFING"]="cyan", ["BOSS"]="amber",
  ["KEY MISSION TASKS"]="acid", ["MISSION TASKS"]="acid", ["GLASS HOUSE"]="amber",
  ["SPACE PIRATE ZERO"]="orange", ["SPZ CLOSER"]="orange", ["SPZ VOICE"]="orange",
  ["THE MIRROR TEST"]="pink", ["THE INSURGENT'S OATH"]="acid",
  ["THE INSURGENTS OATH"]="acid",
}

function Header(el)
  if el.level == 2 or el.level == 3 then
    local raw = pandoc.utils.stringify(el)
    local key = raw:upper():gsub("^%s*%[", ""):gsub("%]%s*$", ""):gsub("%s+$", "")
    for k, c in pairs(color_for) do
      if key == k or key:sub(1, #k + 1) == (k .. " ") or key:sub(1, #k + 1) == (k .. ":") then
        local title = raw:gsub("^%s*%[", ""):gsub("%]%s*$", "")
        return pandoc.Div(
          { pandoc.Para({ pandoc.Str(title) }) },
          pandoc.Attr("", { "banner", c })
        )
      end
    end
  end
  return el
end
