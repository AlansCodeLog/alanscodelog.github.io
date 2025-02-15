---
title: "How To Add Tests To A Zig Project"
pubDate: "2025-02-15"
published: true
tags: ["testing"]
langs: ["zig"]
description: ""
---


I have been dabbling with [Zig](https://ziglang.org/) lately, and I wanted to add some tests to my tiny project, but this was a bit harder than I thought and the docs on this are sparse. so I thought I'd properly document it.

First, you probably want `zig build test` where test is the build step. Not `zig test`.

Still, even if you have a test step and you ran `zig build test`, you might have been puzzled that no tests were running.

And if you were using dependencies, you might have gotten an error like this:

```
no module named '...' available within module root
```

Several things are going on here.

## Adding ALL Tests

If you run `zig build test` it will only run tests in the given `root_source_file`, so if you have no tests in main, they won't run.

You can get around this with the following magical incantation in `src/main.zig`:

```zig
test {
    // include all tests in imported modules, recursively
    @import("std").testing.refAllDeclsRecursive(@This());
}
```

## Sharing Modules with the Build Step

The other error is because when you do this:

```zig
const exe = b.addExecutable(.{
	.name = "foot",
	.root_source_file = b.path("src/main.zig"),
	.target = target,
	.optimize = optimize,
});

exe.root_module.addImport(...); 

// ... 

const tests = b.addTest(.{
	.root_source_file = b.path("src/main.zig"),
	.target = target,
	.optimize = optimize,
});

const test_step = b.step("test", "Run tests.");
test_step.dependOn(&b.addRunArtifact(tests).step);
```

`tests.root_module` has no imports added, so it can't find them. You would have to also add them all to `tests.root_module`.


The good news is zig 0.14.0 added the following feature to avoid this duplication, see [#20388](https://github.com/ziglang/zig/pull/20388). Now you can create a module and pass it both to the exe and to tests:

```zig
const main_module = b.createModule(.{
	.root_source_file = b.path("src/main.zig"),
	.target = target,
	.optimize = optimize,
});

const exe = b.addExecutable(.{
	.name = "foot",
	.root_module = main_module,
});

exe.root_module.addImport(...); 

// ... 
const tests = b.addTest(.{
	.root_module = main_module,
});

const test_step = b.step("test", "Run tests.");
test_step.dependOn(&b.addRunArtifact(tests).step);
```

Now `zig build test` should run all tests and give no missing module errors.
