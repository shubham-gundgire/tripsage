import { test } from 'vitest'

/** A test of the correct behaviour that fails today because of a bug (passes while the bug exists). */
export const knownBug = process.env.SHOW_BUGS ? test : test.fails
