---
title: "I cave, Tailwind rocks."
pubDate: "2023-09-14"
description: |-
   <p>CSS in HTML? Class soup? Relearning CSS property names? No thanks! Right?</p>
   <p>No, I was completely wrong! After hearing about it everywhere I have given it and chance, and I hate that I didn't do it earlier. But what sold me about actually using Tailwind that hadn't sold me when I looked into it?</p>
svgCover: "/posts/tailwind-logo.svg"
svgCoverAlt: "Tailwind logo"
published: false
tags: ["styling"]
langs: ["css", "tailwind"]
---

My first impression of tailwind was 🤮, css in html, not this again. What about seperation of concerns! When I looked at examples they just looked like some sort of class soup. The first example has to be scrolled because the lines are so long! Utility functions are a nice idea I'd been toying with adopting, but surely this went to far?

I had looked into other css frameworks but it was easier to just roll my own than customize a utility framework so I didn't. I'd been toying with a theme management system / variable generator for apps, so using someone else's variables did not make sense. For a while I just used css with the variables my package produced to keep a consistent design.


Tailwind just seemed like another utility based css library that wouldn't benefit me very much.

But after seeing it praised again and again, I had to try it. [The docs are not wrong about this.](https://tailwindcss.com/docs/utility-first#:~:text=you%20have%20to%20actually%20try%20it)

I tried it on a complicated component library to really battle test it and I finally understood what all the praise was about.

It's not just the points you hear all the time. There were also some things that aren't obvious on first glance that I really liked:

- It's very easy to customize and make custom plugins.
- You can quickly use custom values when you need them (e.g. `border-[calc(...)]`).
- Many utility functions do more than one thing and make it easy to do common things that tend to bloat css.
- Predictable application and overriding of styles (assuming the use of something like tailwind-merge).

It's hard to believe, but these all add up to make the class soup actually far exceed my previous scss in simplicity, readability, and maintainability. The [link above](https://tailwindcss.com/docs/utility-first) shows this to some extent but I did not even see this until I actually decided to try tailwind. It really should be one of the first things you see. 

Also you don't have to put it all in one line! Why is it like that in so many examples, 😭?

You can still write very readable styles if you want. And once you get a hang for the basic utility classes (this does not take as long as you'd think), the intent of the styles is far far clearer.

Here's my own example. Where before in a my component library might have css that looked something like this (and yes, I know the *css* could be simplified, but in exchange for verbosity elsewhere[^1]):

[^1]: I know, I could apply all the classes to the wrapper as well or use some BEM naming scheme and simplify the css, but then in complex elements, they need to be attached/created for every element which might only use a single state class, which probably isn't an issue performance wise if the classes aren't changing every second, but just irks me. And conditionally giving them the needed classes is beyond painful so I often stuck with this.

```scss
.component {
	padding: 0 var(--padding-s);
	background: var(--color-bg-el) ;
	&.border {
		border: var(--border-width) solid var(--color-border);
		&:focus { border-color: var(--color-border-focus) ;}
	}
	&:focus { color: var(--color-text-focus) ; }
	&.disabled { background: var(--color-bg-disabled); }
	&.disabled:focus { color: var(--color-text-disabled);}
	&.border.disabled:focus { border-color: var(--color-border-focus) ;}
}
.wraper {
	.component.disabled.border & {
		text-decoration-line: line-through;
	}
}
```

with html (vue) that looked like this:
```vue-html
<div
	:class="classes"
>
	<div class="wrapper"/>
</div>
```

Where `classes` was a computed red in setup, often abstracted away to a function for common states:

```js
const classes = computed(() => ({
	disabled: props.disabled,
	border: props.border
	...
}))
```
Seperation of concerns, right...

Now with tailwind, after a bit of experimenting and the help of tailwind merge I can have html (vue) that looks like this. Same number of css rules.

```vue-html
	<div
		:class="twMerge(`
			p-3
			bg-neutral-50
			focus:text-blue-500
			`,
			border && `
				border
				border-neutral-900
				focus:border-blue-500
			`,
			disabled && `
				bg-neutral-300
				focus:text-neutral-500
			`,
			border && disabled && `
				border-neutral-500
			`)"
	>
		<div :class="disabled && `line-through`"><div>
	</div>
```
And that's it.

There is no more jumping to the js or the css to look things up.

All styles will apply predictably. It's clear what's happening, which classes are being applied when. With the help of tailwind merge we can rely on order and use variables like in the example to avoid specificity issues.\*.

Just a breath of fresh air.

Even with one style per line for readability I have managed to shrink the file size of ALL the components I converted.

I only now have two sections to worry about now, the logic, and the presentation. I've come to understand that presentation is invariably linked to state, and separating the css actually always makes things more painful. The creator of tailwind actually mentions this in the [blog post](https://adamwathan.me/css-utility-classes-and-separation-of-concerns/) where he made the arguments for tailwind on it's release, and I had read this before, but it never sunk in how painful this was until I wasn't experiencing the pain anymore.

I was actually surprised how much faster I could style things (~3x) even when I had to have the tailwind docs pinned to lookup stuff and my tailwind autocomplete was not working well[^2].

[^2]: I had trouble getting it to work with vscode + vue. Also you must type the name exactly and this is hard given the inconsistent naming.

I've come to appreciate how easy it can do things that used to take multiple lines.

Take for example [`truncate`](https://tailwindcss.com/docs/text-overflow#truncate) which does:
```
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

Or gradients! If there's one thing I hate, it's writing css gradients. But in tailwind it's super simple, even with complex stops and everything:

```vue-html
<div class="bg-gradient-to-r from-white to-black"/>
<div class="
	bg-gradient-to-r
	from-white from-10%
	via-blue-500 via-20%
	to-black to-50%
"/>
```

## \* Tailwind Merge

But, tailwind merge is a MUST for complex applications and component libraries to avoid specificity issues. The reason why is that while tailwind cannot escape the css selector specificity problem completely, in fact we loose a bit of control.

See in regular css, if I have two selectors with equal specificity, the last one will win (note that this helps avoid the mess of having many variants and states):

```css
.input {
	&.border:focus {...}
	&.disabled:focus {...}
}
```

In tailwind, you DO NOT have control over the order. The order of the classes is irrelevant, BUT the order tailwind declares them in the stylesheets is and this cannot be controlled (since a single rule might be used in many components).

If you do this, depending on what colors you picked, the style might or might not apply on disabled:

```vue-html
<div
	:class="
		border && `
		border
		border-red-500` +
		disabled && `
		border-neutral-500
	`"
>
</div>
```

Another thing I've seen done is using data attributes which looks cleaner and will seem to work at first, but this is because the data attributes are adding specificity to the selector, +1 for each data attribute.

Here's a [specificity calculator](https://specificity.keegan.st/) you can use to see this.

Tailwind data attribute variants create the following selectors: `{ESCAPED_NAME}:[data-border="true"]:[...]` you can input `.class:[data]:[data]` to quickly test, it would be the same thing.

```vue-html
<div
	:data-border="border"
	:data-disabled="disabled"
	class="
		data-[border=true]:border
		data-[border=true]:border-red-500
		data-[border=true]:data-[disabled]:border-neutral-500
	">
</div>

```

You can easily run into the following problem, where these have equal specificity (2):

```vue-html
<button
	:data-primary="primary"
	class="
		data-[primary=true]:text-white
		focus:text=blue-200
	">
</button>

```

Or worse, here the text will never change on focus when the button is primary and has a border because that has a specificity of 3.
```vue-html
<button
	:data-primary="primary"
	:data-border="border"
	class="
		data-[border=true]:data-[primary=true]:text-white
		focus:text-blue-200
	">
</button>
```

At this point you must pick a solution. You can:

- Add an important `focus:!text-blue-200` which can make it harder for the end user of components to override the rule.
- Add `data-[border=true]:data-[primary=true]:focus:text-blue-200`, but apart from creating hard to read css, this will create a lot of unneeded class soup in the html since the button would contain all styles for all variants even if you only end up using the one of them.
- Use tailwind merge to bypass the problem.

If you pick tailwind-merge though, it is still a good idea to leave the data attributes, at least on the root of the components if you care about users being able to theme the app with css. 

```vue-html
<div
	:class="twMerge(`
		p-3
		bg-neutral-50
		focus:text-blue-500
		`,
		border && `
			border
			border-neutral-900
			focus:border-blue-500
		`,
		disabled && `
			bg-neutral-300
			focus:text-neutral-500
		`,
		border && disabled && `
			border-neutral-500
		`,
		$attrs.class
	)"
	v-bind="{...$attrs, class: undefined }"
>
	<div :class="disabled && `line-through`"><div>
</div>
```

## The Downsides

There are, of course, always some downsides.

### Inconsistent Naming

After some use, this is the one thing that really bugs me. You have `py-*` for top+bottom padding but `gap-y-*` for gaps? This happens in a few other places with units as well. You have spacing that goes down to `-0.5` but opacity which in css is `0-1` goes from `0-100` ???

I can understand not always using the same scales (e.g. `sm` , `md`, `xl` vs `0-*`) but for some of the odder names, because the auto complete does not work based on the css property name, it can be very hard to find the utility you want. I have to keep the docs opened and pinned for actual searching. But I guess that could be considered more the autocomplete's fault, and not tailwind.

### Missing Utilities

Some css properties that are now pretty usable, do not exist yet. For example, text-shadow does not exist because [which default styles to add has not been decided yet](https://github.com/tailwindlabs/tailwindcss/issues/162#issuecomment-777889883).

Which fair, but I really wish they would at least they were provided as experimental properties or something instead of having to rely on other's plugins.

Also some which should really exist, don't, such as grid with `auto-fill` and `auto-fit`.

### Hard to use Existing Tailwind Variables in Custom Utilities

I've written a few custom utilities for gradients, but couldn't for example, re-use the to/from-* gradient utilities and the css variables they create
because I can't seperate the part I need (the color). For example, `from-black from-0%` will create:


```css
-tw-gradient-from-position: 0%;
--tw-gradient-from: #000 var(--tw-gradient-from-position);

// which are then used like this:
--tw-gradient-stops: var(--tw-gradient-from);
```
I can use the position, but not the color, there is no `--tw-gradient-from-color`, so I have to create my own which can get messy.

### Dynamic values

The stylesheet is compiled at build time (so that unused styles can be removed), so this means you can't use dynamic styles. This will not work. You have to use an inline style tag or a script tag.

```vue
<div :class="`p-[${customValue}]`">
</div>

```

## Conclusion

I've been using it now for a few months and I can never go back to the old way.
