---
title: How to Recover Locally Deleted Files From Github
description: "Have you ever deleted a file from a repo, like really really deleted it, only to realize you needed to recover it? Well you can still recover it if it was pushed recently to github."
pubDate: 2024-01-32 
tags: ["github", "git", "recovery", "tip"]
published: true
---

So let's just say, hypothetically, you rewrote your git history or created a fixup commit that deleted a file, force pushed to github, deleted the repo locally, then realized you accidentally deleted one file too many.

I know, is it possible to commit so many sins at once? 

This did not happen with code for me, it was just some dotfiles stuff. I was moving things around and removed a sensitive file from the commit history, then accidentally deleted the repo, only to realize I hadn't backed up the sensitive file I still needed.

## First Step, Don't Panic

If you did not delete the repo, you're good. You can search how to use `git reflog` to recover it.

Otherwise github should keep the commits for [90 days](https://stackoverflow.com/questions/27397344/how-long-does-git-keep-out-of-branch-commits). 

Now I found the partial answer to how to do this [here](https://stackoverflow.com/questions/3973994/how-can-i-recover-from-an-erronous-git-push-f-origin-master/48110879#48110879).

The gist of it is we can use the github api to find the commit and extract a patch. Problem is with a private repo this answer won't work. Additionally if we committed multiple files we don't want to have to extract each patch as suggested by the answer. We just want the full patch.

## Get the Github CLI

If you don't have it already you will need the [github cli](https://github.com/cli/cli#installation). Authenticate with `gh auth`, and now we can use the `gh api` function.

## Find Commit to Recover

First, if we need to find which commit we need to recover we can search through the [events](https://docs.github.com/en/rest/activity/events?apiVersion=2022-11-28#list-public-events-for-a-network-of-repositories):

```sh
gh api repos/{OWNER}/{REPO}/events
```
We can stick the result in a temp file for easier searching.
```sh
gh api repos/{OWNER}/{REPO}/events > temp
```
And we can then make it easier to find the commit by filtering the response with [jq](https://jqlang.github.io/jq/).
```sh 
cat temp | jq ".[].payload.commits.[] | {url: .url, author: .author.name, message: .message}"
```

Once we find our commit we can query the url (just the end bit [see here](https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#get-a-commit)):

```sh
gh api repos/{OWNER}/{REPO}/commits/{SHA}
```
This will give us a json response which is not what we want but we can use it if we want to further find if it contains the correct changes we're looking for.

```sh
gh api repos/{OWNER}/{REPO}/commits/{SHA} | jq ".files[] | {status:.status, filename:.filename, patch: .patch}"
```

## Get the Patch

To actually get the patch we will need to [change a header](https://docs.github.com/en/rest/using-the-rest-api/media-types?apiVersion=2022-11-28#commits-commit-comparison-and-pull-requests).

```sh
# save the patch somewhere not in the repo
gh api -H "Accept: application/vnd.github.patch" repos/{OWNER}/{REPO}/commits/{SHA} > patch
```

## Apply the patch.
We can then apply it (be sure to have committed any changes beforehand). How to apply it can depend, but the following should work even if the repo doesn't have the files anymore, you can then recover what you need:

```sh
git apply /path/to/patch --3way --ignore-space-change --ignore-whitespace
```

## Further Notes

Note that if the patch contains binary file changes, applying them might bork your terminal. You can try sending `reset` one or two times, or try with a different terminal (Konsole worked for me).
