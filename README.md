# Encounters

This is an app for testing out conversations with an LLM-based character. The encounter format allows specifying grounding instructions for the LLM, detecting conditions with the LLM, and updating state variables that affect the instructions.

## Licensing

Code and other files in this repository are licensed under the MIT open source license.

The fonts are hosted from decentapps.net rather than included in this repo. Their licensing is separate, but will be something compatible with open source, e.g., OFS SFIL.

## Support

Github issues can be filed here.
https://github.com/DecentAppsNet/encounters/issues

## Community

Encounters is a Decent App, which is a kind of web app that sends no user data to a server, using all local capabilities. You can find users of Encounters and other Decent Apps on the [Decent Apps Discord server](https://discord.gg/kkp3x4X2Vb).

# Encounters Format

An encounter file defines how a character will act when speaking with the player. It is based on the markdown format. You can import and export encounter files to share encounters with other people.

Sections in an Encounters file are:
* General - general settings applicable to the encounter
* Start - messages that will display and code that will be run once at the start of the encounter
* Instructions - instructions that will be used to ground the LLM

Possible actions are:

**Instruction messages are used for grounding the LLM, and aren't visible to the player.**
_Narration messages display to the player but are not part of chat history that the LLM accesses._
> Character messages are displayed to the player as dialogue spoken by the character. They are also part of chat history that the LLM accesses.
>> Player messages are displayed to the player as though spoken by the character they control. They are also part of chat history that the LLM accesses.
`Code blocks contain Javascript-like code that executes`
* name=value (a way of specifying settings)

If a line is not preceded by one of the line start characters described above, it will be treated as a comment. In other words, that text will not affect the encounter behavior in any way, but can be used to explain what is going on inside of the encounter file.

Any of the messages may optionally contain a conditional code block with an expresssion. If the expression evaluates as true, the message will be displayed/included. In the example below, a narration message will only be displayed if the variable `isHappy` has been set to true:
_`isHappy` The troll smiles a toothy grin, pleased to be in your company._

Any message may have one or more alternate texts delimited with "|". At time of evaluation, one of message texts will be chosen randomly. This technique can be used to add more variety.
_The troll smiles a toothy grin, pleased to be in your company.|The troll beams at you, his new best friend.|The troll is quite happy. He might give you a hug, if you're not careful._

## General Section

Name/value pairs are evaluated. Other kinds of actions are ignored.

* title=The Troll Bridge (a display name describing the encounter)
* model=Llama-3.1-8B-Instruct-q4f16_1-MLC-1k (the model that the encounter was designed to use. Used for giving a warning to player if the model doesn't match.)

## Start Section

Character/player/narration messages and code blocks are evaluated. Other kinds of actions are ignored.

This section is evaluated once per play session for the encounter.

## Instructions Section

Instruction messages and code blocks are evaluated. Other kinds of actions are ignored.

This section is evaluated each time the player enters a prompt to generate a new system message sent to the LLM. If instruction messages contain conditional code blocks, it is possible for the system message to be different after each prompt.

## Condition Sections (Appearing Under Instructions)

Character/player/narration messages and code blocks are evaluated. Other kinds of actions are ignored.

You can optionally define conditions that the LLM will detect along with actions to perform when that condition is met. These appear as sub-sections under the "Instructions" section. The name of the sub-section is the condition that the LLM will attempt to detect after the player sends a prompt.

```
## user gives you a compliment
_The troll blushes at your compliment._
`isHappy=true`
```

You can have as many conditions as you want, but probably want to keep it under ten for more reliable condition detection from the LLM. 

A conditional code block can be included in the section name so that the condition is only actively checked when the conditional expression evaluates as true.

```
## `!isHappy` user gives you a compliment
_The troll blushes at your compliment._
`isHappy=true`
```

By default, conditions are no longer evaluated once they have been triggered. But if you add a conditional code block, it will override this "trigger once" behavior.