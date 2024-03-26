# Custom Code Languages

Provides slash commands to add custom languages (syntax highlighting) to the codeblocks shown in chat messages.

This extension only allows to add very simplistic languages consisting of:
- string (quoted text) highlighting
- custom keywords


## Commands

```
/ccl [name=langName] [optional case=true|false] [optional strings=true|false] (["keywords", "for", "the", "language"]) – Register a new language (or update an existing one) for codeblocks in chat. case=true to make it case-sensitive. strings=true to highlight quoted text.

/ccl-list – Output a list of all custom languages.

/ccl-remove (langName) – Delete a custom language.
```


## Example

Define a simple language for Chain-of-Thought blocks that will highlight the words "Processing" and "Notes".

```
/ccl name=cot ["Processing", "Notes"]
```

Your CoT code blocks would have to begin with three backticks followed by "cot" to set the block's language.

    ```cot
    Processing: User wants to bake a cake.
    Notes: We're going to need a recipe.
    ```
