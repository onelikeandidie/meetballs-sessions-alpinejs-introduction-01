# AlpineJS introduction

AlpineJS is an alternative to popular heavy frameworks like VueJS, React,
Angular, etc. It is a minimal framework that you can use to build interactive
web applications. It is a great choice for small projects where you don't need
the complexity of a full-fledged framework.

To run this introduction, you need to run a local server. It is included in the
repository. You can run it with the following command:

```bash
# Install dependencies
npm install -D
# Run the server
npm run serve
# If you need an alternate port, you can use environment variables
PORT=3000 npm run serve
```

You can access the server at `http://localhost:8000` which will show you the
home page introducing AlpineJS.

This project uses TailwindCSS for styling, on VSCode you'll have to install an
extension to get the IntelliSense for TailwindCSS. JetBrains IDEs have built-in
support for TailwindCSS.

For AlpineJS, JetBrains IDEs have the alpinejs plugin that provides syntax
highlighting and IntelliSense. VSCode has the AlpineJS IntelliSense extension
that provides the same features.

## How do I AlpinoJSo?

AlpineJS can be used to create components without ever leaving your HTML. To
create a component, you need to add the `x-data` attribute to an element. The
example below will a simple counter.

```html
<div x-data="{ count: 0 }">
  <button @click="count++">Increment</button>
  <span x-text="count"></span>
</div>
```

Each component will have a state based on the `x-data` attribute which will
update the DOM when the state changes. Then other attributes like `x-text`,
`x-bind`, `x-show`, `x-html` and `x-model` can be used to put that state into
the DOM.

Elements can then use a `x-on` attribute to listen to events like `click` and
`mouseover` or you can use the `@` shorthand.

```html
<div x-data="{ show: false }">
  <button @click="show = !show">Toggle</button>
  <p x-show="show">This is a paragraph</p>
</div>
```

Another example is to change the class of an element based on a condition.
You can bind any attribute with `x-bind` or use the shorthand `:`. If you
wanted to change the `class` attribute based on a condition, you can use the
`x-bind:class` attribute with an object. The keys of the object are the class
names and the values are the conditions.

```html
<div x-data="{ valid: false }">
  <input type="text" x-model="valid">
  <span x-bind:class="{ 'text-green-500': valid, 'text-red-500': !valid }">
    {{ valid ? 'Valid' : 'Invalid' }}
  </span>
  <button @click="valid = !valid">Toggle</button>
</div>
```

You can read more about AlpineJS in the
[official documentation](https://alpinejs.dev/).