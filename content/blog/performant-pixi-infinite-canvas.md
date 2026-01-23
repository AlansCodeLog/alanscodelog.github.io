---
title: Handling Thousands Cards on an Infinite Canvas
date: 2026-02-02T00:00:00.000Z
description: A deep dive into the engineering behind Pyramid's infinite canvas and how to handle high-density layouts without sacrificing responsiveness — it covers texture baking, custom culling, background idle generation, efficient text handling, text truncation, and the dynamic LOD states required for massive datasets.
image: /thumbs/infinite-canvas-thumb.gif
langs:
  - typescript
  - javascript
  - vue
published: true
static_image: /thumbs/infinite-canvas-thumb.png
tags:
  - pyramid-app
  - programming
  - pixi.js
  - performance
video_image: /thumbs/infinite-canvas-thumb.mp4
---

I'm working on an app, [Pyramid Notes](https://pyramidnotes.com), which will have an infinite canvas.

It will have two modes mainly:

- freeform mode - users can drop and place cards everywhere.
- "structured" mode - with a preset layout. In this initial version, the layout will is a visualization of note tags (they function more like folders).

## Initial DOM Based Attempt

I had initially planned to create an HTML based infinite canvas as it's just easier to get started with, but the DOM approach has a lot of lag, *especially* when zooming, which was a deal breaker. I *needed* really fast zoom in/out performance.

The html version *was* a bit naively coded, but the same approach with pixi.js (webgl canvas lib) was 10x more performant. Properly optimized HTML starts lagging at around 1000 notes, my initial quick canvas implementation started lagging at around 10,000.

