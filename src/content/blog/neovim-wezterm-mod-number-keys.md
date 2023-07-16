---
title: "How to map Mod+Number keys in Vim/Neovim (using Wezterm)"
pubDate: 2023-07-01
tags: ["neovim", "wezterm"]
langs: ["lua"]
published: true
description: "Some lua functions to make it possible to use Modifier+Number shortcuts (e.g.Ctrl+1) in neovim."
cover: "src/assets/posts/neovim-wezterm-icon.png"
coverAlt: "neovim + wezterm icons"
---

I've been recently giving neovim a serious try (this is my fourth/fifth attempt). And I think this time it's going to work out, but I really miss Modifier+Number shortcuts.

Usually you cannot map to modifies + number keys in in neovim (e.g. Ctrl+1). You can [try to map the raw key sequences](https://vi.stackexchange.com/questions/19358/cannot-map-ctrl-number-except-6-or) but this is a pain and does not work for all numbers.

The best way to get around this is to map to an obscure keybinding then make the terminal remap Mod+Number to those odd keybindings. I never got around to actually doing this usually because most terminal's configs are static it's also often a pain to remap keys (e.g. [kitty, I like you, but...](https://sw.kovidgoyal.net/kitty/conf/#shortcut-kitty.Send-arbitrary-text-on-key-presses))

Also the ideal way to do this is to map them to a key chain like `{ObscureCombo} {Mods}+{Remap}` so as to not take up useful keys. But that's even more painful.

Recently though I tried and switched to [wezterm](https://github.com/wez/wezterm) for my terminal emulator, and it's configured through lua which makes this super easy to do for all sequences.

For example, I picked `Ctrl+Alt+Shift+F12` for the obscure key combo and letters for the remap part. So `Ctrl+1` would map to `Ctrl+Alt+Shift+F12 Ctrl+q`.

The letter mapping is to avoid breaking anything. If we mapped them to, for example, the F keys again, we might accidentally shoot ourselves in the foot when pressing `Alt+4` .

Note that we also can't map the numbers without the modifiers, since wezterm has no way to know if we're in normal mode or not, and we would be left unable to type numbers if we did so.

Here's my wezterm function for remapping with all mods.

```lua
-- Allows using Mods+Number in the receiving program if it does not support it.
-- In the receiving program, the keymap needs to be `<C-A-S-F12> <Mods-F{q-p}>`
local remapModNumber = function(keyConfig, modsToRemap)
	-- it's not <Mods-F{Number}> for obvious reasons (i.e. A-F4)
	local numMap = {
		["1"] = "q",
		["2"] = "w",
		["3"] = "e",
		["4"] = "r",
		["5"] = "t",
		["6"] = "y",
		["7"] = "u",
		["8"] = "i",
		["9"] = "o",
		["0"] = "p",
	}

	local createModNumberRemap = function(key, mods)
		local res = {
			key = key,
			mods = mods,
			action = act.Multiple({
				--obscure key to use as base
				act.SendKey({ key = "F12", mods = "CTRL|SHIFT|ALT" }),
				act.SendKey({ key = numMap[key], mods = mods }),
			}),
		}
		return res
	end
	print(keyConfig)
	for i = 0, 9 do
		for _, mod in ipairs(modsToRemap) do
			-- cant insert normally???
			keyConfig[#keyConfig + 1] = createModNumberRemap(tostring(i), mod)
		end
	end
end
config.keys = {
	-- ...your other keybindings
}

remapModNumber(config.keys, { "CTRL", "SHIFT", "ALT", "CTRL|ALT", "ALT|SHIFT", "CTRL|SHIFT", "ALT|CTRL", "CTRL|SHIFT|ALT" })
```

Then in vim, if we wanted to use `<C-1>` we would map to `<C-S-A-F12><C-q>`.

I've also added a small helper function in my local utils module to help with this. I might extract this later into a plugin.

```lua
local M = {}
local config = {
	baseSequence = "<C-S-A-F12>",
}
M.setup = function(opts)
	opts = opts or {}
	vim.tbl_extend("force", config, opts)
end
local replacements = {
	["1"] = "q",
	["2"] = "w",
	["3"] = "e",
	["4"] = "r",
	["5"] = "t",
	["6"] = "y",
	["7"] = "u",
	["8"] = "i",
	["9"] = "o",
	["0"] = "p",
}
M.mapNum = function(keysString)
	local str = ""
	for i = 1, #keysString do
		local prevPrevChar = i > 2 and keysString:sub(i - 2, i - 2) or nil

		local prevChar = i > 1 and keysString:sub(i - 1, i - 1) or nil
		local char = keysString:sub(i, i)
		local isNumber = tonumber(char) ~= nil
		local prevIsNumber = prevChar ~= nil and tonumber(prevChar) ~= nil
		local prevIsAllowed = prevChar == nil or prevChar ~= "F" or prevIsNumber
		local prevPrevIsAllowed = prevPrevChar == nil or prevPrevChar ~= "F"
		if isNumber and prevIsAllowed and prevPrevIsAllowed then
			str = str .. replacements[char]
		else
			str = str .. char
		end
	end
	return config.baseSequence .. str
end

return M
```

It can then be used like so:
```lua
local mn = require("utils").mapNum

vim.keymap.set("n", mn("<C-1>"), ...)
-- will not remap F1
vim.keymap.set("n", mn("<C-F1>"), ...) 
```

How to get a local module to actually load using lazy.nvim is out of scope for this post, but I might write one on that later because it was not very straightforward.
