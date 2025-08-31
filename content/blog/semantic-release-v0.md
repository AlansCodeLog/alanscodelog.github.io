---
title: How to Publish v0.x.x Versioned Packages with Semantic Release 
description: "A simple workaround for semantic-release lack of support for 0 major versioned packages."
date: 2023-07-16
tags: ["semantic-release", "build-tools", "ci"]
published: true

---

I love [semantic-release](https://www.npmjs.com/package/semantic-release), but it unfortunately doesn't support and is probably never going to [support 0 major versioned packages](https://github.com/semantic-release/semantic-release/issues/1507). The issue for it doesn't really contain a good workaround and has unfortunately been locked due to people being rude.

But I'd really like to v0 version some packages. I really regret having had to publish some highly experimental packages starting with v1. In their highly experimental phase it's usually just me using them and I pin them when using them so breaking changes aren't an issue. If I start at v1 and properly commit breaking changes, by the time the package is stable it's at v3+ or something. And the entire time the package says it's a WIP but the version is v1+, and I hate it. Often I won't event properly committed breaking changes unless they're major, half defeating the point of semantic versioning.

I've also tried avoiding publishing them in the first place and just using them directly from the repo, but this often requires more effort to get working (since the prepare script needs to be defined to properly build the package after downloading). Still good to publish packages that just work like this, but I always end up running into obscure problems doing things this way. 

Ideally I want to just start at v0, write commits that create proper release notes listing the breaking changes, but not have them major bump until the package is more stable and I publish v1.

I got really annoyed at this situation recently so started looking at some of the alternatives mentioned in the issue, but most do not do everything semantic-release does. [release-please](https://github.com/googleapis/release-please) was the closest, but it's missing an easier way to manager branches and the workflow seems more error prone to me.

# Workaround

This is the simplest workaround I've found. Instead of the regular `feat/fix/...` commits, I create `v0feat/v0fix/...`. You could do this for all the commit types. I chose to just create three, `v0feat`, `v0fix`, `v0breaking`, and technically `v0fix` is not needed since it's the same as `fix`, but I liked the consistent naming. How you set this up, depends on what you'd like to bump what. Technically the only one you truly need is `v0breaking` so release notes show breaking changes without a major bump.

Now I keep my own [semantic-release-config](https://github.com/AlansCodeLog/my-semantic-release-config/blob/master/release.config.js) so this was easier for me to do. You will need to either configure certain plugins manually each time or I highly suggest creating your own config and abstracting everything away (no more need to install all the deps/plugins needed, your config can just do it for you).

How to do so or the various places you can place your config is out of scope for this post.

I'll just be showing you how to configure the plugins.

First, [commit-analyzer](https://github.com/semantic-release/commit-analyzer). This will tell semantic-release how much to bump.

```jsonc
[
	"@semantic-release/commit-analyzer",
	{
		// you can use a preset here if you like
		"preset": "conventionalcommits",
		"releaseRules": [
			{ "type": "v0feat", "release": "patch" },
			{ "type": "v0fix", "release": "patch" },
			{ "type": "v0breaking",  "release": "minor" }
		]
	}
],
```

Then, [release-notes-generator](https://github.com/semantic-release/release-notes-generator). This will tell semantic-release how to format the commit message headers. The docs for `presetConfig` are a bit hidden. You can find the full spec for them [here](https://github.com/conventional-changelog/conventional-changelog-config-spec)

```jsonc
[
	"@semantic-release/release-notes-generator",
	{
		// note that if you use a preset, you will inherit it's options regarding what text counts as breaking changes
		"preset": "conventionalcommits",
		"presetConfig": {
			"types": [
				{ "type":"v0feat", "section": ":star: New Features" },
				{ "type": "v0fix", "section": ":bug: Fixes" },
				// Simulate a breaking change
				{ "type": "v0breaking", "section": ":warning: BREAKING CHANGES" }
			]
		}

	}
]
```

You can see the configs are pretty similar. In my config I create one shared object to pass as necessary to the plugins.


# Usage

First you will need to create your first commit. Usually I will just create an empty commit.


```sh
git commit --allow-empty "v0feat: empty"
```
Now if you tried to run semantic release now, you would still get version v1.0.0. 

You will need to tag the initial commit as v0.0.0 to trick semantic-release into working how we want.

```sh
git tag v0.0.0
# don't forget!
git push --tags 
```

Then add your code and your real commit.
```sh
git add .
git commit "v0feat: initial"
```

Now you can do a dry run. Note you will need to push to your repo before doing so. So disable your release workflow if you have one. I personally have an env variable `ENABLE_RELEASE` I use to enable/disable, which has not been enabled yet at this point.

```sh
npx semantic-release --dry-run --no-ci #--debug
```

It should now print v0.0.1!

Now so long as you do not commit any commit types that trigger a major bump or use any text that triggers a breaking change in your commit messages (that's what `v0breaking` is for), you should stay in v0.


