---
title: "How to use Dynamic Variables with Tailwind"
date: "2023-10-08"
published: true
tags: ["tip", "tailwind"]
langs: ["css", "vue"]
description: "Have you ever wanted to do `p-[${someDynamicValue}]` in tailwind? Or maybe the more complicated `after:content-[${someDynamicValue}]`? Here's a better solution than resorting to a style tag."
---
Have you ever wanted to do `p-[${someDynamicValue}]` in tailwind? Or maybe the more complicated `after:content-[${someDynamicValue}]`? Here's a better solution than resorting to a style tag.

---

Tailwind cannot have dynamic values in it's classes because the stylesheets are compiled at build time, neither the class name nor the value can be made up of dynamic variables for this to work.

This can be a bit of a pain in certain situations. One obvious solution is to move back to a style tag, but this means now the styles aren't all in one place, the main selling point of tailwind.

For certain situations, like `p-[${someDynamicValue}]` we can fallback to the style property:

```vue
<!-- I'm using vue here, but all frameworks have a way to do this. -->
<div
	:style="`padding:${someDynamicValue}`"
></div>
```


But this is not always the case. Take `after:content[${someDynamicValue}]`. **Style tags cannot target psuedo-elements**, we have to resort to a style tag, or do we?

**Style tags *can* have inline css variables.** So we can actually do this:

```vue
<div
	class="after:p-[var(--customPadding)]"
	:style="`--customPadding:${someDynamicValue}`"
></div>
```

Tailwind can now happily compile the class, it's name is no longer dynamic, it's `.after\:p-\[var\(--customPadding\)\]` and it's value is no longer dynamic, it's `var(--customPadding)`. The part of the outputted css that we care about looks like this, here's a link to a [demo on the playground](https://play.tailwindcss.com/RcEotAgwA9?file=css). 

```
.after\:p-\[var\(--customPadding\)\]::after {
	padding: var(--customPadding)
	//...
}
```

And we can change the css variable to whatever we need. It's also very easy to find where the custom value was declared.
