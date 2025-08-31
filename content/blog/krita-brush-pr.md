---
title: "Krita Popup Palette Improvements"
description: "From zero C++ to getting a PR merged into Krita."
date: "2021-08-01"
published: true
image: "thumbs/krita-demon-summoning.png"
coverAlt: "Debug lines drawn on top of the krita palette."
tags: ["krita", "graphics"]
langs: ["c++"]
---

I switched to Krita from Photoshop a while back now. Photoshop has not really improved it's painting experience in any wayfor a long time and it's had some long standing brush engine related bugs that annoy me to no end.

Krita on the other hand was a little bit rough around the edges, but has some of the best brush engines around (yes, multiple engines), and it's constantly being improved. Plus, it's open source. If something bothers me, I can try to fix it.

One of the little things that did bother me is Krita's popup palette. It had too much going on in my opinion, with no way to disable some parts of it. The number of brush slots had to be pre set in the configuration and they did not use the optimal space. There were also some minor bugs.

I went into this knowing zero C++, never having really built a program like this. It was quite the learning experience, but I finally got everything I wanted fixed and merged! You can find more details about the PR [here](https://invent.kde.org/graphics/krita/-/merge_requests/922).

Krita has some good build docs, but I'm on windows and between that and all this being new to me, there were a lot of little gotchas. I documented them all and ended up writing myself some simple build scripts to simplify everything. I published these along with my VSCode setup and all my notes on [github](https://github.com/AlansCodeLog/krita-build-vscode-config). Hope it might help others in a similar situation. 

Anyways I initially started with the simple stuff. The small bug fixes to get familiar with the code base. It's huge so it helps to focus on some small area. Now this might seem obvious, but I know to my beginner self it was not. My go to strategy for finding something in such a large code base is to search for some text at/near what I want to change and go from there. I do not really try to understand the organization of the project. Enough will emerge from looking at related files to understand what I need. Usually it is not more than a couple of files that you'll need to look at to change something.

When in doubt there was also the very helpful Krita dev IRC chat to point me in the right direction.

The C++ was not as scary as I thought it would be. It's not like you have to deal with pointers or memory management that much at all. You just have to get used to the syntax and using header files and that's about it. The key really is to have your editor setup properly so you have autocomplete. There's a note on how to do that in the readme of the scripts I published.

Krita is built Qt so it also helped have the Qt docs open at all times. 

As I made small fixes, I used [stacked git](https://stacked-git.github.io/) to commit them. I might make a blog post about it later, but it's great for exploratory stuff like this. It makes it super easy to push different changes to different commits, and then later re-order them before submitting a PR. Or temporarily hide some commits for debugging or because they didn't work out. 

I also kept multiple [git worktrees](https://git-scm.com/docs/git-worktree) for different branches. Git worktrees if you've never used them, allow you to checkout a branch in a different folder. So I could have many separate branches and builds. I had one for my branch, one for the the master branch, and a third one just for checking out/navigating commits. This is because switching branches will trigger a complete rebuild and that would take 2-3 hours. So worktrees were a must. I could also setup multiple builds like this.

Next I moved on to the more difficult issue I wanted to tackle, the algorithm that laid out the popup palette brush slots. Making it support a dynamic slot count was easy as the widget could already support them, it was just a matter of allowing it in the config and getting the count of brushes for the chosen tag.

What I really wanted to change was the way the slots were drawn, since they were often too small depending on the count and the ring diameters chosen.

Qt widgets have a paintEvent method where one can draw arbitrary lines and shapes. This is how the majority of the popup palette is drawn. I found it similar to drawing on an html canvas which I already had some experience with..

Here I started to just change the colors of the drawn parts and commment/uncomment code until I understood it more, adding my own comments if needed. Once I understood everything I commented out any code not related to the brush slots I wanted to change and started playing with the algorithm which was in a separate area, drawing measurements to the screen if I didn't understand them.

Some demon summoning later and with a similar procress I understood the original algorithm which relied on a couple of loops to try to find the optimal number of rows we could have.

![Slots drawn on top of the krita palette.](/thumbs/krita-demon-summoning.png){style="margin:auto;width:100%;max-width:300px;"}


I tried to find a geometric approach to calculating the size of the slot circles, but the problem is if we want to allow user control of the diameter of the outer ring, the slots cannot have the same size on every row. We end up limited by how many fit in the inner row.

So I expanded on the original algorithm, adding several checks to shrink/enlarge the slots depending on the situation. These checks are not recursive or complicated in that sence, so while the algorithm is a lot more complex, it still happens in "steps", and you can comment out a part and see that it just no longer optimizes the slot sizes in that situation.

Here is the before/after with the rings at various sizes.

<video src="/posts/krita-palette-before-after.mp4" controls></video>

Anyways, this and a few other goodies I added should be out properly in Krita 5.1, otherwise you can try nightly Next builds (they're in the bottom half of the [download page](https://krita.org/en/download/krita-desktop/)).
