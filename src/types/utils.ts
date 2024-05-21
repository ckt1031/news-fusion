export type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>;
};

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
