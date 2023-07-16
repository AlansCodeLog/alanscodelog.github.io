---
title: "Abusing Typescript's New `satisfies` Operator"
pubDate: "2022-10-10"
published: true
tags: ["tip"]
langs: ["typescript"]
---
Typescript's new `satisfies` is great for it's [intended use case](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator), but it's also great for the following use case.

Writing libraries I often run into the following problem:

I want the user to have nice types when using a method, especially in a class, but this often requires complicated types and conditional returns which cannot be handled nicely internally.

Here's a very simple contrived example:

```ts
type MyType<T> = {value: T}

class MyClass <T extends MyType<any>, TCondition extends boolean = false> {
	public entries: T[] = []
	public condition: TCondition =false as TCondition
	constructor(condition:TCondition, entries: T[]) {

	}
	/** Returns different depending on how the class is instantiated.*/
	createEntry<TEntry extends MyType<any>>(val: TEntry): TCondition extends true ? MyType<true> : MyType<false>  {
		// we get the following error for both returns:
		// Type '{ value: false; }' is not assignable to type 'TCondition extends true ? MyType<true> : MyType<false>'.
		if (this.condition) {
				return {value: true}
		} else {
				return {value: false}
		}
	}
}

const myClass = new MyClass(true, [])

// res = {value: true}
const res = myClass.createEntry({value: "some val"})
```

For the user, the types are correct, but internally for us as developers they are very hard to work with. They can become a mess of cast types, often even as `any` if there's a lot of conditional generics magic happening. I've found modifying objects or building objects to add to classes expecially painful.

In the example you could cast as the return type but this is not safe if the value we're returning could satisfy either type. It's like, but not exactly like, casting `as MyType<boolean>`. 


```ts
if (this.condition) {
	// no error
	return {value: false} as TCondition extends true ? MyType<true> : MyType<false>
}
```

That's where the new `satisfies` operator can come in handy.

By itself it won't fix the error. If we do the following, it won't work, the types of the return *values* are already correct. 

```ts
if (this.condition) {
	return {value: true} satisfies MyType<true>
} else {
	return {value: false} satisfies MyType<false>
}
```
This is because the real problem is typescript doesn't narrow the type of the *return type* based on `this.condition` (see [#24929](https://github.com/microsoft/TypeScript/issues/24929) and [#33014](https://github.com/microsoft/TypeScript/issues/33014)).


But we can use `satisfies` to keep the expected type safety *while* casting as `any`:

```ts
if (this.condition) {
	return {value: true} satisfies MyType<true> as any
} else {
	return {value: false} satisfies MyType<false> as any
}
```

This prevents us from not satisfying the type we expect before casting.

```
// Type 'false' is not assignable to type 'true'.
return {value: false} satisfies MyType<true> as any
```

It can be very useful for keeping a more relaxed level of type safety inside very strictly typed classes.

The only error prone thing about doing this is that you do have to know what type you're expecting, but this is a lot safer than no safety at all.
