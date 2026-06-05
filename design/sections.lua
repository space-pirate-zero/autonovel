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
  -- Non-banner headings: keep their styling but keep them OUT of the TOC
  -- (chapters-only TOC). .unnumbered + .unlisted => pandoc emits \section* with
  -- no \addcontentsline.
  if el.level >= 2 then
    el.classes:insert("unnumbered")
    el.classes:insert("unlisted")
    return el
  end
  return el
end

-- A paragraph that is just one display equation -> wrap in the cyan \eqbox.
function Para(el)
  local sig = {}
  for _, inl in ipairs(el.content) do
    if inl.t ~= "Space" and inl.t ~= "SoftBreak"
       and not (inl.t == "Str" and inl.text == "") then
      sig[#sig + 1] = inl
    end
  end
  if #sig == 1 and sig[1].t == "Math" and sig[1].mathtype == "DisplayMath" then
    return pandoc.RawBlock("latex", "\\eqbox{\\[" .. sig[1].text .. "\\]}")
  end
  return nil
end