Here is a link to [1000 notes on tldraw](https://www.tldraw.com/f/cTRjZahSxPYiXwM6Ws3yH?d=v10977.-651.19434.9393.page) (and the [blank version](https://www.tldraw.com/f/mEG6km2LEfSaAn7TD-JOO?d=v16327.1343.6034.3497.page)) which seems well optimized so you can see it's not me with a bad implementation.

:video{autoplay controls muted src="/posts/infinite-canvas-tldraw-comparison.mp4"}

There's just like a very sluggish feeling, especially zooming. I suspect the culprit might be shadows because they seem to get turned on/off at the point zoom feels sluggish, but I don't think there's any way around that. The blank version is clearly faster so some of it is the text itself rendering when very zoomed out, but I tried different lod levels in DOM, and the zoom range where they change *feels* slow. Sometimes canvas also skips a frame at that point but it doesn't feel nearly as bad.

## Switching to Pixi.js

Once I switched to [pixi.js](https://pixijs.com/8.x/guides/getting-started/introduction), I was way too tempted to properly test the limits and see how many notes I could get to render.

I setup some basic culling + lod states, and changed the layout structure (from flat to a tree) and got to around 50,000 notes before serious lagging, but I wanted to find the real limit. In part out of curiosity, in part to not attempt to load so many (users can limit what they load with a search filter).

Mind you, the 50,000 at that point was a bit of a lie because the notes weren't unique. I also made this mistake when I initially tweeted about reaching 100,000. See below for more details.

## Actual Usage Expectations

From what I've researched and from the number of notes I have myself, I expect the average user to probably have \~1000-10,000 notes. As a maximum I can see maybe some power users will have 20-50,000.

I don't expect >50,000 notes, but it is possible, depending on how they organize them, that they might need to render more since notes can appear more than once in the structured tree.

I do not expect freeform mode to get nearly as big as notes must be added by hand.

::md-emphasis-block
## Limits Reached

I ended up reaching about 60,000 unique cards before there started to be some minor lag (still snappier than the DOM approach), and 90,000 unique cards before it started to feel too sluggish. I reached 100,000 a few times, but past 95,000 the page would occasionally crash as it finished generating all the text.

One can sacrifice a bit of LOD to reach smoother 100,000, but I didn't like it. I think it's best to just warn the user to use a filter past 60,000. If they want to risk it they can (on chrome the crashes sometimes required I restart the entire browser 💀).

Here's what 100,000 feels like, you can see it's starting to struggle:

:video{autoplay controls muted src="/posts/inifite-canvas-100000.mp4"}

Here's 50,000 which feels super snappy (this was the thumb). 60,000 starts to occasionally skip a frame on zoom but still feels fast:

:video{autoplay controls muted src="/posts/infinite-canvas-50000.mp4"}

I'm actually sure we could go *further* (see [#pooling](#pooling)) but I don't think the increase in code complexity is worth it.
::

## Avoiding Accidental Optimizations

It's easy to accidentally get performance speedups from how one sets up the test scenario.

In this case initially I only had 1000 unique notes and initially they were just repeated to get 50,000/100,000. I started like this because generating 50,000 real random documents is currently still super slow, I can only do about 300 docs max at a time. This is because generating a note requires generating a random prosemirror document and this was tricky to even get working.

Now Pixi.js does caching internally to speed up scenerios with duplicate cards like this so I had to make adjustments to avoid all unreasonably performance optimizations and find the real number of *unique* notes I could render.

I say unreasonable because some repitition is expected in every day use. To control the uniqueness and take more *reasonable* advantage of pixi's internal caches (it has per word (temporary), and per text), I generated 170,000 unique "words" (they're just random characters/symbols) and replaced the card text with random slices from those words.

Why 170,000? This is about how many words are actively in use in the english language. They are distributed randomly here, unlike a realistic distribution where some words appear way more than others, but that just means real usage will be slightly faster.

Here's the code I used:

::md-details
```ts
import { faker } from "@faker-js/faker"

export const perfUtilsConfig = {
    minWordLength: 3,
    maxWordLength: 10,
    uniqueWords: 170000,
    uniqueNoteCount: 90000
}
const seenWords = new Set<string>()
export function createWords(count: number) {
    const res = Array.from(
        { length: count },
        () => {
            // i know faker has word generation, but I want random symbols included
            let word = faker.string.sample({ min: perfUtilsConfig.minWordLength, max: perfUtilsConfig.maxWordLength })
            while (seenWords.has(word)) {
                word = faker.string.sample({ min: perfUtilsConfig.minWordLength, max: perfUtilsConfig.maxWordLength })
            }
            return word
        }
    ).join(" ")
    return res
}
// estimated number of english words in active use
const additionalText = createWords(perfUtilsConfig.uniqueWords)
seenWords.clear()

const noteSlicePoints = Array.from({ length: perfUtilsConfig.uniqueNoteCount }).map(i => Math.floor(Math.random() * additionalText.length))
// slice random bits from the text
export function generateText(max: number) {
    const cut = noteSlicePoints[Math.floor(Math.random() * noteSlicePoints.length)]
    const res = additionalText.slice(cut, cut + max)
    return res
}

```
::

You will see in the top right of videos, in the debug details it sayse `Uniqueness: [count]`, this is the number of unique cards generated. `Card Count` is the number of cards in the full tree. `In View` will show how many cards are actually in view.

## Optimizations

### Decoupled Reactive Lifecycle

The rendering loop is decoupled from vue’s reactivity. Instead of immediately reacting to every state change, we set dirty flags and do the appropriate action on the next tick.

I used a class (I did not have a good experience trying to figure out pixi-vue unfortunately) so watchers created here must be properly cleaned up (vue is not automatically aware of them like it is in SFCs).

::md-details
```ts
class PixiCanvas {
	toDestroy = []
	onMounted() {
		let layoutDirty = true
		this.toDestroy.push(watch(this.layout, () => {
			layoutDirty = true
		}).stop)
		app.ticker.add(() => {
			if (layoutDirty) {
				// ...
			}
		})
	}
	
	destroy() {
		if (!this.initialized) throw new Error("Pixi not initialized, cannot destroy.")
		for (const item of this.toDestroy) {
			item()
		}
		// textures should also be destroyed here
		this.app.destroy()
	}
}
```
::

### Culling

Naive culling is not enough, checking thousands of notes is too expensive.

#### Take Advantage of Existing Structure

If your data is structured in any form of tree, take advantage of that even if it makes it harder to traverse/update the tree.

If a parent container is not visible, all children will be skipped making things way faster.

For the freeform mode, I plan to place them inside invisible containers/buckets to simulate this. The freeform layout will be saveable and we can cache the notes each bucket contains and we would only need to update this if a user moves a note.

#### Use a Custom Algorithm If Needed

I used a custom algorithm for two reasons:

I already know how big the viewport will be before pixi loads. I can do the culling beforehand.

I know the constraints of my layout. Nested areas are always contained within their parent, and notes are always contained by their areas. We can make optimizations based on this. For example, if the viewport is inside an area, only that area needs to be checked. All other areas can be immediately skipped.

Pixi does not do this internally because children can exist outside of their parent bounds.

### Manual Texture Baking

This example demonstrates how to manually instruct the renderer to bake any display object (like a `Container` or `Graphics` object) into a reusable texture. This is highly efficient as the complex object is drawn only once.

::md-details
```ts
// example for the full LOD card background

// this is called once, then only again if the theme ref changes
createTextures() {
    // careful to give enough space if using shadows
    const shadowPadding = 4 * 4
    const container = new Container()

    const shadowGraphic = new Graphics()
        .roundRect(shadowPadding, shadowPadding, this.config.cardWidth, this.config.cardHeight, this.config.cardRounding)
        .fill({
            color: this.theme.value.note.shadow,
            alpha: this.theme.value.note.shadowAlpha
        })
    shadowGraphic.filters = [new BlurFilter({ strength: 4, quality: 3, resolution: window.devicePixelRatio })]
    container.addChild(shadowGraphic)

    const cardGraphic = new Graphics()
        .roundRect(shadowPadding, shadowPadding - 2, this.config.cardWidth, this.config.cardHeight, this.config.cardRounding)
        .fill({ color: this.theme.value.note.bg })
    container.addChild(cardGraphic)

    this.cardFullTexture = this.app.renderer.generateTexture({
        target: container,
        frame: new Rectangle(0, 0, this.config.cardWidth + shadowPadding * 2, this.config.cardHeight + shadowPadding * 2)
    })

    // save the texture for later use
    this.cardFullTexture = this.app.renderer.generateTexture({
        target: container,
        frame: new Rectangle(0, 0, this.config.cardWidth + shadowPadding * 2, this.config.cardHeight + shadowPadding * 2)
    })
}

// later during the actual card creation:
const cardSprite = new Sprite(this.cardFullTexture)
```
::

Do NOT attempt to cache the full card, only the background, see [#avoid](#avoid).

This is a bit more complicated for images. I have not added attachments yet, so that will be a problem for later.

### Dynamic Level of Detail (LOD)

At full zoom cards show their titles and a short summary. Both require text wrapping and truncation which is *very* expensive.

Past a certain zoom point cards become unreadable so there’s no point trying to render the text which is very expensive. We can just a simple skeleton, no text. And past that we have two options:

- If the app has some other large features we can visualize (in this case cards exist bounding areas in "structured" mode), we can render those instead.
- We can render a very small single color rectangle. Again, we can cache this. This is slower than rendering some larger feature, so avoid at all costs.

Using this strategy we can fit roughly 10,000 skeleton cards in view or 1000 full-view cards.

This with the full card zoom cut off point being *past* the point that I can’t read it on a 4k screen (with the canvas resolution set to `window.devicePixelRatio`) which is the worst case scenario.

So the cutoff could be increased. It wouldn't look as nice though because even when we can't read the text, we can still get a sense of which note is which. Another option is to only hide the summary initially and only later the text.

In all cases, I will be adding a show-on-hover feature so users can quickly read any card they're hovering over.

### Using Bitmap Text

As Pixi themselves suggest, use BitmapText instead of Text. ***This is absolutely vital past around 50,000 cards.*** It now supports word wrapping and it's easy to generate from a font, so it should suffice for most needs.

The only drawback is it's more expensive for languages with a lot of symbols (like chinese). I did a quick tests though and did not see much of a difference. Canvas still felt smooth enough and memory did not jump excessively. So good signs.

### Loading and On-Demand Text Generation

If we tried to naively load and naively truncate (see below) the text of 100,000 cards on load it would take nearly 30 seconds with all optimizations.

Instead, on load, the card layout is created without any text. When the user zooms we generate the text on demand only when they need the full text LOD.

The generation is limited per so we don’t attempt to create the text for 1000 cards all at once.

We check how much time we have left and hand that ms budge over to `generateCardText` which will handle not exceeding it.

Batching like this also helps give the user a visual indication that cards *are* getting loaded.

Full example combined with idle generation below.

### Background Idle Generation

The canvas loads zoomed out. This gives us some time, between load, and the user zooming/panning to where they want. We can use `requestIdleCallback` to start generating the card text regardless of visibility. This means for most users (less than < 10000 cards which take 3 seconds to load) they probably won’t even see the text get generated, it’ll just be there.

Here's the code combining the on demand generation with the idle generation.

::md-details
```ts
onMounted() {
    // ... initial setup

    // visibilityDirty and docsDirty are set by vue watchers

    app.ticker.add(() => {

        this.updateLodState() // calculates the lod state
        const canGenerateText = !firstTick && this.lodState.value === "full" && this.pendingTextGeneration.size > 0
        const start =  canGenerateText ? performance.now() : undefined

        if (visibilityDirty) {
            visibilityDirty = false
            this.updateQueuesAndCulling()
        }
        if (docsDirty) {
            docsDirty = false
            this.updateTree()
            this.initBackgroundQueue()
            this.scheduleTextGeneration()
        }

        if (canGenerateText) {
            const now = performance.now()
            // budget is a little lower than the real 16ms just in case
            const budget = 13 - (now - start!)
            this.generateCardText(this.pendingTextGeneration, "visible", { startTime: now, budget })
        }
    })
}


// we combine these actions because they both happen together and need to both iterate through the same data
updateQueuesAndCulling() {
    const { visibleNotes, visibleAreas } = this.visible.value

    this.updateVisibleAreas(visibleAreas)

    const showFullText = this.lodState.value === "full"
    const cardLodVisible = this.lodState.value !== "noCards"

    for (const [path, card] of this.noteSprites) {
        const isVisible = visibleNotes.has(path)
        const titleText = card.getChildByLabel("title-text") as Text
        const textAlreadyGenerated = titleText.text !== ""

        card.visible = isVisible && cardLodVisible

        if (!textAlreadyGenerated) {
            if (isVisible && showFullText) {
                this.backgroundPendingTextGeneration.delete(card)
                this.pendingTextGeneration.add(card)
            } else {
                this.pendingTextGeneration.delete(card)
                this.backgroundPendingTextGeneration.add(card)
            }
        } else {
            this.pendingTextGeneration.delete(card)
            this.backgroundPendingTextGeneration.delete(card)
        }
    }

    const cards = visibleNotes.keys()
        .map(path => this.noteSprites.get(path)!).filter(_ => !!_)
    this.updateCardsLodState(cards)
}


// initially, queue up all cards that don't have text yet
initBackgroundQueue() {
    for (const card of allNoteSprites) {
        if (card.text === "") {
            backgroundPendingTextGeneration.add(card);
        }
    }
}

// create the function that actually schedules the work
scheduleTextGeneration() {
    if (this.backgroundPendingTextGeneration.size > 0 && this.idleCallbackId === null) {
        this.idleCallbackId = requestIdleCallback((deadline) => {
            this.idleCallbackId = null
            this.generateCardText(this.backgroundPendingTextGeneration, "background", { deadline })
            this.scheduleTextGeneration()
        })
    } else if (this.backgroundPendingTextGeneration.size === 0) {
        // generation finished
    }
}

/** Generate text for cards from a pending queue with a deadline or a time budget. */
generateCardText(
    pending: Set<Container>,
    type: "visible" | "background",
    {
        deadline,
        budget,
        startTime
    }: {
        deadline?: IdleDeadline
        startTime?: number
        budget?: number
    } = {}
) {
    
    if (pending.size === 0) return

    // the 1 is the aproximate time the truncation takes
    if (budget !== undefined && budget <= 1) return

    const isVisible = type === "visible"

    const iterator = pending.values()
    let generated = 0

    while (pending.size > 0) {
        if (budget !== undefined && isVisible && (performance.now() - startTime!) >= budget - 1) {
            break
        }
        if (deadline && deadline.timeRemaining() <= 1) {
            break
        }
        const next = iterator.next()
        if (next.done) break

        const card = next.value as Container

        pending.delete(card)

        if (type === "visible") {
            this.backgroundPendingTextGeneration.delete(card)
            // skip if card became invisible or LOD changed
            if (!card.visible || this.lodState.value !== "full") {
                continue
            }
        } else if (type === "background" && this.pendingTextGeneration.has(card)) {
            continue
        }

        const titleText = card.getChildByLabel("title-text") as Text
        // const summaryText = ...
        const doc = this.getDoc(card.label)
        // doc might have been deleted by the time we get here
        if (!doc) continue

        generated++

        titleText.text = PixiCanvas.truncatePixiText( doc.title, /* ... */)
        // summaryText.text = PixiCanvas.truncatePixiText( ... )

        if (card.visible && this.lodState.value === "full") {
            // set visibility of elements
        }
    }
}
```
::

### Faster Text Truncation

Initially I just looked up how to do text truncation and found this snippet on the [repo](https://github.com/pixijs/pixijs/issues/3449#issuecomment-428648004) which you'll probably come across if searching for how to do this. Here’s the modified version I initially used:

::md-details
```ts
/** Truncates text to a specific number of lines using PixiJS TextMetrics */
static truncatePixiText(
    /** The raw string to truncate */
    text: string,
    /** PixiJS TextStyle object or configuration */
    style: TextStyle,
    /** Maximum number of lines allowed before truncation */
    maxLines: number
): string {
    if (maxLines === Infinity) {
        return text
    }

    const wordWrapWidth = style.wordWrapWidth
    const { lines } = CanvasTextMetrics.measureText(text, style)

    if (lines.length <= maxLines) {
        return text
    }

    const truncatedLines = lines.slice(0, maxLines)
    const lastLine = truncatedLines[truncatedLines.length - 1]

    const chars = Array.from(lastLine)

    // measure the ellipsis and each character individually
    const charMetrics = CanvasTextMetrics.measureText(`...\n${chars.join("\n")}`, style)
    const [dotsLength, ...charLengths] = charMetrics.lineWidths

    let newLastLine = "";
    let currentLength = dotsLength;

    for (let i = 0; i < charLengths.length; i++) {
        const charLength = charLengths[i];

        if (currentLength + charLength >= wordWrapWidth) {
            break; 
        }

        newLastLine += chars[i];
        currentLength += charLength;
    }

    truncatedLines[truncatedLines.length - 1] = `${newLastLine}...`
    return truncatedLines.join("\n")
}
```
::

As you can see this text truncation function requires two measurements. First, based on the text style, it measures how many lines the wrapped text produces. Then, it takes the line and measure character by character to see where to cut it (the original measured by word, I wanted by character, both are slow).

Pixi does tons of caching internally, but it's just a slow thing to calculate. It's also specially slow with regular `Text` (which I was using at the beginning).

So how to speed this up (apart from using `BitmapText`)? See if you can spot it before reading on. The biggest performance gain feels a bit obvious once you see it.

Some low hanging fruit first, if you have long note summaries that aren't already truncated, it's measuring all that text which won't be visible.

#### Optimization 1 - Limiting Text Length

I measured the smallest character (usually a space) and calculated how many we could fit in a card.

We can then use this to limit how much text we even try to truncate. This should also done as soon as we can after we receive the data to avoid keeping the full summary in memory.

#### Optimization 2 - Avoiding the Second Measurement

We want to avoid the second measurement of the characters at all costs.

I tried caching the measurements of individual characters to calculate the aproximate width of the last line myself. Pixi is already technically doing this but it doesn't keep the cache around between calls. That was faster, but still slow.

I considered using a monospace font even though I didn't like the idea of being restricted to monospace fonts.

I asked the LLMs. They added a third measurement call just to rage bait me, and I went back to thinking.

And then I saw it.

When pixi does the first measurement, it also chops up the line, and we know what text is on which line and how long it is already! 🤦

Now, `.` is usually the shortest character in a font (and if not, we should pick a font where it is).

So when a line needs an ellipsis **all** the last characters we need to chop off are wider than a period. When we replace them, the line is always guaranteed to be shorter.

For example, say we want max 2 lines:

```ts
         cutoff ─┐
                 🭭 
Some long text we want to truncate
            
// pixi will wrap it to:
                 🭭 
Some long text
we want to truncate

// and we want:
                 🭭 
Some long text
we want to trun...
```

With a non-monospace font, here's how they compare:

> we want to truncate
>
> we want to trun...

The truncated line is always shorter.

If we want truncation at the word level, we can just find the first space that's at least 3 characters in.

Here's the final code which takes about 20% less time.

This version supports both Text and BitmapText. As mentioned above bitmap support is crucial as otherwise regular text is still too slow even with this speedup.

::md-details
```ts
/**
* Truncates text to a specific number of lines using PixiJS TextMetrics.
*
* Uses lots of optimizations and caching to make this as fast as possible.
*
* IMPORTANT: Be sure to pre-slice the text if it can get very long.
*/
static truncatePixiText(
    /** The raw string to truncate */
    text: string,
    /** PixiJS TextStyle object or configuration */
    style: TextStyle,
    /** Whether to use the bitmap text measuring method or the canvas text measuring method. Words will NOT wrap right if you use the wrong one. */
    isBitmapFont: boolean = true,
    /** Maximum number of lines allowed before truncation */
    maxLines: number,
    /** Since we recommend slicing the text, we can't be sure if there are more lines or not and whether to add an ellipsis to the last line.
    * @default false
    */
    containsMoreLines: boolean = false,
    /** Pass a cached width. */
    ellipsisWidth?: number
): string {
    if (maxLines === Infinity) {
        return text
    }

    const wordWrapWidth = style.wordWrapWidth

    let lineWidths = []
    let lines = []
    if (isBitmapFont) {
        const measure = BitmapFontManager.getLayout(text, style, true)

        for (let i = 0; i < measure.lines.length && i < maxLines; i++) {
                const line = measure.lines[i]
                const chars = line.chars.join("")
                if (chars.length === 0 && i === measure.lines.length - 1) {
                    // last line is always empty, idk why
                    break
                }
                lineWidths.push(line.width * measure.scale)
                lines.push(line.chars.join(""))
        }
    } else {
        const measure = CanvasTextMetrics.measureText(text, style)
        lineWidths = measure.lineWidths
        lines = measure.lines.slice(0, maxLines)
    }
    if (lines.length < maxLines) {
        return text
    }
    const lastLine = lines[lines.length - 1]

    if (ellipsisWidth === undefined) {
        if (isBitmapFont) {
                const measure = BitmapFontManager.getLayout("...", style, true)
                ellipsisWidth = measure.width * measure.scale
        } else {
                ellipsisWidth = CanvasTextMetrics.measureText("...", style).width
        }
    }
    const ellipsisDontFit = ellipsisWidth > wordWrapWidth
    if (ellipsisDontFit) {
        lines[lines.length - 1] = ""
        return lines.join("")
    }

    // this is a stylistic choice
    const shouldAddEllipsis = (containsMoreLines || lines.length > lines.length) && !lastLine.endsWith(".")

    if (lineWidths[lineWidths.length - 1] + ellipsisWidth < wordWrapWidth && !shouldAddEllipsis) {
        return lines.join("")
    }

    if (style.breakWords) {
        // dots happen to be the shortest width character in most fonts
        // so we can just cut off the last 3 characters and add the ellipsis
        lines[lines.length - 1] = `${lastLine.slice(0, lastLine.length - 3)}...`
    } else {
        // for words, we just have to find the last space that is at least 3 characters in
        const lastIndex = lastLine.lastIndexOf(" ", lastLine.length - 3)
        if (lastIndex === -1) lines[lines.length - 1] = `...`
        else lines[lines.length - 1] = `${lastLine.slice(0, lastIndex)}...`
    }
    return lines.join("")
}
```
::

## Further Potential Optimizations

### Pooling

This is probably the next biggest optimization I could make and is something Pixi.js recommends for handling a lot of objects.

If we cache the text wrapping and truncation, we could re-use the same \~1000-2000 text objects and just overlay them over the visible cards. This, I think will give the most additional performance boost, but complicates things a lot. Even just keeping the existing structure and adding/removing the child text objects gets complicated. I have a rough draft and it is hard to read.

### Others

- As mentioned at the start, all those optimizations that I avoided can be allowed to happen for a speedup.
- I structured the app so we can potentially hook into document changes. That way instead of searching all notes for changes on updates, we can do surgically precise updates.
- The wrapping indexes + truncation index could be saved with the document and/or view. Once saved, we can just pass a pre-split line to Pixi.js and avoid text wrapping entirely.
- Due to how the app works, users can open multiple panes with the infinite canvas view. I will have to reduce the lod for unfocused instances past a certain note count to allow the focused / last focused canvas to stay performant.

### Usability Improvements + Future Features

- For < 1000 we can probably just disable the different lod states.
- To help with navigation, as mentioned, hovering over any note will show it in the corner - we can use a single object and just change it's text.
- Selection of notes - this can be done via sprite tinting.
- Movement - initially I had used a flat list because that would have made it easier to move notes but because we are now using a tree, this will require: hiding the note, creating a temporary copy that's on top of everything, then moving that.

### AVOID

- Do NOT use `cacheAsTexture` for the card with text. You're creating dozens of tiny textures which is pointless and worsens performance. If your notes are contained within some parant container of *known* size that is not too big (less than 4096x4096 pixels) it *might* help.
