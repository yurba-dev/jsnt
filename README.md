# JSNT

Lightweight static utility library for working with JSON data in vanilla JavaScript - read, query, transform, convert, and cache objects.

## Installation

```html
<script src="/dist/jsnt.min.js"></script>
```

All methods are available globally as `jsnt.*`.

## Build

```bash
npm install
npm run build
```

Output: `dist/jsnt.min.js`

## Methods

| Method | Returns | Description |
|---|---|---|
| `parse(data)` | `Promise<object\|null>` | Parse a JSON string, a URL to fetch, or pass an object through |
| `get(url, callback)` | `Promise<void>` | Fetch a JSON file and hand the parsed object to a callback |
| `download(filename, content?)` | `Promise<void>` | Download data as a file (fetches `filename` when `content` is omitted) |
| `replace(url, key, value)` | `Promise<object>` | Fetch JSON and return it with `key` set to `value` |
| `set(obj, path, value)` | `void` | Set a value at a dot-path, creating objects along the way |
| `has(obj, path)` | `boolean` | Check whether a dot-path exists |
| `remove(obj, key)` | `object` | Delete a top-level key (accepts a JSON string too) |
| `renameKey(obj, oldKey, newKey)` | `object` | Return a copy with one key renamed |
| `keys(obj)` | `string[]` | Top-level keys |
| `count(obj)` | `number` | Number of top-level keys |
| `isEmpty(obj)` | `boolean` | Whether the object has no keys |
| `filter(obj, condition)` | `object` | Keep entries whose value passes `condition(value)` |
| `sort(obj, key)` | `object` | Sort entries by a numeric field of their value |
| `equal(a, b)` | `boolean` | Deep equality check |
| `merge(...objects)` | `object` | Shallow-merge objects left to right |
| `flatten(obj)` | `object` | Flatten nested objects into dot-path keys |
| `map(obj, callback)` | `object\|array` | Recursively map every leaf value |
| `group(array, key)` | `object` | Group an array of objects by a field |
| `toArray(obj)` | `array` | Object values as an array |
| `sum(obj, key)` | `number` | Sum a numeric field across values |
| `average(obj, key)` | `number` | Average a numeric field across values |
| `toString(obj)` | `string` | `JSON.stringify` shorthand |
| `toJson(string)` | `object` | `JSON.parse` shorthand |
| `toYAML(obj)` | `string` | Convert an object to YAML |
| `parseYAML(string)` | `object` | Parse flat YAML into an object |
| `toXML(obj)` | `string` | Convert an object to XML |
| `parseXML(string)` | `object` | Parse XML into an object |
| `validate(obj)` | `boolean` | Whether the value is JSON-serializable |
| `date.convert(unix, format, tz?)` | `string` | Format a unix timestamp (`DD MM YYYY hh mm ss`) |
| `date.diff(a, b, unit?)` | `number\|object` | Difference between two unix timestamps |
| `date.now()` | `number` | Current unix timestamp (seconds) |
| `date.add(unix, parts)` | `number` | Add years/months/days/… to a timestamp |
| `date.substr(unix, parts)` | `number` | Subtract years/months/days/… from a timestamp |
| `cache.new(key, value)` | `void` | Store a value in the in-memory cache |
| `cache.add(key, value)` | `void` | Merge a value into an existing cache entry |
| `cache.get(key)` | `any` | Read a cache entry |
| `cache.remove(key)` | `void` | Delete a cache entry |
| `cache.clear()` | `void` | Empty the cache |

## Examples

```js
// Read a nested value safely
const user = { profile: { name: 'Ada' } }
jsnt.has(user, 'profile.name')          // → true
jsnt.set(user, 'profile.role', 'admin') // deep set, creates missing objects

// Query a keyed collection
const posts = {
    1: { title: 'First',  views: 30 },
    2: { title: 'Second', views: 90 },
}
jsnt.sort(posts, 'views')               // → { 1: …, 2: … } ordered by views
jsnt.sum(posts, 'views')                // → 120

// Convert formats
jsnt.toYAML({ app: { name: 'Yurba', port: 80 } })
jsnt.flatten({ a: { b: { c: 1 } } })    // → { 'a.b.c': 1 }

// Dates (unix seconds)
jsnt.date.convert(jsnt.date.now(), 'DD.MM.YYYY hh:mm')
jsnt.date.add(jsnt.date.now(), { days: 7 })
```

See [demo](https://yurba-dev.github.io/jsnt/) for full documentation.
