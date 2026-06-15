export async function shipCommand(message) {

  const user1 =
    "<@1488000947002282145>";

  const user2 =
    "<@853908176013623337>";

  const stories = [

`💕 **Lunaris Ship Generator — Totally Fictional Story** 💕

Nobody in Lunaris Craft could remember exactly when it started.

Some said it began with a random conversation.

Others insisted it started with a friendly argument.

A few claimed it was destiny from the moment ${user1} and ${user2} first crossed paths.

Whatever the truth was, one thing was certain: whenever ${user1} appeared, ${user2} somehow wasn't far behind.

At first, it was nothing special.

Just conversations.

A few jokes.

A little teasing.

But as the days passed, people started noticing strange patterns.

Whenever ${user1} joined, ${user2} somehow appeared shortly afterward.

Whenever ${user2} needed help, ${user1} was somehow already there.

Whenever one disappeared for a while, the other seemed noticeably quieter.

Coincidence?

Maybe.

At least, that's what they told everyone.

The members of Lunaris Craft didn't believe a single word.

The teasing became constant.

Every shared conversation became evidence.

Every interaction became a joke.

Every time ${user1} and ${user2} worked together, someone would appear from nowhere just to type:

👀

And somehow that single emoji caused more chaos than any server event ever could.

As weeks became months, their friendship became one of the most talked-about things in the community.

Not because they were dramatic.

Not because they were loud.

But because they seemed to understand each other in a way nobody else did.

When ${user1} was having a bad day, ${user2} somehow knew.

When ${user2} succeeded at something, ${user1} celebrated just as much.

When one laughed, the other usually wasn't far behind.

Slowly, they became each other's favorite notification.

The person whose message immediately made a bad day better.

The person whose presence could instantly improve a mood.

The person who somehow made even ordinary moments feel important.

Late-night conversations became longer.

Simple greetings became inside jokes.

Small interactions became unforgettable memories.

Neither of them could point to the exact moment things changed.

Maybe there wasn't one.

Maybe it happened so gradually that neither noticed.

Like a sunrise.

You don't see the exact second darkness becomes light.

Yet somehow, before you know it, everything has changed.

One evening, while Lunaris Craft was unusually quiet, ${user1} and ${user2} found themselves talking about everything and nothing at the same time.

Favorite memories.

Future goals.

Random thoughts.

Things they had never really told anyone else.

Hours passed without either realizing.

The world outside continued moving.

But for that moment, it felt as though time had slowed down.

And somewhere in the middle of that conversation, a realization quietly appeared.

Not dramatic.

Not sudden.

Just simple.

Some people enter your life and leave.

Some stay for a while.

And then there are the rare ones who become part of your story.

The kind of person whose absence feels strange.

The kind of person whose happiness matters to you.

The kind of person you instinctively look for whenever something good happens because they're the first person you want to tell.

The kind of person who turns ordinary days into favorite memories.

Neither of them said anything.

Neither needed to.

Because sometimes the most important things don't require words.

The server continued teasing them.

The jokes continued.

The rumors continued.

And every single time they denied everything, the community became even more convinced.

But deep down, there was one thing they couldn't deny.

No matter how chaotic the server became.

No matter how busy life got.

No matter how many adventures, challenges, or distractions appeared.

${user1} and ${user2} always found their way back to each other.

And if you ask the people of Lunaris Craft what happened next, they'll all give the same answer:

"We don't know."

"But we're definitely watching." 🌙💜`
  ];

  const story =
    stories[
      Math.floor(
        Math.random() *
        stories.length
      )
    ];

  return message.channel.send(story);

}
